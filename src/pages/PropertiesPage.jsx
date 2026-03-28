import { useState } from 'react'
import { Building2, Plus, MapPin, Home } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useProperties, useUnits, useCreateProperty } from '@/hooks/useProperties'
import { formatUGXShort } from '@/lib/utils'
import { Card, CardHeader, MetricCard, PageLoader, EmptyState, Modal, ProgressBar } from '@/components/shared'
import toast from 'react-hot-toast'

export function PropertiesPage() {
  const { profile } = useAuth()
  const { data: properties = [], isLoading } = useProperties(profile?.id)
  const [selected, setSelected] = useState(null)
  const [addModal, setAddModal] = useState(false)

  if (isLoading) return <PageLoader />

  const totalUnits = properties.reduce((s, p) => s + p.total_units, 0)

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Properties</h1>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">{properties.length} properties · {totalUnits} total units</p>
        </div>
        <button type="button" onClick={() => setAddModal(true)} className="btn-primary inline-flex items-center justify-center gap-1.5 text-sm w-full sm:w-auto">
          <Plus size={14} /> Add property
        </button>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={<Building2 size={48} />}
          title="No properties yet"
          description="Add your first property to get started"
          action={
            <button type="button" onClick={() => setAddModal(true)} className="btn-primary text-sm px-4 py-2">
              Add property
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map(prop => (
            <PropertyCard
              key={prop.id}
              property={prop}
              isSelected={selected?.id === prop.id}
              onClick={() => setSelected(selected?.id === prop.id ? null : prop)}
            />
          ))}
        </div>
      )}

      {selected && <PropertyDetail property={selected} />}

      {addModal && <AddPropertyModal ownerId={profile?.id ?? ''} onClose={() => setAddModal(false)} />}
    </div>
  )
}

function PropertyCard({ property, isSelected, onClick }) {
  const occupiedUnits = Math.floor(property.total_units * 0.875)
  const occupancyPct = Math.round((occupiedUnits / property.total_units) * 100)

  return (
    <Card
      className={`min-w-0 cursor-pointer transition-all hover:border-brand-200 dark:hover:border-brand-700 ${isSelected ? 'border-brand-300 dark:border-brand-600 bg-brand-50/20 dark:bg-brand-950/25' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950/50 rounded-xl flex items-center justify-center">
          <Building2 size={18} className="text-brand-600 dark:text-brand-400" />
        </div>
        <span className={`pill ${occupancyPct === 100 ? 'pill-green' : occupancyPct >= 80 ? 'pill-blue' : 'pill-amber'}`}>
          {occupancyPct}% full
        </span>
      </div>
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">{property.name}</h3>
      <div className="flex items-start gap-1 text-xs text-gray-400 dark:text-gray-500 mb-3 min-w-0">
        <MapPin size={11} className="shrink-0 mt-0.5" />
        <span className="line-clamp-2">{property.address}, {property.city}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500 mb-3">
        <span className="flex items-center gap-1"><Home size={11} /> {property.total_units} units</span>
        <span>{occupiedUnits} occupied</span>
      </div>
      <ProgressBar pct={occupancyPct} color={occupancyPct >= 90 ? 'green' : occupancyPct >= 70 ? 'brand' : 'amber'} />
    </Card>
  )
}

function PropertyDetail({ property }) {
  const { data: units = [], isLoading } = useUnits(property.id)

  return (
    <Card>
      <CardHeader title={`${property.name} — Units`} />
      {isLoading ? <PageLoader /> : units.length === 0 ? (
        <EmptyState title="No units yet" description="Add units to this property" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {units.map(unit => (
            <div
              key={unit.id}
              className={`p-2.5 rounded-lg border text-center text-xs ${
                unit.is_occupied
                  ? 'border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/40 text-brand-800 dark:text-brand-300'
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500'
              }`}
            >
              <p className="font-medium">{unit.unit_number}</p>
              <p className="text-[10px] mt-0.5">{formatUGXShort(unit.rent_amount)}</p>
              <p className="text-[10px]">{unit.is_occupied ? 'Occupied' : 'Vacant'}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function AddPropertyModal({ ownerId, onClose }) {
  const { mutateAsync, isPending } = useCreateProperty()
  const [form, setForm] = useState({ name: '', address: '', city: 'Kampala', total_units: 1 })
  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await mutateAsync({ ...form, owner_id: ownerId })
      toast.success('Property added')
      onClose()
    } catch { toast.error('Failed to add property') }
  }

  return (
    <Modal open title="Add property" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Property name</label>
          <input className="input" placeholder="e.g. Kato Apartments" value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Address</label>
          <input className="input" placeholder="e.g. Plot 12, Ntinda Road" value={form.address} onChange={e => set('address', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">City</label>
          <input className="input" placeholder="Kampala" value={form.city} onChange={e => set('city', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1.5">Number of units</label>
          <input type="number" className="input" min={1} value={form.total_units} onChange={e => set('total_units', Number(e.target.value))} required />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn flex-1">Cancel</button>
          <button type="submit" disabled={isPending} className="btn-primary flex-1 disabled:opacity-60">
            {isPending ? 'Adding...' : 'Add property'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
