import { useEffect, useState } from 'react'
import type { GeneratedBio } from '../types'
import { MAX_CHARS } from '../lib/generateBios'

interface Props {
  bio: GeneratedBio
}

export default function BioCard({ bio }: Props) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(bio.text)
    } catch {
      // Fallback for environments without clipboard API
      const ta = document.createElement('textarea')
      ta.value = bio.text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        /* noop */
      }
      document.body.removeChild(ta)
    }
    setCopied(true)
  }

  return (
    <div className="rounded-xl border border-gray-200 border-l-4 border-l-teal bg-teal-tint p-3">
      <p className="text-[14px] leading-snug text-gray-800">{bio.text}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11.5px] text-gray-500">
          {bio.charCount}/{MAX_CHARS} characters
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={
            'px-3 py-1 rounded-md text-[12px] font-semibold border transition-colors ' +
            (copied
              ? 'bg-teal text-white border-teal'
              : 'bg-white text-teal border-teal hover:bg-teal hover:text-white')
          }
          aria-label={copied ? 'Copied bio to clipboard' : 'Copy bio to clipboard'}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
