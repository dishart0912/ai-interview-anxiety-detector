import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    sessionId, questionIndex, questionText, answerText,
    responseDelayMs, typingSpeedWpm, answerLengthWords, confidenceScore
  } = body

  // Validate answer quality
  const validation = isValidAnswer(answerText ?? '')
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.reason, code: 'INVALID_ANSWER' },
      { status: 422 }
    )
  }

  const { data, error } = await supabase
    .from('answers')
    .insert({
      session_id: sessionId,
      question_index: questionIndex,
      question_text: questionText,
      answer_text: answerText,
      response_delay_ms: responseDelayMs,
      typing_speed_wpm: typingSpeedWpm,
      answer_length_words: answerLengthWords,
      confidence_score: confidenceScore,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}