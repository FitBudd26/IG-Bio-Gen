export type TonePreference =
  | 'Professional & Credible'
  | 'Motivational & Energetic'
  | 'Friendly & Approachable'
  | 'Scientific & Educational'

export type BusinessType =
  | 'Personal Trainer'
  | 'Gym Owner'
  | 'Boutique Studio Owner'
  | 'Online Fitness Coach'
  | 'Group Fitness Instructor'
  | 'Yoga/Pilates Instructor'
  | 'CrossFit Coach'
  | 'Nutrition Coach'
  | 'Fitness Influencer'
  | 'Specialized Coach (Martial Arts, Boxing, etc.)'

export type TargetAudience =
  | 'Busy Parents'
  | 'Young Professionals'
  | 'Seniors (55+)'
  | 'Athletes'
  | 'Beginners'
  | 'Women Only'
  | 'General Population'

export type Specialization =
  | 'Weight Loss'
  | 'Muscle Building'
  | 'Athletic Performance'
  | 'Senior Fitness'
  | "Women's Health"
  | 'Youth Training'
  | 'Injury Recovery'
  | 'Nutrition Coaching'
  | 'Mental Health & Fitness'
  | 'Functional Movement'

export interface BioFormData {
  name: string
  email: string
  businessType: BusinessType | ''
  yearsExperience: string
  location: string
  specializations: Specialization[]
  targetAudience: TargetAudience | ''
  uniqueSellingPoint: string
  /** 'Auto' infers the best tone from the other inputs; '' is unselected. */
  tonePreference: TonePreference | 'Auto' | ''
}

export interface GeneratedBio {
  text: string
  charCount: number
}

export type FormErrors = Partial<Record<keyof BioFormData, string>>
