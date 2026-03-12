
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, TrendingUp, AlertTriangle, Plus, List, Truck, Clock } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Products", value: "48", icon: Package, color: "text-blue-600" },
    { title: "Deliveries Today", value: "8", icon: Truck, color: "text-orange-600" },
    { title: "Recent Sales", value: "12", icon: ShoppingCart, color: "text-accent" },
    { title: "Revenue (Today)", value: "KES 45,000", icon: TrendingUp, color: "text-purple-600" },
  ];

  const lowStockItems = [
    { name: "Premium Oak Bed", stock: 2 },
    { name: "Dining Chair (Single)", stock: 4 },
    { name: "Storage Cabinet", stock: 1 },
  ];

  const activeDeliveries = [
    { customer: "Jane Doe", location: "Nyali", status: "Out for Delivery", time: "10:30 AM" },
    { customer: "John Smith", location: "Kisimani", status: "Pending", time: "11:45 AM" },
    { customer: "Mombasa Construction", location: "Bamburi", status: "Delivered", time: "09:15 AM" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitor your business performance and inventory.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
            <Link href="/admin/products/add">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-lg font-bold flex items-center">
                <Truck className="mr-2 h-5 w-5 text-accent" />
                Active Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {activeDeliveries.map((delivery, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="bg-slate-100 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-bold text-primary">{delivery.customer}</p>
                        <p className="text-xs text-muted-foreground">{delivery.location} • {delivery.time}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={delivery.status === 'Delivered' ? 'outline' : 'default'}
                      className={cn(
                        "font-bold",
                        delivery.status === 'Out for Delivery' && "bg-blue-100 text-blue-700 hover:bg-blue-100",
                        delivery.status === 'Pending' && "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
                        delivery.status === 'Delivered' && "bg-green-100 text-green-700 border-none hover:bg-green-100"
                      )}
                    >
                      {delivery.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full text-accent hover:bg-accent/5 rounded-none" asChild>
                <Link href="/admin/deliveries">Manage All Deliveries</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-xl bg-slate-50/50">
                <p className="text-muted-foreground italic">Revenue chart placeholder</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <Card className="border-none shadow-sm border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-lg font-bold">Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent>
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
              <Button className="w-full mt-6 bg-primary hover:bg-primary/90" asChild>
                <Link href="/admin/products">Restock Items</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
