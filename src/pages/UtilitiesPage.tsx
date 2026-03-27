import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Zap, Droplets, Wifi, Trash2, Shield, MoreHorizontal } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useProperties, useUtilityBills, useMarkUtilityPaid } from '@/hooks/useProperties'
import { formatUGX, formatUGXShort } from '@/lib/utils'
import { Card, CardHeader, MetricCard, StatusPill, PageLoader, EmptyState, Modal } from '@/components/shared'
import type { UtilityBill, UtilityType } from '@/types/database'
import toast from 'react-hot-toast'

const UTILITY_ICONS: Record<UtilityType, React.FC<{ size?: number; className?: string }>> = {
  electricity: Zap,
  water:       Droplets,
  internet:    Wifi,
  garbage:     Trash2,
  security:    Shield,
  other:       MoreHorizontal,
}

const UTILITY_COLORS: Record<UtilityType, string> = {
  electricity: 'bg-amber-50 text-amber-600',
  water:       'bg-blue-50 text-blue-600',
  internet:    'bg-purple-50 text-purple-600',
  garbage:     'bg-green-50 text-green-600',
  security:    'bg-gray-50 text-gray-600',
  other:       'bg-gray-50 text-gray-500',
}

const now = new Date()
const MONTH = now.getMonth() + 1
const YEAR  = now.getFullYear()

