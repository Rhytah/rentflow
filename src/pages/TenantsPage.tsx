import { useState } from 'react'
import { format, differenceInDays } from 'date-fns'
import { Search, Plus, Phone, Mail, UserCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useProperties, useLeases } from '@/hooks/useProperties'
import { formatUGX, formatUGXShort } from '@/lib/utils'
import { Card, CardHeader, Avatar, StatusPill, PageLoader, EmptyState, MetricCard } from '@/components/shared'
import type { Lease } from '@/types/database'

export function TenantsPage() {
  const { profile } = useAuth()
  const { data: properties = [], isLoading: propsLoading } = useProperties(profile?.id)
  const [selectedProperty, setSelectedProperty] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Lease | null>(null)

  const propId = selectedProperty || properties[0]?.id
  const { data: leases = [], isLoading } = useLeases(propId)

  const filtered = leases.filter(l =>
    !search || l.tenant?.full_name.toLowerCase().includes(search.toLowerCase())
  )

  const expiringSoon = leases.filter(l => {
    const days = differenceInDays(new Date(l.end_date), new Date())
    return days >= 0 && days <= 60
  })

  if (propsLoading) return <PageLoader />

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tenants</h1>
          <p className="text-sm text-gray-500 mt-0.5">{leases.length} active leases</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={14} /> Add tenant
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Total tenants" value={String(leases.length)} sub="Active leases" />
        <MetricCard
          label="Leases expiring soon"
          value={String(expiringSoon.length)}
          sub="Within 60 days"
          subColor={expiringSoon.length > 0 ? 'amber' : undefined}
        />
        <MetricCard
          label="Monthly rent roll"
          value={formatUGXShort(leases.reduce((s, l) => s + Number(l.rent_amount), 0))}
          sub="All active leases"
        />
      </div>

      <div className="flex gap-4">
        {/* Tenant list */}
        <Card className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <select
              className="input w-44"
              value={selectedProperty}
              onChange={e => setSelectedProperty(e.target.value)}
            >
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-8" placeholder="Search tenant..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {isLoading ? <PageLoader /> : filtered.length === 0 ? (
            <EmptyState
              title="No tenants found"
              description="Add tenants by creating a lease"
              action={<button className="btn-primary text-sm px-4 py-2">Add tenant</button>}
            />
          ) : (
            <div className="space-y-1">
              {filtered.map(lease => (
                <TenantCard
                  key={lease.id}
                  lease={lease}
                  isSelected={selected?.id === lease.id}
                  onClick={() => setSelected(selected?.id === lease.id ? null : lease)}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Detail panel */}
        {selected && (
          <div className="w-72 flex-shrink-0 space-y-3">
            <TenantDetail lease={selected} />
          </div>
        )}
      </div>
    </div>
  )
}

function TenantCard({ lease, isSelected, onClick }: {
  lease: Lease; isSelected: boolean; onClick: () => void
}) {
  const daysLeft = differenceInDays(new Date(lease.end_date), new Date())
  const isExpiringSoon = daysLeft >= 0 && daysLeft <= 60

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
        isSelected ? 'border-brand-200 bg-brand-50/40' : 'border-transparent hover:bg-gray-50'
      }`}
    >
      <Avatar name={lease.tenant?.full_name ?? '?'} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-800 truncate">{lease.tenant?.full_name}</p>
          {isExpiringSoon && (
            <span className="pill pill-amber text-[10px] shrink-0">{daysLeft}d left</span>
          )}
        </div>
        <p className="text-xs text-gray-400">Unit {lease.unit?.unit_number} · {formatUGX(lease.rent_amount)}/mo</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-gray-500">Until</p>
        <p className="text-xs font-medium text-gray-700">{format(new Date(lease.end_date), 'MMM yyyy')}</p>
      </div>
    </div>
  )
}

function TenantDetail({ lease }: { lease: Lease }) {
  return (
    <>
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={lease.tenant?.full_name ?? '?'} size="lg" />
          <div>
            <p className="font-medium text-gray-900">{lease.tenant?.full_name}</p>
            <p className="text-xs text-gray-400">Unit {lease.unit?.unit_number}</p>
          </div>
        </div>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={13} className="text-gray-400" />
            {lease.tenant?.phone ?? 'No phone'}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail size={13} className="text-gray-400" />
            <span className="truncate">{lease.tenant?.email}</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Lease details" />
        <div className="space-y-2 text-sm">
          {[
            { label: 'Start date',    val: format(new Date(lease.start_date), 'd MMM yyyy') },
            { label: 'End date',      val: format(new Date(lease.end_date), 'd MMM yyyy') },
            { label: 'Rent',          val: formatUGX(lease.rent_amount) + '/mo' },
            { label: 'Deposit',       val: formatUGX(lease.deposit_amount) },
            { label: 'Due day',       val: `${lease.due_day}${['st','nd','rd'][lease.due_day - 1] || 'th'} of month` },
            { label: 'Grace period',  val: `${lease.grace_period_days} days` },
            { label: 'Late fee',      val: `${lease.late_fee_percent}%` },
          ].map(({ label, val }) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-400">{label}</span>
              <span className="text-gray-800 font-medium">{val}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button className="btn flex-1 text-xs">Renew</button>
          <button className="btn flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50">End lease</button>
        </div>
      </Card>
    </>
  )
}
