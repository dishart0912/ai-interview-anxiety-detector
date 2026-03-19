import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function getMLPrediction(metrics: {
  responseDelayMs: number
  typingSpeedWpm: number
  answerLengthWords: number
}) {
  // Uses env var in production, falls back to localhost in dev
  const ML_URL = process.env.ML_SERVICE_URL ?? 'http://localhost:8000'

  const res = await fetch(`${ML_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      response_delay_ms: metrics.responseDelayMs,
      typing_speed_wpm: metrics.typingSpeedWpm,
      answer_length_words: metrics.answerLengthWords,
    }),
  })
  if (!res.ok) throw new Error('ML service error')
  return await res.json()
}

function isValidAnswer(text: string): { valid: boolean; reason: string } {
  const trimmed = text.trim()
  const words = trimmed.split(/\s+/).filter(Boolean)
  const uniqueWords = new Set(words.map(w => w.toLowerCase()))

  if (words.length < 10) {
    return { valid: false, reason: 'Answer too short — minimum 10 words required' }
  }
  if (/(.)\1{4,}/.test(trimmed)) {
    return { valid: false, reason: 'Answer contains repeated character patterns' }
  }
  const validCharRatio = (trimmed.match(/[a-zA-Z\s.,!?'-]/g) || []).length / trimmed.length
  if (validCharRatio < 0.75) {
    return { valid: false, reason: 'Answer contains too many invalid characters' }
  }
  if (uniqueWords.size < 5) {
    return { valid: false, reason: 'Answer lacks word variety' }
  }
  const avgWordLength = words.join('').length / words.length
  if (avgWordLength < 2.5) {
    return { valid: false, reason: 'Answer appears to be random characters' }
  }
  return { valid: true, reason: '' }
}

function generateFeedback(
  anxietyLevel: string,
  questionText: string,
  metrics: { responseDelayMs: number; typingSpeedWpm: number; answerLengthWords: number }
): { aiFeedback: string; improvementTips: string } {
  const delaySeconds = (metrics.responseDelayMs / 1000).toFixed(1)
  const words = metrics.answerLengthWords

  if (anxietyLevel === 'low') {
    return {
      aiFeedback: `Strong response with good behavioral signals. You responded in ${delaySeconds}s with ${words} words, showing confidence and preparation. Your answer to this question demonstrated readiness.`,
      improvementTips: '• Keep maintaining this response speed\n• Consider adding specific examples or numbers to strengthen your answers\n• Structure answers using the STAR method (Situation, Task, Action, Result) for even more impact',
    }
  }

  if (anxietyLevel === 'moderate') {
    return {
      aiFeedback: `Decent response but some hesitation detected. You took ${delaySeconds}s before responding and wrote ${words} words — there is room to improve both your response speed and answer depth.`,
      improvementTips: '• Try to start typing within 2 seconds of reading the question\n• Aim for at least 60 words per answer to demonstrate depth\n• Practice answering common questions out loud daily to reduce hesitation',
    }
  }

  return {
    aiFeedback: `Response shows signs of anxiety — ${delaySeconds}s delay before answering and only ${words} words detected. This is very common and improves significantly with practice. Do not be discouraged.`,
    improvementTips: '• Practice mock interviews daily — even 10 minutes helps reduce response delay\n• Prepare 5–6 key stories from your experience that can answer most behavioral questions\n• Use the "pause and breathe" technique: take one breath before typing to reset your focus',
  }
}

export async function POST(req: Request) {
  console.log('=== /api/analyze called ===')
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { answerId, questionText, answerText, metrics } = await req.json()
    console.log('answerId:', answerId)

    const validation = isValidAnswer(answerText ?? '')
    if (!validation.valid) {
      console.warn('Invalid answer rejected:', validation.reason)
      return NextResponse.json(
        { error: validation.reason, code: 'INVALID_ANSWER' },
        { status: 422 }
      )
    }

    let mlResult = null
    try {
      mlResult = await getMLPrediction(metrics)
      console.log('ML result:', mlResult)
    } catch (err) {
      console.warn('ML service failed:', err)
    }

    const score = mlResult?.ml_confidence_score ?? 50
    const anxietyLevel = mlResult?.anxiety_level ?? 'moderate'

    const { aiFeedback, improvementTips } = generateFeedback(
      anxietyLevel,
      questionText,
      {
        responseDelayMs: metrics?.responseDelayMs ?? 0,
        typingSpeedWpm: metrics?.typingSpeedWpm ?? 0,
        answerLengthWords: metrics?.answerLengthWords ?? 0,
      }
    )

    const insertData = {
      answer_id: answerId,
      confidence_score: Math.round(score),
      clarity_score: Math.round(score * 0.9),
      professionalism_score: Math.round(score * 0.95),
      ai_feedback: aiFeedback,
      improvement_tips: improvementTips,
      ml_confidence_score: mlResult?.ml_confidence_score ?? null,
      anxiety_level: mlResult?.anxiety_level ?? null,
      behavioral_tips: mlResult?.behavioral_tips?.join(' | ') ?? null,
      delay_impact: mlResult?.breakdown?.delay?.impact ?? null,
      speed_impact: mlResult?.breakdown?.speed?.impact ?? null,
      length_impact: mlResult?.breakdown?.length?.impact ?? null,
    }

    console.log('Inserting:', insertData)

    const { data, error } = await supabase
      .from('ai_results')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Success:', data)
    return NextResponse.json(data)

  } catch (err) {
    console.error('Analyze error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}