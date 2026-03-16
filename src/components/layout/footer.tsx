import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <h3 className="text-2xl font-headline font-bold leading-tight">Dockwood <br /> Furnitures</h3>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
              Mombasa's leading suppliers of premium timber and bespoke handcrafted furniture. Built on quality and integrity since 2010.
            </p>
            <div className="flex space-x-5">
              <Link href="#" className="hover:text-accent transition-colors"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-accent transition-colors"><Instagram className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-accent transition-colors"><Twitter className="h-5 w-5" /></Link>
            </div>
          </div>

          <div>
            <h4 className="font-headline font-bold mb-6 text-lg text-white">Quick Navigation</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li><Link href="/" className="hover:text-accent transition-colors">Home Page</Link></li>
              <li><Link href="/products" className="hover:text-accent transition-colors">Furniture Catalog</Link></li>
              <li><Link href="/about" className="hover:text-accent transition-colors">Our Story</Link></li>
              <li><Link href="/contact" className="hover:text-accent transition-colors">Get in Touch</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline font-bold mb-6 text-lg text-white">Product Categories</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li><Link href="/products?cat=Beds" className="hover:text-accent transition-colors">Premium Bed Frames</Link></li>
              <li><Link href="/products?cat=Chairs" className="hover:text-accent transition-colors">Bespoke Chairs</Link></li>
              <li><Link href="/products?cat=Timber" className="hover:text-accent transition-colors">Hardwood Timber</Link></li>
              <li><Link href="/products?cat=Tables" className="hover:text-accent transition-colors">Dining & Office Tables</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline font-bold mb-6 text-lg text-white">Contact Details</h4>
            <ul className="space-y-4 text-sm text-primary-foreground/70">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 shrink-0 text-accent" />
                <span>Bombolulu, Kisimani, Opposite Nivash Supermarket, Opposite Petrocity, Mombasa</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 shrink-0 text-accent" />
                <span>+254 711 662 626</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 shrink-0 text-accent" />
                <span>info@dockwoodfurnitures.co.ke</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest font-bold text-primary-foreground/40">
          <p>© {new Date().getFullYear()} Dockwood Furnitures. All rights reserved.</p>
          <div className="flex space-x-6 mt-6 md:mt-0">
            <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
