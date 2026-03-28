import { useState } from 'react'
import { format } from 'date-fns'
import { Search, Download, Send } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useProperties, useMyLease } from '@/hooks/useProperties'
import { usePayments, usePaymentSummary, useRecordPayment, useMyPayments } from '@/hooks/usePayments'
import { formatUGX, formatUGXShort, daysFromNow } from '@/lib/utils'
import {
  MetricCard, Card, CardHeader, StatusPill, Avatar,
  Modal, PageLoader, EmptyState, ProgressBar,
} from '@/components/shared'
import toast from 'react-hot-toast'

const now = new Date()
const MONTH = now.getMonth() + 1
const YEAR = now.getFullYear()

const METHOD_LABELS = {
  mtn_momo: 'MTN MoMo',
  airtel_money: 'Airtel Money',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
}

export function PaymentsPage() {
  const { profile } = useAuth()
  return profile?.role === 'tenant' ? <TenantPayments /> : <LandlordPayments />
}

function LandlordPayments() {
  const { profile } = useAuth()
  const { data: properties = [], isLoading: propsLoading } = useProperties(profile?.id)
  const [selectedProperty, setSelectedProperty] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [recordModal, setRecordModal] = useState(null)

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
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Payments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">{format(now, 'MMMM yyyy')} · Rent collection</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button type="button" className="btn inline-flex items-center justify-center gap-1.5 text-sm w-full sm:w-auto">
            <Download size={14} /> Export
          </button>
          <button type="button" className="btn inline-flex items-center justify-center gap-1.5 text-sm text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/30 w-full sm:w-auto">
            <Send size={14} /> Send bulk reminders
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

      <Card className="min-w-0">
        <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:flex-wrap lg:items-center">
          <select
            className="input w-full sm:w-44 shrink-0"
            value={selectedProperty}
            onChange={e => setSelectedProperty(e.target.value)}
          >
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select className="input w-full sm:w-36 shrink-0" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
            <option value="pending">Pending</option>
          </select>
          <div className="relative w-full lg:flex-1 lg:max-w-xs min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              className="input pl-8"
              placeholder="Search tenant..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-500 lg:ml-auto">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block shrink-0" />Paid: {summary?.paid_count ?? 0}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block shrink-0" />Overdue: {summary?.overdue_count ?? 0}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0" />Partial: {summary?.partial_count ?? 0}</span>
          </div>
        </div>

        {isLoading ? <PageLoader /> : filtered.length === 0 ? (
          <EmptyState title="No payments found" description="Try adjusting your filters" />
        ) : (
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left text-xs text-gray-400 dark:text-gray-500 font-normal pb-3 w-[28%]">Tenant</th>
                  <th className="text-left text-xs text-gray-400 dark:text-gray-500 font-normal pb-3 w-[8%]">Unit</th>
                  <th className="text-right text-xs text-gray-400 dark:text-gray-500 font-normal pb-3 w-[14%]">Amount due</th>
                  <th className="text-right text-xs text-gray-400 dark:text-gray-500 font-normal pb-3 w-[14%]">Paid</th>
                  <th className="text-left text-xs text-gray-400 dark:text-gray-500 font-normal pb-3 w-[12%]">Status</th>
                  <th className="text-left text-xs text-gray-400 dark:text-gray-500 font-normal pb-3 w-[12%]">Method</th>
                  <th className="text-left text-xs text-gray-400 dark:text-gray-500 font-normal pb-3 w-[12%]">Due date</th>
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

      {recordModal && (
        <RecordPaymentModal
          payment={recordModal}
          onClose={() => setRecordModal(null)}
        />
      )}
    </div>
  )
}

function PaymentRow({ payment, onRecord }) {
  const days = daysFromNow(payment.due_date)
  const isPaid = payment.status === 'paid'

  return (
    <tr className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
      <td className="py-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={payment.tenant?.full_name ?? '?'} />
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">{payment.tenant?.full_name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{payment.tenant?.phone}</p>
          </div>
        </div>
      </td>
      <td className="py-3 text-gray-600 dark:text-gray-500">{payment.unit?.unit_number}</td>
      <td className="py-3 text-right font-medium text-gray-800 dark:text-gray-200">
        {formatUGX(payment.amount_due)}
        {payment.late_fee > 0 && (
          <p className="text-xs text-red-500 dark:text-red-400">+{formatUGXShort(payment.late_fee)} fee</p>
        )}
      </td>
      <td className="py-3 text-right text-gray-600 dark:text-gray-500">
        {payment.amount > 0 ? formatUGX(payment.amount) : '—'}
      </td>
      <td className="py-3"><StatusPill status={payment.status} /></td>
      <td className="py-3 text-gray-600 dark:text-gray-500 text-xs">
        {payment.method ? METHOD_LABELS[payment.method] : '—'}
      </td>
      <td className="py-3 text-xs">
        <p className="text-gray-600 dark:text-gray-500">{format(new Date(payment.due_date), 'd MMM yyyy')}</p>
        {days > 0 && !isPaid && (
          <p className="text-red-500 dark:text-red-400">{days}d overdue</p>
        )}
      </td>
      <td className="py-3 text-right">
        {!isPaid && (
          <button type="button" onClick={onRecord} className="btn text-xs px-2.5 py-1">
            Record
          </button>
        )}
        {isPaid && (
          <button type="button" className="btn text-xs px-2.5 py-1">Receipt</button>
        )}
      </td>
    </tr>
  )
}

function RecordPaymentModal({ payment, onClose }) {
  const { mutateAsync, isPending } = useRecordPayment()
  const [amount, setAmount] = useState(String(payment.amount_due + payment.late_fee))
  const [method, setMethod] = useState('mtn_momo')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(e) {
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
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-gray-500 dark:text-gray-500">Rent due</span>
            <span className="font-medium">{formatUGX(payment.amount_due)}</span>
          </div>
          {payment.late_fee > 0 && (
            <div className="flex justify-between mb-1">
              <span className="text-red-500 dark:text-red-400">Late fee</span>
              <span className="font-medium text-red-500 dark:text-red-400">+{formatUGX(payment.late_fee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
            <span className="text-gray-700 dark:text-gray-300 dark:text-gray-600 font-medium">Total due</span>
            <span className="font-semibold">{formatUGX(payment.amount_due + payment.late_fee)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Amount received (UGX)</label>
          <input
            type="number"
            className="input"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min={1}
            required
          />
          {Number(amount) < payment.amount_due && Number(amount) > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Partial payment — {formatUGX(payment.amount_due - Number(amount))} still outstanding
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Payment method</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(METHOD_LABELS).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setMethod(val)}
                className={`text-sm py-2 px-3 rounded-lg border text-left transition-all ${
                  method === val
                    ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-800 dark:text-brand-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Reference / Transaction ID</label>
          <input className="input" placeholder="e.g. MM2603011" value={reference} onChange={e => setReference(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Notes (optional)</label>
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

function TenantPayments() {
  const { profile } = useAuth()
  const { data: payments = [], isLoading } = useMyPayments(profile?.id)
  const { data: lease } = useMyLease(profile?.id)
  const [payModal, setPayModal] = useState(null)

  const current = payments.find(p =>
    p.period_month === MONTH && p.period_year === YEAR
  )

  if (isLoading) return <PageLoader />

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">My payments</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

      {current && current.status !== 'paid' && (
        <Card className="border-brand-100 dark:border-brand-900/40 bg-brand-50/30 dark:bg-brand-950/25">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600">
                {format(now, 'MMMM yyyy')} rent
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                {formatUGX(current.amount_due + current.late_fee)}
              </p>
              {current.late_fee > 0 && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">Includes {formatUGX(current.late_fee)} late fee</p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Due {format(new Date(current.due_date), 'd MMMM yyyy')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPayModal(current)}
              className="btn-primary px-6 py-2.5 w-full sm:w-auto shrink-0"
            >
              Pay now
            </button>
          </div>
        </Card>
      )}

      <Card className="min-w-0">
        <CardHeader title="Payment history" />
        {payments.length === 0 ? (
          <EmptyState title="No payment records" description="Your payment history will appear here" />
        ) : (
          <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs text-gray-400 dark:text-gray-500 font-normal pb-3">Period</th>
                <th className="text-right text-xs text-gray-400 dark:text-gray-500 font-normal pb-3">Amount</th>
                <th className="text-left text-xs text-gray-400 dark:text-gray-500 font-normal pb-3 pl-4">Status</th>
                <th className="text-left text-xs text-gray-400 dark:text-gray-500 font-normal pb-3">Method</th>
                <th className="text-left text-xs text-gray-400 dark:text-gray-500 font-normal pb-3">Paid on</th>
                <th className="text-left text-xs text-gray-400 dark:text-gray-500 font-normal pb-3">Reference</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="py-3 font-medium text-gray-800 dark:text-gray-200">
                    {format(new Date(p.due_date), 'MMMM yyyy')}
                  </td>
                  <td className="py-3 text-right text-gray-800 dark:text-gray-200">{formatUGX(p.amount_due)}</td>
                  <td className="py-3 pl-4"><StatusPill status={p.status} /></td>
                  <td className="py-3 text-gray-500 dark:text-gray-500 text-xs">
                    {p.method ? METHOD_LABELS[p.method] : '—'}
                  </td>
                  <td className="py-3 text-gray-500 dark:text-gray-500 text-xs">
                    {p.paid_at ? format(new Date(p.paid_at), 'd MMM yyyy') : '—'}
                  </td>
                  <td className="py-3 text-gray-400 dark:text-gray-500 text-xs font-mono">{p.reference ?? '—'}</td>
                  <td className="py-3 text-right">
                    {p.status === 'paid' && (
                      <button type="button" className="btn text-xs px-2 py-1">Receipt</button>
                    )}
                    {p.status !== 'paid' && (
                      <button type="button" onClick={() => setPayModal(p)} className="btn-primary text-xs px-2 py-1">
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>

      {payModal && (
        <TenantPayModal payment={payModal} onClose={() => setPayModal(null)} />
      )}
    </div>
  )
}

function TenantPayModal({ payment, onClose }) {
  const { mutateAsync, isPending } = useRecordPayment()
  const [method, setMethod] = useState('mtn_momo')
  const [phone, setPhone] = useState('')

  const total = payment.amount_due + payment.late_fee

  async function handlePay(e) {
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
          <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{formatUGX(total)}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {format(new Date(payment.due_date), 'MMMM yyyy')} rent
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-2">Select payment method</label>
          <div className="space-y-2">
            {Object.entries(METHOD_LABELS).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setMethod(val)}
                className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg border text-left transition-all text-sm ${
                  method === val
                    ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${method === val ? 'border-brand-600 bg-brand-600' : 'border-gray-300 dark:border-gray-600'}`} />
                <span className={method === val ? 'text-brand-800 dark:text-brand-300 font-medium' : 'text-gray-600 dark:text-gray-500'}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {(method === 'mtn_momo' || method === 'airtel_money') && (
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Mobile number</label>
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
