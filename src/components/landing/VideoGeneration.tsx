import { Play, Pause } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const VideoGeneration = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section id="video" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Motion from stills
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
              Turn photos into
              <span className="text-gradient-gold"> scroll-stopping</span> fashion videos
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Feed any FashionAI still into our motion engine, describe the mood in a sentence, and generate vertical-ready videos that feel like full productions – without reshoots.
            </p>

            {/* Steps */}
            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Pick your hero still",
                  description: "Start from any FashionAI shot you love – a lookbook pose, e-commerce angle, or campaign hero image.",
                },
                {
                  step: "2",
                  title: "Type a motion prompt",
                  description: "Describe the movement you want – e.g. \"slow pan down, soft camera shake, studio lights pulsing\".",
                },
                {
                  step: "3",
                  title: "Export ready-to-post clips",
                  description: "Download vertical videos in the right aspect ratios for Reels, TikTok, and Stories.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg" className="mt-8">
              Generate a sample video
            </Button>
          </div>

          {/* Video preview */}
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[9/16] max-w-sm mx-auto rounded-3xl bg-gradient-card border border-border/50 overflow-hidden shadow-elevated">
              {/* Video placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary via-muted to-secondary" />
              
              {/* Phone frame effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-background rounded-b-2xl" />
              
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors shadow-glow"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-primary-foreground" />
                  ) : (
                    <Play className="w-6 h-6 text-primary-foreground ml-1" />
                  )}
                </button>
              </div>

              {/* Bottom UI overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-card/80 border border-border" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">FashionAI Studio</div>
                    <div className="text-xs text-muted-foreground">Sponsored · Fashion</div>
                  </div>
                </div>
              </div>

              {/* Floating indicators */}
              <div className="absolute top-12 right-4 space-y-3">
                {["❤️ 312", "💬 8", "↗️"].map((item, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-card/50 backdrop-blur-sm flex items-center justify-center text-xs">
                    {item.includes("312") ? "❤️" : item.includes("8") ? "💬" : "↗️"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoGeneration;
