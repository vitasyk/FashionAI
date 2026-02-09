import { ArrowLeft, Clock, DollarSign, Zap, Camera, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import transformBeforeAfter from "@/assets/transform-before-after.jpg";

const benefits = [
  {
    icon: Clock,
    title: "Save weeks of time",
    description: "What used to take 2-3 weeks of planning, shooting, and editing now takes minutes.",
  },
  {
    icon: DollarSign,
    title: "Cut costs by 90%",
    description: "No model fees, no studio rentals, no photographer costs. Just upload and generate.",
  },
  {
    icon: Zap,
    title: "Instant scalability",
    description: "Generate hundreds of product images in the time it takes to do one traditional shoot.",
  },
  {
    icon: Camera,
    title: "Consistent quality",
    description: "Every image matches your brand guidelines with perfect lighting and composition.",
  },
];

const steps = [
  "Upload your product flat lay or ghost mannequin shot",
  "Choose from our library of AI models, poses, and backgrounds",
  "Generate campaign-ready images in under 60 seconds",
  "Download high-resolution files ready for your store",
];

const ReplaceWeeksOfShoots = () => {
  return (
    <>
      <Helmet>
        <title>Replace Weeks of Shoots - FashionAI</title>
        <meta
          name="description"
          content="Transform your fashion photography workflow. Replace weeks of expensive photoshoots with AI-powered imagery in minutes."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container px-4 md:px-6">
            {/* Back link */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>

            {/* Hero section */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  AI-Powered Photography
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
                  Replace weeks of
                  <span className="text-gradient-gold"> photoshoots</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  No model bookings, no studio fees, no endless editing. Just upload your product
                  photos and let AI create stunning, on-brand imagery that scales with your catalog.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="hero" size="lg">
                    <Link to="/auth">Start creating for free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/examples">View examples</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border border-border/50 shadow-elevated">
                  <img
                    src={transformBeforeAfter}
                    alt="Before and after transformation"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Benefits grid */}
            <div className="mb-24">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">
                Why brands are switching to
                <span className="text-gradient-gold"> AI photography</span>
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                  <div
                    key={benefit.title}
                    className="group p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-glow hover:-translate-y-1"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="mb-24">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">
                How it
                <span className="text-gradient-gold"> works</span>
              </h2>
              <div className="max-w-2xl mx-auto">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 mb-6 last:mb-0"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-lg">{step}</p>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center bg-gradient-card rounded-3xl p-12 border border-border/50">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Ready to transform your workflow?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of brands already saving time and money with AI-powered fashion photography.
              </p>
              <Button asChild variant="hero" size="lg">
                <Link to="/auth">Get started for free</Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required • 10 free credits to start
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ReplaceWeeksOfShoots;
