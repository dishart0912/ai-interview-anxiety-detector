import { useRef, useCallback } from 'react'
import { calculateConfidenceScore } from '@/lib/scoring'

export interface Metrics {
  responseDelayMs: number
  typingSpeedWpm: number
  answerLengthWords: number
  confidenceScore: number
}

export function useMetricsTracker() {
  const questionShownAt = useRef<number | null>(null)
  const firstKeystrokeAt = useRef<number | null>(null)
  const typingStartAt = useRef<number | null>(null)

  const onQuestionShown = useCallback(() => {
    questionShownAt.current = Date.now()
    firstKeystrokeAt.current = null
    typingStartAt.current = null
  }, [])

  const onKeyDown = useCallback(() => {
    const now = Date.now()
    if (!firstKeystrokeAt.current) {
      firstKeystrokeAt.current = now
      typingStartAt.current = now
    }
  }, [])

  const calculateMetrics = useCallback((answerText: string): Metrics => {
    const words = answerText.trim().split(/\s+/).filter(Boolean)
    const answerLengthWords = words.length

    const responseDelayMs = firstKeystrokeAt.current && questionShownAt.current
      ? Math.max(0, firstKeystrokeAt.current - questionShownAt.current)
      : 0

    // WPM based on time from first to last keystroke
    let typingSpeedWpm = 0
    if (typingStartAt.current && answerLengthWords > 3) {
      const durationMinutes = (Date.now() - typingStartAt.current) / 60000
      typingSpeedWpm = durationMinutes > 0
        ? Math.round(answerLengthWords / durationMinutes)
        : 0
    }

    const confidenceScore = calculateConfidenceScore({
      responseDelayMs,
      typingSpeedWpm,
      answerLengthWords,
    })

    return { responseDelayMs, typingSpeedWpm, answerLengthWords, confidenceScore }
  }, [])

  return { onQuestionShown, onKeyDown, calculateMetrics }
}