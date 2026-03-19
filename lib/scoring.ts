export function calculateConfidenceScore({
  responseDelayMs,
  typingSpeedWpm,
  answerLengthWords,
}: {
  responseDelayMs: number
  typingSpeedWpm: number
  answerLengthWords: number
}): number {
  // Response delay is the strongest anxiety signal (40% weight)
  // Under 2s = full score, penalty kicks in after 4s
  const delayScore = responseDelayMs < 2000
    ? 100
    : responseDelayMs < 4000
    ? 100 - ((responseDelayMs - 2000) / 2000) * 30
    : Math.max(0, 70 - ((responseDelayMs - 4000) / 6000) * 70)

  // Answer length matters most after delay (45% weight)
  // A confident person gives a fuller answer
  const lengthScore = answerLengthWords >= 80
    ? 100
    : answerLengthWords >= 50
    ? 60 + ((answerLengthWords - 50) / 30) * 40
    : answerLengthWords >= 20
    ? 20 + ((answerLengthWords - 20) / 30) * 40
    : (answerLengthWords / 20) * 20

  // Typing speed is a weak signal (15% weight)
  // We only penalize extreme slowness (under 15 WPM)
  // Normal variation 20-80 WPM is not penalized at all
  const speedScore = typingSpeedWpm >= 20
    ? 100
    : typingSpeedWpm >= 10
    ? 50 + ((typingSpeedWpm - 10) / 10) * 50
    : (typingSpeedWpm / 10) * 50

  const score = (delayScore * 0.40) + (lengthScore * 0.45) + (speedScore * 0.15)
  return Math.round(Math.max(0, Math.min(100, score)))
}