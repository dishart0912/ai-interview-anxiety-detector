'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/interview/start', label: 'New interview' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(10,10,15,0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 2rem',
      height: '60px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link href="/dashboard" style={{ textDecoration: 'none' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800, fontSize: '1.2rem',
          background: 'var(--grad-main)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>
          InterviewIQ
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {links.map(link => (
          <Link key={link.href} href={link.href} style={{
            textDecoration: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: pathname === link.href ? 'var(--text)' : 'var(--muted)',
            background: pathname === link.href ? 'rgba(255,255,255,0.08)' : 'transparent',
            transition: 'all 0.2s',
          }}>
            {link.label}
          </Link>
        ))}

        <button onClick={handleLogout} style={{
          marginLeft: '0.5rem',
          padding: '6px 14px',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--muted)',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}