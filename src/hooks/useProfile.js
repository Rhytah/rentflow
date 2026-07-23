import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async ({ id, full_name, phone }) => {
      const { data, error } = await supabase
        .from('profiles').update({ full_name, phone }).eq('id', id).select().single()
      if (error) throw error
      return data
    },
  })
}
