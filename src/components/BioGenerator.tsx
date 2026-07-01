import { useState } from 'react'
import type { BioFormData, FormErrors, GeneratedBio, Specialization } from '../types'
import { generateBios } from '../lib/generateBios'
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

// Keeps the form and results views at the same tool height so the embed size
// never changes when switching pages.
const VIEW_MIN_HEIGHT = 'min-h-[560px]'

type View = 'form' | 'results'

export default function BioGenerator() {
  const [form, setForm] = useState<BioFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [bios, setBios] = useState<GeneratedBio[]>([])
  const [view, setView] = useState<View>('form')
  const [modalOpen, setModalOpen] = useState(false)
  const [leadShown, setLeadShown] = useState(false)
  const [genCount, setGenCount] = useState(0)

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

  /** Generate a fresh set of bios. Returns false when validation blocked it. */
  function runGeneration(): boolean {
    if (!validate()) return false

    setBios(generateBios(form))

    const nextCount = genCount + 1
    setGenCount(nextCount)

    // Best-effort lead capture (no-op when HubSpot is not configured).
    void saveLead({ form, generationCount: nextCount })
    return true
  }

  function handleGenerate() {
    if (runGeneration()) setView('results')
  }

  function handleRegenerate() {
    runGeneration()
  }

  // Lead popup is triggered by the first bio copy in this session.
  function handleCopied() {
    if (!leadShown) {
      setLeadShown(true)
      setModalOpen(true)
    }
  }

  function handleBook(email: string) {
    void saveLead({ form, generationCount: genCount, email })
    setModalOpen(false)
    window.open(DEMO_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="relative w-full max-w-[536px] mx-auto p-4">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4">
        {view === 'form' ? (
          <div className={`flex flex-col ${VIEW_MIN_HEIGHT}`}>
            <div className="flex-1">
              <InputForm
                data={form}
                errors={errors}
                onChange={update}
                onToggleSpecialization={toggleSpecialization}
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              className="mt-4 w-full h-[46px] rounded-lg bg-accent text-white text-[15px] font-bold hover:bg-accent-dark transition-colors flex items-center justify-center gap-1.5"
            >
              <span aria-hidden="true">⚡</span>
              Generate Bios
            </button>
          </div>
        ) : (
          <div className={`flex flex-col ${VIEW_MIN_HEIGHT}`}>
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setView('form')}
                className="flex items-center gap-1 text-[12px] font-semibold text-teal hover:text-teal-dark"
              >
                <span aria-hidden="true">←</span> Edit details
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-2.5">
              {bios.map((bio, i) => (
                <BioCard key={i} bio={bio} onCopied={handleCopied} />
              ))}
            </div>

            <button
              type="button"
              onClick={handleRegenerate}
              className="mt-4 w-full h-[46px] rounded-lg bg-accent text-white text-[15px] font-bold hover:bg-accent-dark transition-colors flex items-center justify-center gap-1.5"
            >
              <span aria-hidden="true">⚡</span>
              Regenerate
            </button>
          </div>
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
