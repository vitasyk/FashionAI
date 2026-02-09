import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import GenerationForm from '@/components/dashboard/GenerationForm';
import JobsList from '@/components/dashboard/JobsList';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - FashionAI</title>
        <meta name="description" content="Create AI-powered fashion photography for your e-commerce products" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
                Create Fashion Photos
              </h1>
              <p className="text-muted-foreground">
                Generate professional AI fashion photography for your products
              </p>
            </div>

            <GenerationForm />
            <JobsList />
          </div>
        </main>
      </div>
    </>
  );
}
