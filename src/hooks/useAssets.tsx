import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useAssets(type?: 'upload' | 'generated' | 'mask' | 'video') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assets', user?.id, type],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('asset_type', type);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
