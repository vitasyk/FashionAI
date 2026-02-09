import { 
  Users, 
  Image, 
  Video, 
  Shirt, 
  Sparkles, 
  Maximize2, 
  RotateCcw, 
  UserPlus 
} from "lucide-react";

import promptAlterations from "@/assets/prompt-alterations.jpg";
import promptColorChange from "@/assets/prompt-color-change.jpg";
import promptModifications from "@/assets/prompt-modifications.jpg";

const features = [
  { icon: Users, title: "Multiple model types", description: "Generate with different fashion models, including men, women, teens, and more." },
  { icon: Image, title: "Custom backgrounds", description: "Generate different backgrounds on your generated images to match your brand." },
  { icon: Video, title: "Video generation", description: "Generate videos from your generated images with a single motion prompt." },
  { icon: Shirt, title: "Top & bottom support", description: "Generate with different bottom and top clothes, including pants, skirts, and more." },
  { icon: Maximize2, title: "High resolution", description: "We automatically upscale to high resolution images at no extra cost." },
  { icon: RotateCcw, title: "Front & back views", description: "Generate front and back views of your clothing products automatically." },
  { icon: Sparkles, title: "Random models", description: "Get completely random models on each generation for variety." },
  { icon: UserPlus, title: "Multiple models", description: "Add multiple models to your images by selecting the model quantity option." },
];

const promptExamples = [
  { prompt: "Make the sleeves shorter", category: "Alterations", image: promptAlterations },
  { prompt: "Make the t-shirt red", category: "Color change", image: promptColorChange },
  { prompt: "Make the sleeves longer", category: "Modifications", image: promptModifications },
];

const Features = () => {
  return (
    <section id="features" className="py-24 md:py-32 relative">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Features</span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">And tons of other<span className="text-gradient-gold"> AI features</span></h2>
          <p className="text-lg text-muted-foreground">We've got it all. And we're just getting started.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={feature.title} className="group p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-glow hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 md:mt-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h3 className="text-2xl md:text-4xl font-serif font-bold mb-4">Edit with AI-Powered Prompts</h3>
            <p className="text-muted-foreground">Transform your product photos with natural language prompts. Simply describe the style, setting, or mood you want.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {promptExamples.map((example, index) => (
              <div key={index} className="group relative rounded-2xl bg-gradient-card border border-border/50 overflow-hidden hover:border-primary/30 transition-all duration-500">
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img src={example.image} alt={example.category} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent">
                  <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">{example.category}</div>
                    <p className="text-sm font-medium">"{example.prompt}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
