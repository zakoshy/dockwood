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
  Loader2,
  BarChart3,
  Warehouse,
  ChevronRight,
  Layers,
  MapPin,
  ShieldCheck
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
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";

export default function AdminDashboard() {
  const db = useFirestore();
  const { user } = useUser();

  // Fetch all data for stats, protected by user check
  const productsQuery = useMemo(() => (db && user ? collection(db, "products") : null), [db, user]);
  const salesQuery = useMemo(() => (db && user ? collection(db, "sales") : null), [db, user]);
  const deliveriesQuery = useMemo(() => (db && user ? collection(db, "deliveries") : null), [db, user]);
  const warehousesQuery = useMemo(() => (db && user ? collection(db, "warehouses") : null), [db, user]);

  const { data: products, loading: productsLoading } = useCollection(productsQuery);
  const { data: sales, loading: salesLoading } = useCollection(salesQuery);
  const { data: deliveries, loading: deliveriesLoading } = useCollection(deliveriesQuery);
  const { data: warehouses, loading: warehousesLoading } = useCollection(warehousesQuery);

  const stats = useMemo(() => {
    const revenue = sales?.reduce((acc, sale: any) => acc + (Number(sale.totalAmount) || 0), 0) || 0;
    const activeDeliveries = deliveries?.filter((d: any) => d.status !== 'Delivered' && d.status !== 'Cancelled').length || 0;
    const lowStockCount = products?.filter((p: any) => (p.stock || 0) < 5).length || 0;

    return [
      { 
        title: "Total Revenue", 
        value: `KES ${revenue.toLocaleString()}`, 
        icon: TrendingUp, 
        trend: revenue > 0 ? "Active" : "None", 
        positive: revenue > 0, 
        color: "text-emerald-600", 
        bg: "bg-emerald-50",
        description: "Lifetime transaction value"
      },
      { 
        title: "Active Deliveries", 
        value: activeDeliveries.toString(), 
        icon: Truck, 
        trend: activeDeliveries > 0 ? "In Progress" : "All Clear", 
        positive: activeDeliveries === 0, 
        color: "text-blue-600", 
        bg: "bg-blue-50",
        description: "Current pending dispatches"
      },
      { 
        title: "Total Stock Units", 
        value: products?.reduce((acc, p: any) => acc + (Number(p.stock) || 0), 0).toString() || "0", 
        icon: Layers, 
        trend: "Live Inventory", 
        positive: true, 
        color: "text-purple-600", 
        bg: "bg-purple-50",
        description: "Items across all warehouses"
      },
      { 
        title: "Critical Alerts", 
        value: lowStockCount.toString(), 
        icon: AlertTriangle, 
        trend: lowStockCount > 0 ? "Requires Action" : "Optimal Levels", 
        positive: lowStockCount === 0, 
        color: lowStockCount > 0 ? "text-red-600" : "text-emerald-600", 
        bg: lowStockCount > 0 ? "bg-red-50" : "bg-emerald-50",
        description: "Items below 5 units"
      },
    ];
  }, [products, sales, deliveries]);

  const warehouseStats = useMemo(() => {
    if (!warehouses || !products) return [];
    return warehouses.map((w: any) => {
      const itemsInWarehouse = products.filter((p: any) => p.warehouseId === w.id);
      const totalUnits = itemsInWarehouse.reduce((acc, p: any) => acc + (Number(p.stock) || 0), 0);
      return {
        id: w.id,
        name: w.name,
        count: itemsInWarehouse.length,
        units: totalUnits,
        color: "bg-primary"
      };
    }).sort((a, b) => b.units - a.units).slice(0, 4);
  }, [warehouses, products]);

  const lowStockItems = useMemo(() => {
    return products?.filter((p: any) => (p.stock || 0) < 5).slice(0, 4) || [];
  }, [products]);

  const chartData = useMemo(() => {
    if (!sales || sales.length === 0) return [];

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const grouped = sales.reduce((acc: any, sale: any) => {
      const date = sale.timestamp?.toDate ? sale.timestamp.toDate() : new Date(sale.timestamp);
      const dayName = days[date.getDay()];
      acc[dayName] = (acc[dayName] || 0) + (Number(sale.totalAmount) || 0);
      return acc;
    }, {});

    return days.map(day => ({
      name: day,
      total: grouped[day] || 0
    }));
  }, [sales]);

  if (productsLoading || salesLoading || deliveriesLoading || warehousesLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <p className="text-xl font-headline font-bold text-primary">Synchronizing Workspace</p>
          <p className="text-muted-foreground animate-pulse">Fetching real-time inventory and logistics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground text-lg">Mombasa Operations Overview & Resource Management.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-12 px-6 rounded-2xl font-bold border-2 hover:bg-slate-50 transition-all">
            <Link href="/admin/warehouses">
              <Warehouse className="mr-2 h-5 w-5 text-accent" /> Network Status
            </Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 h-12 px-8 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95">
            <Link href="/admin/products/add">
              <Plus className="mr-2 h-5 w-5" /> New Stock Entry
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white group overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-500", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <Badge variant="outline" className={cn(
                  "font-bold text-[10px] px-2.5 py-1 rounded-full border-none",
                  stat.positive ? "text-emerald-700 bg-emerald-100" : "text-red-700 bg-red-100"
                )}>
                  {stat.trend}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <div className="text-3xl font-black text-primary tracking-tight">{stat.value}</div>
                <p className="text-[11px] text-muted-foreground/70 font-medium">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-sm min-h-[450px] flex flex-col bg-white rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-primary">Market Performance</CardTitle>
                  <CardDescription>Financial transaction trends over the current week</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center pt-6">
              {chartData.some(d => d.total > 0) ? (
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `K ${value >= 1000 ? value/1000 + 'k' : value}`}
                      />
                      <Tooltip 
                        cursor={{fill: '#f1f5f9'}}
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                          padding: '12px 16px'
                        }}
                      />
                      <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.total === Math.max(...chartData.map(d => d.total)) ? '#e15d2a' : '#2d4b38'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-20 space-y-6 opacity-40">
                  <BarChart3 className="h-16 w-16 text-slate-400" />
                  <p className="text-sm font-bold text-slate-600">Market Data Pending</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className={cn(
            "border-none shadow-lg rounded-3xl overflow-hidden transition-all duration-500",
            lowStockItems.length > 0 ? "bg-red-600 text-white ring-4 ring-red-100" : "bg-white"
          )}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn("h-5 w-5", lowStockItems.length > 0 ? "text-white" : "text-red-600")} />
                  <CardTitle className="text-lg font-bold">Stock Alerts</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockItems.length > 0 ? lowStockItems.map((item: any, i) => (
                  <div key={i} className="p-4 bg-white/10 rounded-2xl border border-white/20 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm truncate pr-4">{item.name}</span>
                      <Badge className="bg-white text-red-600 font-black text-[10px] rounded-lg">
                        {item.stock} LEFT
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-70">
                      <span>{item.category}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {item.warehouseLocation || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 space-y-3 opacity-60">
                    <ShieldCheck className="h-10 w-10 mx-auto text-emerald-600" />
                    <p className="text-sm font-bold text-emerald-600">Inventory Levels Stable</p>
                  </div>
                )}
              </div>
              <Button 
                className={cn(
                  "w-full mt-6 h-12 font-bold rounded-2xl shadow-lg transition-all",
                  lowStockItems.length > 0 ? "bg-white text-red-600 hover:bg-white/90" : "bg-primary text-white"
                )} 
                asChild
              >
                <Link href="/admin/products">Inventory Manager</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
