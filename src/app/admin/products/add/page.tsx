
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, X, Plus, Warehouse } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddProductPage() {
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [sku, setSku] = useState("");
  
  // Image State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Auto-generate SKU when name or category changes
  useEffect(() => {
    if (name || category) {
      const catPrefix = category ? category.substring(0, 3).toUpperCase() : "GEN";
      const namePart = name ? name.substring(0, 3).replace(/\s+/g, '').toUpperCase() : "ITEM";
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      setSku(`DW-${catPrefix}-${namePart}-${randomPart}`);
    }
  }, [name, category]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    // Note: In a real app, use environment variables for Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unsigned_preset";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    if (!warehouseLocation) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please specify a Warehouse/Stall section." });
      return;
    }

    setIsSubmitting(true);
    let finalImageUrls: string[] = [];

    try {
      if (imageFiles.length > 0) {
        setIsUploading(true);
        // Fallback for demo if no keys
        if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
            const uploadPromises = imageFiles.map(file => uploadToCloudinary(file));
            finalImageUrls = await Promise.all(uploadPromises);
        } else {
            finalImageUrls = imagePreviews; // Just use previews if no cloud keys for now
        }
        setIsUploading(false);
      } else {
        finalImageUrls = ["https://picsum.photos/seed/placeholder/800/600"];
      }

      await addDoc(collection(db, "products"), {
        name,
        category,
        description,
        price: Number(price),
        stock: Number(stock),
        warehouseLocation,
        sku,
        imageUrls: finalImageUrls,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Product Published",
        description: `${name} has been added to ${warehouseLocation}.`,
      });
      router.push("/admin/products");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: err.message || "Failed to save product.",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
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
          <h1 className="text-3xl font-headline font-bold text-primary">Add Stock to Stall</h1>
          <p className="text-muted-foreground">Log new items into your specific warehouse sections.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Product Information</CardTitle>
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
                  <Select onValueChange={setCategory} required value={category}>
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
                  <Label htmlFor="price">Price (KES)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="45000" 
                    className="h-11 rounded-xl" 
                    value={price}
                    required
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Product Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe wood quality, durability, and key features..." 
                  className="min-h-[120px] resize-none rounded-xl" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2">
              <Warehouse className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg font-bold">Inventory Location</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warehouseLocation">Warehouse Section / Stall</Label>
                <Input 
                  id="warehouseLocation" 
                  placeholder="e.g. Section A, Stall 4" 
                  required 
                  className="h-11 rounded-xl" 
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Units in Stock</Label>
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
              <div className="col-span-2 space-y-2">
                <Label htmlFor="sku">SKU Code (System Generated)</Label>
                <Input 
                  id="sku" 
                  className="h-11 rounded-xl bg-slate-50 font-mono text-xs cursor-not-allowed" 
                  value={sku}
                  readOnly
                  placeholder="Auto-generating..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-bold">Showroom Photos</CardTitle>
              <CardDescription className="text-xs">These photos will appear on the public site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                multiple
                accept="image/*" 
                onChange={handleImageSelect}
              />
              
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border group">
                    <Image src={preview} alt={`Preview ${index}`} fill className="object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">Add</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isUploading ? "Uploading..." : "Publishing..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save Listing
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
