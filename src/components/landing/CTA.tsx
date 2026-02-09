import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-gold mb-8 shadow-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          
          {/* Headline */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
            Ready to transform your
            <span className="block text-gradient-gold">fashion photography?</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join 9,000+ fashion brands already using AI to create stunning product photos in minutes.
          </p>
          
          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="group">
              Start creating for free
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="glass" size="xl">
              View examples
            </Button>
          </div>
          
          {/* Trust indicators */}
          <p className="text-sm text-muted-foreground mt-8">
            No credit card required • 10 free credits to start
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
