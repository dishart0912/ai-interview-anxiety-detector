'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

const roles = ['General', 'Engineering', 'Product', 'Design', 'Marketing']
const difficulties = [
  {
    id: 'easy',
    label: 'Easy',
    desc: 'Warm-up questions',
    detail: 'Open-ended, comfortable, low pressure',
    color: '#00F5A0',
  },
  {
    id: 'medium',
    label: 'Medium',
    desc: 'Standard interview',
    detail: 'Behavioral and situational questions',
    color: '#FFD93D',
  },
  {
    id: 'hard',
    label: 'Hard',
    desc: 'Senior-level grilling',
    detail: 'Tough judgment and failure questions',
    color: '#FF3CAC',
  },
]

export default function StartPage() {
  const [role, setRole] = useState('General')
  const [difficulty, setDifficulty] = useState('medium')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const startInterview = async () => {
    setLoading(true)
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobRole: role, difficulty }),
    })
    const session = await res.json()
    router.push(`/interview/${session.id}`)
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="blob blob-1"/><div className="blob blob-2"/>
      <Navbar />

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '100px 1.5rem 3rem', position: 'relative', zIndex: 1 }}>
        <div className="fade-up" style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,60,172,0.1)', border: '1px solid rgba(255,60,172,0.2)', borderRadius: '20px', padding: '4px 14px', fontSize: '0.8rem', color: 'var(--pink)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.05em' }}>
            NEW SESSION
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '0.75rem' }}>
            Configure your<br />
            <span style={{ background: 'var(--grad-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>mock interview</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.6 }}>
            Our AI will analyze your confidence, clarity, and anxiety signals in real time.
          </p>
        </div>

        {/* Role selector */}
        <div className="fade-up-2" style={{ marginBottom: '2rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', display: 'block', marginBottom: '0.75rem' }}>
            JOB ROLE
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {roles.map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                padding: '8px 18px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.2s',
                background: role === r ? 'var(--grad-main)' : 'rgba(255,255,255,0.04)',
                border: role === r ? 'none' : '1px solid var(--border)',
                color: role === r ? '#fff' : 'var(--muted)',
                fontFamily: 'var(--font-body)',
              }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="fade-up-3" style={{ marginBottom: '2.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', display: 'block', marginBottom: '0.75rem' }}>
            DIFFICULTY
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {difficulties.map(d => (
  <button key={d.id} onClick={() => setDifficulty(d.id)} style={{
    padding: '1.25rem 1rem', borderRadius: '14px', cursor: 'pointer',
    transition: 'all 0.2s', textAlign: 'left',
    background: difficulty === d.id
      ? `rgba(${d.id === 'easy' ? '0,245,160' : d.id === 'medium' ? '255,217,61' : '255,60,172'},0.1)`
      : 'rgba(255,255,255,0.03)',
    border: difficulty === d.id ? `1px solid ${d.color}40` : '1px solid var(--border)',
    fontFamily: 'var(--font-body)',
  }}>
    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, marginBottom: '0.75rem' }}/>
    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: difficulty === d.id ? d.color : 'var(--text)', marginBottom: '4px' }}>
      {d.label}
    </div>
    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '2px' }}>{d.desc}</div>
    <div style={{ fontSize: '0.7rem', color: difficulty === d.id ? d.color : 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
      {d.detail}
    </div>
  </button>
))}
          </div>
        </div>

        {/* Start button */}
        <div className="fade-up-4">
          <button onClick={startInterview} disabled={loading} style={{
            width: '100%', padding: '1rem',
            background: loading ? 'rgba(255,255,255,0.05)' : 'var(--grad-main)',
            border: 'none', borderRadius: '14px',
            color: '#fff', fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: '1.05rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
            letterSpacing: '0.02em',
          }}>
            {loading ? 'Starting session...' : 'Begin interview →'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--muted)', fontSize: '0.8rem' }}>
            5 questions · AI analyzes every answer · Results on dashboard
          </p>
        </div>
      </div>
    </div>
  )
}