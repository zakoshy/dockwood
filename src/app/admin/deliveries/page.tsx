
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Truck, Search, Filter, MapPin, Phone, User, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_DELIVERIES = [
  { id: "DEL-1001", customer: "Alice Johnson", phone: "+254 711 000 111", location: "Nyali", items: "Mahogany Bed x1", status: "Out for Delivery", urgency: "High" },
  { id: "DEL-1002", customer: "BuildRight Ltd", phone: "+254 722 000 222", location: "Bamburi", items: "Treated Timber x50", status: "Pending", urgency: "Medium" },
  { id: "DEL-1003", customer: "John Kamau", phone: "+254 733 000 333", location: "Kisimani", items: "Dining Chairs x4", status: "Delivered", urgency: "Normal" },
  { id: "DEL-1004", customer: "Coast Resorts", phone: "+254 744 000 444", location: "Diani", items: "Pool Side Tables x10", status: "Cancelled", urgency: "Normal" },
];

export default function AdminDeliveries() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Delivery Management</h1>
          <p className="text-muted-foreground">Dispatch and track local same-day deliveries.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
          <Truck className="mr-2 h-4 w-4" /> Dispatch New
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search deliveries..." className="pl-10 bg-white" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          <div className="flex border rounded-md overflow-hidden bg-white">
            <Button variant="ghost" className="rounded-none border-r px-4 h-10 bg-slate-100 font-bold">All</Button>
            <Button variant="ghost" className="rounded-none border-r px-4 h-10 hover:bg-slate-50">Active</Button>
            <Button variant="ghost" className="rounded-none px-4 h-10 hover:bg-slate-50">Done</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_DELIVERIES.map((delivery) => (
          <Card key={delivery.id} className="border-none shadow-sm overflow-hidden group">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className={cn(
                  "w-2 md:w-3 shrink-0",
                  delivery.status === 'Out for Delivery' && "bg-blue-500",
                  delivery.status === 'Pending' && "bg-yellow-500",
                  delivery.status === 'Delivered' && "bg-green-500",
                  delivery.status === 'Cancelled' && "bg-slate-300"
                )} />
                
                <div className="flex-1 p-6 flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{delivery.id}</span>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          delivery.urgency === 'High' && "bg-red-100 text-red-700"
                        )}
                      >
                        {delivery.urgency} Priority
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm font-bold text-primary">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          {delivery.customer}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="mr-2 h-3.5 w-3.5" />
                          {delivery.phone}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center text-sm font-bold text-primary">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          {delivery.location}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Package className="mr-2 h-3.5 w-3.5" />
                          {delivery.items}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end gap-4 min-w-[150px]">
                    <Badge 
                      className={cn(
                        "px-4 py-1 font-bold",
                        delivery.status === 'Out for Delivery' && "bg-blue-600",
                        delivery.status === 'Pending' && "bg-yellow-500 text-primary",
                        delivery.status === 'Delivered' && "bg-green-600",
                        delivery.status === 'Cancelled' && "bg-slate-200 text-slate-500"
                      )}
                    >
                      {delivery.status}
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8">Details</Button>
                      <Button size="sm" className="h-8 bg-primary">Update</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
