'use client'
import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { useMetricsTracker } from '@/hooks/useMetricsTracker'
import { getQuestions } from '@/lib/questions'

const QUESTION_TIME = 120

function validateAnswer(text: string): { valid: boolean; reason: string } {
  const trimmed = text.trim()
  const words = trimmed.split(/\s+/).filter(Boolean)
  const uniqueWords = new Set(words.map(w => w.toLowerCase()))
  if (words.length < 10) {
    return { valid: false, reason: `Too short — write at least 10 words (${words.length}/10)` }
  }
  if (/(.)\1{4,}/.test(trimmed)) {
    return { valid: false, reason: 'Answer contains repeated characters — please write a real response' }
  }
  const validCharRatio = (trimmed.match(/[a-zA-Z\s.,!?'-]/g) || []).length / trimmed.length
  if (validCharRatio < 0.75) {
    return { valid: false, reason: 'Answer contains too many invalid characters' }
  }
  if (uniqueWords.size < 5) {
    return { valid: false, reason: 'Answer is not varied enough — please elaborate more' }
  }
  const avgWordLength = words.join('').length / words.length
  if (avgWordLength < 2.5) {
    return { valid: false, reason: 'Answer looks like random characters — please write full words' }
  }
  return { valid: true, reason: '' }
}

function ConfidenceMeter({ score }: { score: number }) {
  const color = score >= 70 ? '#00F5A0' : score >= 45 ? '#FFD93D' : '#FF3CAC'
  const label = score >= 70 ? 'High confidence' : score >= 45 ? 'Moderate' : 'Nervous'
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 0.5rem' }}>
        <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
          <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - score / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color }}>{score}</span>
        </div>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function TimerBar({ seconds, total }: { seconds: number, total: number }) {
  const pct = (seconds / total) * 100
  const color = pct > 50 ? '#00F5A0' : pct > 25 ? '#FFD93D' : '#FF3CAC'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return (
    <div style={{ minWidth: '160px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Time remaining</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color }}>
          {m}:{s.toString().padStart(2, '0')}
        </span>
      </div>
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 1s linear, background 0.5s' }}/>
      </div>
    </div>
  )
}

// Exit confirmation modal
function ExitModal({
  current,
  total,
  onConfirm,
  onCancel,
}: {
  current: number
  total: number
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '400px',
        width: '100%',
        animation: 'fadeUp 0.2s ease',
      }}>
        {/* Icon */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'rgba(255,60,172,0.1)',
          border: '1px solid rgba(255,60,172,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.25rem', fontSize: '1.4rem',
        }}>
          ✕
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          Exit interview?
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
          You have answered <span style={{ color: 'var(--text)', fontWeight: 600 }}>{current} of {total}</span> questions.
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          Your progress so far will be <span style={{ color: '#FFD93D', fontWeight: 500 }}>saved</span> but the session will be marked incomplete. You can start a fresh interview anytime.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.75rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              borderRadius: '12px', color: 'var(--text)',
              fontFamily: 'var(--font-display)', fontWeight: 600,
              fontSize: '0.9rem', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            Keep going
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '0.75rem',
              background: 'rgba(255,60,172,0.15)',
              border: '1px solid rgba(255,60,172,0.3)',
              borderRadius: '12px', color: '#FF3CAC',
              fontFamily: 'var(--font-display)', fontWeight: 600,
              fontSize: '0.9rem', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,60,172,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,60,172,0.15)'}
          >
            Exit interview
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InterviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const [questions, setQuestions] = useState(getQuestions('General', 'medium'))
  const [current, setCurrent] = useState(0)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const [liveWpm, setLiveWpm] = useState(0)
  const [liveScore, setLiveScore] = useState(0)
  const [liveDelay, setLiveDelay] = useState<number | null>(null)
  const [validationError, setValidationError] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)  // ← new
  const firstKeystrokeTime = useRef<number | null>(null)
  const questionShownTime = useRef<number>(Date.now())
  const { onQuestionShown, onKeyDown, calculateMetrics } = useMetricsTracker()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`)
        const session = await res.json()
        if (session?.job_role) {
          setQuestions(getQuestions(session.job_role, session.difficulty ?? 'medium'))
        }
      } catch {
        // fallback to General
      }
    }
    loadSession()
  }, [sessionId])

  useEffect(() => {
    onQuestionShown()
    setTimeLeft(QUESTION_TIME)
    setLiveDelay(null)
    setValidationError('')
    setIsValid(false)
    firstKeystrokeTime.current = null
    questionShownTime.current = Date.now()
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [current])

  // Pause timer when exit modal is open
  useEffect(() => {
    if (showExitModal) {
      if (timerRef.current) clearInterval(timerRef.current)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000)
    }
  }, [showExitModal])

  const handleExit = async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    // Mark session as abandoned so it shows correctly on dashboard
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'abandoned' }),
    })
    router.push('/dashboard')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    onKeyDown()
    if (!firstKeystrokeTime.current) {
      firstKeystrokeTime.current = Date.now()
      const delay = firstKeystrokeTime.current - questionShownTime.current
      setLiveDelay(delay)
    }
    const words = answer.trim().split(/\s+/).filter(Boolean).length
    setLiveWpm(Math.min(words * 3, 120))
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setAnswer(val)
    const metrics = calculateMetrics(val)
    setLiveScore(metrics.confidenceScore)
    const words = val.trim().split(/\s+/).filter(Boolean).length
    if (firstKeystrokeTime.current && words > 1) {
      const mins = (Date.now() - firstKeystrokeTime.current) / 60000
      setLiveWpm(mins > 0 ? Math.round(words / mins) : 0)
    }
    if (val.trim().length > 5) {
      const result = validateAnswer(val)
      setValidationError(result.valid ? '' : result.reason)
      setIsValid(result.valid)
    } else {
      setValidationError('')
      setIsValid(false)
    }
  }

  const submitAnswer = async () => {
    const finalCheck = validateAnswer(answer)
    if (!finalCheck.valid) {
      setValidationError(finalCheck.reason)
      setIsValid(false)
      return
    }
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)

    const metrics = calculateMetrics(answer)
    const res = await fetch('/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId, questionIndex: current,
        questionText: questions[current].text,
        answerText: answer,
        responseDelayMs: metrics.responseDelayMs,
        typingSpeedWpm: metrics.typingSpeedWpm,
        answerLengthWords: metrics.answerLengthWords,
        confidenceScore: metrics.confidenceScore,
      }),
    })
    const saved = await res.json()

    if (saved.id) {
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answerId: saved.id,
          questionText: questions[current].text,
          answerText: answer,
          metrics: {
            responseDelayMs: metrics.responseDelayMs,
            typingSpeedWpm: metrics.typingSpeedWpm,
            answerLengthWords: metrics.answerLengthWords,
            confidenceScore: metrics.confidenceScore,
          },
        }),
      })
    }

    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
      setAnswer('')
      setLiveScore(0)
      setLiveWpm(0)
      setLiveDelay(null)
      setValidationError('')
      setIsValid(false)
    } else {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })
      setDone(true)
    }
    setSubmitting(false)
  }

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="blob blob-1"/><div className="blob blob-2"/>
      <div className="fade-up" style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '2rem' }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--grad-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>✓</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>Interview complete!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', maxWidth: '340px' }}>AI is crunching your behavioral data. Results will be ready on your dashboard.</p>
        <button onClick={() => router.push('/dashboard')} style={{
          padding: '0.875rem 2rem', background: 'var(--grad-main)', border: 'none',
          borderRadius: '12px', color: '#fff', fontFamily: 'var(--font-display)',
          fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
        }}>
          View my results →
        </button>
      </div>
    </div>
  )

  const q = questions[current]
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length

  const delayDisplay = liveDelay === null ? 'waiting...'
    : liveDelay < 1000 ? `${liveDelay}ms`
    : `${(liveDelay / 1000).toFixed(1)}s`

  const delayColor = liveDelay === null ? 'var(--muted)'
    : liveDelay < 2000 ? '#00F5A0'
    : liveDelay < 5000 ? '#FFD93D'
    : '#FF3CAC'

  const wordCountColor = wordCount >= 10
    ? wordCount >= 50 ? '#00F5A0' : '#FFD93D'
    : '#FF3CAC'

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="blob blob-1"/><div className="blob blob-2"/>

      {/* Exit modal */}
      {showExitModal && (
        <ExitModal
          current={current}
          total={questions.length}
          onConfirm={handleExit}
          onCancel={() => setShowExitModal(false)}
        />
      )}

      {/* Top progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.05)', zIndex: 200 }}>
        <div style={{ height: '100%', background: 'var(--grad-main)', transition: 'width 0.5s', width: `${(current / questions.length) * 100}%` }}/>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 1.5rem 3rem', position: 'relative', zIndex: 1 }}>

        {/* Header — exit button added here */}
        <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Exit button */}
            <button
              onClick={() => setShowExitModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--muted)', fontSize: '0.8rem',
                cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,60,172,0.4)'
                e.currentTarget.style.color = '#FF3CAC'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--muted)'
              }}
            >
              ← Exit
            </button>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '4px' }}>
                QUESTION {current + 1} OF {questions.length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--cyan)', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '6px', padding: '2px 10px', display: 'inline-block' }}>
                {q.category}
              </div>
            </div>
          </div>

          <TimerBar seconds={timeLeft} total={QUESTION_TIME} />
        </div>

        <div className="interview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: '1.5rem', alignItems: 'start' }}>

          <div>
            <div className="fade-up" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.75rem', marginBottom: '1rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)', fontWeight: 600, lineHeight: 1.4, color: 'var(--text)' }}>
                {q.text}
              </p>
            </div>

            <div className="fade-up-2">
              <textarea
                value={answer}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Start typing your answer... The AI is watching your response patterns."
                rows={7}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${
                    answer.trim().length > 5
                      ? isValid ? 'rgba(0,245,160,0.3)' : 'rgba(255,60,172,0.3)'
                      : 'var(--border)'
                  }`,
                  borderRadius: '16px', padding: '1.25rem',
                  color: 'var(--text)', fontSize: '0.95rem',
                  outline: 'none', resize: 'none', lineHeight: 1.7,
                  fontFamily: 'var(--font-body)', transition: 'border 0.3s',
                }}
                onFocus={e => { if (answer.trim().length <= 5) e.target.style.borderColor = 'rgba(120,75,160,0.5)' }}
                onBlur={e => { if (answer.trim().length <= 5) e.target.style.borderColor = 'var(--border)' }}
              />

              <div style={{ marginTop: '0.75rem' }}>
                {validationError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', padding: '0.6rem 0.875rem', background: 'rgba(255,60,172,0.08)', border: '1px solid rgba(255,60,172,0.2)', borderRadius: '10px' }}>
                    <span style={{ color: '#FF3CAC', fontSize: '1rem', lineHeight: 1 }}>⚠</span>
                    <span style={{ color: '#FF3CAC', fontSize: '0.8rem', lineHeight: 1.4 }}>{validationError}</span>
                  </div>
                )}
                {isValid && answer.trim().length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', padding: '0.6rem 0.875rem', background: 'rgba(0,245,160,0.06)', border: '1px solid rgba(0,245,160,0.15)', borderRadius: '10px' }}>
                    <span style={{ color: '#00F5A0', fontSize: '1rem', lineHeight: 1 }}>✓</span>
                    <span style={{ color: '#00F5A0', fontSize: '0.8rem' }}>Answer looks good — ready to submit</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      <span style={{ color: wordCountColor, fontWeight: 600, transition: 'color 0.3s' }}>{wordCount}</span>
                      <span style={{ color: 'var(--muted)' }}>/10 words min</span>
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      <span style={{ color: '#00D4FF', fontWeight: 600 }}>{Math.round(liveWpm)}</span> WPM
                    </span>
                  </div>
                  <button
                    onClick={submitAnswer}
                    disabled={submitting || !isValid}
                    style={{
                      padding: '0.75rem 1.75rem',
                      background: submitting || !isValid ? 'rgba(255,255,255,0.05)' : 'var(--grad-main)',
                      border: 'none', borderRadius: '12px', color: '#fff',
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem',
                      cursor: submitting || !isValid ? 'not-allowed' : 'pointer',
                      opacity: submitting || !isValid ? 0.4 : 1, transition: 'all 0.2s',
                    }}
                  >
                    {submitting ? 'Saving...' : current < questions.length - 1 ? 'Next →' : 'Finish'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="fade-up-3" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '0.75rem', textAlign: 'center' }}>LIVE SCORE</div>
              <ConfidenceMeter score={liveScore} />
            </div>

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.08em' }}>SIGNALS</div>
              {[
                { label: 'Delay',  val: delayDisplay,                 color: delayColor },
                { label: 'Speed',  val: `${Math.round(liveWpm)} wpm`, color: liveWpm > 20 ? '#00F5A0' : '#FFD93D' },
                { label: 'Length', val: `${wordCount}w`,              color: wordCountColor },
              ].map(stat => (
                <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{stat.label}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: stat.color, transition: 'color 0.3s' }}>{stat.val}</span>
                </div>
              ))}
              <div style={{ marginTop: '0.25rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: isValid ? '#00F5A0' : answer.trim().length > 5 ? '#FF3CAC' : 'var(--muted)',
                    transition: 'background 0.3s', flexShrink: 0,
                  }}/>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.3 }}>
                    {isValid ? 'Valid answer' : answer.trim().length > 5 ? 'Needs improvement' : 'Start typing...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}