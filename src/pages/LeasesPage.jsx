import { useState } from 'react'
import { format, differenceInDays, addYears } from 'date-fns'
import { Plus, FileText } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import {
  useProperties, useUnits, useLeases, useMyLease,
  useTenantProfiles, useCreateLease, useRenewLease, useEndLease,
} from '@/hooks/useProperties'
import { formatUGX } from '@/lib/utils'
import { Card, CardHeader, Avatar, PageLoader, EmptyState, Modal } from '@/components/shared'
import toast from 'react-hot-toast'

export function LeasesPage() {
  const { profile } = useAuth()
  return profile?.role === 'tenant' ? <TenantLease /> : <LandlordLeases />
}

function LandlordLeases() {
  const { profile } = useAuth()
  const { data: properties = [], isLoading: propsLoading } = useProperties(profile?.id)
  const [selectedProperty, setSelectedProperty] = useState('')
  const [newLeaseModal, setNewLeaseModal] = useState(false)
  const [renewLease, setRenewLease] = useState(null)
  const [endLease, setEndLease] = useState(null)

  const propId = selectedProperty || properties[0]?.id
  const { data: leases = [], isLoading } = useLeases(propId)
  const { data: units = [] } = useUnits(propId)
  const vacantUnits = units.filter(u => !u.is_occupied)

  if (propsLoading) return <PageLoader />

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Leases</h1>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">{leases.length} active leases</p>
        </div>
        <button
          type="button"
          onClick={() => setNewLeaseModal(true)}
          disabled={vacantUnits.length === 0}
          className="btn-primary inline-flex items-center justify-center gap-1.5 text-sm w-full sm:w-auto disabled:opacity-50"
        >
          <Plus size={14} /> New lease
        </button>
      </div>

      <Card>
        <div className="mb-4">
          <select
            className="input w-full sm:w-52"
            value={selectedProperty}
            onChange={e => setSelectedProperty(e.target.value)}
          >
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {isLoading ? <PageLoader /> : leases.length === 0 ? (
          <EmptyState
            icon={<FileText size={48} />}
            title="No active leases"
            description="Create a lease to assign a tenant to a unit"
            action={
              <button
                type="button"
                onClick={() => setNewLeaseModal(true)}
                disabled={vacantUnits.length === 0}
                className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
              >
                New lease
              </button>
            }
          />
        ) : (
          <div className="space-y-2">
            {leases.map(lease => (
              <LeaseRow
                key={lease.id}
                lease={lease}
                onRenew={() => setRenewLease(lease)}
                onEnd={() => setEndLease(lease)}
              />
            ))}
          </div>
        )}
      </Card>

      {newLeaseModal && (
        <CreateLeaseModal
          vacantUnits={vacantUnits}
          onClose={() => setNewLeaseModal(false)}
        />
      )}
      {renewLease && <RenewLeaseModal lease={renewLease} onClose={() => setRenewLease(null)} />}
      {endLease && <EndLeaseModal lease={endLease} onClose={() => setEndLease(null)} />}
    </div>
  )
}

function LeaseRow({ lease, onRenew, onEnd }) {
  const daysLeft = differenceInDays(new Date(lease.end_date), new Date())
  const isExpiringSoon = daysLeft >= 0 && daysLeft <= 60

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
      <Avatar name={lease.tenant?.full_name ?? '?'} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{lease.tenant?.full_name}</p>
          {isExpiringSoon && <span className="pill pill-amber text-[10px] shrink-0">{daysLeft}d left</span>}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Unit {lease.unit?.unit_number} · {formatUGX(lease.rent_amount)}/mo · Ends {format(new Date(lease.end_date), 'd MMM yyyy')}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button type="button" onClick={onRenew} className="btn text-xs px-2.5 py-1.5">Renew</button>
        <button type="button" onClick={onEnd} className="btn text-xs px-2.5 py-1.5 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30">
          End lease
        </button>
      </div>
    </div>
  )
}

