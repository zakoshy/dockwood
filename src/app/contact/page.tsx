"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, MessageCircle, Send, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We'll get back to you as soon as possible!",
    });
  };

  const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=-4.0326,39.7027";

  return (
    <>
      <Header />
      <main className="flex-grow py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Get In Touch</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have a question about our products or want a custom quote? Reach out to us today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-2xl border shadow-sm">
                <h2 className="text-2xl font-headline font-bold mb-8">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/5 p-3 rounded-xl"><MapPin className="text-accent" /></div>
                    <div>
                      <h4 className="font-bold">Visit Us</h4>
                      <p className="text-muted-foreground">Bombolulu, Kisimani, Opposite Nivash Supermarket, Mombasa, Kenya</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/5 p-3 rounded-xl"><Phone className="text-accent" /></div>
                    <div>
                      <h4 className="font-bold">Call Us</h4>
                      <p className="text-muted-foreground">+254 741 157 757</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/5 p-3 rounded-xl"><Mail className="text-accent" /></div>
                    <div>
                      <h4 className="font-bold">Email Us</h4>
                      <p className="text-muted-foreground">info@dockwoodfurnitures.co.ke</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t flex flex-col gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-accent text-accent hover:bg-accent hover:text-white h-12 rounded-xl"
                    asChild
                  >
                    <a href="https://wa.me/254741157757" target="_blank" rel="noopener">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Chat on WhatsApp
                    </a>
                  </Button>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold"
                    asChild
                  >
                    <a href="tel:+254741157757">
                      <Phone className="mr-2 h-5 w-5" />
                      Call 0741 157 757
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="h-[300px] bg-muted rounded-2xl overflow-hidden border">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.880491845145!2d39.7027!3d-4.0326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwMDEnNTcuNCJTIDM5wrA0MicyOS43IkU!5e0!3m2!1sen!2ske!4v1620000000000!5m2!1sen!2ske"
                    allowFullScreen
                  ></iframe>
                </div>
                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg" asChild>
                  <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="mr-2 h-5 w-5" />
                    Get Directions
                  </a>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white p-10 rounded-2xl border shadow-sm">
                <h2 className="text-2xl font-headline font-bold mb-8">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Your name" required className="h-12 bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="email@example.com" required className="h-12 bg-background/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What is your inquiry about?" required className="h-12 bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Describe your request in detail..." className="min-h-[200px] bg-background/50" required />
                  </div>
                  <Button type="submit" className="w-full md:w-auto px-10 h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
