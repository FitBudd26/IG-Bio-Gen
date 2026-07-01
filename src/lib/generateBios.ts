import type {
  BioFormData,
  GeneratedBio,
  Specialization,
  TargetAudience,
  TonePreference,
} from '../types'

export const MAX_CHARS = 150

/**
 * Grapheme-aware character count so multi-codepoint emojis (e.g. 🏋️‍♀️)
 * count as a single "character", matching how Instagram-style counters feel.
 */
export function countChars(text: string): number {
  const AnyIntl = Intl as unknown as {
    Segmenter?: new (
      locale?: string,
      opts?: { granularity: 'grapheme' | 'word' | 'sentence' },
    ) => { segment: (s: string) => Iterable<unknown> }
  }
  if (typeof AnyIntl.Segmenter === 'function') {
    const seg = new AnyIntl.Segmenter('en', { granularity: 'grapheme' })
    let count = 0
    for (const _ of seg.segment(text)) count++
    return count
  }
  return Array.from(text).length
}

type Style = 'authority' | 'results' | 'community' | 'value'

// ---------------------------------------------------------------------------
// Vocabulary pools
// ---------------------------------------------------------------------------

const AUDIENCE_PHRASES: Record<TargetAudience, string[]> = {
  'Busy Parents': ['busy parents', 'parents on the clock', 'time-strapped parents'],
  'Young Professionals': ['busy pros', 'young professionals', '9-to-5 hustlers'],
  'Seniors (55+)': ['the active 55+ crowd', 'strong-at-55 movers', 'seniors who mean it'],
  Athletes: ['driven athletes', 'competitors', 'athletes'],
  Beginners: ['beginners', 'day-one lifters', 'first-timers'],
  'Women Only': ['strong women', 'women who lift', 'women'],
  'General Population': ['everyday lifters', 'everyday humans', 'real people'],
}

const SPEC_PHRASES: Record<Specialization, string[]> = {
  'Weight Loss': ['fat-loss', 'lean results', 'sustainable weight loss'],
  'Muscle Building': ['real gains', 'strength & size', 'muscle'],
  'Athletic Performance': ['performance', 'athletic power', 'game-day strength'],
  'Senior Fitness': ['mobility', 'joint-friendly strength', 'strong-for-life training'],
  "Women's Health": ["women's strength", 'hormone-smart training', "women's health"],
  'Youth Training': ['young-athlete development', 'foundational strength', 'youth athletics'],
  'Injury Recovery': ['pain-free movement', 'rehab-to-strong', 'return-to-strength'],
  'Nutrition Coaching': ['macros', 'smart fueling', 'no-BS nutrition'],
  'Mental Health & Fitness': ['mind & muscle', 'stress-proof training', 'mental strength'],
  'Functional Movement': ['functional movement', 'move-better training', 'everyday strength'],
}

const FITNESS_VERBS = [
  'reps',
  'strength',
  'form',
  'mobility',
  'habits',
  'coaching',
  'accountability',
  'sweat',
  'gains',
]

const RESULT_PHRASES = [
  'results you can measure',
  'real, lasting results',
  'progress that sticks',
  'PRs worth chasing',
  'lean, strong, capable',
]

const TONE: Record<
  TonePreference,
  { descriptors: string[]; emojiPairs: [string, string][] }
> = {
  'Professional & Credible': {
    descriptors: ['proven programming', 'structured coaching', 'experience + evidence'],
    emojiPairs: [
      ['📈', '💪'],
      ['🎯', '🏋️‍♀️'],
      ['📊', '💪'],
      ['✅', '💪'],
    ],
  },
  'Motivational & Energetic': {
    descriptors: ['high-energy sessions', 'full-send effort', 'relentless consistency'],
    emojiPairs: [
      ['🔥', '⚡'],
      ['💪', '🔥'],
      ['⚡', '🏋️‍♀️'],
      ['🚀', '🔥'],
    ],
  },
  'Friendly & Approachable': {
    descriptors: ['zero judgment', 'real-people coaching', 'come-as-you-are vibes'],
    emojiPairs: [
      ['💪', '🙌'],
      ['🥗', '💪'],
      ['😊', '🔥'],
      ['🙌', '🔥'],
    ],
  },
  'Scientific & Educational': {
    descriptors: ['evidence-based training', 'data-driven programming', 'science-backed methods'],
    emojiPairs: [
      ['🧠', '💪'],
      ['📊', '🔬'],
      ['📈', '🧠'],
      ['🔬', '💪'],
    ],
  },
}

// ---------------------------------------------------------------------------
// Auto tone inference — picks the tone that best fits the user's inputs.
// ---------------------------------------------------------------------------

const DEFAULT_TONE: TonePreference = 'Professional & Credible'

