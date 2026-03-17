
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Plus, Edit2, Trash2, ArrowUpDown, Filter, Loader2, Warehouse } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCollection, useFirestore } from "@/firebase";
import { collection, deleteDoc, doc, query, orderBy } from "firebase/firestore";

export default function AdminProducts() {
  const { toast } = useToast();
  const db = useFirestore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const productsRef = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("warehouseLocation", "asc"));
  }, [db]);

  const { data: products, loading } = useCollection(productsRef);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.warehouseLocation?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const confirmDelete = async () => {
    if (!db || !deleteId) return;
    
    try {
      await deleteDoc(doc(db, "products", deleteId));
      toast({
        title: "Product Removed",
        description: "The product has been successfully deleted from stock.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete product.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Warehouse Inventory</h1>
          <p className="text-muted-foreground">Manage your stock across different workshop sections and stalls.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 h-11 px-6 rounded-xl font-bold">
          <Link href="/admin/products/add">
            <Plus className="mr-2 h-5 w-5" /> Add New Item
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-6 border-b bg-white">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search by name, stall or category..." 
                className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-11 rounded-xl"><Warehouse className="mr-2 h-4 w-4" /> By Stall</Button>
              <Button variant="outline" className="h-11 rounded-xl"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            {loading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-20 text-center text-muted-foreground">
                No inventory items found. Start by adding stock to a stall.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-primary uppercase bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-5">Item</th>
                    <th className="px-6 py-5">Location / Stall</th>
                    <th className="px-6 py-5">Category</th>
                    <th className="px-6 py-5 text-center">Qty</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product: any) => (
                    <tr key={product.id} className="bg-white hover:bg-slate-50 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden relative border shadow-sm shrink-0">
                            <Image 
                              src={(product.imageUrls && product.imageUrls[0]) || "https://picsum.photos/seed/placeholder/100/100"} 
                              alt={product.name} 
                              fill 
                              className="object-cover" 
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-primary group-hover:text-accent transition-colors">{product.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">KES {product.price?.toLocaleString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-bold bg-blue-50 text-blue-700 border-blue-100 py-1">
                          <Warehouse className="mr-1.5 h-3 w-3" />
                          {product.warehouseLocation || "Unassigned"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="font-bold bg-slate-100 text-slate-700">{product.category}</Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={cn(
                            "font-bold text-base",
                            (product.stock || 0) < 5 ? 'text-red-600' : 'text-emerald-600'
                          )}>
                            {product.stock || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-lg text-slate-500 hover:text-accent hover:bg-accent/5"
                            asChild
                          >
                            <Link href={`/admin/products/edit/${product.id}`}>
                              <Edit2 className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setDeleteId(product.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold text-primary text-xl">Remove from Inventory</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              This will permanently delete this item record from its assigned stall.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
            >
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
