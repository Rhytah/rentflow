import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useMaintenanceRequests(propertyId) {
  return useQuery({
    queryKey: ['maintenance-requests', propertyId],
    enabled: !!propertyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          unit:units(unit_number, property_id),
          tenant:profiles!maintenance_requests_tenant_id_fkey(id, full_name, phone, email)
        `)
        .eq('unit.property_id', propertyId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useMyMaintenanceRequests(tenantId) {
  return useQuery({
    queryKey: ['my-maintenance-requests', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*, unit:units(unit_number, property:properties(name))')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useOpenMaintenanceCount(propertyIds = []) {
  return useQuery({
    queryKey: ['open-maintenance-count', propertyIds],
    enabled: propertyIds.length > 0,
    queryFn: async () => {
      const { data: units, error: unitsErr } = await supabase
        .from('units').select('id').in('property_id', propertyIds)
      if (unitsErr) throw unitsErr
      const unitIds = units.map(u => u.id)
      if (unitIds.length === 0) return 0

      const { count, error } = await supabase
        .from('maintenance_requests')
        .select('id', { count: 'exact', head: true })
        .in('unit_id', unitIds)
        .eq('status', 'open')
      if (error) throw error
      return count ?? 0
    },
  })
}

export function useCreateMaintenanceRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input) => {
      const { data, error } = await supabase.from('maintenance_requests').insert(input).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-maintenance-requests'] })
      qc.invalidateQueries({ queryKey: ['maintenance-requests'] })
      qc.invalidateQueries({ queryKey: ['open-maintenance-count'] })
    },
  })
}

export function useUpdateMaintenanceStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update({ status, resolved_at: status === 'resolved' ? new Date().toISOString() : null })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance-requests'] })
      qc.invalidateQueries({ queryKey: ['my-maintenance-requests'] })
      qc.invalidateQueries({ queryKey: ['open-maintenance-count'] })
    },
  })
}
