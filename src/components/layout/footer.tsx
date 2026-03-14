import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-headline font-bold">Dockwood Furniture's</h3>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Premium timber and handcrafted furniture in Mombasa. 
              We pride ourselves on quality and same-day delivery.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-accent transition-colors"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-accent transition-colors"><Instagram className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-accent transition-colors"><Twitter className="h-5 w-5" /></Link>
            </div>
          </div>

          <div>
            <h4 className="font-headline font-semibold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link href="/" className="hover:text-accent">Home</Link></li>
              <li><Link href="/products" className="hover:text-accent">Our Products</Link></li>
              <li><Link href="/about" className="hover:text-accent">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-accent">Contact Us</Link></li>
              <li className="pt-2">
                <Link href="/admin" className="flex items-center text-accent hover:underline font-bold">
                  <Lock className="h-3 w-3 mr-1" /> Admin Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline font-semibold mb-4 text-lg">Categories</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link href="/products?cat=beds" className="hover:text-accent">Premium Beds</Link></li>
              <li><Link href="/products?cat=chairs" className="hover:text-accent">Dining Chairs</Link></li>
              <li><Link href="/products?cat=timber" className="hover:text-accent">Construction Timber</Link></li>
              <li><Link href="/products?cat=cabinets" className="hover:text-accent">Storage Cabinets</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline font-semibold mb-4 text-lg">Contact Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 shrink-0 text-accent" />
                <span>Bombolulu, Kisimani, Opposite Nivash Supermarket, Mombasa, Kenya</span>
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
        
        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Dockwood Furniture's. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-accent">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-accent">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
