import { useEffect, useRef, useState } from 'react'

interface Props {
  open: boolean
  /** Email already captured from the main form (if any). */
  existingEmail: string
  onClose: () => void
  onBook: (email: string) => void
}

export default function LeadCaptureModal({ open, existingEmail, onClose, onBook }: Props) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const hasEmail = existingEmail.trim().length > 0

  useEffect(() => {
    if (!open) return
    setEmail('')
    setError('')

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, input, [tabindex]:not([tabindex="-1"])',
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    // Move focus into the dialog.
    const t = setTimeout(() => {
      const target = dialogRef.current?.querySelector<HTMLElement>(
        'input, button',
      )
      target?.focus()
    }, 0)

    return () => {
      document.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open, onClose])

  if (!open) return null

  function handleBook() {
    const finalEmail = hasEmail ? existingEmail.trim() : email.trim()
    if (!hasEmail) {
      if (!finalEmail) {
        setError('Please enter your email.')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
        setError('Please enter a valid email.')
        return
      }
    }
    onBook(finalEmail)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="relative w-full max-w-[360px] rounded-2xl border border-gray-200 bg-white p-5 shadow-lg"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <h2 id="lead-modal-title" className="text-[16px] font-bold text-gray-900 pr-6">
          You’ve hit today’s limit 🎉
        </h2>
        <p className="mt-1.5 text-[13px] leading-snug text-gray-600">
          Want unlimited fitness business tools? Book a free FitBudd demo.
        </p>

        {!hasEmail && (
          <div className="mt-3">
            <label className="block text-[12px] font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-invalid={!!error}
              className="w-full h-[40px] px-3 rounded-lg border border-gray-300 bg-white text-[13.5px] text-gray-800 outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 placeholder:text-gray-400"
            />
            {error && <p className="mt-1 text-[11.5px] text-red-500">{error}</p>}
          </div>
        )}

        <button
          type="button"
          onClick={handleBook}
          className="mt-4 w-full h-[42px] rounded-lg bg-accent text-white text-[14px] font-bold hover:bg-accent-dark transition-colors"
        >
          Book Free Demo
        </button>
      </div>
    </div>
  )
}
