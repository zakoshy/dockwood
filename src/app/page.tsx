"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { StructuredData } from "@/components/structured-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/product-card";
import { Truck, ShieldCheck, Clock, Hammer, MapPin, PhoneCall, Navigation, Loader2 } from "lucide-react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";

export default function Home() {
  const db = useFirestore();

  const featuredQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "products"), limit(3), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: featuredProducts, loading } = useCollection(featuredQuery);

  const features = [
    { icon: Truck, title: "Same-Day Delivery", description: "Get your furniture delivered to your doorstep within hours in Mombasa." },
    { icon: ShieldCheck, title: "Premium Quality", description: "Only the finest timber and craftsmanship for every piece we build." },
    { icon: Clock, title: "Quick Service", description: "Prompt response to all inquiries and fast turnaround times." },
    { icon: Hammer, title: "Custom Orders", description: "We build furniture tailored to your specific space and needs." },
  ];

  const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=-4.0326,39.7027";

  return (
    <>
      <Header />
      <StructuredData />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
          <Image
            src="https://picsum.photos/seed/dockwood-hero/1920/1080"
            alt="Dockwood Furniture Workshop"
            fill
            className="object-cover brightness-[0.4]"
            priority
            data-ai-hint="woodworking workshop"
          />
          <div className="container mx-auto px-4 relative z-10 text-center text-white">
            <Badge className="mb-6 bg-accent border-none text-white px-4 py-1 text-sm uppercase tracking-wider font-bold">
              Mombasa's Finest Timber & Furniture
            </Badge>
            <h1 className="text-4xl md:text-7xl font-headline font-bold mb-6 max-w-4xl mx-auto leading-tight">
              Quality Woodwork That <span className="text-accent">Lasts a Lifetime</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              Trusted timber suppliers and expert furniture makers. Same-day delivery available in Bombolulu, Mombasa.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 font-bold text-lg rounded-full" asChild>
                <Link href="/products">View All Products</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary px-8 font-bold text-lg rounded-full" asChild>
                <Link href="/contact">Visit Our Shop</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary mb-4">Why Choose Dockwood?</h2>
              <div className="h-1.5 w-20 bg-accent mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-secondary/50 transition-colors">
                  <div className="h-16 w-16 bg-primary/5 text-accent rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-headline font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-headline font-bold text-primary mb-2">Featured Products</h2>
                <p className="text-muted-foreground">Check out our latest timber and furniture arrivals.</p>
              </div>
              <Button variant="link" asChild className="text-accent font-bold">
                <Link href="/products">See All Items →</Link>
              </Button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredProducts.map((product: any) => (
                  <ProductCard 
                    key={product.id} 
                    id={product.id}
                    name={product.name}
                    category={product.category}
                    quantity={product.stock || 0}
                    imageUrl={product.imageUrl}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                No featured products available at the moment.
              </div>
            )}
          </div>
        </section>

        {/* Delivery Promo */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6">Need it Today? <br /><span className="text-accent">We Deliver Fast.</span></h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg">
                We understand urgency. Whether it's timber for your construction project or a new bed for your home, our same-day delivery service covers all of Mombasa Bombolulu.
              </p>
              <Button size="lg" className="bg-accent text-white hover:bg-accent/90 px-10 rounded-full font-bold" asChild>
                <a href="tel:+254741157757">Call Us Now</a>
              </Button>
            </div>
            <div className="md:w-1/2 relative h-[300px] w-full rounded-2xl overflow-hidden shadow-2xl">
              <Image 
                src="https://picsum.photos/seed/delivery/800/600" 
                alt="Delivery Truck" 
                fill 
                className="object-cover"
                data-ai-hint="delivery truck"
              />
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-headline font-bold text-primary mb-6">Visit Our Showroom</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Located conveniently in Bombolulu, Kisimani. Come and see the quality of our craftsmanship firsthand. We have a wide range of beds, chairs, and timber products in stock.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/5 p-3 rounded-lg"><MapPin className="text-accent" /></div>
                    <div>
                      <h4 className="font-bold">Our Address</h4>
                      <p className="text-muted-foreground">Bombolulu, Kisimani, Opposite Nivash Supermarket, Mombasa</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/5 p-3 rounded-lg"><PhoneCall className="text-accent" /></div>
                    <div>
                      <h4 className="font-bold">Contact Number</h4>
                      <p className="text-muted-foreground">0741 157 757</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 w-full">
                <div className="h-[400px] w-full bg-muted rounded-2xl overflow-hidden border">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.880491845145!2d39.7027!3d-4.0326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwMDEnNTcuNCJTIDM5wrA0MicyOS43IkU!5e0!3m2!1sen!2ske!4v1620000000000!5m2!1sen!2ske"
                    allowFullScreen
                  ></iframe>
                </div>
                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg" asChild>
                  <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="mr-2 h-5 w-5" />
                    Get Directions to Shop
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
