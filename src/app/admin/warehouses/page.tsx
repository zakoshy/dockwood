
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Warehouse, Plus, Search, Loader2, ChevronRight, MapPin, Package, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
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

export default function WarehousesPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: warehouses, loading } = useCollection(
    useMemo(() => (db ? query(collection(db, "warehouses"), orderBy("name", "asc")) : null), [db])
  );

  const { data: allProducts } = useCollection(
    useMemo(() => (db ? collection(db, "products") : null), [db])
  );

  const filteredWarehouses = useMemo(() => {
    if (!warehouses) return [];
    return warehouses.filter((w: any) => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [warehouses, searchQuery]);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "warehouses"), {
        name,
        description,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Warehouse Created",
        description: `${name} has been added to your locations.`,
      });
      
      setName("");
      setDescription("");
      setIsDialogOpen(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to create warehouse.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!db || !deleteId) return;
    try {
      await deleteDoc(doc(db, "warehouses", deleteId));
      toast({ title: "Warehouse Removed", description: "The location has been deleted." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete warehouse." });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const getProductCount = (warehouseId: string) => {
    return allProducts?.filter((p: any) => p.warehouseId === warehouseId).length || 0;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">Warehouse Network</h1>
          <p className="text-muted-foreground">Manage your physical storage sections and stalls.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 h-11 px-6 rounded-xl font-bold">
              <Plus className="mr-2 h-5 w-5" /> Create New Stall
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold text-primary">New Location</DialogTitle>
              <DialogDescription>Define a new physical section for your inventory.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateWarehouse} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="w-name">Warehouse/Stall Name</Label>
                <Input 
                  id="w-name" 
                  placeholder="e.g. Section A, Stall 4" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="w-desc">Description (Optional)</Label>
                <Textarea 
                  id="w-desc" 
                  placeholder="Additional details about the location..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl min-h-[100px] resize-none"
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-primary h-12 rounded-xl font-bold" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Create Warehouse"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Filter by warehouse name..." 
          className="pl-10 h-11 bg-white border-none shadow-sm rounded-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-muted-foreground" /></div>
        ) : filteredWarehouses.length === 0 ? (
          <Card className="col-span-full border-none shadow-sm p-20 text-center text-muted-foreground bg-white rounded-3xl border-dashed">
            <div className="flex flex-col items-center gap-4 opacity-50">
              <Warehouse className="h-16 w-16" />
              <p>No warehouses defined. Create your first storage section to start organizing stock.</p>
            </div>
          </Card>
        ) : (
          filteredWarehouses.map((warehouse: any) => (
            <Card key={warehouse.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white rounded-3xl border border-transparent hover:border-accent/10">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-secondary rounded-2xl text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                      <Warehouse className="h-6 w-6" />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-300 hover:text-red-600 rounded-xl"
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteId(warehouse.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors">{warehouse.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{warehouse.description || "No description provided."}</p>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <Badge variant="secondary" className="bg-slate-50 text-slate-600 font-bold px-3 py-1 rounded-lg">
                      <Package className="mr-1.5 h-3 w-3" />
                      {getProductCount(warehouse.id)} Items
                    </Badge>
                  </div>
                </div>
                
                <Link 
                  href={`/admin/warehouses/${warehouse.id}`}
                  className="flex items-center justify-between p-4 bg-slate-50 hover:bg-accent hover:text-white transition-all text-sm font-bold text-primary"
                >
                  Manage Inventory
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold text-primary text-xl">Delete Warehouse</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will not delete the products inside, but they will become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
