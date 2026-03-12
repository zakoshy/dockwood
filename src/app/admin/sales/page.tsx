
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, FileText, Download, TrendingUp, Plus, User, Package, CreditCard } from "lucide-react";
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

const MOCK_SALES = [
  { id: "S101", product: "Mahogany Bed", qty: 1, date: "2024-03-20 14:30", total: "KES 45,000" },
  { id: "S102", product: "Cypress Timber", qty: 20, date: "2024-03-19 11:20", total: "KES 18,000" },
  { id: "S103", product: "Kitchen Table", qty: 1, date: "2024-03-19 09:15", total: "KES 22,500" },
  { id: "S104", product: "Dining Chairs (Set)", qty: 6, date: "2024-03-18 16:45", total: "KES 36,000" },
];

export default function AdminSales() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewSale = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDialogOpen(false);
      toast({
        title: "Sale Recorded",
        description: "The transaction has been added to the sales history.",
      });
    }, 1000);
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
                    <Input id="customer" placeholder="e.g. John Kamau" required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product" className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" /> Product
                      </Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bed">Mahogany Bed</SelectItem>
                          <SelectItem value="timber">Cypress Timber</SelectItem>
                          <SelectItem value="table">Solid Oak Table</SelectItem>
                          <SelectItem value="chair">Dining Chairs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="qty">Quantity</Label>
                      <Input id="qty" type="number" defaultValue="1" min="1" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="method" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" /> Payment
                      </Label>
                      <Select required>
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
                      <Input id="amount" type="number" placeholder="0.00" required />
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
              <span className="text-primary-foreground/70 text-sm font-medium">Monthly Revenue</span>
              <div className="bg-white/10 p-1.5 rounded-lg">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
            </div>
            <div className="text-3xl font-bold">KES 1.2M</div>
            <div className="text-xs text-primary-foreground/50 mt-2 flex items-center gap-1">
              <span className="text-emerald-400 font-bold">+12%</span> from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-6 border-b bg-white">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Filter by product or customer..." className="pl-10 h-11 bg-slate-50 border-none rounded-xl" />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">Last 30 Days</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-primary uppercase bg-slate-50/50">
                <tr>
                  <th className="px-6 py-5">Sale ID</th>
                  <th className="px-6 py-5">Product Details</th>
                  <th className="px-6 py-5 text-center">Qty</th>
                  <th className="px-6 py-5">Timestamp</th>
                  <th className="px-6 py-5 text-right">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_SALES.map((sale) => (
                  <tr key={sale.id} className="bg-white hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-muted-foreground">#{sale.id}</td>
                    <td className="px-6 py-4 font-bold text-primary group-hover:text-accent transition-colors">{sale.product}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-bold">{sale.qty}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{sale.date}</td>
                    <td className="px-6 py-4 font-bold text-accent text-right">{sale.total}</td>
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
