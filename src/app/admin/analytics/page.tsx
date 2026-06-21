"use client";

import { useMemo, useEffect, useState } from "react";
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
  Globe,
  Trash2
} from "lucide-react";
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
import { collection, query, orderBy, limit, where, getDocs, writeBatch, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function AdminAnalytics() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isCleaning, setIsCleaning] = useState(false);

  // Calculate the timestamp for 7 days ago
  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    d.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(d);
  }, []);

  // Fetch only the last 7 days of interactions
  const interactionsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "interactions"), 
      where("timestamp", ">=", sevenDaysAgo),
      orderBy("timestamp", "desc")
    );
  }, [db, user, sevenDaysAgo]);

  const { data: interactions, loading } = useCollection(interactionsQuery);

  // Self-cleaning logic: Delete records older than 7 days
  useEffect(() => {
    const cleanupOldData = async () => {
      if (!db || !user || isCleaning) return;
      
      setIsCleaning(true);
      try {
        const oldDataQuery = query(
          collection(db, "interactions"),
          where("timestamp", "<", sevenDaysAgo),
          limit(500) // Batch limit for stability
        );
        
        const snapshot = await getDocs(oldDataQuery);
        if (!snapshot.empty) {
          const batch = writeBatch(db);
          snapshot.docs.forEach((doc) => batch.delete(doc.ref));
          await batch.commit();
          console.log(`Cleaned up ${snapshot.docs.length} expired interaction records.`);
        }
      } catch (error) {
        console.error("Cleanup failed:", error);
      } finally {
        setIsCleaning(false);
      }
    };

    cleanupOldData();
  }, [db, user, sevenDaysAgo]);

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
    return interactions?.slice(0, 15) || [];
  }, [interactions]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading weekly performance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">Weekly Engagement Analytics</h1>
          <p className="text-muted-foreground">Showing interaction data from the last 7 days (Self-cleaning enabled).</p>
        </div>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 py-1.5 px-4 rounded-xl font-bold">
          <Clock className="mr-2 h-4 w-4" /> 7-Day Retention Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl bg-blue-50">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Last 7 Days</Badge>
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
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Active Inquiries</Badge>
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
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Showroom Engagement</Badge>
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
                <CardTitle className="text-lg font-bold text-primary">Traffic Trends (Rolling Week)</CardTitle>
                <CardDescription>Daily customer interactions recorded locally</CardDescription>
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
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[400px] overflow-y-auto">
              {recentInteractions.length > 0 ? recentInteractions.map((item: any, i) => (
                <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                      item.type === 'inquiry' ? "bg-emerald-100 text-emerald-700" :
                      item.type === 'visit' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                    )}>
                      {item.type === 'inquiry' ? "WhatsApp" : 
                       item.type === 'visit' ? "Site Visit" : "View"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-primary truncate">
                    {item.page || (item.productName ? `Viewing ${item.productName}` : 'Home')}
                  </p>
                </div>
              )) : (
                <div className="p-12 text-center text-muted-foreground text-sm italic font-medium">
                  No interactions in the last 7 days.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}