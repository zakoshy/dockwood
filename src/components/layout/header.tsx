"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-24 flex items-center">
        <Link href="/" className="flex items-center space-x-4 shrink-0">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl shadow-md border-2 border-primary/10 bg-white p-0.5">
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <Image 
                src="/logo.jpeg" 
                alt="Dockwood Furnitures Logo" 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </div>
          <span className="text-2xl font-headline font-bold text-primary hidden lg:inline-block tracking-tight">
            Dockwood<span className="text-accent"> Furnitures</span>
          </span>
        </Link>

        {/* Desktop Nav - Spread equally across the remaining space */}
        <nav className="hidden md:flex flex-1 items-center justify-around px-8 lg:px-16">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-base font-bold transition-colors hover:text-accent text-primary/80 uppercase tracking-wide"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="flex items-center space-x-4 md:hidden ml-auto">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-primary">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden border-b bg-background px-4 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block text-lg font-bold py-2 hover:text-accent text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
