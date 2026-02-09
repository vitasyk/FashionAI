import { Button } from "@/components/ui/button";
import { Upload, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import heroFashion1 from "@/assets/hero-fashion-1.jpg";
import heroFashion2 from "@/assets/hero-fashion-2.jpg";
import heroFashion3 from "@/assets/hero-fashion-3.jpg";
import heroFashion4 from "@/assets/hero-fashion-4.jpg";

const heroImages = [heroFashion1, heroFashion2, heroFashion3, heroFashion4];

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-glow opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Trust badge - clickable */}
          <Link
            to="/brands"
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in cursor-pointer group"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-background flex items-center justify-center"
                >
                  <span className="text-xs font-bold text-primary">B</span>
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              <span className="text-primary font-semibold">+9k</span> brands trust FashionAI
            </span>
          </Link>

          {/* Main headline */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight">
              Fashion photography with
              <span className="block text-gradient-gold italic mt-2">AI models</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Generate professional-grade, high quality fashion photos for your e-commerce store in minutes using AI.
            </p>
          </div>

          {/* CTA Button */}
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button asChild variant="hero" size="xl" className="group">
              <Link to="/dashboard">
                <Upload className="w-5 h-5" />
                Upload product photos
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Image gallery */}
        <div className="mt-16 md:mt-24 animate-scale-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex justify-center items-end gap-4 md:gap-6 overflow-hidden px-4">
            {/* Image cards with hover effects */}
            {[
              { delay: "0s", rotate: "-6deg", height: "h-64 md:h-80" },
              { delay: "0.1s", rotate: "-2deg", height: "h-72 md:h-96" },
              { delay: "0.2s", rotate: "2deg", height: "h-72 md:h-96" },
              { delay: "0.3s", rotate: "6deg", height: "h-64 md:h-80" },
            ].map((card, i) => (
              <div
                key={i}
                className={`relative ${card.height} w-48 md:w-64 rounded-2xl shadow-elevated overflow-hidden group transition-all duration-500 hover:scale-105 hover:shadow-glow animate-float`}
                style={{ 
                  transform: `rotate(${card.rotate})`,
                  animationDelay: card.delay,
                }}
              >
                {/* Fashion image */}
                <img
                  src={heroImages[i]}
                  alt={`Fashion model ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                
                {/* Original image thumbnail */}
                <div className="absolute top-3 right-3 w-12 h-12 rounded-lg bg-card/80 backdrop-blur-sm border border-border shadow-lg p-1 overflow-hidden">
                  <img
                    src={heroImages[i]}
                    alt="Original"
                    className="w-full h-full rounded object-cover opacity-70"
                  />
                </div>
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
