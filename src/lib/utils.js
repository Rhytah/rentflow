/** Format UGX amounts: 950000 → "UGX 950,000" */
export function formatUGX(amount) {
  return `UGX ${amount.toLocaleString('en-UG')}`
}

/** Format short: 950000 → "UGX 950K" */
export function formatUGXShort(amount) {
  if (amount >= 1_000_000) return `UGX ${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `UGX ${Math.round(amount / 1_000)}K`
  return formatUGX(amount)
}

/** Collection rate as percentage string */
export function pct(numerator, denominator) {
  if (!denominator) return '0%'
  return `${Math.round((numerator / denominator) * 100)}%`
}

/** Days overdue (negative = days until due) */
export function daysFromNow(dateStr) {
  const due = new Date(dateStr)
  const now = new Date()
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-UG', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

/** Trigger a CSV file download from an array of row arrays (first row = header) */
export function downloadCSV(filename, rows) {
  const csv = rows
    .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Normalize a Ugandan local number (07XXXXXXXX) to international digits (2567XXXXXXXX) */
export function normalizeUgPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.startsWith('0')) return `256${digits.slice(1)}`
  if (digits.startsWith('256')) return digits
  return digits
}

export function waLink(phone, message) {
  return `https://wa.me/${normalizeUgPhone(phone)}?text=${encodeURIComponent(message)}`
}

export function smsLink(phone, message) {
  return `sms:${normalizeUgPhone(phone)}?body=${encodeURIComponent(message)}`
}

export function mailLink(email, subject, body) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}
