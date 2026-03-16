"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, MessageCircle, Send, Navigation, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    honeypot: "", // Bot trap
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Sanitization
    const sanitizedName = formData.name.trim();
    const sanitizedEmail = formData.email.trim().toLowerCase();
    const sanitizedMessage = formData.message.trim();

    if (formData.honeypot) {
      console.warn("Bot detected via honeypot.");
      return;
    }

    if (!sanitizedName || !sanitizedEmail || !sanitizedMessage) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast({
        title: "Message Sent Successfully",
        description: "Thank you for reaching out! We will get back to you within 24 hours.",
      });

      // Reset Form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        honeypot: "",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "System Error",
        description: "Could not send message at this time. Please try calling us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=-4.029404,39.693963";

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
                      <p className="text-muted-foreground">Bombolulu, Kisimani, Opposite Nivash Supermarket, Opposite Petrocity, Mombasa</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/5 p-3 rounded-xl"><Phone className="text-accent" /></div>
                    <div>
                      <h4 className="font-bold">Call Us</h4>
                      <p className="text-muted-foreground">+254 711 662 626</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/5 p-3 rounded-xl"><Mail className="text-accent" /></div>
                    <div>
                      <h4 className="font-bold">Email Us</h4>
                      <p className="text-muted-foreground">info@dockwoodfurnitures.com</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t flex flex-col gap-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-accent text-accent hover:bg-accent hover:text-white h-12 rounded-xl"
                    asChild
                  >
                    <a href="https://wa.me/254711662626" target="_blank" rel="noopener">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Chat on WhatsApp
                    </a>
                  </Button>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold"
                    asChild
                  >
                    <a href="tel:+254711662626">
                      <Phone className="mr-2 h-5 w-5" />
                      Call 0711 662 626
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
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.883713406283!2d39.693963!3d-4.029404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwMDEnNDUuOCJTIDM5wrA0MSczOC4zIkU!5e0!3m2!1sen!2ske!4v1710000000000!5m2!1sen!2ske"
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
                  {/* Honeypot Field */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="honeypot">Leave this field empty</label>
                    <input
                      type="text"
                      id="honeypot"
                      value={formData.honeypot}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <input 
                        id="name" 
                        placeholder="Your name" 
                        required 
                        className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <input 
                        id="email" 
                        type="email" 
                        placeholder="email@example.com" 
                        required 
                        className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <input 
                      id="subject" 
                      placeholder="What is your inquiry about?" 
                      required 
                      className="flex h-12 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Describe your request in detail..." 
                      className="min-h-[200px] bg-background/50" 
                      required 
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto px-10 h-12 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    {isSubmitting ? "Sending..." : "Send Message"}
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
