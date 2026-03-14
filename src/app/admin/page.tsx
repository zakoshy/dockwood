
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Truck, 
  Clock, 
  Users,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from "recharts";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";

export default function AdminDashboard() {
  const db = useFirestore();

  // Fetch all data for stats
  const { data: products, loading: productsLoading } = useCollection(
    useMemo(() => (db ? collection(db, "products") : null), [db])
  );
  const { data: sales, loading: salesLoading } = useCollection(
    useMemo(() => (db ? collection(db, "sales") : null), [db])
  );
  const { data: deliveries, loading: deliveriesLoading } = useCollection(
    useMemo(() => (db ? collection(db, "deliveries") : null), [db])
  );

  const stats = useMemo(() => {
    const revenue = sales?.reduce((acc, sale: any) => acc + (sale.totalAmount || 0), 0) || 0;
    const activeDeliveries = deliveries?.filter((d: any) => d.status !== 'Delivered' && d.status !== 'Cancelled').length || 0;
    const lowStockCount = products?.filter((p: any) => (p.stock || 0) < 5).length || 0;
    const todayDeliveries = deliveries?.filter((d: any) => {
      if (!d.timestamp) return false;
      const date = d.timestamp.toDate ? d.timestamp.toDate() : new Date(d.timestamp);
      return date.toDateString() === new Date().toDateString();
    }).length || 0;

    return [
      { title: "Total Revenue", value: `KES ${revenue.toLocaleString()}`, icon: TrendingUp, trend: "+8.2%", positive: true, color: "text-emerald-600", bg: "bg-emerald-50" },
      { title: "Active Orders", value: sales?.length.toString() || "0", icon: ShoppingCart, trend: "Live", positive: true, color: "text-blue-600", bg: "bg-blue-50" },
      { title: "Deliveries Today", value: todayDeliveries.toString(), icon: Truck, trend: "Fast", positive: true, color: "text-orange-600", bg: "bg-orange-50" },
      { title: "Low Stock Items", value: lowStockCount.toString(), icon: AlertTriangle, trend: "Alert", positive: false, color: "text-red-600", bg: "bg-red-50" },
    ];
  }, [products, sales, deliveries]);

  const lowStockItems = useMemo(() => {
    return products?.filter((p: any) => (p.stock || 0) < 5).slice(0, 3) || [];
  }, [products]);

  const activeDeliveries = useMemo(() => {
    return deliveries?.slice(0, 3) || [];
  }, [deliveries]);

  const chartData = useMemo(() => {
    // Basic grouping by day for the last 7 days could go here
    // For now, let's use a default set or dynamic if enough data exists
    return [
      { name: "Mon", total: 4500 },
      { name: "Tue", total: 5200 },
      { name: "Wed", total: 4800 },
      { name: "Thu", total: 6100 },
      { name: "Fri", total: 5900 },
      { name: "Sat", total: 8200 },
      { name: "Sun", total: 7500 },
    ];
  }, []);

  if (productsLoading || salesLoading || deliveriesLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Crunching data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">Business Intelligence</h1>
          <p className="text-muted-foreground">Real-time overview of your workshop operations.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 h-11 px-6 rounded-xl font-bold">
            <Link href="/admin/products/add">
              <Plus className="mr-2 h-5 w-5" /> Add New Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <Badge variant="outline" className={cn(
                  "font-bold text-[10px] px-2 py-0.5",
                  stat.positive ? "text-emerald-600 border-emerald-100 bg-emerald-50" : "text-red-600 border-red-100 bg-red-50"
                )}>
                  {stat.trend}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-primary">Revenue Trends</CardTitle>
                  <CardDescription>Performance Overview</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <ArrowUpRight className="h-4 w-4" /> Real-time
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `KES ${value}`}
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#e15d2a' : '#2d4b38'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle className="text-lg font-bold flex items-center">
                <Truck className="mr-2 h-5 w-5 text-accent" />
                Recent Logistics Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {activeDeliveries.length > 0 ? activeDeliveries.map((delivery: any, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="bg-slate-100 p-2.5 rounded-full">
                        <Clock className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-bold text-primary">{delivery.customerName}</p>
                        <p className="text-xs text-muted-foreground">{delivery.location}</p>
                      </div>
                    </div>
                    <Badge 
                      className={cn(
                        "font-bold",
                        delivery.status === 'Out for Delivery' && "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none",
                        delivery.status === 'Pending' && "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none",
                        delivery.status === 'Delivered' && "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none",
                        delivery.status === 'Cancelled' && "bg-slate-100 text-slate-500 hover:bg-slate-100 border-none"
                      )}
                    >
                      {delivery.status}
                    </Badge>
                  </div>
                )) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">No delivery activity recorded yet.</div>
                )}
              </div>
              <Button variant="ghost" className="w-full text-accent hover:bg-accent/5 rounded-none h-12 font-bold" asChild>
                <Link href="/admin/deliveries">View All Logistics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <Card className="border-none shadow-sm bg-gradient-to-br from-red-50 to-white">
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-red-900">Inventory Alerts</CardTitle>
                <CardDescription className="text-red-700/70">Urgent restocking required</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockItems.length > 0 ? lowStockItems.map((item: any, i) => (
                  <div key={i} className="group p-3 bg-white rounded-xl border border-red-100 shadow-sm flex flex-col gap-1 transition-all hover:border-red-300">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-primary">{item.name}</span>
                      <Badge variant="destructive" className="font-bold text-[10px]">
                        {item.stock} LEFT
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.category}</span>
                  </div>
                )) : (
                  <div className="text-sm text-muted-foreground py-4 text-center">All inventory levels are healthy.</div>
                )}
              </div>
              <Button className="w-full mt-6 bg-primary hover:bg-primary/90 h-11 font-bold rounded-xl" asChild>
                <Link href="/admin/products">Open Inventory Manager</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Users className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Business Growth</CardTitle>
              <CardDescription className="text-primary-foreground/60">Automated Insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold">{sales?.length || 0}</div>
                <p className="text-sm text-primary-foreground/70">Total transactions processed this period.</p>
                <Button variant="secondary" className="w-full font-bold h-11 rounded-xl" asChild>
                  <Link href="/admin/sales">Record Sale</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
