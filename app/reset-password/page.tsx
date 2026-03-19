'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Supabase puts the token in the URL hash — this handles it automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is now in password recovery mode, show the form
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
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

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="blob blob-1"/><div className="blob blob-2"/>
      <div className="fade-up" style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '2rem' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,245,160,0.1)', border: '1px solid rgba(0,245,160,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.75rem' }}>
          ✓
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Password updated!</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Redirecting you to dashboard...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="blob blob-1"/><div className="blob blob-2"/>

      <div className="fade-up" style={{ width: '100%', maxWidth: '420px', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', background: 'var(--grad-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
            InterviewIQ
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Set your new password</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>New password</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Choose a strong password for your account.</p>

          {error && (
            <div style={{ background: 'rgba(255,60,172,0.1)', border: '1px solid rgba(255,60,172,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#FF3CAC' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>New password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                autoComplete="new-password"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(120,75,160,0.6)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Same as above"
                required
                autoComplete="new-password"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(120,75,160,0.6)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              marginTop: '0.25rem', padding: '0.875rem',
              background: loading ? 'rgba(255,255,255,0.05)' : 'var(--grad-green)',
              border: 'none', borderRadius: '12px',
              color: loading ? 'var(--muted)' : '#0A0A0F',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Updating...' : 'Update password →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
