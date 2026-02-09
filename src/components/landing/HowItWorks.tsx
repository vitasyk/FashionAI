
import { Upload, Palette, Download, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import transformBeforeAfter from "@/assets/transform-before-after.jpg";

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload your product photos",
    description: "Start from simple flat lays or product shots — our AI understands the garment.",
  },
  {
    step: "02",
    icon: Palette,
    title: "Select model & scene",
    description: "Mix and match AI models, poses and locations to match each collection.",
  },
  {
    step: "03",
    icon: Download,
    title: "Approve & publish",
    description: "Approve the best looks, then export high-resolution assets ready for your store.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      
      <div className="container px-4 md:px-6 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            How it works
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
            From product shot to campaign-ready
            <span className="text-gradient-gold"> in minutes</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Replace weeks of photoshoots with one upload. No model bookings, no studio fees.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div
              key={step.step}
              className="group relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-border via-primary/30 to-border z-0" />
              )}
              
              {/* Card */}
              <div className="relative bg-gradient-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-glow group-hover:-translate-y-2">
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-serif font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature highlight - clickable */}
        <Link
          to="/replace-weeks-of-shoots"
          className="block mt-16 md:mt-24 bg-gradient-card rounded-3xl p-8 md:p-12 border border-border/50 relative overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-glow group cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-1/2 h-full bg-glow opacity-50" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-bold group-hover:text-primary transition-colors">
                Replace weeks of shoots with one upload
              </h3>
              <p className="text-muted-foreground max-w-lg">
                No model bookings, no studio fees. Just on-brand, production-ready imagery that scales with your catalog.
              </p>
              <span className="inline-flex items-center text-primary font-medium text-sm">
                Learn more →
              </span>
            </div>
            
            {/* Visual with actual image */}
            <div className="w-full md:w-96 h-64 rounded-2xl border border-border/50 relative overflow-hidden">
              <img
                src={transformBeforeAfter}
                alt="Before and after transformation"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default HowItWorks;
