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
              <Link 
                href="https://web.facebook.com/profile.php?id=61555310847954" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link 
                href="https://www.instagram.com/dock_wood_kenya/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link 
                href="https://vm.tiktok.com/ZS9R2y6HNUART-vpscf/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="h-5 w-5 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.31-.75.42-1.24 1.25-1.33 2.1-.1.7.1 1.41.53 1.94.49.63 1.25.99 2.04 1.01.89.06 1.8-.32 2.38-1.02.41-.48.6-1.12.59-1.75.02-4.43 0-8.85.01-13.27.31-.03.62-.05.93-.06z"/>
                </svg>
              </Link>
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
                <span>info@dockwoodfurnitures.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center text-[10px] uppercase tracking-widest font-bold text-primary-foreground/40">
          <p>© {new Date().getFullYear()} Dockwood Furnitures. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
