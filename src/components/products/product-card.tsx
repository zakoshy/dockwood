
"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Box, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  quantity: number;
  imageUrls?: string[];
  imageUrl?: string; // Fallback
}

export function ProductCard({ id, name, category, quantity, imageUrls, imageUrl }: ProductCardProps) {
  const displayImages = imageUrls && imageUrls.length > 0 ? imageUrls : [imageUrl || `https://picsum.photos/seed/${id}/600/450`];

  const handleInquiry = () => {
    const phoneNumber = "254711662626";
    const message = encodeURIComponent(`Hello Dockwood Furniture's, I would like to inquire about the price of ${name}.`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const isLowStock = quantity > 0 && quantity < 5;
  const isOutOfStock = quantity === 0;

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all border-none shadow-sm bg-white flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden">
        {displayImages.length > 1 ? (
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full ml-0">
              {displayImages.map((url, index) => (
                <CarouselItem key={index} className="h-full pl-0 relative">
                  <div className="h-[250px] relative">
                    <Image
                      src={url}
                      alt={`${name} - ${index + 1}`}
                      fill
                      className="object-cover"
                      data-ai-hint="wooden furniture"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/70 border-none h-8 w-8" />
            <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/70 border-none h-8 w-8" />
          </Carousel>
        ) : (
          <div className="h-full w-full relative">
            <Image
              src={displayImages[0]}
              alt={name}
              fill
              className="object-cover transition-transform group-hover:scale-110 duration-500"
              data-ai-hint="wooden furniture"
            />
          </div>
        )}
        
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
      
      <CardHeader className="p-4 pb-0">
        <h3 className="text-lg font-headline font-bold text-primary group-hover:text-accent transition-colors line-clamp-1">
          {name}
        </h3>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="flex items-center text-sm text-muted-foreground">
          <Box className="h-4 w-4 mr-2 shrink-0" />
          <span className="truncate">{category} Selection</span>
        </div>
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
