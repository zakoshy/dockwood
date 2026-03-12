
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Edit2, Trash2, ArrowUpDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const MOCK_PRODUCTS = [
  { id: "1", name: "Premium Mahogany King Bed", category: "Beds", quantity: 12, imageUrl: "https://picsum.photos/seed/bed1/100/100" },
  { id: "2", name: "Solid Oak Dining Table", category: "Tables", quantity: 8, imageUrl: "https://picsum.photos/seed/table1/100/100" },
  { id: "3", name: "High-Grade Cypress Timber", category: "Timber", quantity: 45, imageUrl: "https://picsum.photos/seed/timber1/100/100" },
  { id: "4", name: "Orthopedic Mattress Support", category: "Beds", quantity: 5, imageUrl: "https://picsum.photos/seed/bed2/100/100" },
  { id: "5", name: "Modern Office Swivel Chair", category: "Chairs", quantity: 2, imageUrl: "https://picsum.photos/seed/chair2/100/100" },
];

export default function AdminProducts() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Products</h1>
          <p className="text-muted-foreground">Manage your catalog and stock levels.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
          <Link href="/admin/products/add">
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search catalog..." className="pl-10 h-10 bg-slate-50 border-none" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><ArrowUpDown className="mr-2 h-4 w-4" /> Sort</Button>
              <Button variant="outline" size="sm">Filter</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-primary uppercase bg-slate-100">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_PRODUCTS.map((product) => (
                  <tr key={product.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden relative border">
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">{product.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-medium">{product.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${product.quantity < 5 ? 'text-red-600' : 'text-green-600'}`}>
                        {product.quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-accent">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
