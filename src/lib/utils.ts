/** Format UGX amounts: 950000 → "UGX 950,000" */
export function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString('en-UG')}`
}

/** Format short: 950000 → "UGX 950K" */
export function formatUGXShort(amount: number): string {
  if (amount >= 1_000_000) return `UGX ${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000)     return `UGX ${Math.round(amount / 1_000)}K`
  return formatUGX(amount)
}

/** Collection rate as percentage string */
export function pct(numerator: number, denominator: number): string {
  if (!denominator) return '0%'
  return `${Math.round((numerator / denominator) * 100)}%`
}

/** Days overdue (negative = days until due) */
export function daysFromNow(dateStr: string): number {
  const due = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-UG', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
