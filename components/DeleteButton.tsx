'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

function BinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/>
      <path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

export default function DeleteButton({ sessionId }: { sessionId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setDeleting(true)
    await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
    router.refresh()
  }

  if (confirming) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Delete?</span>
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem',
          fontWeight: 600, cursor: 'pointer', border: 'none',
          background: '#FF3CAC', color: '#fff',
          opacity: deleting ? 0.6 : 1,
        }}
      >
        {deleting ? '...' : 'Yes'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        style={{
          padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem',
          fontWeight: 600, cursor: 'pointer',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid var(--border)',
          color: 'var(--muted)',
        }}
      >
        No
      </button>
    </div>
  )

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Delete session"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '28px', height: '28px',
        borderRadius: '8px', cursor: 'pointer',
        background: 'rgba(255,60,172,0.08)',
        border: '1px solid rgba(255,60,172,0.2)',
        color: 'rgba(255,60,172,0.6)',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,60,172,0.18)'
        e.currentTarget.style.color = '#FF3CAC'
        e.currentTarget.style.borderColor = 'rgba(255,60,172,0.5)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,60,172,0.08)'
        e.currentTarget.style.color = 'rgba(255,60,172,0.6)'
        e.currentTarget.style.borderColor = 'rgba(255,60,172,0.2)'
      }}
    >
      <BinIcon />
    </button>
  )
}