export function inferTone(data: BioFormData): TonePreference {
  const score: Record<TonePreference, number> = {
    'Professional & Credible': 0,
    'Motivational & Energetic': 0,
    'Friendly & Approachable': 0,
    'Scientific & Educational': 0,
  }

  // Business type signals
  switch (data.businessType) {
    case 'Nutrition Coach':
      score['Scientific & Educational'] += 2
      break
    case 'CrossFit Coach':
    case 'Group Fitness Instructor':
    case 'Fitness Influencer':
      score['Motivational & Energetic'] += 2
      break
    case 'Yoga/Pilates Instructor':
      score['Friendly & Approachable'] += 2
      break
    case 'Gym Owner':
    case 'Boutique Studio Owner':
    case 'Online Fitness Coach':
    case 'Personal Trainer':
      score['Professional & Credible'] += 1
      break
  }

  // Target audience signals
  switch (data.targetAudience) {
    case 'Athletes':
      score['Motivational & Energetic'] += 2
      break
    case 'Beginners':
    case 'Busy Parents':
      score['Friendly & Approachable'] += 2
      break
    case 'Seniors (55+)':
      score['Friendly & Approachable'] += 1
      score['Scientific & Educational'] += 1
      break
    case 'Young Professionals':
      score['Professional & Credible'] += 1
      break
  }

  // Specialization signals
  for (const spec of data.specializations) {
    if (spec === 'Athletic Performance' || spec === 'Muscle Building')
      score['Motivational & Energetic'] += 1
    else if (
      spec === 'Nutrition Coaching' ||
      spec === 'Injury Recovery' ||
      spec === 'Senior Fitness' ||
      spec === 'Functional Movement'
    )
      score['Scientific & Educational'] += 1
    else if (spec === 'Mental Health & Fitness' || spec === "Women's Health")
      score['Friendly & Approachable'] += 1
  }

  // Unique selling point keyword signals
  const usp = data.uniqueSellingPoint.toLowerCase()
  const has = (words: string[]) => words.some((w) => usp.includes(w))
  if (has(['science', 'evidence', 'research', 'study', 'data', 'phd', 'physio', 'rd ', 'dietitian']))
    score['Scientific & Educational'] += 2
  if (has(['certified', 'certification', 'years', 'experience', 'proven', 'licensed', 'accredited']))
    score['Professional & Credible'] += 2
  if (has(['fun', 'energy', 'hype', 'motivat', 'passion', 'intense']))
    score['Motivational & Energetic'] += 2
  if (has(['welcoming', 'friendly', 'judgment', 'judgement', 'community', 'supportive', 'safe space']))
    score['Friendly & Approachable'] += 2

  // Highest score wins; deterministic tie-break via preference order.
  const order: TonePreference[] = [
    'Professional & Credible',
    'Motivational & Energetic',
    'Friendly & Approachable',
    'Scientific & Educational',
  ]
  let best = DEFAULT_TONE
  let bestScore = -1
  for (const tone of order) {
    if (score[tone] > bestScore) {
      bestScore = score[tone]
      best = tone
    }
  }
  return best
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** A short, usable USP snippet — only when it stays tight enough to read cleanly. */
function uspSnippet(usp: string): string | null {
  const trimmed = usp.trim().replace(/\s+/g, ' ').replace(/[.。]+$/, '')
  if (!trimmed) return null
  if (countChars(trimmed) > 45) return null
  return trimmed
}

interface Ctx {
  audience: string
  spec: string
  descriptor: string
  usp: string | null
  verbs: string[]
}

// ---------------------------------------------------------------------------
// Templates per style. Each returns an ordered list of candidate texts
// (fuller first, shorter fallbacks last) — never emojis, never names.
// ---------------------------------------------------------------------------

function authorityTemplates(c: Ctx): string[] {
  const [v1, v2] = c.verbs
  const withUsp = c.usp
    ? [
        `${cap(c.usp)}. Coaching ${c.audience} to real ${c.spec} with ${c.descriptor}.`,
        `${cap(c.usp)} — ${c.spec} coaching for ${c.audience}, built on ${v1} that counts.`,
      ]
    : []
  return [
    ...withUsp,
    `Coaching ${c.audience} to real ${c.spec} with ${c.descriptor} and smarter ${v1}.`,
    `${cap(c.spec)} coaching built on ${c.descriptor}. No fluff, just ${v1} and ${v2}.`,
    `Helping ${c.audience} train with intent: dialed-in ${v1}, honest ${v2}.`,
    `${cap(c.descriptor)} for ${c.audience}. ${cap(c.spec)} done right.`,
  ]
}

function resultsTemplates(c: Ctx): string[] {
  const [v1, v2] = c.verbs
  const result = pick(RESULT_PHRASES)
  const withUsp = c.usp
    ? [
        `${cap(c.usp)}. ${cap(c.spec)} for ${c.audience} — ${result}.`,
        `${cap(c.usp)} turning consistent ${v1} into ${result} for ${c.audience}.`,
      ]
    : []
  return [
    ...withUsp,
    `${cap(c.spec)} that sticks. Smarter ${v1}, better ${v2}, ${result}.`,
    `Turning consistent ${v1} into visible ${c.spec} for ${c.audience}.`,
    `Less guessing, more ${v1}. ${cap(result)} for ${c.audience} who show up.`,
    `${cap(c.spec)} for ${c.audience}. Smarter ${v1}, ${result}.`,
  ]
}

function communityTemplates(c: Ctx): string[] {
  const [v1] = c.verbs
  const withUsp = c.usp
    ? [
        `${cap(c.usp)}. A crew of ${c.audience} chasing ${c.spec} and keeping it honest.`,
        `${cap(c.usp)} — ${c.audience} who train together and get strong for good.`,
      ]
    : []
  return [
    ...withUsp,
    `Building a crew of ${c.audience} who chase ${c.spec} and keep each other honest.`,
    `Where ${c.audience} train together, laugh often, and get strong for good.`,
    `${cap(c.spec)} with a team that has your back: ${v1}, accountability, momentum.`,
    `A home for ${c.audience} chasing ${c.spec} — together.`,
  ]
}

function valueTemplates(c: Ctx): string[] {
  const [v1, v2] = c.verbs
  const withUsp = c.usp
    ? [
        `${cap(c.usp)}. Real ${c.spec} for ${c.audience}, minus the fluff.`,
        `${cap(c.usp)} — smarter ${v1}, steadier ${v2}, better results.`,
      ]
    : []
  return [
    ...withUsp,
    `${cap(c.spec)} without the guesswork — just ${v1}, ${v2}, and momentum.`,
    `Helping ${c.audience} move better, feel stronger, and keep the ${v1}.`,
    `Real ${c.spec} for ${c.audience}. Sustainable ${v1}, zero fluff.`,
    `${cap(c.spec)} built around your life, not the other way around.`,
  ]
}

const TEMPLATES: Record<Style, (c: Ctx) => string[]> = {
  authority: authorityTemplates,
  results: resultsTemplates,
  community: communityTemplates,
  value: valueTemplates,
}

// ---------------------------------------------------------------------------
// Bio assembly
// ---------------------------------------------------------------------------

function buildBio(style: Style, ctx: Ctx, emojis: [string, string]): GeneratedBio {
  const candidates = TEMPLATES[style](ctx)
  const suffix = ` ${emojis[0]}${emojis[1]}`

  for (const text of candidates) {
    const full = text + suffix
    if (countChars(full) <= MAX_CHARS) {
      return { text: full, charCount: countChars(full) }
    }
  }

  // Absolute fallback — guaranteed short, never a mid-sentence cut.
  const safe = `${cap(ctx.spec)} coaching for ${ctx.audience}.` + suffix
  return { text: safe, charCount: countChars(safe) }
}

export function generateBios(data: BioFormData): GeneratedBio[] {
  const audienceList =
    data.targetAudience && AUDIENCE_PHRASES[data.targetAudience]
      ? AUDIENCE_PHRASES[data.targetAudience]
      : ['everyday lifters']

  const specPool =
    data.specializations.length > 0
      ? data.specializations.flatMap((s) => SPEC_PHRASES[s])
      : ['strength', 'lean results', 'real gains', 'mobility']

  // Resolve the tone: a concrete choice is used directly; 'Auto' or unselected
  // infers the best-fitting tone from the rest of the inputs.
  const resolvedTone: TonePreference =
    data.tonePreference && data.tonePreference !== 'Auto'
      ? data.tonePreference
      : inferTone(data)
  const tone = TONE[resolvedTone]
  const usp = uspSnippet(data.uniqueSellingPoint)

  const emojiPairs = shuffle(tone.emojiPairs)
  const styles: Style[] = ['authority', 'results', 'community', 'value']

  const seenText = new Set<string>()

  return styles.map((style, i): GeneratedBio => {
    const verbs = shuffle(FITNESS_VERBS)
    const ctx: Ctx = {
      audience: pick(audienceList),
      spec: pick(specPool),
      descriptor: pick(tone.descriptors),
      usp,
      verbs,
    }

    let bio = buildBio(style, ctx, emojiPairs[i % emojiPairs.length])

    // Ensure the three bios read as clearly different.
    let attempts = 0
    while (seenText.has(bio.text) && attempts < 5) {
      const retryCtx: Ctx = {
        ...ctx,
        audience: pick(audienceList),
        spec: pick(specPool),
        descriptor: pick(tone.descriptors),
        verbs: shuffle(FITNESS_VERBS),
      }
      bio = buildBio(style, retryCtx, emojiPairs[i % emojiPairs.length])
      attempts++
    }
    seenText.add(bio.text)
    return bio
  })
}
