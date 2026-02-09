import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import ExamplesGallery from "@/components/landing/ExamplesGallery";
import Features from "@/components/landing/Features";
import VideoGeneration from "@/components/landing/VideoGeneration";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import { Helmet } from "react-helmet";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>FashionAI - AI Fashion Photography for E-Commerce</title>
        <meta
          name="description"
          content="Generate professional-grade fashion photos for your e-commerce store in minutes using AI. Virtual try-on, model photoshoots, and video generation."
        />
        <meta name="keywords" content="AI fashion photography, virtual try-on, e-commerce photos, AI models, fashion AI" />
        <link rel="canonical" href="https://fashionai.com" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <HowItWorks />
          <ExamplesGallery />
          <Features />
          <VideoGeneration />
          <Testimonials />
          <Pricing />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
