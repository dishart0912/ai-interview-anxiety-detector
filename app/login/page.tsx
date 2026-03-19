'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type View = 'login' | 'forgot' | 'sent'

export default function LoginPage() {
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setLoading(false)
    setView('sent')
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    color: 'var(--text)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border 0.2s',
    fontFamily: 'var(--font-body)',
  } as React.CSSProperties

  // ── Sent confirmation ──────────────────────────────────────
  if (view === 'sent') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="blob blob-1"/><div className="blob blob-2"/>
      <div className="fade-up" style={{ width: '100%', maxWidth: '420px', padding: '0 1.5rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,245,160,0.1)', border: '1px solid rgba(0,245,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.75rem' }}>
          ✉
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.75rem' }}>Check your inbox</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          We sent a password reset link to<br/>
          <span style={{ color: 'var(--text)', fontWeight: 500 }}>{email}</span>
        </p>
        <button onClick={() => { setView('login'); setError('') }} style={{
          padding: '0.75rem 2rem', background: 'var(--grad-main)', border: 'none',
          borderRadius: '12px', color: '#fff', fontFamily: 'var(--font-display)',
          fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
        }}>
          Back to sign in
        </button>
      </div>
    </div>
  )

  // ── Forgot password ────────────────────────────────────────
  if (view === 'forgot') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="blob blob-1"/><div className="blob blob-2"/>
      <div className="fade-up" style={{ width: '100%', maxWidth: '420px', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', background: 'var(--grad-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
            InterviewIQ
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Reset your password</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Forgot password?</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Enter your email and we'll send you a reset link.
          </p>

          {error && (
            <div style={{ background: 'rgba(255,60,172,0.1)', border: '1px solid rgba(255,60,172,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#FF3CAC' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(120,75,160,0.6)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              marginTop: '0.25rem', padding: '0.875rem',
              background: loading ? 'rgba(255,255,255,0.05)' : 'var(--grad-main)',
              border: 'none', borderRadius: '12px', color: '#fff',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Sending...' : 'Send reset link →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
          Remember it?{' '}
          <button onClick={() => { setView('login'); setError('') }} style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem', padding: 0 }}>
            Back to sign in
          </button>
        </p>
      </div>
    </div>
  )

  // ── Login ──────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="blob blob-1"/><div className="blob blob-2"/><div className="blob blob-3"/>

      <div className="fade-up" style={{ width: '100%', maxWidth: '420px', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', background: 'var(--grad-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
            InterviewIQ
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Interview Anxiety Detector</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Welcome back
          </h1>

          {error && (
            <div style={{ background: 'rgba(255,60,172,0.1)', border: '1px solid rgba(255,60,172,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#FF3CAC' }}>
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            autoComplete="off"
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {/* Hidden dummy fields trick browsers into not autofilling the real ones */}
            <input type="text"     style={{ display: 'none' }} aria-hidden="true" readOnly />
            <input type="password" style={{ display: 'none' }} aria-hidden="true" readOnly />

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="new-password"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(120,75,160,0.6)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setView('forgot'); setError('') }}
                  style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer', padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(120,75,160,0.6)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              marginTop: '0.5rem', padding: '0.875rem',
              background: loading ? 'rgba(255,255,255,0.05)' : 'var(--grad-main)',
              border: 'none', borderRadius: '12px', color: '#fff',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
          No account?{' '}
          <Link href="/signup" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 500 }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}