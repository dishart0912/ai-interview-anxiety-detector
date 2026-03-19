'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="blob blob-1"/><div className="blob blob-2"/><div className="blob blob-3"/>

      <div className="fade-up" style={{ width: '100%', maxWidth: '420px', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', background: 'var(--grad-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>InterviewIQ</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Start your journey to interview confidence</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>Create account</h1>

          {error && (
            <div style={{ background: 'rgba(255,60,172,0.1)', border: '1px solid rgba(255,60,172,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#FF3CAC' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Email', type: 'email', val: email, set: setEmail, ph: 'you@example.com' },
              { label: 'Password', type: 'password', val: password, set: setPassword, ph: 'Min 6 characters' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 500, display: 'block', marginBottom: '6px' }}>{f.label}</label>
                <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} required
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1rem', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            ))}

            <button type="submit" disabled={loading} style={{
              marginTop: '0.5rem', padding: '0.875rem',
              background: loading ? 'rgba(255,255,255,0.05)' : 'var(--grad-green)',
              border: 'none', borderRadius: '12px', color: '#0A0A0F',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Creating account...' : 'Get started →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--pink)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}