import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useCredits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { data, error } = await supabase
        .from('credit_balances')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.balance ?? 0;
    },
    enabled: !!user,
  });
}
