import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useGenerationJobs() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['generation-jobs', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('generation_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 5000, // Poll for updates
  });
}

interface CreateJobParams {
  prompt: string;
  modelPreset?: string;
  scenePreset?: string;
  posePreset?: string;
  negativePrompt?: string;
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (params: CreateJobParams) => {
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('create-generation-job', {
        body: params,
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generation-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      toast.success('Generation started!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start generation');
    },
  });
}
