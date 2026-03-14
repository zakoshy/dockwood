"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Truck, Search, Filter, MapPin, Phone, User, Package, Banknote, Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function AdminDeliveries() {
  const { toast } = useToast();
  const db = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch Deliveries
  const { data: deliveries, loading } = useCollection(
    useMemo(() => (db ? query(collection(db, "deliveries"), orderBy("timestamp", "desc")) : null), [db])
  );

  // Form State
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [items, setItems] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const [cost, setCost] = useState("");

  const filteredDeliveries = useMemo(() => {
    if (!deliveries) return [];
    return deliveries.filter((d: any) => 
      d.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.items?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [deliveries, searchQuery]);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "deliveries"), {
        customerName: customer,
        phone,
        location,
        items,
        status: "Pending",
        urgency,
        cost: Number(cost),
        timestamp: serverTimestamp(),
      });

      toast({
        title: "Trip Dispatched",
        description: `New delivery logged for ${customer}.`,
      });
      
      // Reset form
      setCustomer("");
      setPhone("");
      setLocation("");
      setItems("");
      setUrgency("Normal");
      setCost("");
      setIsDialogOpen(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to log delivery.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "deliveries", id), { status: newStatus });
      toast({ title: "Status Updated", description: `Delivery is now ${newStatus}.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update status." });
    }
  };

  const confirmDelete = async () => {
    if (!db || !deleteId) return;
    try {
      await deleteDoc(doc(db, "deliveries", deleteId));
      toast({ title: "Record Deleted", description: "The delivery entry has been removed." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete record." });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Logistics & Dispatch</h1>
          <p className="text-muted-foreground">Manage and track local same-day deliveries in Mombasa.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 h-11 px-6 rounded-xl font-bold">
              <Truck className="mr-2 h-5 w-5" /> Dispatch New Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold text-primary">New Logistics Entry</DialogTitle>
              <DialogDescription>Details for the upcoming dispatch trip.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleDispatch} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input required value={customer} onChange={(e) => setCustomer(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input required value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location / Landmark</Label>
                <Input required value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Items to Deliver</Label>
                <Input required placeholder="e.g. 1x King Bed, 4x Chairs" value={items} onChange={(e) => setItems(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Urgency</Label>
                  <Select onValueChange={setUrgency} defaultValue="Normal">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cost (KES)</Label>
                  <Input type="number" required value={cost} onChange={(e) => setCost(e.target.value)} />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-primary font-bold h-12 rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Dispatch Trip"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search by customer, ID or location..." 
            className="pl-10 h-11 bg-white rounded-xl border-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-muted-foreground" /></div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="p-20 text-center text-muted-foreground bg-white rounded-2xl border border-dashed">No delivery trips recorded yet.</div>
        ) : (
          filteredDeliveries.map((delivery: any) => (
            <Card key={delivery.id} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className={cn(
                    "w-2 md:w-3 shrink-0",
                    delivery.status === 'Out for Delivery' && "bg-blue-500",
                    delivery.status === 'Pending' && "bg-yellow-500",
                    delivery.status === 'Delivered' && "bg-emerald-500",
                    delivery.status === 'Cancelled' && "bg-slate-300"
                  )} />
                  
                  <div className="flex-1 p-6 flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            delivery.urgency === 'High' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {delivery.urgency} Priority
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-300 hover:text-red-600 rounded-lg lg:opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setDeleteId(delivery.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm font-bold text-primary">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            {delivery.customerName}
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

                        <div className="space-y-1 md:border-l md:pl-6">
                          <div className="flex items-center text-sm font-bold text-accent">
                            <Banknote className="mr-2 h-4 w-4" />
                            KES {delivery.cost?.toLocaleString()}
                          </div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Delivery Fee</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end gap-4 min-w-[180px]">
                      <Badge 
                        className={cn(
                          "px-4 py-1.5 font-bold rounded-lg border-none",
                          delivery.status === 'Out for Delivery' && "bg-blue-600 text-white",
                          delivery.status === 'Pending' && "bg-yellow-500 text-primary",
                          delivery.status === 'Delivered' && "bg-emerald-600 text-white",
                          delivery.status === 'Cancelled' && "bg-slate-200 text-slate-500"
                        )}
                      >
                        {delivery.status}
                      </Badge>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Select onValueChange={(val) => updateStatus(delivery.id, val)} value={delivery.status}>
                          <SelectTrigger className="h-9 rounded-lg">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold text-primary text-xl">Delete Logistics Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this delivery trip from the logs? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep Record</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}