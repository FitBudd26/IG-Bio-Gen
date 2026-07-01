import type { BioFormData, FormErrors, Specialization } from '../types'
import {
  BUSINESS_TYPES,
  SPECIALIZATIONS,
  TARGET_AUDIENCES,
  TONE_PREFERENCES,
} from '../lib/constants'

interface Props {
  data: BioFormData
  errors: FormErrors
  onChange: <K extends keyof BioFormData>(key: K, value: BioFormData[K]) => void
  onToggleSpecialization: (spec: Specialization) => void
}

const inputBase =
  'w-full h-[40px] px-3 rounded-lg border border-gray-300 bg-white text-[13.5px] text-gray-800 ' +
  'outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20 ' +
  'placeholder:text-gray-400'

const labelBase = 'block text-[12px] font-semibold text-gray-700 mb-1'

const errorBase = 'mt-1 text-[11.5px] text-red-500'

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <label className={labelBase}>
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {children}
      {error && <p className={errorBase}>{error}</p>}
    </div>
  )
}

export default function InputForm({
  data,
  errors,
  onChange,
  onToggleSpecialization,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Row: Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Name / Business Name" required error={errors.name}>
          <input
            className={inputBase}
            type="text"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Your name or brand"
            aria-invalid={!!errors.name}
          />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input
            className={inputBase}
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="you@email.com"
            aria-invalid={!!errors.email}
          />
        </Field>
      </div>

      {/* Row: Business Type + Years */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Business Type" required error={errors.businessType}>
          <select
            className={inputBase}
            value={data.businessType}
            onChange={(e) =>
              onChange('businessType', e.target.value as BioFormData['businessType'])
            }
            aria-invalid={!!errors.businessType}
          >
            <option value="">Select…</option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Years of Experience">
          <input
            className={inputBase}
            type="text"
            value={data.yearsExperience}
            onChange={(e) => onChange('yearsExperience', e.target.value)}
            placeholder="e.g. 5+"
          />
        </Field>
      </div>

      {/* Row: Location + Target Audience */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Location">
          <input
            className={inputBase}
            type="text"
            value={data.location}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="City or Online"
          />
        </Field>
        <Field label="Target Audience" required error={errors.targetAudience}>
          <select
            className={inputBase}
            value={data.targetAudience}
            onChange={(e) =>
              onChange('targetAudience', e.target.value as BioFormData['targetAudience'])
            }
            aria-invalid={!!errors.targetAudience}
          >
            <option value="">Select…</option>
            {TARGET_AUDIENCES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Specializations */}
      <div>
        <label className={labelBase}>Specializations</label>
        <div className="flex flex-wrap gap-1.5">
          {SPECIALIZATIONS.map((spec) => {
            const active = data.specializations.includes(spec)
            return (
              <button
                key={spec}
                type="button"
                onClick={() => onToggleSpecialization(spec)}
                aria-pressed={active}
                className={
                  'px-2.5 py-1 rounded-full text-[12px] font-medium border transition-colors ' +
                  (active
                    ? 'bg-teal text-white border-teal'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-teal hover:text-teal')
                }
              >
                {spec}
              </button>
            )
          })}
        </div>
      </div>

      {/* USP */}
      <Field label="Unique Selling Point">
        <textarea
          className={
            'w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-[13.5px] ' +
            'text-gray-800 outline-none transition-colors resize-none h-[74px] ' +
            'focus:border-teal focus:ring-2 focus:ring-teal/20 placeholder:text-gray-400'
          }
          value={data.uniqueSellingPoint}
          onChange={(e) => onChange('uniqueSellingPoint', e.target.value)}
          placeholder="What makes you different? (e.g., 10+ years experience, specialized certifications, unique training method)"
        />
      </Field>

      {/* Tone */}
      <Field label="Tone Preference">
        <select
          className={inputBase}
          value={data.tonePreference}
          onChange={(e) =>
            onChange('tonePreference', e.target.value as BioFormData['tonePreference'])
          }
        >
          <option value="Auto">Auto (based on your input)</option>
          {TONE_PREFERENCES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
    </div>
  )
}
