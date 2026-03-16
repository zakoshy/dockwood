"use client";

import { useState, useRef, useEffect, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, X, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function EditProductPage(props: { params: Promise<{ productId: string }> }) {
  const resolvedParams = use(props.params);
  const productId = resolvedParams.productId;
  
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const productRef = useMemo(() => (db ? doc(db, "products", productId) : null), [db, productId]);
  const { data: product, loading: productLoading } = useDoc(productRef);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  
  // Image State
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Initialize form when product data is loaded
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setCategory(product.category || "");
      setDescription(product.description || "");
      setPrice(product.price?.toString() || "");
      setStock(product.stock?.toString() || "");
      setSku(product.sku || "");
      setExistingImages(product.imageUrls || []);
    }
  }, [product]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewImageFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary credentials missing.");
    }

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
    if (!db || !productRef) return;

    setIsSubmitting(true);
    let uploadedUrls: string[] = [];

    try {
      if (newImageFiles.length > 0) {
        setIsUploading(true);
        const uploadPromises = newImageFiles.map(file => uploadToCloudinary(file));
        uploadedUrls = await Promise.all(uploadPromises);
        setIsUploading(false);
      }

      const finalImageUrls = [...existingImages, ...uploadedUrls];

      await updateDoc(productRef, {
        name,
        category,
        description,
        price: Number(price),
        stock: Number(stock),
        sku,
        imageUrls: finalImageUrls,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Changes Saved",
        description: `${name} has been updated.`,
      });
      router.push("/admin/products");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Error",
        description: err.message || "Failed to update product.",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  if (productLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Fetching product data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Edit Listing</h1>
          <p className="text-muted-foreground">Update details for {product?.name || 'Item'}.</p>
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
            <CardHeader>
              <CardTitle className="text-lg font-bold">Inventory & Logistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Units in Stock</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  required 
                  className="h-11 rounded-xl" 
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU Code (System Generated)</Label>
                <Input 
                  id="sku" 
                  className="h-11 rounded-xl bg-slate-50 font-mono text-xs cursor-not-allowed" 
                  value={sku}
                  readOnly
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-bold">Showroom Photos</CardTitle>
              <CardDescription className="text-xs">Manage current and new photos.</CardDescription>
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
                {/* Existing Images */}
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border group">
                    <Image src={url} alt={`Existing ${index}`} fill className="object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-[8px] text-white text-center py-0.5">EXISTING</div>
                  </div>
                ))}

                {/* New Previews */}
                {newImagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border group">
                    <Image src={preview} alt={`New Preview ${index}`} fill className="object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500/60 text-[8px] text-white text-center py-0.5">NEW</div>
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
                  {isUploading ? "Uploading..." : "Saving Changes..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Update Product
                </>
              )}
            </Button>
            <Button variant="outline" className="w-full h-12 rounded-xl" asChild>
              <Link href="/admin/products">Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}