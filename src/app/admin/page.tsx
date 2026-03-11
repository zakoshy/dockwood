"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, TrendingUp, AlertTriangle, Plus, List } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  // Mock data - In production this is fetched from Firestore
  const stats = [
    { title: "Total Products", value: "48", icon: Package, color: "text-blue-600" },
    { title: "Total Stock", value: "245", icon: List, color: "text-green-600" },
    { title: "Recent Sales", value: "12", icon: ShoppingCart, color: "text-accent" },
    { title: "Revenue (Today)", value: "KES 45,000", icon: TrendingUp, color: "text-purple-600" },
  ];

  const lowStockItems = [
    { name: "Premium Oak Bed", stock: 2 },
    { name: "Dining Chair (Single)", stock: 4 },
    { name: "Storage Cabinet", stock: 1 },
  ];

  const recentSales = [
    { product: "Mahogany Bed", qty: 1, date: "2024-03-20", status: "Delivered" },
    { product: "Cypress Timber", qty: 20, date: "2024-03-19", status: "Processing" },
    { product: "Kitchen Table", qty: 1, date: "2024-03-19", status: "Delivered" },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-10 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-headline font-bold text-primary">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your inventory, sales, and products.</p>
            </div>
            <div className="flex gap-4">
              <Button asChild className="bg-accent hover:bg-accent/90">
                <Link href="/admin/products/add">
                  <Plus className="mr-2 h-4 w-4" /> Add Product
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/sales">
                  <ShoppingCart className="mr-2 h-4 w-4" /> View Sales
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-none shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Recent Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-muted-foreground">
                      <thead className="text-xs text-primary uppercase bg-slate-100">
                        <tr>
                          <th className="px-6 py-3">Product</th>
                          <th className="px-6 py-3">Qty</th>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentSales.map((sale, i) => (
                          <tr key={i} className="bg-white border-b hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-primary">{sale.product}</td>
                            <td className="px-6 py-4">{sale.qty}</td>
                            <td className="px-6 py-4">{sale.date}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                sale.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {sale.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button variant="ghost" className="w-full mt-4 text-accent hover:text-accent/80" asChild>
                    <Link href="/admin/sales">View All Sales History</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="border-none shadow-sm h-full border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-lg font-bold">Low Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4">Items with less than 5 units in stock.</p>
                  <div className="space-y-4">
                    {lowStockItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                        <span className="font-medium text-sm text-red-900">{item.name}</span>
                        <Badge variant="destructive" className="font-bold">
                          {item.stock} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-8 bg-primary hover:bg-primary/90" asChild>
                    <Link href="/admin/products">Update Inventory</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
