import { useGenerationJobs } from '@/hooks/useGenerationJobs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-muted text-muted-foreground' },
  queued: { label: 'Queued', icon: Clock, className: 'bg-muted text-muted-foreground' },
  processing: { label: 'Processing', icon: Loader2, className: 'bg-primary/20 text-primary' },
  completed: { label: 'Completed', icon: CheckCircle, className: 'bg-green-500/20 text-green-500' },
  failed: { label: 'Failed', icon: XCircle, className: 'bg-destructive/20 text-destructive' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-muted text-muted-foreground' },
};

export default function JobsList() {
  const { data: jobs, isLoading } = useGenerationJobs();

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border">
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Card className="bg-card/50 border-border">
        <CardContent className="py-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No generations yet</p>
          <p className="text-sm text-muted-foreground/70">
            Create your first fashion photo above!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="font-serif">Recent Generations</CardTitle>
        <CardDescription>Your latest AI-generated fashion photos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.map((job) => {
          const status = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.pending;
          const StatusIcon = status.icon;

          return (
            <div
              key={job.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50"
            >
              {/* Thumbnail placeholder */}
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                {job.status === 'processing' ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>

              {/* Job details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">
                  {job.prompt || 'No prompt'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className={status.className}>
                    <StatusIcon className={`w-3 h-3 mr-1 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
                    {status.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                  </span>
                </div>
                {job.error_message && (
                  <p className="text-xs text-destructive mt-1 truncate">
                    {job.error_message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
