import { ArrowLeft, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

import galleryDress from "@/assets/gallery-dress.jpg";
import galleryJacket from "@/assets/gallery-jacket.jpg";
import gallerySuit from "@/assets/gallery-suit.jpg";
import gallerySwimwear from "@/assets/gallery-swimwear.jpg";
import galleryCasual from "@/assets/gallery-casual.jpg";
import galleryStreetwear from "@/assets/gallery-streetwear.jpg";
import galleryFormal from "@/assets/gallery-formal.jpg";
import galleryAthletic from "@/assets/gallery-athletic.jpg";
import galleryEvening from "@/assets/gallery-evening.jpg";
import galleryDenim from "@/assets/gallery-denim.jpg";
import galleryOuterwear from "@/assets/gallery-outerwear.jpg";
import galleryAccessories from "@/assets/gallery-accessories.jpg";

const categories = ["All", "Dress", "Jacket", "Suit", "Swimwear", "Casual", "Streetwear", "Formal", "Athletic", "Evening", "Denim", "Outerwear", "Accessories"];

const exampleImages = [
  { id: 1, category: "Dress", image: galleryDress },
  { id: 2, category: "Jacket", image: galleryJacket },
  { id: 3, category: "Suit", image: gallerySuit },
  { id: 4, category: "Swimwear", image: gallerySwimwear },
  { id: 5, category: "Casual", image: galleryCasual },
  { id: 6, category: "Streetwear", image: galleryStreetwear },
  { id: 7, category: "Formal", image: galleryFormal },
  { id: 8, category: "Athletic", image: galleryAthletic },
  { id: 9, category: "Evening", image: galleryEvening },
  { id: 10, category: "Denim", image: galleryDenim },
  { id: 11, category: "Outerwear", image: galleryOuterwear },
  { id: 12, category: "Accessories", image: galleryAccessories },
];

const Examples = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredImages = activeFilter === "All" 
    ? exampleImages 
    : exampleImages.filter(img => img.category === activeFilter);

  return (
    <>
      <Helmet>
        <title>Examples - FashionAI</title>
        <meta
          name="description"
          content="Browse our gallery of AI-generated fashion photography examples. See how brands style FashionAI looks."
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

            {/* Header */}
            <div className="max-w-3xl mb-12">
              <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
                Example
                <span className="text-gradient-gold"> Gallery</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Explore our collection of AI-generated fashion photography. From casual streetwear
                to elegant evening wear, see what's possible with FashionAI.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeFilter === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Gallery grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-glow"
                >
                  <img
                    src={image.image}
                    alt={`${image.category} fashion example`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
                      <span className="text-sm font-medium">{image.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-4">
                Ready to create stunning fashion photos like these?
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Start creating for free
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Examples;
