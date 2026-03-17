
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  MousePointer2, 
  MessageCircle, 
  Clock, 
  Loader2, 
  BarChart3,
  Calendar,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";

export default function AdminAnalytics() {
  const db = useFirestore();

  // Fetch interaction data
  const { data: interactions, loading } = useCollection(
    useMemo(() => (db ? query(collection(db, "interactions"), orderBy("timestamp", "desc"), limit(500)) : null), [db])
  );

  const stats = useMemo(() => {
    if (!interactions) return { visits: 0, inquiries: 0, views: 0 };
    
    return {
      visits: interactions.filter((i: any) => i.type === 'visit').length,
      inquiries: interactions.filter((i: any) => i.type === 'inquiry').length,
      views: interactions.filter((i: any) => i.type === 'view_product').length,
    };
  }, [interactions]);

  const chartData = useMemo(() => {
    if (!interactions || interactions.length === 0) return [];

    // Group visits by day
    const days: { [key: string]: number } = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }).reverse();

    last7Days.forEach(day => days[day] = 0);

    interactions.forEach((i: any) => {
      if (!i.timestamp) return;
      const date = i.timestamp.toDate ? i.timestamp.toDate() : new Date(i.timestamp);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      if (days[dayName] !== undefined) {
        days[dayName]++;
      }
    });

    return last7Days.map(day => ({
      name: day,
      interactions: days[day]
    }));
  }, [interactions]);

  const recentInteractions = useMemo(() => {
    return interactions?.slice(0, 10) || [];
  }, [interactions]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading interaction data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">Website Interaction Analytics</h1>
        <p className="text-muted-foreground">Monitor how customers are engaging with Dockwood Furnitures online.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-blue-50">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Total Site Visits</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Page Loads</p>
              <div className="text-3xl font-bold text-primary">{stats.visits}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-50">
                <MessageCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Sales Inquiries</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">WhatsApp Clicks</p>
              <div className="text-3xl font-bold text-primary">{stats.inquiries}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-orange-50">
                <MousePointer2 className="h-6 w-6 text-orange-600" />
              </div>
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Product Engagement</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Item Views</p>
              <div className="text-3xl font-bold text-primary">{stats.views}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-primary">Traffic Trends</CardTitle>
                <CardDescription>Customer interactions over the last 7 days</CardDescription>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="interactions" fill="#2d4b38" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-lg font-bold flex items-center">
              <Clock className="mr-2 h-5 w-5 text-accent" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[400px] overflow-y-auto">
              {recentInteractions.length > 0 ? recentInteractions.map((item: any, i) => (
                <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      item.type === 'inquiry' ? "bg-emerald-100 text-emerald-700" :
                      item.type === 'visit' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                    )}>
                      {item.type === 'inquiry' ? "WhatsApp Click" : 
                       item.type === 'visit' ? "Site Visit" : "Product View"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    {item.page || (item.productName ? `Viewing ${item.productName}` : 'Landed on Home')}
                  </p>
                </div>
              )) : (
                <div className="p-12 text-center text-muted-foreground text-sm italic">
                  No interactions recorded yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
