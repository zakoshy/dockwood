"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Box } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  quantity: number;
  imageUrl: string;
}

export function ProductCard({ id, name, category, quantity, imageUrl }: ProductCardProps) {
  const handleInquiry = () => {
    const phoneNumber = "254711662626";
    const message = encodeURIComponent(`Hello Dockwood Furniture's, I would like to inquire about the price of ${name}.`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const isLowStock = quantity > 0 && quantity < 5;
  const isOutOfStock = quantity === 0;

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all border-none shadow-sm bg-white">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageUrl || `https://picsum.photos/seed/${id}/600/450`}
          alt={name}
          fill
          className="object-cover transition-transform group-hover:scale-110 duration-500"
          data-ai-hint="wooden furniture"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Badge variant="secondary" className="bg-white/90 text-primary border-none font-semibold">
            {category}
          </Badge>
          {isOutOfStock ? (
            <Badge variant="destructive" className="font-bold">Out of Stock</Badge>
          ) : isLowStock ? (
            <Badge className="bg-accent text-white border-none font-bold">Limited: {quantity} left</Badge>
          ) : (
            <Badge className="bg-green-600 text-white border-none font-bold">Available: {quantity}</Badge>
          )}
        </div>
      </div>
      <CardHeader className="p-4 pb-0">
        <h3 className="text-lg font-headline font-bold text-primary group-hover:text-accent transition-colors">
          {name}
        </h3>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Box className="h-4 w-4 mr-2" />
          <span>Category: {category}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleInquiry} 
          className="w-full bg-accent hover:bg-accent/90 text-white font-bold"
          disabled={isOutOfStock}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Inquire Price
        </Button>
      </CardFooter>
    </Card>
  );
}
