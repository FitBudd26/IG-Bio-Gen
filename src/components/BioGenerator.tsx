import { useState } from 'react'
import type { BioFormData, FormErrors, GeneratedBio, Specialization } from '../types'
import { generateBios } from '../lib/generateBios'
import {
  DAILY_LIMIT,
  getUsageCount,
  hasReachedLimit,
  incrementUsage,
} from '../lib/usageLimit'
import { saveLead } from '../lib/hubspot'
import { DEMO_URL } from '../lib/constants'
import InputForm from './InputForm'
import BioCard from './BioCard'
import LeadCaptureModal from './LeadCaptureModal'

const EMPTY_FORM: BioFormData = {
  name: '',
  email: '',
  businessType: '',
  yearsExperience: '',
  location: '',
  specializations: [],
  targetAudience: '',
  uniqueSellingPoint: '',
  tonePreference: 'Auto',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type View = 'form' | 'results'

export default function BioGenerator() {
  const [form, setForm] = useState<BioFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [bios, setBios] = useState<GeneratedBio[]>([])
  const [usage, setUsage] = useState<number>(() => getUsageCount())
  const [modalOpen, setModalOpen] = useState(false)
  const [view, setView] = useState<View>('form')

  function update<K extends keyof BioFormData>(key: K, value: BioFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  }

  function toggleSpecialization(spec: Specialization) {
    setForm((f) => ({
      ...f,
      specializations: f.specializations.includes(spec)
        ? f.specializations.filter((s) => s !== spec)
        : [...f.specializations, spec],
    }))
  }

  function validate(): boolean {
    const next: FormErrors = {}
    if (!form.name.trim()) next.name = 'Name / Business Name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!EMAIL_RE.test(form.email.trim())) next.email = 'Enter a valid email.'
    if (!form.businessType) next.businessType = 'Business Type is required.'
    if (!form.targetAudience) next.targetAudience = 'Target Audience is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  /** Core generation step. Returns false when it was blocked (limit/validation). */
  function runGeneration(): boolean {
    // Beyond the daily limit → no generation, show the lead modal.
    if (hasReachedLimit()) {
      setModalOpen(true)
      return false
    }
    if (!validate()) return false

    setBios(generateBios(form))

    const newCount = incrementUsage()
    setUsage(newCount)

    // Best-effort lead capture (no-op when Supabase is not configured).
    void saveLead({ form, generationCount: newCount })

    // After the final generation, surface the lead modal.
    if (newCount >= DAILY_LIMIT) {
      setModalOpen(true)
    }
    return true
  }

  function handleGenerate() {
    if (runGeneration()) setView('results')
  }

  function handleRegenerate() {
    // Stays on the results page; just refreshes the bios (counts as a generation).
    runGeneration()
  }

  function handleBook(email: string) {
    void saveLead({ form, generationCount: getUsageCount(), email })
    setModalOpen(false)
    window.open(DEMO_URL, '_blank', 'noopener,noreferrer')
  }

  const limitReached = usage >= DAILY_LIMIT

  return (
    <div className="w-full max-w-[536px] mx-auto p-4">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        {/* Usage counter */}
        <div className="flex items-center justify-between mb-2">
          {view === 'results' ? (
            <button
              type="button"
              onClick={() => setView('form')}
              className="flex items-center gap-1 text-[12px] font-semibold text-teal hover:text-teal-dark"
            >
              <span aria-hidden="true">←</span> Edit details
            </button>
          ) : (
            <span />
          )}
          <span className="text-[12px] font-medium text-gray-500">
            Daily generations: {usage}/{DAILY_LIMIT} used
          </span>
        </div>

        {view === 'form' ? (
          <>
            <InputForm
              data={form}
              errors={errors}
              onChange={update}
              onToggleSpecialization={toggleSpecialization}
            />

            <button
              type="button"
              onClick={handleGenerate}
              className="mt-4 w-full h-[46px] rounded-lg bg-accent text-white text-[15px] font-bold hover:bg-accent-dark transition-colors flex items-center justify-center gap-1.5"
            >
              <span aria-hidden="true">⚡</span>
              Generate Bios
            </button>

            {limitReached && (
              <p className="mt-2 text-center text-[12px] text-gray-500">
                You’ve used all {DAILY_LIMIT} generations today.
              </p>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2.5">
              {bios.map((bio, i) => (
                <BioCard key={i} bio={bio} />
              ))}
            </div>

            <button
              type="button"
              onClick={handleRegenerate}
              disabled={limitReached}
              className="mt-4 w-full h-[46px] rounded-lg bg-accent text-white text-[15px] font-bold hover:bg-accent-dark transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent"
            >
              <span aria-hidden="true">⚡</span>
              Regenerate
            </button>

            {limitReached && (
              <p className="mt-2 text-center text-[12px] text-gray-500">
                You’ve used all {DAILY_LIMIT} generations today.
              </p>
            )}
          </>
        )}
      </div>

      <LeadCaptureModal
        open={modalOpen}
        existingEmail={form.email}
        onClose={() => setModalOpen(false)}
        onBook={handleBook}
      />
    </div>
  )
}
