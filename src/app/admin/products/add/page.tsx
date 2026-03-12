
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { generateProductContent } from "@/ai/flows/generate-product-content-flow";

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const handleAIGenerate = async () => {
    if (!name || !category) {
      toast({
        title: "Details Required",
        description: "Please enter a product name and select a category to help the AI generate content.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateProductContent({
        productName: name,
        productCategory: category,
      });
      
      if (result && result.productDescription) {
        setDescription(result.productDescription);
        toast({
          title: "Description Generated!",
          description: "AI has suggested a professional description for your product.",
        });
      } else {
        throw new Error("No output received from AI.");
      }
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      toast({
        variant: "destructive",
        title: "AI Generation Failed",
        description: error.message || "Ensure your API key is configured correctly in the .env file.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Product Created",
        description: `${name} has been added to your catalog successfully.`,
      });
      router.push("/admin/products");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Add New Product</h1>
          <p className="text-muted-foreground">Expand your digital showroom catalog.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Premium Mahogany King Bed" 
                  required 
                  className="h-11 rounded-xl" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={setCategory} required>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beds">Beds</SelectItem>
                      <SelectItem value="Timber">Timber</SelectItem>
                      <SelectItem value="Chairs">Chairs</SelectItem>
                      <SelectItem value="Tables">Tables</SelectItem>
                      <SelectItem value="Cabinets">Cabinets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Estimated Price (KES)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="45000" 
                    className="h-11 rounded-xl" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="description">Product Description</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs font-bold border-accent text-accent hover:bg-accent hover:text-white transition-all shadow-sm rounded-lg"
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    AI Generate
                  </Button>
                </div>
                <Textarea 
                  id="description" 
                  placeholder="Describe features, wood type, dimensions..." 
                  className="min-h-[180px] resize-none focus:ring-accent rounded-xl" 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Inventory Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Available Stock Units</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  placeholder="10" 
                  required 
                  className="h-11 rounded-xl" 
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Reference ID</Label>
                <Input id="sku" placeholder="DW-BED-001" className="h-11 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Product Media</CardTitle>
              <CardDescription>Primary display image</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Click to upload image</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 bg-slate-50/50 p-4">
              <p className="text-[10px] text-muted-foreground text-center">
                Supported formats: JPG, PNG. Max size 2MB.
              </p>
            </CardFooter>
          </Card>

          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/10"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Publish Product
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 font-bold rounded-xl"
              onClick={() => router.back()}
              disabled={isSubmitting || isGenerating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