export function UtilitiesPage() {
  const { profile } = useAuth()
  const { data: properties = [], isLoading: propsLoading } = useProperties(profile?.id)
  const [selectedProperty, setSelectedProperty] = useState('')
  const [addModal, setAddModal] = useState(false)

  const propId = selectedProperty || properties[0]?.id
  const { data: bills = [], isLoading } = useUtilityBills(propId, MONTH, YEAR)
  const { mutateAsync: markPaid } = useMarkUtilityPaid()

  const totalDue  = bills.filter(b => b.status !== 'paid').reduce((s, b) => s + Number(b.amount), 0)
  const totalPaid = bills.filter(b => b.status === 'paid').reduce((s, b) => s + Number(b.amount), 0)
  const upcoming  = bills.filter(b => b.status === 'upcoming').length
  const overdue   = bills.filter(b => b.status === 'overdue').length

  if (propsLoading) return <PageLoader />

  async function handleMarkPaid(id: string) {
    try {
      await markPaid(id)
      toast.success('Marked as paid')
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Utilities</h1>
          <p className="text-sm text-gray-500 mt-0.5">{format(now, 'MMMM yyyy')} · Bills & services</p>
        </div>
        <div className="flex gap-2">
          <select
            className="input w-44"
            value={selectedProperty}
            onChange={e => setSelectedProperty(e.target.value)}
          >
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button onClick={() => setAddModal(true)} className="btn-primary flex items-center gap-1.5 text-sm">
            <Plus size={14} /> Add bill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <MetricCard label="Total bills this month" value={String(bills.length)} />
        <MetricCard label="Amount due" value={formatUGXShort(totalDue)} subColor={totalDue > 0 ? 'amber' : undefined} />
        <MetricCard label="Paid" value={formatUGXShort(totalPaid)} subColor="green" />
        <MetricCard label="Overdue" value={String(overdue)} subColor={overdue > 0 ? 'red' : undefined} />
      </div>

      {/* Bill cards grid */}
      {isLoading ? <PageLoader /> : bills.length === 0 ? (
        <EmptyState
          title="No utility bills for this month"
          description="Add electricity, water, internet and other bills"
          action={
            <button onClick={() => setAddModal(true)} className="btn-primary text-sm px-4 py-2">
              Add first bill
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {bills.map(bill => (
            <UtilityCard key={bill.id} bill={bill} onMarkPaid={() => handleMarkPaid(bill.id)} />
          ))}
        </div>
      )}

      {/* Per-unit breakdown */}
      {bills.length > 0 && (
        <Card>
          <CardHeader title="Monthly summary by type" />
          <div className="space-y-3">
            {Object.entries(
              bills.reduce((acc, b) => {
                const key = b.type
                if (!acc[key]) acc[key] = { total: 0, count: 0 }
                acc[key].total += Number(b.amount)
                acc[key].count++
                return acc
              }, {} as Record<string, { total: number; count: number }>)
            ).map(([type, { total, count }]) => {
              const Icon = UTILITY_ICONS[type as UtilityType] ?? MoreHorizontal
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${UTILITY_COLORS[type as UtilityType]}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-700">{type}</span>
                      <span className="font-medium text-gray-900">{formatUGX(total)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-400 rounded-full"
                        style={{ width: `${Math.min((total / (totalDue + totalPaid)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {addModal && <AddBillModal propId={propId} onClose={() => setAddModal(false)} />}
    </div>
  )
}

function UtilityCard({ bill, onMarkPaid }: { bill: UtilityBill; onMarkPaid: () => void }) {
  const Icon = UTILITY_ICONS[bill.type] ?? MoreHorizontal
  const isPaid = bill.status === 'paid'

  return (
    <Card className={isPaid ? 'opacity-75' : ''}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${UTILITY_COLORS[bill.type]}`}>
          <Icon size={18} />
        </div>
        <StatusPill status={bill.status} />
      </div>
      <p className="font-medium text-gray-800 capitalize">{bill.type}</p>
      <p className="text-xs text-gray-400 mb-3">{bill.provider}</p>
      <p className="text-xl font-semibold text-gray-900 mb-1">{formatUGX(bill.amount)}</p>
      <p className="text-xs text-gray-400 mb-4">
        Due {format(new Date(bill.due_date), 'd MMM yyyy')}
        {bill.unit && ` · Unit ${bill.unit.unit_number}`}
        {!bill.unit && ' · Whole building'}
      </p>
      {!isPaid && (
        <button onClick={onMarkPaid} className="btn w-full text-sm">Mark as paid</button>
      )}
      {isPaid && bill.paid_at && (
        <p className="text-xs text-green-600 text-center">
          Paid {format(new Date(bill.paid_at), 'd MMM yyyy')}
        </p>
      )}
    </Card>
  )
}

function AddBillModal({ propId, onClose }: { propId: string; onClose: () => void }) {
  const { useCreateUtilityBill } = require('@/hooks/useProperties')
  const { mutateAsync, isPending } = useCreateUtilityBill()
  const [form, setForm] = useState({
    type: 'electricity' as UtilityType,
    provider: '',
    amount: '',
    due_date: '',
    split_among_units: false,
  })

  function set(key: string, val: any) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await mutateAsync({
        property_id: propId,
        type: form.type,
        provider: form.provider,
        amount: Number(form.amount),
        period_month: MONTH,
        period_year: YEAR,
        due_date: form.due_date,
        status: 'upcoming',
        split_among_units: form.split_among_units,
      })
      toast.success('Bill added')
      onClose()
    } catch {
      toast.error('Failed to add bill')
    }
  }

  return (
    <Modal open title="Add utility bill" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Utility type</label>
          <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
            {Object.keys(UTILITY_ICONS).map(t => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Provider</label>
          <input className="input" placeholder="e.g. UMEME, NWSC" value={form.provider} onChange={e => set('provider', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount (UGX)</label>
          <input type="number" className="input" placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)} required min={1} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Due date</label>
          <input type="date" className="input" value={form.due_date} onChange={e => set('due_date', e.target.value)} required />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="split" checked={form.split_among_units} onChange={e => set('split_among_units', e.target.checked)} className="rounded" />
          <label htmlFor="split" className="text-sm text-gray-600">Split among units</label>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn flex-1">Cancel</button>
          <button type="submit" disabled={isPending} className="btn-primary flex-1 disabled:opacity-60">
            {isPending ? 'Adding...' : 'Add bill'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
