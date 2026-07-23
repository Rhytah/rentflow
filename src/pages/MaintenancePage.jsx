import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Wrench } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useProperties, useMyLease } from '@/hooks/useProperties'
import {
  useMaintenanceRequests, useMyMaintenanceRequests,
  useCreateMaintenanceRequest, useUpdateMaintenanceStatus,
} from '@/hooks/useMaintenance'
import { Card, CardHeader, Avatar, PageLoader, EmptyState, Modal } from '@/components/shared'
import toast from 'react-hot-toast'

const STATUS_PILL = {
  open: 'pill-red',
  in_progress: 'pill-amber',
  resolved: 'pill-green',
}

const PRIORITY_PILL = {
  low: 'pill-gray',
  medium: 'pill-blue',
  high: 'pill-amber',
  urgent: 'pill-red',
}

function StatusBadge({ status }) {
  return <span className={`pill ${STATUS_PILL[status]}`}>{status.replace('_', ' ')}</span>
}

function PriorityBadge({ priority }) {
  return <span className={`pill ${PRIORITY_PILL[priority]}`}>{priority}</span>
}

export function MaintenancePage() {
  const { profile } = useAuth()
  return profile?.role === 'tenant' ? <TenantMaintenance /> : <LandlordMaintenance />
}

function LandlordMaintenance() {
  const { profile } = useAuth()
  const { data: properties = [], isLoading: propsLoading } = useProperties(profile?.id)
  const [selectedProperty, setSelectedProperty] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const propId = selectedProperty || properties[0]?.id
  const { data: requests = [], isLoading } = useMaintenanceRequests(propId)
  const { mutateAsync: updateStatus } = useUpdateMaintenanceStatus()

  const filtered = requests.filter(r => !statusFilter || r.status === statusFilter)
  const openCount = requests.filter(r => r.status === 'open').length

  if (propsLoading) return <PageLoader />

  async function handleStatusChange(id, status) {
    try {
      await updateStatus({ id, status })
      toast.success('Request updated')
    } catch {
      toast.error('Failed to update request')
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Maintenance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">{openCount} open requests</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <select className="input w-full sm:w-44" value={selectedProperty} onChange={e => setSelectedProperty(e.target.value)}>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="input w-full sm:w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {isLoading ? <PageLoader /> : filtered.length === 0 ? (
          <EmptyState icon={<Wrench size={48} />} title="No maintenance requests" description="Tenant requests will show up here" />
        ) : (
          <div className="space-y-2">
            {filtered.map(req => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <Avatar name={req.tenant?.full_name ?? '?'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{req.title}</p>
                    <PriorityBadge priority={req.priority} />
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {req.tenant?.full_name} · Unit {req.unit?.unit_number} · {format(new Date(req.created_at), 'd MMM yyyy')}
                  </p>
                  {req.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{req.description}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {req.status === 'open' && (
                    <button type="button" onClick={() => handleStatusChange(req.id, 'in_progress')} className="btn text-xs px-2.5 py-1.5">
                      Start
                    </button>
                  )}
                  {req.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(req.id, 'resolved')}
                      className="btn text-xs px-2.5 py-1.5 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-950/30"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function TenantMaintenance() {
  const { profile } = useAuth()
  const { data: lease } = useMyLease(profile?.id)
  const { data: requests = [], isLoading } = useMyMaintenanceRequests(profile?.id)
  const [newModal, setNewModal] = useState(false)

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Maintenance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">{requests.length} requests</p>
        </div>
        <button
          type="button"
          onClick={() => setNewModal(true)}
          disabled={!lease}
          className="btn-primary inline-flex items-center justify-center gap-1.5 text-sm w-full sm:w-auto disabled:opacity-50"
        >
          <Plus size={14} /> New request
        </button>
      </div>

      <Card>
        {isLoading ? <PageLoader /> : requests.length === 0 ? (
          <EmptyState
            icon={<Wrench size={48} />}
            title="No maintenance requests"
            description="Report an issue with your unit"
            action={
              <button type="button" onClick={() => setNewModal(true)} disabled={!lease} className="btn-primary text-sm px-4 py-2 disabled:opacity-50">
                New request
              </button>
            }
          />
        ) : (
          <div className="space-y-2">
            {requests.map(req => (
              <div key={req.id} className="flex flex-col gap-1 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{req.title}</p>
                  <PriorityBadge priority={req.priority} />
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {format(new Date(req.created_at), 'd MMM yyyy')}
                </p>
                {req.description && <p className="text-xs text-gray-500 dark:text-gray-500">{req.description}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {newModal && <NewRequestModal unitId={lease?.unit?.id} tenantId={profile?.id} onClose={() => setNewModal(false)} />}
    </div>
  )
}

function NewRequestModal({ unitId, tenantId, onClose }) {
  const { mutateAsync, isPending } = useCreateMaintenanceRequest()
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' })
  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await mutateAsync({
        unit_id: unitId,
        tenant_id: tenantId,
        title: form.title,
        description: form.description || null,
        priority: form.priority,
      })
      toast.success('Request submitted')
      onClose()
    } catch { toast.error('Failed to submit request') }
  }

  return (
    <Modal open title="New maintenance request" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Title</label>
          <input className="input" placeholder="e.g. Leaking tap in kitchen" value={form.title} onChange={e => set('title', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Description (optional)</label>
          <textarea className="input resize-none" rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Priority</label>
          <select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn flex-1">Cancel</button>
          <button type="submit" disabled={isPending} className="btn-primary flex-1 disabled:opacity-60">
            {isPending ? 'Submitting...' : 'Submit request'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
