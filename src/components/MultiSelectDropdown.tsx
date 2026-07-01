import { useEffect, useRef, useState } from 'react'

interface Props<T extends string> {
  options: readonly T[]
  selected: T[]
  onToggle: (value: T) => void
  placeholder?: string
}

export default function MultiSelectDropdown<T extends string>({
  options,
  selected,
  onToggle,
  placeholder = 'Select…',
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const summary =
    selected.length === 0
      ? placeholder
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selected`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full h-[40px] items-center justify-between px-3 rounded-lg border border-gray-300 bg-white text-[13.5px] outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20"
      >
        <span className={selected.length ? 'text-gray-800 truncate' : 'text-gray-400'}>
          {summary}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 ml-2 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-[210px] overflow-auto py-1"
        >
          {options.map((opt) => {
            const active = selected.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onToggle(opt)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] hover:bg-teal-tint"
              >
                <span
                  className={
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border ' +
                    (active ? 'bg-teal border-teal text-white' : 'border-gray-300 bg-white')
                  }
                  aria-hidden="true"
                >
                  {active && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
                <span className="text-gray-700">{opt}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
