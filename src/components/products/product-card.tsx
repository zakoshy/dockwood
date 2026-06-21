
"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Box, Maximize2, X, Info } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  imageUrls?: string[];
  imageUrl?: string; // Fallback
}

export function ProductCard({ id, name, category, description, quantity, imageUrls, imageUrl }: ProductCardProps) {
  const db = useFirestore();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const displayImages = imageUrls && imageUrls.length > 0 ? imageUrls : [imageUrl || `https://picsum.photos/seed/${id}/600/450`];

  const handleInquiry = async () => {
    // Track inquiry interaction
    if (db) {
      addDoc(collection(db, "interactions"), {
        type: "inquiry",
        productName: name,
        productId: id,
        timestamp: serverTimestamp()
      });
    }

    const phoneNumber = "254711662626";
    const message = encodeURIComponent(`Hello Dockwood Furnitures, I would like to inquire about the price of ${name}.`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const isLowStock = quantity > 0 && quantity < 5;
  const isOutOfStock = quantity === 0;

  const ImageContent = ({ inModal = false }: { inModal?: boolean }) => (
    <>
      {displayImages.length > 1 ? (
        <Carousel className="w-full h-full">
          <CarouselContent className={inModal ? "h-[60vh]" : "h-full ml-0"}>
            {displayImages.map((url, index) => (
              <CarouselItem key={index} className="h-full pl-0 relative">
                <div className="relative w-full h-full">
                  <Image
                    src={url}
                    alt={`${name} - ${index + 1}`}
                    fill
                    className={inModal ? "object-contain" : "object-cover"}
                    data-ai-hint="wooden furniture"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {displayImages.length > 1 && (
            <>
              <CarouselPrevious className="left-4 bg-white/80 border-none h-10 w-10" />
              <CarouselNext className="right-4 bg-white/80 border-none h-10 w-10" />
            </>
          )}
        </Carousel>
      ) : (
        <div className="h-full w-full relative">
          <Image
            src={displayImages[0]}
            alt={name}
            fill
            className={inModal ? "object-contain" : "object-cover transition-transform group-hover:scale-105 duration-500"}
            data-ai-hint="wooden furniture"
          />
        </div>
      )}
    </>
  );

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all border-none shadow-sm bg-white flex flex-col h-full">
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <div className="relative aspect-[4/3] overflow-hidden cursor-zoom-in">
          <DialogTrigger asChild>
            <div className="w-full h-full">
              <ImageContent />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 drop-shadow-lg" />
              </div>
            </div>
          </DialogTrigger>
          
          <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
            <Badge variant="secondary" className="bg-white/90 text-primary border-none font-semibold shadow-sm">
              {category}
            </Badge>
            {isOutOfStock ? (
              <Badge variant="destructive" className="font-bold shadow-sm">Out of Stock</Badge>
            ) : isLowStock ? (
              <Badge className="bg-accent text-white border-none font-bold shadow-sm">Limited: {quantity} left</Badge>
            ) : (
              <Badge className="bg-green-600 text-white border-none font-bold shadow-sm">Available: {quantity}</Badge>
            )}
          </div>
        </div>

        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 bg-black/95 border-none rounded-none sm:rounded-none overflow-hidden flex flex-col md:flex-row">
          <DialogTitle className="sr-only">Product Image Viewer: {name}</DialogTitle>
          <div className="relative flex-1 h-[60vh] md:h-full p-4 md:p-12 flex items-center justify-center">
            <ImageContent inModal />
          </div>
          <div className="w-full md:w-[400px] bg-white p-8 overflow-y-auto flex flex-col gap-6">
            <div>
              <Badge className="mb-2 bg-accent text-white border-none">{category}</Badge>
              <h2 className="text-3xl font-headline font-bold text-primary mb-4">{name}</h2>
              <div className="h-1 w-12 bg-accent rounded-full mb-6"></div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-accent shrink-0 mt-1" />
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {description || "No description available for this product."}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t">
              <Button 
                onClick={handleInquiry} 
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-2xl shadow-xl"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Inquire via WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <CardHeader className="p-4 pb-0">
        <h3 className="text-lg font-headline font-bold text-primary group-hover:text-accent transition-colors line-clamp-1">
          {name}
        </h3>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-grow flex flex-col gap-2">
        <div className="flex items-center text-xs text-muted-foreground font-medium">
          <Box className="h-3.5 w-3.5 mr-2 shrink-0" />
          <span className="truncate">{category} Selection</span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 italic leading-relaxed">
            {description}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleInquiry} 
          className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-accent/10"
          disabled={isOutOfStock}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Inquire Price
        </Button>
      </CardFooter>
    </Card>
  );
}
