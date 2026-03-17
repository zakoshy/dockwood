
"use client";

import { use, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/badge";
import { Button as ShButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Warehouse, 
  ArrowLeft, 
  Package, 
  Plus, 
  Loader2, 
  Edit2, 
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useDoc, useCollection, useFirestore } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function WarehouseDetailPage(props: { params: Promise<{ warehouseId: string }> }) {
  const resolvedParams = use(props.params);
  const warehouseId = resolvedParams.warehouseId;
  const db = useFirestore();

  const warehouseRef = useMemo(() => (db ? doc(db, "warehouses", warehouseId) : null), [db, warehouseId]);
  const { data: warehouse, loading: warehouseLoading } = useDoc(warehouseRef);

  const productsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "products"), where("warehouseId", "==", warehouseId));
  }, [db, warehouseId]);

  const { data: products, loading: productsLoading } = useCollection(productsQuery);

  if (warehouseLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading Warehouse Profile...</p>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="p-20 text-center">
        <p className="text-xl font-bold text-primary mb-4">Warehouse Not Found</p>
        <ShButton asChild>
          <Link href="/admin/warehouses">Return to List</Link>
        </ShButton>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <ShButton variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/admin/warehouses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </ShButton>
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">{warehouse.name}</h1>
          <p className="text-muted-foreground">{warehouse.description || "Active Storage Location"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-primary text-white p-6 rounded-3xl lg:col-span-1">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <Badge className="bg-white/20 text-white border-none font-bold">LIVE</Badge>
            </div>
            <div>
              <p className="text-primary-foreground/60 text-sm font-medium">Items Stored</p>
              <div className="text-4xl font-bold">{products?.length || 0}</div>
            </div>
            <ShButton 
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-12 rounded-2xl shadow-lg shadow-accent/20"
              asChild
            >
              <Link href={`/admin/products/add?warehouseId=${warehouseId}&location=${encodeURIComponent(warehouse.name)}`}>
                <Plus className="mr-2 h-5 w-5" /> Add Stock to this Stall
              </Link>
            </ShButton>
          </div>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold">Stall Inventory</CardTitle>
              <Badge variant="outline" className="font-bold border-slate-200">Current Stock</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {productsLoading ? (
              <div className="p-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : products?.length === 0 ? (
              <div className="p-20 text-center text-muted-foreground italic">
                This warehouse is currently empty.
              </div>
            ) : (
              <div className="divide-y">
                {products.map((product: any) => (
                  <div key={product.id} className="p-6 hover:bg-slate-50 transition-all group flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-slate-100 overflow-hidden relative border shadow-sm">
                        <Image 
                          src={(product.imageUrls && product.imageUrls[0]) || "https://picsum.photos/seed/placeholder/100/100"} 
                          alt={product.name} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-primary group-hover:text-accent transition-colors">{product.name}</p>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-[10px] font-bold py-0">{product.category}</Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">SKU: {product.sku}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className={cn(
                          "text-xl font-bold",
                          (product.stock || 0) < 5 ? "text-red-600" : "text-emerald-600"
                        )}>
                          {product.stock || 0}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Units</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <ShButton variant="ghost" size="icon" asChild className="rounded-xl hover:bg-accent/5 hover:text-accent">
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </ShButton>
                        <ShButton variant="ghost" size="icon" asChild className="rounded-xl">
                          <Link href="/products" target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </ShButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
