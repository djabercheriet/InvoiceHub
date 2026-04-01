'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-svh w-full items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1a6b1a 0%, #0a3d0a 50%, #003366 100%)',
        fontFamily: '"MS Sans Serif", "Tahoma", sans-serif',
        fontSize: '11px',
      }}
    >
      {/* Outer window frame */}
      <div
        style={{
          width: '340px',
          border: '2px solid',
          borderColor: '#ffffff #808080 #808080 #ffffff',
          boxShadow: '4px 4px 10px rgba(0,0,0,0.5), inset 1px 1px 0 #dfdfdf',
          background: '#d4d0c8',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            background: 'linear-gradient(to right, #0a246a, #a6b5d7)',
            padding: '3px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Window icon */}
            <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="0" y="0" width="6" height="6" fill="#ff0000" />
                <rect x="8" y="0" width="6" height="6" fill="#00cc00" />
                <rect x="0" y="8" width="6" height="6" fill="#0000ff" />
                <rect x="8" y="8" width="6" height="6" fill="#ffcc00" />
              </svg>
            </div>
            <span style={{ color: '#ffffff', fontSize: '11px', fontWeight: 'bold', fontFamily: '"Tahoma", sans-serif' }}>
              Log On to InvoiceHub
            </span>
          </div>
          {/* Window controls */}
          <div style={{ display: 'flex', gap: '2px' }}>
            {['_', '□', '×'].map((btn, i) => (
              <button
                key={i}
                style={{
                  width: '16px',
                  height: '14px',
                  background: '#d4d0c8',
                  border: '1px solid',
                  borderColor: '#ffffff #808080 #808080 #ffffff',
                  fontSize: '9px',
                  fontFamily: '"Marlett", sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'default',
                  color: '#000',
                  padding: 0,
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>

        {/* Window content */}
        <div style={{ padding: '12px' }}>
          {/* Logo area */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px',
              background: '#ffffff',
              border: '1px solid',
              borderColor: '#808080 #ffffff #ffffff #808080',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #003399, #0066ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #003399',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="8" width="20" height="14" rx="1" stroke="white" strokeWidth="1.5" fill="none" />
                <path d="M4 11h20" stroke="white" strokeWidth="1.5" />
                <rect x="7" y="14" width="6" height="1.5" rx="0.5" fill="white" />
                <rect x="7" y="17" width="10" height="1.5" rx="0.5" fill="white" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#003399' }}>InvoiceHub</div>
              <div style={{ fontSize: '10px', color: '#666666' }}>Professional Edition</div>
              <div style={{ fontSize: '9px', color: '#999999' }}>Version 2.0.0</div>
            </div>
          </div>

          {/* Separator */}
          <div style={{ borderTop: '1px solid #808080', borderBottom: '1px solid #ffffff', marginBottom: '12px' }} />

          {/* Welcome text */}
          <p style={{ fontSize: '11px', color: '#000000', marginBottom: '12px', lineHeight: '1.4' }}>
            Please enter your user name and password to log on to InvoiceHub.
          </p>

          <form onSubmit={handleLogin}>
            {/* Email field */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '6px' }}>
              <label
                htmlFor="email"
                style={{ width: '80px', fontSize: '11px', color: '#000000', flexShrink: 0, textAlign: 'right' }}
              >
                User name:
              </label>
              <input
                id="email"
                type="email"
                placeholder="user@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  height: '21px',
                  padding: '2px 4px',
                  fontSize: '11px',
                  fontFamily: '"Tahoma", sans-serif',
                  background: '#ffffff',
                  border: '1px solid',
                  borderColor: '#808080 #dfdfdf #dfdfdf #808080',
                  outline: 'none',
                  boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.15)',
                  color: '#000000',
                }}
              />
            </div>

            {/* Password field */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '6px' }}>
              <label
                htmlFor="password"
                style={{ width: '80px', fontSize: '11px', color: '#000000', flexShrink: 0, textAlign: 'right' }}
              >
                Password:
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  flex: 1,
                  height: '21px',
                  padding: '2px 4px',
                  fontSize: '11px',
                  fontFamily: '"Tahoma", sans-serif',
                  background: '#ffffff',
                  border: '1px solid',
                  borderColor: '#808080 #dfdfdf #dfdfdf #808080',
                  outline: 'none',
                  boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.15)',
                  color: '#000000',
                }}
              />
            </div>

            {/* Error message */}
            {error && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #808080',
                  padding: '4px 8px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '16px', color: '#cc0000', fontWeight: 'bold' }}>✕</span>
                <span style={{ fontSize: '11px', color: '#cc0000' }}>{error}</span>
              </div>
            )}

            {/* Separator */}
            <div style={{ borderTop: '1px solid #808080', borderBottom: '1px solid #ffffff', marginBottom: '10px' }} />

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
              <Win2kButton type="submit" disabled={isLoading} primary>
                {isLoading ? 'Logging on...' : 'OK'}
              </Win2kButton>
              <Win2kButton type="button" onClick={() => { setEmail(''); setPassword(''); setError(null) }}>
                Cancel
              </Win2kButton>
              <Win2kButton type="button">
                Help
              </Win2kButton>
            </div>
          </form>

          {/* Sign-up link */}
          <div style={{ marginTop: '10px', borderTop: '1px solid #808080', paddingTop: '8px' }}>
            <p style={{ fontSize: '11px', color: '#000000', margin: 0 }}>
              {'Don\'t have an account? '}
              <Link
                href="/auth/sign-up"
                style={{ color: '#0000ff', textDecoration: 'underline', fontSize: '11px' }}
              >
                Create a new account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Status bar at bottom of screen */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '28px',
          background: '#d4d0c8',
          borderTop: '1px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: '2px',
          boxShadow: '0 -1px 0 #808080',
        }}
      >
        {/* Start button */}
        <button
          style={{
            height: '22px',
            padding: '0 8px',
            background: '#d4d0c8',
            border: '1px solid',
            borderColor: '#ffffff #808080 #808080 #ffffff',
            fontSize: '11px',
            fontWeight: 'bold',
            fontFamily: '"Tahoma", sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'default',
            color: '#000000',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="0" y="0" width="6" height="6" fill="#ff0000" />
            <rect x="8" y="0" width="6" height="6" fill="#00cc00" />
            <rect x="0" y="8" width="6" height="6" fill="#0000ff" />
            <rect x="8" y="8" width="6" height="6" fill="#ffcc00" />
          </svg>
          Start
        </button>
        {/* Separator */}
        <div style={{ width: '1px', height: '20px', background: '#808080', marginLeft: '2px' }} />
        <div style={{ width: '1px', height: '20px', background: '#ffffff', marginRight: '2px' }} />
        {/* Taskbar item */}
        <div
          style={{
            height: '22px',
            padding: '0 8px',
            background: '#bdb9b0',
            border: '1px solid',
            borderColor: '#808080 #ffffff #ffffff #808080',
            fontSize: '11px',
            fontFamily: '"Tahoma", sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#000000',
          }}
        >
          Log On to InvoiceHub
        </div>
        {/* Clock */}
        <div
          style={{
            marginLeft: 'auto',
            height: '22px',
            padding: '0 6px',
            border: '1px solid',
            borderColor: '#808080 #ffffff #ffffff #808080',
            fontSize: '11px',
            fontFamily: '"Tahoma", sans-serif',
            display: 'flex',
            alignItems: 'center',
            color: '#000000',
          }}
        >
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

function Win2kButton({
  children,
  type = 'button',
  disabled = false,
  primary = false,
  onClick,
}: {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  primary?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        minWidth: '72px',
        height: '23px',
        padding: '0 8px',
        fontSize: '11px',
        fontFamily: '"Tahoma", sans-serif',
        background: disabled ? '#d4d0c8' : '#d4d0c8',
        border: `${primary ? '2px' : '1px'} solid`,
        borderColor: disabled
          ? '#a0a0a0 #a0a0a0 #a0a0a0 #a0a0a0'
          : '#ffffff #808080 #808080 #ffffff',
        color: disabled ? '#808080' : '#000000',
        cursor: disabled ? 'default' : 'default',
        outline: primary ? '1px solid #000000' : 'none',
        outlineOffset: '-3px',
        boxShadow: disabled ? 'none' : '1px 1px 0 #dfdfdf inset',
      }}
    >
      {children}
    </button>
  )
}
