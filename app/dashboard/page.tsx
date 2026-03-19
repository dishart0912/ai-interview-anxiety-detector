import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import DeleteButton from '@/components/DeleteButton'

function AnxietyBadge({ level }: { level: string | null }) {
  if (!level) return null
  const cfg: Record<string, { bg: string, color: string, label: string }> = {
    low:      { bg: 'rgba(0,245,160,0.1)',  color: '#00F5A0', label: 'Low anxiety' },
    moderate: { bg: 'rgba(255,217,61,0.1)', color: '#FFD93D', label: 'Moderate'    },
    high:     { bg: 'rgba(255,60,172,0.1)', color: '#FF3CAC', label: 'High anxiety'},
  }
  const c = cfg[level] ?? { bg: 'rgba(255,255,255,0.05)', color: 'var(--muted)', label: level }
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}30`, borderRadius: '20px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em' }}>
      {c.label}
    </span>
  )
}

function ScoreRing({ score, color, label }: { score: number, color: string, label: string }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const validScore = score && score > 0 ? score : 0
  return (
    <div style={{ textAlign: 'center', minWidth: '70px' }}>
      <div style={{ position: 'relative', width: '70px', height: '70px' }}>
        <svg width="70" height="70" style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          <circle cx="35" cy="35" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
          <circle cx="35" cy="35" r={r} fill="none"
            stroke={validScore > 0 ? color : 'rgba(255,255,255,0.06)'}
            strokeWidth="5"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - validScore / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: validScore > 0 ? color : 'var(--muted)' }}>
            {validScore > 0 ? validScore : '—'}
          </span>
        </div>
      </div>
      <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '6px', letterSpacing: '0.03em' }}>
        {label}
      </div>
    </div>
  )
}

// Status badge for session completion state
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string, label: string }> = {
    completed: { color: '#00F5A0', label: 'Completed' },
    abandoned: { color: '#FFD93D', label: 'Abandoned' },
    active:    { color: '#00D4FF', label: 'In progress' },
  }
  const c = cfg[status] ?? { color: 'var(--muted)', label: status }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: c.color }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: c.color, display: 'inline-block' }}/>
      {c.label}
    </span>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      answers (
        id,
        question_text,
        question_index,
        confidence_score,
        response_delay_ms,
        typing_speed_wpm,
        answer_length_words,
        ai_results (
          confidence_score,
          clarity_score,
          professionalism_score,
          ml_confidence_score,
          anxiety_level,
          ai_feedback,
          improvement_tips,
          delay_impact,
          speed_impact,
          length_impact
        )
      )
    `)
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(10)

  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0

  const allScores = sessions?.flatMap(s =>
    (s.answers ?? []).flatMap((a: any) =>
      a.ai_results ? [a.ai_results.ml_confidence_score ?? a.ai_results.confidence_score] : []
    )
  ).filter(Boolean) ?? []

  const overallAvg = avg(allScores)

  // Accent colors per session for card differentiation
  const sessionAccents = ['#FF3CAC', '#00D4FF', '#00F5A0', '#FFD93D', '#784BA0', '#FF3CAC', '#00D4FF', '#00F5A0', '#FFD93D', '#784BA0']

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="blob blob-1"/><div className="blob blob-2"/>
      <Navbar />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 1.5rem 3rem', position: 'relative', zIndex: 1 }}>

        {/* Hero stats */}
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Overall confidence', val: overallAvg || '—', color: '#FF3CAC', suffix: overallAvg ? '/100' : '' },
            { label: 'Sessions completed', val: sessions?.filter(s => s.status === 'completed').length ?? 0, color: '#00D4FF', suffix: '' },
            { label: 'Answers analyzed',   val: sessions?.reduce((a, s) => a + (s.answers?.length ?? 0), 0) ?? 0, color: '#00F5A0', suffix: '' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                {stat.label.toUpperCase()}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: stat.color }}>
                {stat.val}
                <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 400 }}>{stat.suffix}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Header row */}
        <div className="fade-up-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>Session history</h2>
          <Link href="/interview/start" style={{
            padding: '8px 18px', background: 'var(--grad-main)', border: 'none',
            borderRadius: '10px', color: '#fff', fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
          }}>+ New interview</Link>
        </div>

        {(!sessions || sessions.length === 0) && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>No interviews yet. Start your first one!</p>
            <Link href="/interview/start" style={{ color: 'var(--cyan)', fontWeight: 600, textDecoration: 'none' }}>
              Begin mock interview →
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sessions?.map((s, si) => {
            const answers = ((s.answers ?? []) as any[])
              .sort((a, b) => (a.question_index ?? 0) - (b.question_index ?? 0))

            const aiResults = answers.map((a: any) => a.ai_results).filter(Boolean)
            const mlScores      = aiResults.map((r: any) => r.ml_confidence_score).filter(Boolean)
            const clarityScores = aiResults.map((r: any) => r.clarity_score).filter(Boolean)
            const profScores    = aiResults.map((r: any) => r.professionalism_score).filter(Boolean)
            const avgML      = avg(mlScores)
            const avgClarity = avg(clarityScores)
            const avgProf    = avg(profScores)

            const anxietyLevels = aiResults.map((r: any) => r.anxiety_level).filter(Boolean)
            const dominantAnxiety = anxietyLevels.length > 0
              ? (anxietyLevels as string[]).sort((a, b) =>
                  anxietyLevels.filter((v: string) => v === b).length -
                  anxietyLevels.filter((v: string) => v === a).length
                )[0]
              : null

            const accent = sessionAccents[si % sessionAccents.length]

            return (
              <div key={s.id} className="fade-up" style={{
                animationDelay: `${si * 0.05}s`,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                overflow: 'hidden',
                // Left accent bar for differentiation
                borderLeft: `3px solid ${accent}`,
              }}>

                {/* Session header */}
                <div style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  background: `linear-gradient(135deg, ${accent}08 0%, transparent 60%)`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Top row: role + badges + DELETE ICON */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: accent }}>
                        {s.job_role}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                        {s.difficulty}
                      </span>
                      <StatusBadge status={s.status ?? 'completed'} />
                      {dominantAnxiety && <AnxietyBadge level={dominantAnxiety} />}

                      {/* Bin icon delete button — always visible */}
                      <DeleteButton sessionId={s.id} />
                    </div>

                    {/* Bottom row: date + question count */}
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>
                        {new Date(s.started_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{answers.length} / 5 questions answered</span>
                    </div>
                  </div>

                  {/* Score rings */}
                  {aiResults.length > 0 && (
                    <div className="score-rings" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexShrink: 0 }}>
                      <ScoreRing score={avgML}      color="#FF3CAC" label="Confidence" />
                      <ScoreRing score={avgClarity} color="#00D4FF" label="Clarity" />
                      <ScoreRing score={avgProf}    color="#00F5A0" label="Prof." />
                    </div>
                  )}
                </div>

                {/* Per-answer breakdown */}
                <div>
                  {answers.map((answer: any, i: number) => {
                    const result = answer.ai_results
                    // Alternate row background for readability
                    const rowBg = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                    return (
                      <div key={answer.id} style={{
                        padding: '1rem 1.5rem',
                        borderBottom: i < answers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        background: rowBg,
                      }}>
                        {/* Question row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: result ? '0.6rem' : 0, gap: '1rem' }}>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text)', flex: 1, lineHeight: 1.5 }}>
                            <span style={{
                              color: accent, fontSize: '0.7rem', marginRight: '8px',
                              fontFamily: 'var(--font-display)', fontWeight: 700,
                              background: `${accent}15`, padding: '1px 7px',
                              borderRadius: '4px',
                            }}>
                              Q{(answer.question_index ?? i) + 1}
                            </span>
                            {answer.question_text}
                          </p>
                          {result && <AnxietyBadge level={result.anxiety_level} />}
                        </div>

                        {result ? (
                          <>
                            {/* Score pills */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                              {[
                                { label: 'ML',     val: result.ml_confidence_score,   color: '#FF3CAC', bg: 'rgba(255,60,172,0.08)' },
                                { label: 'Clarity', val: result.clarity_score,         color: '#00D4FF', bg: 'rgba(0,212,255,0.08)' },
                                { label: 'Prof.',   val: result.professionalism_score,  color: '#00F5A0', bg: 'rgba(0,245,160,0.08)' },
                              ].map(m => (
                                <div key={m.label} style={{
                                  display: 'flex', alignItems: 'center', gap: '4px',
                                  background: m.bg, borderRadius: '6px',
                                  padding: '3px 8px',
                                }}>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{m.label}</span>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: m.color, fontFamily: 'var(--font-display)' }}>
                                    {m.val ?? '—'}
                                  </span>
                                </div>
                              ))}
                              {answer.response_delay_ms > 0 && (
                                <div style={{
                                  display: 'flex', alignItems: 'center', gap: '4px',
                                  background: 'rgba(255,255,255,0.05)', borderRadius: '6px',
                                  padding: '3px 8px',
                                }}>
                                  <span style={{
                                    width: '5px', height: '5px', borderRadius: '50%',
                                    background: result.delay_impact === 'positive' ? '#00F5A0' : '#FF3CAC',
                                    display: 'inline-block', flexShrink: 0,
                                  }}/>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                                    {(answer.response_delay_ms / 1000).toFixed(1)}s delay
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* AI feedback */}
                            {result.ai_feedback && (
                              <p style={{
                                fontSize: '0.8rem', color: 'var(--muted)',
                                background: 'rgba(255,255,255,0.03)',
                                borderLeft: '2px solid rgba(255,255,255,0.1)',
                                borderRadius: '0 8px 8px 0',
                                padding: '0.6rem 0.875rem',
                                lineHeight: 1.6, marginBottom: '0.5rem',
                              }}>
                                {result.ai_feedback}
                              </p>
                            )}

                            {/* Tips */}
                            {result.improvement_tips && (
                              <p style={{
                                fontSize: '0.78rem', color: '#00D4FF',
                                background: 'rgba(0,212,255,0.05)',
                                border: '1px solid rgba(0,212,255,0.12)',
                                borderRadius: '8px',
                                padding: '0.6rem 0.875rem',
                                lineHeight: 1.6, whiteSpace: 'pre-line',
                              }}>
                                {result.improvement_tips}
                              </p>
                            )}
                          </>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--purple)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}/>
                            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontStyle: 'italic' }}>AI analysis pending...</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}