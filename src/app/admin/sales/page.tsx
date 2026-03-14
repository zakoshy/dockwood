
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, Download, TrendingUp, Plus, User, Package, CreditCard, Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

export default function AdminSales() {
  const { toast } = useToast();
  const db = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Sales and Products
  const { data: sales, loading: salesLoading } = useCollection(
    useMemo(() => (db ? query(collection(db, "sales"), orderBy("timestamp", "desc")) : null), [db])
  );
  const { data: products } = useCollection(
    useMemo(() => (db ? collection(db, "products") : null), [db])
  );

  // Form State
  const [customer, setCustomer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState("1");
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    return sales.filter((s: any) => 
      s.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.productName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sales, searchQuery]);

  const totalRevenue = useMemo(() => {
    return sales?.reduce((acc, sale: any) => acc + (Number(sale.totalAmount) || 0), 0) || 0;
  }, [sales]);

  const handleNewSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setIsSubmitting(true);
    try {
      const product = products?.find((p: any) => p.id === selectedProduct);
      
      await addDoc(collection(db, "sales"), {
        customerName: customer,
        productId: selectedProduct,
        productName: product?.name || "Unknown Product",
        quantity: Number(qty),
        totalAmount: Number(amount),
        paymentMethod: method,
        timestamp: serverTimestamp(),
      });

      toast({
        title: "Sale Recorded",
        description: `Successfully recorded sale for ${customer}.`,
      });
      
      // Reset form
      setCustomer("");
      setSelectedProduct("");
      setQty("1");
      setMethod("");
      setAmount("");
      setIsDialogOpen(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to record sale.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return "N/A";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Sales History</h1>
          <p className="text-muted-foreground">Detailed logs of all customer purchases.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-11 rounded-xl">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/10">
                <Plus className="mr-2 h-5 w-5" /> Record New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline font-bold text-primary">New Transaction</DialogTitle>
                <DialogDescription>Enter the details of the customer purchase below.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleNewSale} className="space-y-6 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" /> Customer Name
                    </Label>
                    <Input id="customer" placeholder="e.g. John Kamau" required value={customer} onChange={(e) => setCustomer(e.target.value)} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product" className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" /> Product
                      </Label>
                      <Select required onValueChange={setSelectedProduct} value={selectedProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="qty">Quantity</Label>
                      <Input id="qty" type="number" min="1" required value={qty} onChange={(e) => setQty(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="method" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" /> Payment
                      </Label>
                      <Select required onValueChange={setMethod} value={method}>
                        <SelectTrigger>
                          <SelectValue placeholder="Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mpesa">M-Pesa</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Total Amount (KES)</Label>
                      <Input id="amount" type="number" placeholder="0.00" required value={amount} onChange={(e) => setAmount(e.target.value)} />
                    </div>
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="rounded-xl h-11 px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-accent hover:bg-accent/90 rounded-xl h-11 px-8 font-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Complete Sale"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-white border-none shadow-lg shadow-primary/20 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10">
            <TrendingUp className="h-32 w-32" />
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-primary-foreground/70 text-sm font-medium">Total Lifetime Revenue</span>
              <div className="bg-white/10 p-1.5 rounded-lg">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
            </div>
            <div className="text-3xl font-bold">KES {totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-primary-foreground/50 mt-2 flex items-center gap-1">
              <span className="text-emerald-400 font-bold">Live Data</span> from database
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-6 border-b bg-white">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Filter by product or customer..." 
                className="pl-10 h-11 bg-slate-50 border-none rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">Historical Records</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            {salesLoading ? (
              <div className="p-20 flex justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="p-20 text-center text-muted-foreground">No transactions recorded yet.</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-primary uppercase bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-5">Product Details</th>
                    <th className="px-6 py-5">Customer</th>
                    <th className="px-6 py-5 text-center">Qty</th>
                    <th className="px-6 py-5">Timestamp</th>
                    <th className="px-6 py-5 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.map((sale: any) => (
                    <tr key={sale.id} className="bg-white hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-primary group-hover:text-accent transition-colors">{sale.productName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{sale.customerName}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold">{sale.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{formatDate(sale.timestamp)}</td>
                      <td className="px-6 py-4 font-bold text-accent text-right">KES {sale.totalAmount?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
