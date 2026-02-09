import { Building2, Star, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const brands = [
  { name: "Zara", category: "Fast Fashion" },
  { name: "H&M", category: "Fast Fashion" },
  { name: "Nike", category: "Sportswear" },
  { name: "Adidas", category: "Sportswear" },
  { name: "Gucci", category: "Luxury" },
  { name: "Prada", category: "Luxury" },
  { name: "Levi's", category: "Denim" },
  { name: "Calvin Klein", category: "Contemporary" },
  { name: "Tommy Hilfiger", category: "Contemporary" },
  { name: "Ralph Lauren", category: "Premium" },
  { name: "Burberry", category: "Luxury" },
  { name: "Versace", category: "Luxury" },
  { name: "ASOS", category: "E-commerce" },
  { name: "Boohoo", category: "E-commerce" },
  { name: "Shein", category: "Fast Fashion" },
  { name: "Uniqlo", category: "Basics" },
];

const Brands = () => {
  return (
    <>
      <Helmet>
        <title>Brands - FashionAI</title>
        <meta
          name="description"
          content="Discover the 9K+ brands that trust FashionAI for their e-commerce photography needs."
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
            <div className="max-w-3xl mb-16">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  9,000+ Brands
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
                Trusted by leading
                <span className="text-gradient-gold"> fashion brands</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From fast fashion to luxury houses, thousands of brands use FashionAI to create
                stunning product photography at scale. Join the revolution in e-commerce imagery.
              </p>
            </div>

            {/* Brands grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
              {brands.map((brand, index) => (
                <div
                  key={brand.name}
                  className="group p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-glow hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1">{brand.name}</h3>
                  <p className="text-sm text-muted-foreground">{brand.category}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-4">
                And thousands more brands scaling their product photography with AI
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Join 9K+ brands today
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Brands;
