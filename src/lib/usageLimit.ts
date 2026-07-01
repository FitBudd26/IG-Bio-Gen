export const DAILY_LIMIT = 5
const STORAGE_KEY = 'ig_bio_usage'

interface UsageRecord {
  date: string // YYYY-MM-DD
  count: number
}

function todayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function read(): UsageRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as UsageRecord
      if (parsed.date === todayStr() && typeof parsed.count === 'number') {
        return parsed
      }
    }
  } catch {
    /* ignore malformed / unavailable storage */
  }
  return { date: todayStr(), count: 0 }
}

function write(record: UsageRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch {
    /* storage unavailable — app still functions in-memory this session */
  }
}

/** Current usage count for today (auto-resets when the date changes). */
export function getUsageCount(): number {
  return read().count
}

/** Increment and persist today's usage. Returns the new count. */
export function incrementUsage(): number {
  const record = read()
  const next: UsageRecord = { date: todayStr(), count: record.count + 1 }
  write(next)
  return next.count
}

export function hasReachedLimit(): boolean {
  return getUsageCount() >= DAILY_LIMIT
}
