import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Basic",
    tagline: "The essentials to get started",
    price: 35,
    credits: 140,
    resolution: "1K",
    popular: false,
    features: [
      "140 credits = 140 images",
      "1K resolution",
      "Image editing with prompts",
    ],
  },
  {
    name: "Professional",
    tagline: "For growing businesses",
    price: 99,
    credits: 450,
    resolution: "1K",
    popular: true,
    features: [
      "450 credits = 450 images",
      "1K resolution",
      "Video generation",
      "Image editing with prompts",
    ],
  },
  {
    name: "Enterprise",
    tagline: "For large businesses",
    price: 450,
    credits: 2300,
    resolution: "2K",
    popular: false,
    features: [
      "2300 credits = 2300 images",
      "2K resolution",
      "Video generation",
      "Image editing with prompts",
    ],
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container px-4 md:px-6 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
            Scale with
            <span className="text-gradient-gold"> flexible pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose a plan that grows with your business needs. One-time payment, refill as needed.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-1 ${
                plan.popular
                  ? "bg-gradient-gold shadow-glow"
                  : "bg-border/50"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-gold rounded-full text-primary-foreground text-sm font-medium flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  Popular
                </div>
              )}
              
              <div className={`h-full rounded-[calc(1.5rem-4px)] p-6 md:p-8 ${
                plan.popular ? "bg-card" : "bg-gradient-card"
              }`}>
                {/* Plan header */}
                <div className="mb-6">
                  <div className="text-sm text-muted-foreground mb-1">0{index + 1}</div>
                  <h3 className="text-2xl font-serif font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.tagline}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">one time</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Refill as needed</p>
                </div>

                {/* CTA */}
                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full mb-8"
                  size="lg"
                >
                  Get Started
                </Button>

                {/* Features */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">What's included</p>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Need a custom solution?{" "}
            <a href="mailto:support@fashionai.com" className="text-primary hover:underline">
              Let's talk about your requirements
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
