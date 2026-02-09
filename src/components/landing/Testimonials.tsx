import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "FashionAI completely transformed our e-commerce store. The virtual try-on feature has boosted customer confidence, and our sales have skyrocketed!",
    author: "Sophia Williams",
    role: "Founder, ChicStyle Boutique",
    rating: 5,
  },
  {
    quote: "The ease of generating high-quality product images is unmatched. It has made my product launches seamless and stress-free.",
    author: "James Anderson",
    role: "Owner, Urban Threads",
    rating: 5,
  },
  {
    quote: "The AI is amazing! The customization options for virtual try-ons are endless, and my customers love the interactive experience.",
    author: "Emily Davis",
    role: "E-Commerce Manager, LuxeWear",
    rating: 5,
  },
  {
    quote: "We've cut our photoshoot costs by over 70% thanks to FashionAI. The platform is intuitive and perfect for scaling our catalog.",
    author: "Michael Carter",
    role: "Creative Director, Modern Attire",
    rating: 5,
  },
  {
    quote: "Using FashionAI has been a game-changer. The time we save on creating product photos has allowed us to focus more on growing our business.",
    author: "Sophia Roberts",
    role: "Brand Strategist, Ethereal Design Co.",
    rating: 5,
  },
  {
    quote: "FashionAI has revolutionized the way we showcase our collections. It's efficient, affordable, and delivers consistent results every time.",
    author: "William Green",
    role: "Product Manager, StyleSphere",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 md:py-32 relative overflow-hidden">
      <div className="container px-4 md:px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
            Real stories from teams who
            <span className="text-gradient-gold"> transformed</span> their photography
          </h2>
          
          {/* Rating summary */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-muted border-2 border-background"
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-muted-foreground">4.9/5 • 2,431 reviews</span>
          </div>
        </div>

        {/* Testimonials marquee */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
          
          {/* Scrolling container */}
          <div className="overflow-hidden">
            <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused]">
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-80 md:w-96 p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-300"
                >
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <blockquote className="text-foreground mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20" />
                    <div>
                      <div className="font-medium text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
