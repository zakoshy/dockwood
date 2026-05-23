
"use client";

import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Printer, 
  Plus, 
  Trash2, 
  User, 
  Phone, 
  CreditCard, 
  Loader2, 
  ArrowLeft,
  ChevronRight,
  Search,
  History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function ReceiptGenerator() {
  const { toast } = useToast();
  const db = useFirestore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Receipt Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [items, setItems] = useState<ReceiptItem[]>([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const [receiptNumber, setReceiptNumber] = useState(`DW-${Math.floor(1000 + Math.random() * 9000)}`);

  // History State
  const { data: receipts, loading: receiptsLoading } = useCollection(
    useMemo(() => (db ? query(collection(db, "receipts"), orderBy("createdAt", "desc")) : null), [db])
  );

  const filteredReceipts = useMemo(() => {
    if (!receipts) return [];
    return receipts.filter((r: any) => 
      r.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [receipts, searchQuery]);

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ReceiptItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    item.total = item.quantity * item.unitPrice;
    newItems[index] = item;
    setItems(newItems);
  };

  const handleGenerateReceipt = async () => {
    if (!customerName || items.some(i => !i.description || i.unitPrice <= 0)) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please provide customer name and item details." });
      return;
    }

    setIsGenerating(true);
    try {
      if (db) {
        await addDoc(collection(db, "receipts"), {
          receiptNumber,
          customerName,
          customerPhone,
          paymentMethod,
          items,
          totalAmount: calculateTotal(),
          createdAt: serverTimestamp(),
        });
      }
      setShowPrintPreview(true);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save receipt." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMethod("Cash");
    setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    setReceiptNumber(`DW-${Math.floor(1000 + Math.random() * 9000)}`);
    setShowPrintPreview(false);
  };

  if (showPrintPreview) {
    return (
      <div className="animate-in fade-in duration-500 max-w-2xl mx-auto space-y-8 pb-20">
        <div className="flex justify-between items-center print:hidden">
          <Button variant="outline" onClick={() => setShowPrintPreview(false)} className="rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" /> Edit Receipt
          </Button>
          <div className="flex gap-2">
            <Button onClick={resetForm} variant="secondary" className="rounded-xl font-bold">New Receipt</Button>
            <Button onClick={handlePrint} className="bg-accent hover:bg-accent/90 rounded-xl font-bold shadow-lg shadow-accent/20">
              <Printer className="mr-2 h-4 w-4" /> Print Now
            </Button>
          </div>
        </div>

        {/* PRINTABLE AREA */}
        <div id="printable-receipt" className="bg-white p-12 shadow-xl border rounded-none min-h-[842px] print:shadow-none print:border-none print:p-0">
          <div className="flex justify-between items-start mb-12 border-b pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-primary p-0.5">
                   <div className="relative h-full w-full rounded-lg overflow-hidden bg-white">
                      <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" />
                   </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-primary tracking-tight">Dockwood Furnitures</h1>
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent">Quality Timber & Furniture</p>
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed mt-4">
                Bombolulu, Kisimani, Opposite Nivash Supermarket,<br />
                Opposite Petrocity, Mombasa, Kenya.<br />
                Phone: +254 711 662 626 | info@dockwoodfurnitures.com
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-slate-200 uppercase tracking-tighter mb-1">Receipt</h2>
              <div className="text-sm font-bold text-primary"># {receiptNumber}</div>
              <div className="text-xs text-muted-foreground mt-1">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Billed To:</p>
              <h3 className="font-bold text-primary text-lg">{customerName}</h3>
              <p className="text-sm text-muted-foreground">{customerPhone || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Payment Info:</p>
              <h3 className="font-bold text-primary">{paymentMethod}</h3>
              <p className="text-sm text-muted-foreground">Status: Paid in Full</p>
            </div>
          </div>

          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-primary">
                <th className="text-left py-4 text-xs font-black uppercase tracking-widest text-primary">Description</th>
                <th className="text-center py-4 text-xs font-black uppercase tracking-widest text-primary">Qty</th>
                <th className="text-right py-4 text-xs font-black uppercase tracking-widest text-primary">Unit Price</th>
                <th className="text-right py-4 text-xs font-black uppercase tracking-widest text-primary">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="py-4 text-sm font-medium text-slate-700">{item.description}</td>
                  <td className="py-4 text-center text-sm font-bold text-slate-500">{item.quantity}</td>
                  <td className="py-4 text-right text-sm text-slate-500">KES {item.unitPrice.toLocaleString()}</td>
                  <td className="py-4 text-right text-sm font-bold text-primary">KES {item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end border-t-2 border-slate-100 pt-8">
            <div className="w-64 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Subtotal</span>
                <span className="font-bold text-slate-700">KES {calculateTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg border-t pt-4">
                <span className="font-black text-primary uppercase text-sm self-center">Grand Total</span>
                <span className="text-2xl font-black text-accent">KES {calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-24 pt-12 border-t border-dashed text-center">
            <p className="text-xs font-medium text-muted-foreground">Thank you for choosing Dockwood Furnitures. Quality woodwork that lasts a lifetime.</p>
            <div className="mt-8 flex justify-center gap-12">
               <div className="w-40 border-b border-slate-200"></div>
               <div className="w-40 border-b border-slate-200"></div>
            </div>
            <div className="mt-2 flex justify-center gap-12 text-[8px] font-black uppercase text-slate-300">
               <span>Customer Signature</span>
               <span>Manager Signature</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary tracking-tight">Receipt Generator</h1>
          <p className="text-muted-foreground">Manually generate and print formal transaction receipts for customers.</p>
        </div>
        <div className="bg-white p-1 rounded-xl shadow-sm border flex">
           <Button variant="ghost" className="rounded-lg h-9 px-4 text-xs font-bold bg-accent text-white hover:bg-accent hover:text-white">Generator</Button>
           <Button variant="ghost" className="rounded-lg h-9 px-4 text-xs font-bold text-muted-foreground hover:bg-slate-50">Saved Records</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM SIDE */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 pb-6 border-b">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 rounded-xl bg-primary text-white">
                    <User className="h-5 w-5" />
                 </div>
                 <CardTitle className="text-lg font-bold">Customer Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-primary/80">Full Name</Label>
                <Input 
                  placeholder="e.g. Samuel Maina" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-12 rounded-2xl bg-slate-50 border-none shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-primary/80">Phone Number (Optional)</Label>
                <Input 
                  placeholder="e.g. 0712 345 678" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-12 rounded-2xl bg-slate-50 border-none shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-primary/80">Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                   {['Cash', 'M-Pesa', 'Bank'].map(method => (
                     <button
                       key={method}
                       type="button"
                       onClick={() => setPaymentMethod(method)}
                       className={cn(
                         "h-12 rounded-2xl text-xs font-black uppercase transition-all",
                         paymentMethod === method 
                           ? "bg-accent text-white shadow-lg shadow-accent/20" 
                           : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                       )}
                     >
                       {method}
                     </button>
                   ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-primary/80">Receipt #</Label>
                <Input 
                  readOnly
                  value={receiptNumber}
                  className="h-12 rounded-2xl bg-slate-100 border-none font-mono text-xs opacity-60 cursor-not-allowed"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 pb-6 border-b flex flex-row justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 rounded-xl bg-accent text-white">
                    <FileText className="h-5 w-5" />
                 </div>
                 <CardTitle className="text-lg font-bold">Purchase Items</CardTitle>
              </div>
              <Button onClick={addItem} variant="outline" className="rounded-xl h-9 text-xs border-accent text-accent hover:bg-accent hover:text-white">
                 <Plus className="mr-2 h-3.5 w-3.5" /> Add Row
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-muted-foreground border-b">
                  <tr>
                    <th className="px-8 py-4 text-left">Description</th>
                    <th className="px-4 py-4 text-center">Qty</th>
                    <th className="px-4 py-4 text-right">Unit Price</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, index) => (
                    <tr key={index} className="group">
                      <td className="px-8 py-6">
                        <Input 
                          placeholder="Handmade Mahogany Bed" 
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="h-11 rounded-xl bg-slate-50/50 border-none"
                        />
                      </td>
                      <td className="px-4 py-6 w-24">
                        <Input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          className="h-11 rounded-xl text-center bg-slate-50/50 border-none"
                        />
                      </td>
                      <td className="px-4 py-6 w-40">
                        <Input 
                          type="number"
                          placeholder="Price"
                          value={item.unitPrice || ""}
                          onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                          className="h-11 rounded-xl text-right bg-slate-50/50 border-none"
                        />
                      </td>
                      <td className="px-8 py-6 text-right w-20">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeItem(index)}
                          className="text-slate-200 hover:text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* SUMMARY SIDE */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-primary text-white rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <CreditCard className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-headline font-bold uppercase tracking-widest text-primary-foreground/50 text-[11px]">Final Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <p className="text-sm font-medium text-primary-foreground/60">Payable Amount</p>
                <div className="text-5xl font-black tracking-tighter">
                   <span className="text-xl mr-2 opacity-50 font-normal">KES</span>
                   {calculateTotal().toLocaleString()}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                 <div className="flex justify-between text-xs font-bold">
                    <span className="opacity-50 uppercase tracking-widest">Customer</span>
                    <span>{customerName || 'N/A'}</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold">
                    <span className="opacity-50 uppercase tracking-widest">Total Items</span>
                    <span>{items.reduce((a, b) => a + b.quantity, 0)}</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold">
                    <span className="opacity-50 uppercase tracking-widest">Method</span>
                    <Badge className="bg-white/10 text-white font-black border-none py-0 h-5">{paymentMethod}</Badge>
                 </div>
              </div>

              <Button 
                onClick={handleGenerateReceipt}
                className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl shadow-xl shadow-accent/20 text-lg transition-transform active:scale-95"
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Printer className="mr-2" />}
                {isGenerating ? "Processing..." : "Generate & Preview"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
               <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-accent" />
                  <CardTitle className="text-sm font-bold">Recent Receipts</CardTitle>
               </div>
               <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                  <input 
                    placeholder="Search..." 
                    className="pl-7 h-8 w-32 rounded-lg bg-white border text-[10px] font-medium outline-none focus:ring-1 ring-accent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y max-h-[400px] overflow-y-auto">
                  {receiptsLoading ? (
                    <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
                  ) : filteredReceipts.length > 0 ? filteredReceipts.map((rec: any) => (
                    <div key={rec.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => {
                      setCustomerName(rec.customerName);
                      setCustomerPhone(rec.customerPhone);
                      setPaymentMethod(rec.paymentMethod);
                      setItems(rec.items);
                      setReceiptNumber(rec.receiptNumber);
                      setShowPrintPreview(true);
                    }}>
                       <div className="space-y-0.5 min-w-0">
                          <p className="font-bold text-primary truncate text-sm">{rec.customerName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{rec.receiptNumber} • {rec.createdAt?.toDate ? rec.createdAt.toDate().toLocaleDateString() : 'Today'}</p>
                       </div>
                       <div className="text-right flex items-center gap-3">
                          <div className="text-xs font-black text-accent">KES {rec.totalAmount?.toLocaleString()}</div>
                          <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-accent transition-colors" />
                       </div>
                    </div>
                  )) : (
                    <div className="p-12 text-center text-xs text-muted-foreground italic">No saved receipts.</div>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
