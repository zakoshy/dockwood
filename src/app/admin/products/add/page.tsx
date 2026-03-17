
"use client";

import { useState, useRef, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [warehouseId, setWarehouseId] = useState(searchParams.get("warehouseId") || "");
  const [warehouseLocation, setWarehouseLocation] = useState(searchParams.get("location") || "");
  const [sku, setSku] = useState("");
  
  // Image State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const warehousesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "warehouses"), orderBy("name", "asc"));
  }, [db]);

  const { data: warehouses } = useCollection(warehousesQuery);

  // Auto-generate SKU
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    if (!warehouseId) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please select a Warehouse/Stall." });
      return;
    }

    setIsSubmitting(true);
    let finalImageUrls: string[] = [];

    try {
      // Logic for image upload would go here if Cloudinary is configured
      finalImageUrls = imagePreviews.length > 0 ? imagePreviews : ["https://picsum.photos/seed/placeholder/800/600"];

      await addDoc(collection(db, "products"), {
        name,
        category,
        description,
        price: price ? Number(price) : 0,
        stock: Number(stock),
        warehouseId,
        warehouseLocation: warehouseLocation || warehouses?.find((w: any) => w.id === warehouseId)?.name || "Unassigned",
        sku,
        imageUrls: finalImageUrls,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Product Published",
        description: `${name} has been added to stock.`,
      });
      router.push(warehouseId ? `/admin/warehouses/${warehouseId}` : "/admin/products");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: err.message || "Failed to save product.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
                <Label htmlFor="price">Price (KES) <span className="text-muted-foreground font-normal">(Optional)</span></Label>
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
            <CardTitle className="text-lg font-bold">Inventory Assignment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warehouseSelect">Assigned Warehouse / Stall</Label>
              <Select onValueChange={(val) => {
                setWarehouseId(val);
                const locationName = warehouses?.find((w: any) => w.id === val)?.name || "";
                setWarehouseLocation(locationName);
              }} required value={warehouseId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses?.map((w: any) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                  {warehouses?.length === 0 && (
                    <div className="p-4 text-xs italic text-center text-muted-foreground">
                      No warehouses created yet. <Link href="/admin/warehouses" className="text-accent underline">Create one first.</Link>
                    </div>
                  )}
                </SelectContent>
              </Select>
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
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Publishing...
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
  );
}

export default function AddProductPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">New Inventory Entry</h1>
          <p className="text-muted-foreground">Add new items and assign them to a physical location.</p>
        </div>
      </div>

      <Suspense fallback={<div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>}>
        <AddProductForm />
      </Suspense>
    </div>
  );
}
