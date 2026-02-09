import { Link } from "react-router-dom";

import galleryDress from "@/assets/gallery-dress.jpg";
import galleryJacket from "@/assets/gallery-jacket.jpg";
import gallerySuit from "@/assets/gallery-suit.jpg";
import gallerySwimwear from "@/assets/gallery-swimwear.jpg";
import galleryCasual from "@/assets/gallery-casual.jpg";
import galleryStreetwear from "@/assets/gallery-streetwear.jpg";
import galleryFormal from "@/assets/gallery-formal.jpg";
import galleryAthletic from "@/assets/gallery-athletic.jpg";

const exampleImages = [
    { id: 1, category: "Dress", image: galleryDress, height: 320 },
    { id: 2, category: "Jacket", image: galleryJacket, height: 380 },
    { id: 3, category: "Suit", image: gallerySuit, height: 340 },
    { id: 4, category: "Swimwear", image: gallerySwimwear, height: 300 },
    { id: 5, category: "Casual", image: galleryCasual, height: 320 },
    { id: 6, category: "Streetwear", image: galleryStreetwear, height: 380 },
    { id: 7, category: "Formal", image: galleryFormal, height: 360 },
    { id: 8, category: "Athletic", image: galleryAthletic, height: 300 },
];

const ExamplesGallery = () => {
    return (
        <section id="examples" className="py-24 md:py-32 relative overflow-hidden">
            <div className="container px-4 md:px-6">
                {/* Section header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        Example images
                    </span>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
                        See how brands style
                        <span className="text-gradient-gold"> FashionAI</span> looks
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        We have created over 1,000+ fashion photos with our AI. Browse our gallery for inspiration.
                    </p>
                </div>

                {/* Masonry-style gallery */}
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {exampleImages.map((image) => (
                        <Link
                            key={image.id}
                            to="/examples"
                            className="break-inside-avoid group relative rounded-2xl border border-border/50 overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-glow block"
                            style={{ height: `${image.height}px` }}
                        >
                            <img
                                src={image.image}
                                alt={`${image.category} fashion example`}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />

                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Category label */}
                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
                                    <span className="text-sm font-medium">{image.category}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* View more */}
                <div className="text-center mt-12">
                    <Link to="/examples" className="text-primary hover:underline font-medium">
                        View all examples →
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ExamplesGallery;
