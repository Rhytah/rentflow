import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Property, Unit, Lease, UtilityBill } from '@/types/database'

// ── PROPERTIES ───────────────────────────────────────────────
export function useProperties(userId?: string) {
  return useQuery({
    queryKey: ['properties', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, owner:profiles!properties_owner_id_fkey(full_name, email), manager:profiles!properties_manager_id_fkey(full_name)')
        .or(`owner_id.eq.${userId},manager_id.eq.${userId}`)
        .order('name')
      if (error) throw error
      return data as Property[]
    },
  })
}

export function useProperty(id?: string) {
  return useQuery({
    queryKey: ['property', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties').select('*').eq('id', id!).single()
      if (error) throw error
      return data as Property
    },
  })
}

export function useCreateProperty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<Property>) => {
      const { data, error } = await supabase.from('properties').insert(input).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  })
}

// ── UNITS ────────────────────────────────────────────────────
export function useUnits(propertyId?: string) {
  return useQuery({
    queryKey: ['units', propertyId],
    enabled: !!propertyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('units').select('*').eq('property_id', propertyId!).order('unit_number')
      if (error) throw error
      return data as Unit[]
    },
  })
}

// ── LEASES ───────────────────────────────────────────────────
export function useLeases(propertyId?: string) {
  return useQuery({
    queryKey: ['leases', propertyId],
    enabled: !!propertyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          *,
          unit:units(unit_number, property_id, rent_amount),
          tenant:profiles!leases_tenant_id_fkey(id, full_name, phone, email)
        `)
        .eq('unit.property_id', propertyId!)
        .eq('is_active', true)
      if (error) throw error
      return data as Lease[]
    },
  })
}

export function useMyLease(tenantId?: string) {
  return useQuery({
    queryKey: ['my-lease', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select('*, unit:units(*, property:properties(name, address))')
        .eq('tenant_id', tenantId!)
        .eq('is_active', true)
        .single()
      if (error) throw error
      return data as Lease
    },
  })
}

export function useCreateLease() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<Lease>) => {
      const { data, error } = await supabase.from('leases').insert(input).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leases'] })
      qc.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

// ── UTILITY BILLS ─────────────────────────────────────────────
export function useUtilityBills(propertyId?: string, month?: number, year?: number) {
  return useQuery({
    queryKey: ['utility-bills', propertyId, month, year],
    enabled: !!propertyId,
    queryFn: async () => {
      let q = supabase
        .from('utility_bills')
        .select('*, unit:units(unit_number)')
        .eq('property_id', propertyId!)
        .order('due_date')
      if (month) q = q.eq('period_month', month)
      if (year)  q = q.eq('period_year', year)
      const { data, error } = await q
      if (error) throw error
      return data as UtilityBill[]
    },
  })
}

export function useCreateUtilityBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<UtilityBill>) => {
      const { data, error } = await supabase.from('utility_bills').insert(input).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['utility-bills'] }),
  })
}

export function useMarkUtilityPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('utility_bills').update({
        status: 'paid', paid_at: new Date().toISOString(),
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['utility-bills'] }),
  })
}
