"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["All", "Beds", "Chairs", "Tables", "Timber", "Cabinets", "Other"];

// Mock initial data - In production this comes from Firestore
const INITIAL_PRODUCTS = [
  { id: "1", name: "Premium Mahogany King Bed", category: "Beds", quantity: 12, imageUrl: "https://picsum.photos/seed/bed1/800/600" },
  { id: "2", name: "Solid Oak Dining Table", category: "Tables", quantity: 8, imageUrl: "https://picsum.photos/seed/table1/800/600" },
  { id: "3", name: "High-Grade Cypress Timber", category: "Timber", quantity: 45, imageUrl: "https://picsum.photos/seed/timber1/800/600" },
  { id: "4", name: "Orthopedic Mattress Support Bed", category: "Beds", quantity: 5, imageUrl: "https://picsum.photos/seed/bed2/800/600" },
  { id: "5", name: "Modern Office Swivel Chair", category: "Chairs", quantity: 2, imageUrl: "https://picsum.photos/seed/chair2/800/600" },
  { id: "6", name: "Kitchen Pantry Cabinet", category: "Cabinets", quantity: 0, imageUrl: "https://picsum.photos/seed/cab1/800/600" },
  { id: "7", name: "Treated Podo Timber Planks", category: "Timber", quantity: 100, imageUrl: "https://picsum.photos/seed/timber2/800/600" },
  { id: "8", name: "6-Seater Hardwood Set", category: "Chairs", quantity: 15, imageUrl: "https://picsum.photos/seed/chair3/800/600" },
];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = INITIAL_PRODUCTS.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Header />
      <main className="flex-grow py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-headline font-bold text-primary mb-2">Our Catalog</h1>
              <p className="text-muted-foreground">High quality timber and handcrafted furniture for your home.</p>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 bg-white border-muted"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-12 items-center">
            <Filter className="h-5 w-5 text-accent mr-2" />
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                className={activeCategory === cat ? "bg-accent text-white" : "hover:border-accent hover:text-accent bg-white"}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
              <p className="text-lg text-muted-foreground">No products found in this category matching your search.</p>
              <Button 
                variant="link" 
                onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
                className="text-accent mt-2"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}