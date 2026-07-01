import type {
  BusinessType,
  Specialization,
  TargetAudience,
  TonePreference,
} from '../types'

export const DEMO_URL = 'https://www.fitbudd.com/book-a-demo'

export const BUSINESS_TYPES: BusinessType[] = [
  'Personal Trainer',
  'Gym Owner',
  'Boutique Studio Owner',
  'Online Fitness Coach',
  'Group Fitness Instructor',
  'Yoga/Pilates Instructor',
  'CrossFit Coach',
  'Nutrition Coach',
  'Fitness Influencer',
  'Specialized Coach (Martial Arts, Boxing, etc.)',
]

export const TARGET_AUDIENCES: TargetAudience[] = [
  'Busy Parents',
  'Young Professionals',
  'Seniors (55+)',
  'Athletes',
  'Beginners',
  'Women Only',
  'General Population',
]

export const SPECIALIZATIONS: Specialization[] = [
  'Weight Loss',
  'Muscle Building',
  'Athletic Performance',
  'Senior Fitness',
  "Women's Health",
  'Youth Training',
  'Injury Recovery',
  'Nutrition Coaching',
  'Mental Health & Fitness',
  'Functional Movement',
]

export const TONE_PREFERENCES: TonePreference[] = [
  'Professional & Credible',
  'Motivational & Energetic',
  'Friendly & Approachable',
  'Scientific & Educational',
]
