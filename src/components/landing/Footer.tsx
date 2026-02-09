import { Instagram, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    product: [
      { label: "Examples", href: "#examples" },
      { label: "Pricing", href: "#pricing" },
      { label: "Photography Styles", href: "#styles" },
      { label: "Compare", href: "#compare" },
    ],
    help: [
      { label: "Affiliate Program", href: "#affiliate" },
      { label: "Customer Support", href: "mailto:support@fashionai.com" },
      { label: "Terms & Conditions", href: "#terms" },
      { label: "Privacy Policy", href: "#privacy" },
    ],
  };

  return (
    <footer className="py-16 md:py-20 border-t border-border bg-gradient-dark">
      <div className="container px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">F</span>
              </div>
              <span className="font-serif text-xl font-semibold tracking-tight">
                Fashion<span className="text-primary">AI</span>
              </span>
            </a>
            <p className="text-muted-foreground max-w-sm mb-6">
              Virtual try-on and stunning fashion photoshoots in minutes. Transform your e-commerce with AI-powered imagery.
            </p>
            {/* Social links */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors">
                <Instagram className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors">
                <Twitter className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors">
                <Linkedin className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Help</h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FashionAI. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Crafted with AI for the future of fashion
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
