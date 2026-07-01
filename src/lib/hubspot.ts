import type { BioFormData } from '../types'

/**
 * HubSpot Forms Submission API integration.
 *
 * Uses the public Forms endpoint, which only needs a Portal ID + Form GUID
 * (both non-secret) — safe to ship in a client-side embed. No private app
 * token is ever exposed.
 *
 * Docs: https://developers.hubspot.com/docs/api/marketing/forms
 */

const portalId = import.meta.env.VITE_HUBSPOT_PORTAL_ID as string | undefined
const formGuid = import.meta.env.VITE_HUBSPOT_FORM_GUID as string | undefined

export function isHubSpotConfigured(): boolean {
  return Boolean(portalId && formGuid)
}

export interface LeadPayload {
  form: BioFormData
  generationCount: number
  /** Overrides form email when captured from the lead modal. */
  email?: string
}

interface HubSpotField {
  name: string
  value: string
}

/**
 * Best-effort lead submission. Never throws — if HubSpot is not configured or
 * the request fails, the app continues normally (booking flow still opens).
 *
 * Custom fields (business_type, etc.) must exist as contact properties in your
 * HubSpot account with matching internal names, and be added to the form.
 */
export async function saveLead(payload: LeadPayload): Promise<boolean> {
  if (!portalId || !formGuid) return false

  const { form, generationCount } = payload
  const email = (payload.email || form.email || '').trim()

  const fields: HubSpotField[] = []
  const push = (name: string, value: string | undefined) => {
    if (value && value.trim()) fields.push({ name, value: value.trim() })
  }

  push('email', email)
  push('firstname', form.name)
  push('business_type', form.businessType)
  push('years_experience', form.yearsExperience)
  push('location', form.location)
  push('specializations', form.specializations.join(', '))
  push('target_audience', form.targetAudience)
  push('unique_selling_point', form.uniqueSellingPoint)
  push('tone_preference', form.tonePreference)
  push('generation_count', String(generationCount))

  const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields,
        context: {
          pageName: 'Instagram Bio Generator',
          pageUri:
            typeof window !== 'undefined' ? window.location.href : undefined,
        },
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