export function CreateLeaseModal({ vacantUnits, onClose }) {
  const { mutateAsync, isPending } = useCreateLease()
  const { data: tenants = [], isLoading: tenantsLoading } = useTenantProfiles()
  const [form, setForm] = useState({
    unit_id: vacantUnits[0]?.id ?? '',
    tenant_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
    rent_amount: vacantUnits[0]?.rent_amount ?? '',
    deposit_amount: '',
    due_day: 1,
    grace_period_days: 3,
    late_fee_percent: 5,
  })
  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function handleUnitChange(unitId) {
    const unit = vacantUnits.find(u => u.id === unitId)
    setForm(f => ({ ...f, unit_id: unitId, rent_amount: unit?.rent_amount ?? f.rent_amount }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.tenant_id) { toast.error('Select a tenant'); return }
    try {
      await mutateAsync({
        unit_id: form.unit_id,
        tenant_id: form.tenant_id,
        start_date: form.start_date,
        end_date: form.end_date,
        rent_amount: Number(form.rent_amount),
        deposit_amount: Number(form.deposit_amount || 0),
        due_day: Number(form.due_day),
        grace_period_days: Number(form.grace_period_days),
        late_fee_percent: Number(form.late_fee_percent),
      })
      toast.success('Lease created')
      onClose()
    } catch { toast.error('Failed to create lease') }
  }

  return (
    <Modal open title="New lease" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Unit</label>
          <select className="input" value={form.unit_id} onChange={e => handleUnitChange(e.target.value)} required>
            {vacantUnits.length === 0 && <option value="">No vacant units</option>}
            {vacantUnits.map(u => (
              <option key={u.id} value={u.id}>{u.unit_number} — {formatUGX(u.rent_amount)}/mo</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Tenant</label>
          <select className="input" value={form.tenant_id} onChange={e => set('tenant_id', e.target.value)} required>
            <option value="">{tenantsLoading ? 'Loading...' : 'Select tenant'}</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.full_name} ({t.email})</option>
            ))}
          </select>
          {!tenantsLoading && tenants.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No tenant accounts yet — ask the tenant to sign up first.</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Start date</label>
            <input type="date" className="input" value={form.start_date} onChange={e => set('start_date', e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">End date</label>
            <input type="date" className="input" value={form.end_date} onChange={e => set('end_date', e.target.value)} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Rent (UGX/mo)</label>
            <input type="number" className="input" min={1} value={form.rent_amount} onChange={e => set('rent_amount', e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Deposit (UGX)</label>
            <input type="number" className="input" min={0} value={form.deposit_amount} onChange={e => set('deposit_amount', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Due day</label>
            <input type="number" className="input" min={1} max={28} value={form.due_day} onChange={e => set('due_day', e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Grace (days)</label>
            <input type="number" className="input" min={0} value={form.grace_period_days} onChange={e => set('grace_period_days', e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Late fee (%)</label>
            <input type="number" className="input" min={0} step="0.5" value={form.late_fee_percent} onChange={e => set('late_fee_percent', e.target.value)} required />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn flex-1">Cancel</button>
          <button type="submit" disabled={isPending || vacantUnits.length === 0} className="btn-primary flex-1 disabled:opacity-60">
            {isPending ? 'Creating...' : 'Create lease'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function RenewLeaseModal({ lease, onClose }) {
  const { mutateAsync, isPending } = useRenewLease()
  const [endDate, setEndDate] = useState(format(addYears(new Date(lease.end_date), 1), 'yyyy-MM-dd'))

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await mutateAsync({ id: lease.id, end_date: endDate })
      toast.success('Lease renewed')
      onClose()
    } catch { toast.error('Failed to renew lease') }
  }

  return (
    <Modal open title={`Renew lease — ${lease.tenant?.full_name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Current end date: {format(new Date(lease.end_date), 'd MMM yyyy')}
        </p>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">New end date</label>
          <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} required />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn flex-1">Cancel</button>
          <button type="submit" disabled={isPending} className="btn-primary flex-1 disabled:opacity-60">
            {isPending ? 'Saving...' : 'Renew lease'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function EndLeaseModal({ lease, onClose }) {
  const { mutateAsync, isPending } = useEndLease()

  async function handleConfirm() {
    try {
      await mutateAsync(lease.id)
      toast.success('Lease ended')
      onClose()
    } catch { toast.error('Failed to end lease') }
  }

  return (
    <Modal open title="End lease" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          End the lease for <span className="font-medium text-gray-800 dark:text-gray-200">{lease.tenant?.full_name}</span> on
          unit {lease.unit?.unit_number}? The unit will be marked vacant immediately.
        </p>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn flex-1">Cancel</button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="btn-primary flex-1 disabled:opacity-60 !bg-red-600 hover:!bg-red-700"
          >
            {isPending ? 'Ending...' : 'End lease'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function TenantLease() {
  const { profile } = useAuth()
  const { data: lease, isLoading, error } = useMyLease(profile?.id)

  if (isLoading) return <PageLoader />

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-2xl">
      <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">My lease</h1>

      {error || !lease ? (
        <EmptyState icon={<FileText size={48} />} title="No active lease" description="You don't have an active lease yet" />
      ) : (
        <>
          <Card>
            <CardHeader title={lease.unit?.property?.name} />
            <p className="text-sm text-gray-500 dark:text-gray-500">{lease.unit?.property?.address}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">Unit {lease.unit?.unit_number}</p>
          </Card>
          <Card>
            <CardHeader title="Lease details" />
            <div className="space-y-2 text-sm">
              {[
                { label: 'Start date', val: format(new Date(lease.start_date), 'd MMM yyyy') },
                { label: 'End date', val: format(new Date(lease.end_date), 'd MMM yyyy') },
                { label: 'Rent', val: `${formatUGX(lease.rent_amount)}/mo` },
                { label: 'Deposit', val: formatUGX(lease.deposit_amount) },
                { label: 'Due day', val: `${lease.due_day}${['st', 'nd', 'rd'][lease.due_day - 1] || 'th'} of month` },
                { label: 'Grace period', val: `${lease.grace_period_days} days` },
                { label: 'Late fee', val: `${lease.late_fee_percent}%` },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-500">{label}</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">{val}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
