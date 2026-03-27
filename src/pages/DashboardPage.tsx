import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useProperties } from '@/hooks/useProperties'
import { usePayments, usePaymentSummary } from '@/hooks/usePayments'
import { formatUGX, formatUGXShort } from '@/lib/utils'
import {
  MetricCard, Card, CardHeader, StatusPill, Avatar,
  PageLoader, ProgressBar,
} from '@/components/shared'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const now = new Date()
const MONTH = now.getMonth() + 1
const YEAR  = now.getFullYear()

export function DashboardPage() {
  const { profile } = useAuth()
  const isTenant = profile?.role === 'tenant'

  return isTenant ? <TenantDashboard /> : <LandlordDashboard />
}

// ── LANDLORD / MANAGER / OWNER DASHBOARD ─────────────────────
function LandlordDashboard() {
  const { profile } = useAuth()
  const { data: properties = [], isLoading: propsLoading } = useProperties(profile?.id)

  // Use first property for summary (real app: aggregate all)
  const primaryProperty = properties[0]
  const { data: summary, isLoading: sumLoading } = usePaymentSummary(
    primaryProperty?.id ?? '', MONTH, YEAR
  )
  const { data: payments = [], isLoading: payLoading } = usePayments(
    primaryProperty?.id, MONTH, YEAR
  )

  if (propsLoading || sumLoading) return <PageLoader />

  const overdue  = payments.filter(p => p.status === 'overdue')
  const recentPaid = payments.filter(p => p.status === 'paid').slice(0, 5)

  const chartData = [
    { name: 'Nov', amount: 11_200_000 },
    { name: 'Dec', amount: 11_800_000 },
    { name: 'Jan', amount: 13_100_000 },
    { name: 'Feb', amount: 12_600_000 },
    { name: 'Mar', amount: summary?.total_collected ?? 0 },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Good morning, {profile?.full_name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(now, 'EEEE, d MMMM yyyy')} · {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>
        <Link to="/payments" className="btn flex items-center gap-1.5 text-sm">
          View all payments <ArrowRight size={14} />
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        <MetricCard
          label="Expected this month"
          value={formatUGXShort(summary?.total_expected ?? 0)}
          sub={`${summary?.total ?? 0} units`}
        />
        <MetricCard
          label="Collected"
          value={formatUGXShort(summary?.total_collected ?? 0)}
          sub={`${summary?.collection_rate ?? 0}% collection rate`}
          subColor={
            (summary?.collection_rate ?? 0) >= 90 ? 'green' :
            (summary?.collection_rate ?? 0) >= 70 ? 'amber' : 'red'
          }
        />
        <MetricCard
          label="Outstanding"
          value={formatUGXShort((summary?.total_expected ?? 0) - (summary?.total_collected ?? 0))}
          sub={`${summary?.overdue_count ?? 0} overdue`}
          subColor={(summary?.overdue_count ?? 0) > 0 ? 'red' : 'green'}
        />
        <MetricCard
          label="Late fees accrued"
          value={formatUGXShort(summary?.total_late_fees ?? 0)}
          sub="Auto-calculated"
          subColor={(summary?.total_late_fees ?? 0) > 0 ? 'amber' : undefined}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Revenue chart */}
        <Card className="col-span-2">
          <CardHeader title="Revenue — last 5 months" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={32}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${Math.round(v / 1_000_000)}M`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => formatUGX(v)} cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === chartData.length - 1 ? '#185FA5' : '#B5D4F4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Collection breakdown */}
        <Card>
          <CardHeader title="This month" />
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Paid ({summary?.paid_count ?? 0})</span>
                <span className="text-green-600 font-medium">
                  {summary?.total ? Math.round(((summary.paid_count ?? 0) / summary.total) * 100) : 0}%
                </span>
              </div>
              <ProgressBar pct={summary?.total ? ((summary.paid_count ?? 0) / summary.total) * 100 : 0} color="green" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Partial ({summary?.partial_count ?? 0})</span>
                <span className="text-amber-600 font-medium">
                  {summary?.total ? Math.round(((summary.partial_count ?? 0) / summary.total) * 100) : 0}%
                </span>
              </div>
              <ProgressBar pct={summary?.total ? ((summary.partial_count ?? 0) / summary.total) * 100 : 0} color="amber" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Overdue ({summary?.overdue_count ?? 0})</span>
                <span className="text-red-600 font-medium">
                  {summary?.total ? Math.round(((summary.overdue_count ?? 0) / summary.total) * 100) : 0}%
                </span>
              </div>
              <ProgressBar pct={summary?.total ? ((summary.overdue_count ?? 0) / summary.total) * 100 : 0} color="red" />
            </div>
          </div>

          {/* Properties */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-3">Properties</p>
            <div className="space-y-2">
              {properties.map(prop => (
                <div key={prop.id} className="flex items-center justify-between">
                  <p className="text-xs text-gray-700 truncate max-w-[120px]">{prop.name}</p>
                  <span className="text-xs text-gray-400">{prop.total_units} units</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Overdue alerts */}
        <Card>
          <CardHeader
            title="Overdue payments"
            action={
              <Link to="/payments?status=overdue" className="text-xs text-brand-600 hover:underline">
                View all
              </Link>
            }
          />
          {overdue.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600 text-sm py-4">
              <CheckCircle2 size={16} /> All payments up to date
            </div>
          ) : (
            <div className="space-y-2">
              {overdue.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <Avatar name={p.tenant?.full_name ?? '?'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.tenant?.full_name}</p>
                    <p className="text-xs text-gray-400">Unit {p.unit?.unit_number} · {formatUGXShort(p.amount_due)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-red-500">
                    <AlertCircle size={13} />
                    <span className="text-xs">Overdue</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent payments */}
        <Card>
          <CardHeader
            title="Recent payments"
            action={
              <Link to="/payments" className="text-xs text-brand-600 hover:underline">View all</Link>
            }
          />
          {recentPaid.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">No payments recorded yet</p>
          ) : (
            <div className="space-y-2">
              {recentPaid.map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <Avatar name={p.tenant?.full_name ?? '?'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.tenant?.full_name}</p>
                    <p className="text-xs text-gray-400">
                      Unit {p.unit?.unit_number} · {p.paid_at ? format(new Date(p.paid_at), 'd MMM') : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatUGXShort(p.amount)}</p>
                    <StatusPill status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ── TENANT DASHBOARD ──────────────────────────────────────────
function TenantDashboard() {
  const { profile } = useAuth()
  const { useMyLease } = require('@/hooks/useProperties')
  const { useMyPayments } = require('@/hooks/usePayments')
  const { data: lease } = useMyLease(profile?.id)
  const { data: payments = [] } = useMyPayments(profile?.id)

  const nextPayment = payments.find(p => p.status === 'pending' || p.status === 'upcoming')
  const recentPayments = payments.slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Hi, {profile?.full_name.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{format(now, 'EEEE, d MMMM yyyy')}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Monthly rent" value={formatUGX(lease?.rent_amount ?? 0)} sub={`Unit ${lease?.unit?.unit_number}`} />
        <MetricCard
          label="Next due"
          value={nextPayment ? format(new Date(nextPayment.due_date), 'd MMM yyyy') : 'No upcoming'}
          sub={nextPayment ? formatUGX(nextPayment.amount_due) : ''}
          subColor="amber"
        />
        <MetricCard
          label="Balance"
          value={nextPayment?.status === 'overdue' ? formatUGX(nextPayment.amount_due) : 'UGX 0'}
          sub={nextPayment?.status === 'overdue' ? 'Overdue' : 'All clear'}
          subColor={nextPayment?.status === 'overdue' ? 'red' : 'green'}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Quick pay" />
          {nextPayment ? (
            <div>
              <p className="text-3xl font-semibold text-gray-900 mb-1">{formatUGX(nextPayment.amount_due)}</p>
              <p className="text-sm text-gray-500 mb-4">
                Due {format(new Date(nextPayment.due_date), 'd MMMM yyyy')}
              </p>
              <Link to="/payments" className="btn-primary block text-center py-2.5 rounded-lg">
                Pay now
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600 py-4">
              <CheckCircle2 size={16} />
              <span className="text-sm">No payments due</span>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Payment history" action={<Link to="/payments" className="text-xs text-brand-600">View all</Link>} />
          <div className="space-y-2">
            {recentPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm text-gray-800">{format(new Date(p.due_date), 'MMM yyyy')}</p>
                  <p className="text-xs text-gray-400">{p.method?.replace('_', ' ') ?? 'Not recorded'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatUGXShort(p.amount)}</p>
                  <StatusPill status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
