import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Payment, PaymentMethod, PaymentStatus } from '@/types/database'

export function usePayments(propertyId?: string, month?: number, year?: number) {
  return useQuery({
    queryKey: ['payments', propertyId, month, year],
    queryFn: async () => {
      let q = supabase
        .from('payments')
        .select(`
          *,
          tenant:profiles!payments_tenant_id_fkey(id, full_name, phone, email),
          unit:units(id, unit_number, property_id),
          property:properties(id, name, address)
        `)
        .order('due_date', { ascending: false })

      if (propertyId) q = q.eq('property_id', propertyId)
      if (month)      q = q.eq('period_month', month)
      if (year)       q = q.eq('period_year', year)

      const { data, error } = await q
      if (error) throw error
      return data as Payment[]
    },
  })
}

export function useMyPayments(tenantId?: string) {
  return useQuery({
    queryKey: ['my-payments', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`*, unit:units(unit_number), property:properties(name)`)
        .eq('tenant_id', tenantId!)
        .order('period_year', { ascending: false })
        .order('period_month', { ascending: false })

      if (error) throw error
      return data as Payment[]
    },
  })
}

export function usePaymentSummary(propertyId: string, month: number, year: number) {
  return useQuery({
    queryKey: ['payment-summary', propertyId, month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('status, amount, amount_due, late_fee')
        .eq('property_id', propertyId)
        .eq('period_month', month)
        .eq('period_year', year)

      if (error) throw error

      const total_expected  = data.reduce((s, p) => s + Number(p.amount_due), 0)
      const total_collected = data.reduce((s, p) => s + Number(p.amount), 0)
      const total_late_fees = data.reduce((s, p) => s + Number(p.late_fee), 0)
      const paid_count      = data.filter(p => p.status === 'paid').length
      const overdue_count   = data.filter(p => p.status === 'overdue').length
      const partial_count   = data.filter(p => p.status === 'partial').length
      const collection_rate = total_expected > 0
        ? Math.round((total_collected / total_expected) * 100) : 0

      return {
        total_expected, total_collected, total_late_fees,
        paid_count, overdue_count, partial_count,
        collection_rate, total: data.length,
      }
    },
  })
}

interface RecordPaymentInput {
  paymentId: string
  amount: number
  method: PaymentMethod
  reference?: string
  notes?: string
}

export function useRecordPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ paymentId, amount, method, reference, notes }: RecordPaymentInput) => {
      // Fetch payment to compare amount
      const { data: existing } = await supabase
        .from('payments').select('amount_due, late_fee').eq('id', paymentId).single()

      const totalDue = Number(existing?.amount_due ?? 0) + Number(existing?.late_fee ?? 0)
      const newStatus: PaymentStatus = amount >= totalDue ? 'paid' : 'partial'

      const { data, error } = await supabase
        .from('payments')
        .update({
          amount,
          method,
          reference: reference ?? null,
          notes: notes ?? null,
          status: newStatus,
          paid_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  })
}

export function useUpdatePaymentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PaymentStatus }) => {
      const { error } = await supabase.from('payments').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  })
}
