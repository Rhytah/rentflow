import { useState } from 'react'
import { format } from 'date-fns'
import { Search, Filter, Download, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useProperties } from '@/hooks/useProperties'
import { usePayments, usePaymentSummary, useRecordPayment, useMyPayments } from '@/hooks/usePayments'
import { formatUGX, formatUGXShort, daysFromNow } from '@/lib/utils'
import {
  MetricCard, Card, CardHeader, StatusPill, Avatar,
  Modal, PageLoader, EmptyState, ProgressBar,
} from '@/components/shared'
import type { Payment, PaymentMethod, PaymentStatus } from '@/types/database'
import toast from 'react-hot-toast'

const now = new Date()
const MONTH = now.getMonth() + 1
const YEAR  = now.getFullYear()

const METHOD_LABELS: Record<PaymentMethod, string> = {
  mtn_momo:      'MTN MoMo',
  airtel_money:  'Airtel Money',
  bank_transfer: 'Bank Transfer',
  cash:          'Cash',
}

export function PaymentsPage() {
  const { profile } = useAuth()
  return profile?.role === 'tenant' ? <TenantPayments /> : <LandlordPayments />
}

// ── LANDLORD PAYMENTS ─────────────────────────────────────────
function LandlordPayments() {
  const { profile } = useAuth()
  const { data: properties = [], isLoading: propsLoading } = useProperties(profile?.id)
  const [selectedProperty, setSelectedProperty] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('')
  const [search, setSearch] = useState('')
  const [recordModal, setRecordModal] = useState<Payment | null>(null)

  const propId = selectedProperty || properties[0]?.id
  const { data: payments = [], isLoading } = usePayments(propId, MONTH, YEAR)
  const { data: summary } = usePaymentSummary(propId ?? '', MONTH, YEAR)

  const filtered = payments.filter(p => {
    const matchStatus = !statusFilter || p.status === statusFilter
    const matchSearch = !search || p.tenant?.full_name.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  if (propsLoading) return <PageLoader />

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-0.5">{format(now, 'MMMM yyyy')} · Rent collection</p>
        </div>
        <div className="flex gap-2">
          <button className="btn flex items-center gap-1.5 text-sm">
            <Download size={14} /> Export
          </button>
          <button className="btn flex items-center gap-1.5 text-sm text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100">
            <Send size={14} /> Send bulk reminders
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Expected" value={formatUGXShort(summary?.total_expected ?? 0)} sub={`${summary?.total ?? 0} payments`} />
        <MetricCard
          label="Collected"
          value={formatUGXShort(summary?.total_collected ?? 0)}
          sub={`${summary?.collection_rate ?? 0}% rate`}
          subColor={(summary?.collection_rate ?? 0) >= 85 ? 'green' : 'amber'}
        />
        <MetricCard
          label="Outstanding"
          value={formatUGXShort((summary?.total_expected ?? 0) - (summary?.total_collected ?? 0))}
          sub={`${(summary?.overdue_count ?? 0) + (summary?.partial_count ?? 0)} tenants`}
          subColor={(summary?.overdue_count ?? 0) > 0 ? 'red' : undefined}
        />
        <MetricCard
          label="Late fees"
          value={formatUGXShort(summary?.total_late_fees ?? 0)}
          subColor={(summary?.total_late_fees ?? 0) > 0 ? 'amber' : undefined}
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <select
            className="input w-44"
            value={selectedProperty}
            onChange={e => setSelectedProperty(e.target.value)}
          >
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select className="input w-36" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
          </select>
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-8"
              placeholder="Search tenant..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="ml-auto flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Paid: {summary?.paid_count ?? 0}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Overdue: {summary?.overdue_count ?? 0}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Partial: {summary?.partial_count ?? 0}</span>
          </div>
        </div>

        {/* Table */}
        {isLoading ? <PageLoader /> : filtered.length === 0 ? (
          <EmptyState title="No payments found" description="Try adjusting your filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 font-normal pb-3 w-[28%]">Tenant</th>
                  <th className="text-left text-xs text-gray-400 font-normal pb-3 w-[8%]">Unit</th>
                  <th className="text-right text-xs text-gray-400 font-normal pb-3 w-[14%]">Amount due</th>
                  <th className="text-right text-xs text-gray-400 font-normal pb-3 w-[14%]">Paid</th>
                  <th className="text-left text-xs text-gray-400 font-normal pb-3 w-[12%]">Status</th>
                  <th className="text-left text-xs text-gray-400 font-normal pb-3 w-[12%]">Method</th>
                  <th className="text-left text-xs text-gray-400 font-normal pb-3 w-[12%]">Due date</th>
                  <th className="pb-3 w-[10%]" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(payment => (
                  <PaymentRow
                    key={payment.id}
                    payment={payment}
                    onRecord={() => setRecordModal(payment)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Payment Modal */}
      {recordModal && (
        <RecordPaymentModal
          payment={recordModal}
          onClose={() => setRecordModal(null)}
        />
      )}
    </div>
  )
}

function PaymentRow({ payment, onRecord }: { payment: Payment; onRecord: () => void }) {
  const days = daysFromNow(payment.due_date)
  const isPaid = payment.status === 'paid'

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
      <td className="py-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={payment.tenant?.full_name ?? '?'} />
          <div>
            <p className="font-medium text-gray-800">{payment.tenant?.full_name}</p>
            <p className="text-xs text-gray-400">{payment.tenant?.phone}</p>
          </div>
        </div>
      </td>
      <td className="py-3 text-gray-600">{payment.unit?.unit_number}</td>
      <td className="py-3 text-right font-medium text-gray-800">
        {formatUGX(payment.amount_due)}
        {payment.late_fee > 0 && (
          <p className="text-xs text-red-500">+{formatUGXShort(payment.late_fee)} fee</p>
        )}
      </td>
      <td className="py-3 text-right text-gray-600">
        {payment.amount > 0 ? formatUGX(payment.amount) : '—'}
      </td>
      <td className="py-3"><StatusPill status={payment.status} /></td>
      <td className="py-3 text-gray-600 text-xs">
        {payment.method ? METHOD_LABELS[payment.method] : '—'}
      </td>
      <td className="py-3 text-xs">
        <p className="text-gray-600">{format(new Date(payment.due_date), 'd MMM yyyy')}</p>
        {days > 0 && !isPaid && (
          <p className="text-red-500">{days}d overdue</p>
        )}
      </td>
      <td className="py-3 text-right">
        {!isPaid && (
          <button onClick={onRecord} className="btn text-xs px-2.5 py-1">
            Record
          </button>
        )}
        {isPaid && (
          <button className="btn text-xs px-2.5 py-1">Receipt</button>
        )}
      </td>
    </tr>
  )
}

// ── RECORD PAYMENT MODAL ──────────────────────────────────────
function RecordPaymentModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const { mutateAsync, isPending } = useRecordPayment()
  const [amount, setAmount] = useState(String(payment.amount_due + payment.late_fee))
  const [method, setMethod] = useState<PaymentMethod>('mtn_momo')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await mutateAsync({
        paymentId: payment.id,
        amount: Number(amount),
        method,
        reference,
        notes,
      })
      toast.success('Payment recorded successfully')
      onClose()
    } catch {
      toast.error('Failed to record payment')
    }
  }

  return (
    <Modal open title={`Record payment — ${payment.tenant?.full_name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-gray-500">Rent due</span>
            <span className="font-medium">{formatUGX(payment.amount_due)}</span>
          </div>
          {payment.late_fee > 0 && (
            <div className="flex justify-between mb-1">
              <span className="text-red-500">Late fee</span>
              <span className="font-medium text-red-500">+{formatUGX(payment.late_fee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
            <span className="text-gray-700 font-medium">Total due</span>
            <span className="font-semibold">{formatUGX(payment.amount_due + payment.late_fee)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount received (UGX)</label>
          <input
            type="number"
            className="input"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min={1}
            required
          />
          {Number(amount) < payment.amount_due && Number(amount) > 0 && (
            <p className="text-xs text-amber-600 mt-1">
              Partial payment — {formatUGX(payment.amount_due - Number(amount))} still outstanding
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Payment method</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(METHOD_LABELS) as [PaymentMethod, string][]).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setMethod(val)}
                className={`text-sm py-2 px-3 rounded-lg border text-left transition-all ${
                  method === val
                    ? 'border-brand-600 bg-brand-50 text-brand-800'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Reference / Transaction ID</label>
          <input className="input" placeholder="e.g. MM2603011" value={reference} onChange={e => setReference(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes (optional)</label>
          <textarea className="input resize-none" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn flex-1">Cancel</button>
          <button type="submit" disabled={isPending} className="btn-primary flex-1 disabled:opacity-60">
            {isPending ? 'Saving...' : 'Record payment'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── TENANT PAYMENTS ───────────────────────────────────────────
function TenantPayments() {
  const { profile } = useAuth()
  const { data: payments = [], isLoading } = useMyPayments(profile?.id)
  const { useMyLease } = require('@/hooks/useProperties')
  const { data: lease } = useMyLease(profile?.id)
  const [payModal, setPayModal] = useState<Payment | null>(null)

  const current = payments.find(p =>
    p.period_month === MONTH && p.period_year === YEAR
  )

  if (isLoading) return <PageLoader />

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">My payments</h1>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Monthly rent" value={formatUGX(lease?.rent_amount ?? 0)} sub={`Unit ${lease?.unit?.unit_number}`} />
        <MetricCard
          label="This month"
          value={current ? formatUGX(current.amount_due) : '—'}
          sub={current ? `Due ${format(new Date(current.due_date), 'd MMM')}` : ''}
          subColor={current?.status === 'overdue' ? 'red' : 'amber'}
        />
        <MetricCard
          label="Status"
          value={current?.status ?? 'No record'}
          subColor={current?.status === 'paid' ? 'green' : current?.status === 'overdue' ? 'red' : undefined}
        />
      </div>

      {/* Pay now card */}
      {current && current.status !== 'paid' && (
        <Card className="border-brand-100 bg-brand-50/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {format(now, 'MMMM yyyy')} rent
              </p>
              <p className="text-2xl font-semibold text-gray-900 mt-0.5">
                {formatUGX(current.amount_due + current.late_fee)}
              </p>
              {current.late_fee > 0 && (
                <p className="text-xs text-red-500 mt-0.5">Includes {formatUGX(current.late_fee)} late fee</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Due {format(new Date(current.due_date), 'd MMMM yyyy')}
              </p>
            </div>
            <button
              onClick={() => setPayModal(current)}
              className="btn-primary px-6 py-2.5"
            >
              Pay now
            </button>
          </div>
        </Card>
      )}

      {/* Payment history */}
      <Card>
        <CardHeader title="Payment history" />
        {payments.length === 0 ? (
          <EmptyState title="No payment records" description="Your payment history will appear here" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-400 font-normal pb-3">Period</th>
                <th className="text-right text-xs text-gray-400 font-normal pb-3">Amount</th>
                <th className="text-left text-xs text-gray-400 font-normal pb-3 pl-4">Status</th>
                <th className="text-left text-xs text-gray-400 font-normal pb-3">Method</th>
                <th className="text-left text-xs text-gray-400 font-normal pb-3">Paid on</th>
                <th className="text-left text-xs text-gray-400 font-normal pb-3">Reference</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 font-medium text-gray-800">
                    {format(new Date(p.due_date), 'MMMM yyyy')}
                  </td>
                  <td className="py-3 text-right text-gray-800">{formatUGX(p.amount_due)}</td>
                  <td className="py-3 pl-4"><StatusPill status={p.status} /></td>
                  <td className="py-3 text-gray-500 text-xs">
                    {p.method ? METHOD_LABELS[p.method] : '—'}
                  </td>
                  <td className="py-3 text-gray-500 text-xs">
                    {p.paid_at ? format(new Date(p.paid_at), 'd MMM yyyy') : '—'}
                  </td>
                  <td className="py-3 text-gray-400 text-xs font-mono">{p.reference ?? '—'}</td>
                  <td className="py-3 text-right">
                    {p.status === 'paid' && (
                      <button className="btn text-xs px-2 py-1">Receipt</button>
                    )}
                    {p.status !== 'paid' && (
                      <button onClick={() => setPayModal(p)} className="btn-primary text-xs px-2 py-1">
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {payModal && (
        <TenantPayModal payment={payModal} onClose={() => setPayModal(null)} />
      )}
    </div>
  )
}

// ── TENANT PAY MODAL ──────────────────────────────────────────
function TenantPayModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const { mutateAsync, isPending } = useRecordPayment()
  const [method, setMethod] = useState<PaymentMethod>('mtn_momo')
  const [phone, setPhone] = useState('')

  const total = payment.amount_due + payment.late_fee

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    try {
      await mutateAsync({
        paymentId: payment.id,
        amount: total,
        method,
        reference: `AUTO-${Date.now()}`,
      })
      toast.success('Payment submitted! Awaiting confirmation.')
      onClose()
    } catch {
      toast.error('Payment failed. Please try again.')
    }
  }

  return (
    <Modal open title="Pay rent" onClose={onClose}>
      <form onSubmit={handlePay} className="space-y-4">
        <div className="text-center py-2">
          <p className="text-3xl font-semibold text-gray-900">{formatUGX(total)}</p>
          <p className="text-sm text-gray-400 mt-1">
            {format(new Date(payment.due_date), 'MMMM yyyy')} rent
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Select payment method</label>
          <div className="space-y-2">
            {(Object.entries(METHOD_LABELS) as [PaymentMethod, string][]).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setMethod(val)}
                className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg border text-left transition-all text-sm ${
                  method === val
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${method === val ? 'border-brand-600 bg-brand-600' : 'border-gray-300'}`} />
                <span className={method === val ? 'text-brand-800 font-medium' : 'text-gray-600'}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {(method === 'mtn_momo' || method === 'airtel_money') && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Mobile number</label>
            <input
              className="input"
              placeholder="07X XXX XXXX"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn flex-1">Cancel</button>
          <button type="submit" disabled={isPending} className="btn-primary flex-1 disabled:opacity-60">
            {isPending ? 'Processing...' : `Pay ${formatUGX(total)}`}
          </button>
        </div>
      </form>
    </Modal>
  )
}
