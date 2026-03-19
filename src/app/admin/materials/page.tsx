
"use client";

import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Construction, 
  Plus, 
  Search, 
  Loader2, 
  Trash2, 
  Edit2, 
  Image as ImageIcon,
  X,
  Warehouse,
  ChevronRight,
  Package,
  Maximize2
} from "lucide-react";
import Image from "next/image";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MaterialsPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Viewer State
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const { data: materials, loading } = useCollection(
    useMemo(() => (db ? query(collection(db, "materials"), orderBy("createdAt", "desc")) : null), [db])
  );

  const { data: warehouses } = useCollection(
    useMemo(() => (db ? query(collection(db, "warehouses"), orderBy("name", "asc")) : null), [db])
  );

  const filteredMaterials = useMemo(() => {
    if (!materials) return [];
    return materials.filter((m: any) => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [materials, searchQuery]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "materials"), {
        name,
        type,
        quantity,
        description: description || "", 
        warehouseId: warehouseId || "unassigned", 
        warehouseLocation: warehouseLocation || "General Stock", 
        imageUrls: imagePreviews.length > 0 ? imagePreviews : ["https://picsum.photos/seed/material/800/600"],
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Material Logged",
        description: `${name} has been added to internal production stock.`,
      });
      
      // Reset
      setName(""); setType(""); setQuantity(""); setDescription("");
      setWarehouseId(""); setWarehouseLocation(""); setImagePreviews([]);
      setIsDialogOpen(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!db || !deleteId) return;
    try {
      await deleteDoc(doc(db, "materials", deleteId));
      toast({ title: "Removed", description: "Material entry deleted." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete material." });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">Materials Library</h1>
          <p className="text-muted-foreground">Manage raw materials and items for production (Hidden from website).</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 h-11 px-6 rounded-xl font-bold">
              <Plus className="mr-2 h-5 w-5" /> Log New Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] max-h-[85vh] h-[85vh] flex flex-col p-0 rounded-2xl overflow-hidden">
            <DialogHeader className="p-6 pb-2 shrink-0 border-b">
              <DialogTitle className="text-2xl font-headline font-bold text-primary">Add Internal Material</DialogTitle>
              <DialogDescription>Input details for production supplies.</DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="material-form" onSubmit={handleCreateMaterial} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mat-name">Material Name</Label>
                    <Input id="mat-name" required placeholder="e.g. Mahogany Planks" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mat-type">Material Type</Label>
                    <Select onValueChange={setType} required>
                      <SelectTrigger id="mat-type" className="h-11"><SelectValue placeholder="Select Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Timber">Timber / Wood</SelectItem>
                        <SelectItem value="Fabric">Fabric / Leather</SelectItem>
                        <SelectItem value="Hardware">Hardware / Fittings</SelectItem>
                        <SelectItem value="Finishing">Varnish / Paint</SelectItem>
                        <SelectItem value="Tools">Tools</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mat-qty">Quantity / Stock</Label>
                    <Input id="mat-qty" required placeholder="e.g. 50 pcs, 10 rolls" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mat-stall">Stall Location (Optional)</Label>
                    <Select onValueChange={(val) => {
                      setWarehouseId(val);
                      setWarehouseLocation(warehouses?.find((w: any) => w.id === val)?.name || "");
                    }}>
                      <SelectTrigger id="mat-stall" className="h-11"><SelectValue placeholder="Select Stall" /></SelectTrigger>
                      <SelectContent>
                        {warehouses?.map((w: any) => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mat-notes">Internal Notes (Optional)</Label>
                  <Textarea id="mat-notes" placeholder="Details for craftsmen..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[100px] rounded-xl" />
                </div>

                <div className="space-y-3 pb-4">
                  <Label>Reference Photos</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {imagePreviews.map((p, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border group">
                        <Image src={p} alt="Preview" fill className="object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeImage(i)} 
                          className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-slate-50 transition-colors bg-slate-50/50"
                    >
                      <ImageIcon className="h-5 w-5 mb-1" />
                      <span className="text-[10px] font-bold">ADD PHOTO</span>
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageSelect} 
                  />
                </div>
              </form>
            </div>

            <DialogFooter className="p-4 border-t shrink-0 flex flex-row gap-2 bg-slate-50/50">
              <Button 
                variant="outline" 
                type="button" 
                className="flex-1 rounded-xl h-12"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                form="material-form"
                type="submit" 
                className="flex-[2] bg-primary h-12 rounded-xl font-bold" 
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                {isSubmitting ? "Saving..." : "Save to Library"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Filter materials by name or type..." 
          className="pl-10 h-11 bg-white border-none shadow-sm rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-muted-foreground" /></div>
        ) : filteredMaterials.length === 0 ? (
          <Card className="col-span-full border-none shadow-sm p-20 text-center text-muted-foreground bg-white rounded-3xl border-dashed">
            <div className="flex flex-col items-center gap-4 opacity-50">
              <Construction className="h-16 w-16" />
              <p>No internal materials logged. Use this space to track stock for production.</p>
            </div>
          </Card>
        ) : (
          filteredMaterials.map((material: any) => (
            <Card key={material.id} className="border-none shadow-sm hover:shadow-lg transition-all overflow-hidden bg-white rounded-3xl group">
              <div 
                className="relative aspect-video overflow-hidden cursor-zoom-in"
                onClick={() => setViewingImage(material.imageUrls?.[0] || "https://picsum.photos/seed/mat/800/600")}
              >
                <Image 
                  src={material.imageUrls?.[0] || "https://picsum.photos/seed/mat/800/600"} 
                  alt={material.name} 
                  fill 
                  className="object-cover transition-transform group-hover:scale-105 duration-500" 
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 drop-shadow-md" />
                </div>
                <div className="absolute top-2 right-2 flex gap-1 z-10">
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur rounded-lg">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-8 w-8 bg-red-500/80 backdrop-blur rounded-lg"
                    onClick={(e) => { e.stopPropagation(); setDeleteId(material.id); setIsDeleteDialogOpen(true); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-primary/90 backdrop-blur border-none font-bold">{material.type}</Badge>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-primary">{material.name}</h3>
                  <Badge variant="outline" className="font-black text-[10px] tracking-widest uppercase">
                    {material.quantity}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">{material.description || "Internal production resource."}</p>
                
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-accent">
                    <Warehouse className="h-3.5 w-3.5" />
                    {material.warehouseLocation || "Main Hub"}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium italic">
                    Logged {material.createdAt?.toDate ? material.createdAt.toDate().toLocaleDateString() : 'recently'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Image Viewer Dialog */}
      <Dialog open={!!viewingImage} onOpenChange={(open) => !open && setViewingImage(null)}>
        <DialogContent className="max-w-[90vw] w-full h-[80vh] p-0 bg-black/95 border-none rounded-none overflow-hidden flex flex-col items-center justify-center">
          <DialogTitle className="sr-only">Material Image Preview</DialogTitle>
          <div className="relative w-full h-full p-4 flex items-center justify-center">
            {viewingImage && (
              <Image 
                src={viewingImage} 
                alt="Material Preview" 
                fill 
                className="object-contain" 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold text-primary text-xl">Delete Material Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this material from the internal library? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
