
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  History,
  ShieldCheck,
  Hash
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc } from "firebase/firestore";
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
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Deletion State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Receipt Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPin, setCustomerPin] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [items, setItems] = useState<ReceiptItem[]>([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const [receiptNumber, setReceiptNumber] = useState(`DW-${Math.floor(100000 + Math.random() * 900000)}`);
  
  // Dockwood Details
  const companyPin = "P051234567A"; 

  // History State
  const receiptsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "receipts"), orderBy("createdAt", "desc"));
  }, [db, user]);

  const { data: receipts, loading: receiptsLoading } = useCollection(receiptsQuery);

  const filteredReceipts = useMemo(() => {
    if (!receipts) return [];
    return receipts.filter((r: any) => 
      r.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [receipts, searchQuery]);

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const vatRate = 0.16;
  const totalAmount = calculateSubtotal();
  const vatableAmount = totalAmount / (1 + vatRate);
  const vatAmount = totalAmount - vatableAmount;

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
          customerPin,
          paymentMethod,
          items,
          totalAmount: calculateSubtotal(),
          vatAmount,
          vatableAmount,
          createdAt: serverTimestamp(),
        });
      }
      setShowPrintPreview(true);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save receipt record." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDeleteReceipt = async () => {
    if (!db || !deleteId) return;
    try {
      await deleteDoc(doc(db, "receipts", deleteId));
      toast({ title: "Receipt Removed", description: "Record has been deleted from history." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete record." });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerPin("");
    setPaymentMethod("Cash");
    setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    setReceiptNumber(`DW-${Math.floor(100000 + Math.random() * 900000)}`);
    setShowPrintPreview(false);
  };

  if (showPrintPreview) {
    return (
      <div className="animate-in fade-in duration-500 max-w-2xl mx-auto space-y-8 pb-20">
        <div className="flex justify-between items-center print:hidden">
          <Button type="button" variant="outline" onClick={() => setShowPrintPreview(false)} className="rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" /> Edit Receipt
          </Button>
          <div className="flex gap-2">
            <Button type="button" onClick={resetForm} variant="secondary" className="rounded-xl font-bold">New Receipt</Button>
            <Button 
              type="button"
              onClick={handlePrint} 
              className="bg-accent hover:bg-accent/90 rounded-xl font-bold shadow-lg shadow-accent/20"
            >
              <Printer className="mr-2 h-4 w-4" /> Print Receipt
            </Button>
          </div>
        </div>

        {/* PRINTABLE AREA */}
        <div id="printable-receipt" className="bg-white p-12 shadow-xl border rounded-none min-h-[842px] print:shadow-none print:border-none print:p-0">
          <div className="flex justify-between items-start mb-10 border-b-4 border-primary pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-primary p-0.5">
                   <div className="relative h-full w-full rounded-lg overflow-hidden bg-white">
                      <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" />
                   </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-primary tracking-tight">DOCKWOOD FURNITURES</h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">eTIMS COMPLIANT RECEIPT</p>
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed mt-4 font-medium">
                Bombolulu, Kisimani, Mombasa, Kenya<br />
                PIN: <span className="text-primary font-bold">{companyPin}</span><br />
                TEL: +254 711 662 626 | EMAIL: info@dockwoodfurnitures.com
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter mb-1">CASH SALE</h2>
              <div className="text-sm font-bold text-primary">RECEIPT #: {receiptNumber}</div>
              <div className="text-xs text-muted-foreground mt-1 font-bold">DATE: {new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div className="text-[10px] text-muted-foreground mt-1 font-mono">TIME: {new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-10">
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Customer Details:</p>
              <h3 className="font-bold text-primary text-lg">{customerName}</h3>
              <p className="text-xs text-muted-foreground mt-1">{customerPhone || 'N/A'}</p>
              {customerPin && <p className="text-xs text-primary font-bold mt-1">PIN: {customerPin}</p>}
            </div>
            <div className="text-right p-4">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Transaction Info:</p>
              <h3 className="font-bold text-primary">{paymentMethod}</h3>
              <p className="text-xs text-emerald-600 font-black uppercase mt-1">Status: Paid in Full</p>
              <p className="text-[9px] text-muted-foreground mt-2 font-mono">Control Code: DW-AUTO-{receiptNumber.slice(-4)}</p>
            </div>
          </div>

          <table className="w-full mb-10">
            <thead>
              <tr className="bg-primary text-white">
                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest">Description</th>
                <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest">Qty</th>
                <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest">Unit Price</th>
                <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest">Total (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-4 py-4 text-sm font-bold text-slate-700">{item.description}</td>
                  <td className="px-4 py-4 text-center text-sm font-black text-slate-400">{item.quantity}</td>
                  <td className="px-4 py-4 text-right text-sm text-slate-500">{item.unitPrice.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-sm font-black text-primary">{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end border-t-4 border-primary pt-8">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>SUBTOTAL (EXCL. VAT)</span>
                <span>KES {vatableAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>V.A.T (16%)</span>
                <span>KES {vatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xl border-t-2 border-slate-200 pt-4 mt-2">
                <span className="font-black text-primary uppercase text-xs self-center tracking-widest">TOTAL DUE</span>
                <span className="text-3xl font-black text-accent">KES {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-dashed text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-loose">
              This is an official digital tax receipt generated by Dockwood Furnitures.<br />
              Goods once sold are not returnable. Thank you for your business!
            </p>
            <div className="mt-12 flex justify-center gap-20">
               <div className="text-center">
                 <div className="w-40 border-b-2 border-slate-200 mb-2"></div>
                 <span className="text-[8px] font-black uppercase text-slate-400">Customer Signature</span>
               </div>
               <div className="text-center">
                 <div className="w-40 border-b-2 border-slate-200 mb-2"></div>
                 <span className="text-[8px] font-black uppercase text-slate-400">Manager Signature</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-black text-primary tracking-tight">Digital Receipt Generator</h1>
          <p className="text-muted-foreground font-medium">Standard Kenyan Tax Format (eTIMS Placeholder Support)</p>
        </div>
        <div className="bg-white p-1 rounded-xl shadow-sm border flex">
           <Button type="button" variant="ghost" className="rounded-lg h-9 px-4 text-xs font-black bg-accent text-white hover:bg-accent hover:text-white" onClick={resetForm}>NEW RECEIPT</Button>
           <Button type="button" variant="ghost" className="rounded-lg h-9 px-4 text-xs font-bold text-muted-foreground hover:bg-slate-50">HISTORY</Button>
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
                 <CardTitle className="text-lg font-bold">Manual Customer Entry</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-primary/80">Full Customer Name</Label>
                  <Input 
                    placeholder="e.g. Samuel Maina" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-12 rounded-2xl bg-slate-50 border-none shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary/80">Phone Number</Label>
                  <Input 
                    placeholder="e.g. 0712 345 678" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-12 rounded-2xl bg-slate-50 border-none shadow-inner"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-primary/80">Customer KRA PIN (Optional)</Label>
                  <Input 
                    placeholder="e.g. A001234567Z" 
                    value={customerPin}
                    onChange={(e) => setCustomerPin(e.target.value)}
                    className="h-12 rounded-2xl bg-slate-50 border-none shadow-inner uppercase font-mono"
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
                          "h-12 rounded-2xl text-[10px] font-black uppercase transition-all",
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
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 pb-6 border-b flex flex-row justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 rounded-xl bg-accent text-white">
                    <FileText className="h-5 w-5" />
                 </div>
                 <CardTitle className="text-lg font-bold">Itemized Entry</CardTitle>
              </div>
              <Button type="button" onClick={addItem} variant="outline" className="rounded-xl h-9 text-xs font-black border-accent text-accent hover:bg-accent hover:text-white">
                 <Plus className="mr-2 h-3.5 w-3.5" /> ADD LINE
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-muted-foreground border-b">
                  <tr>
                    <th className="px-8 py-4 text-left">Item Description</th>
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
                          placeholder="Type product name manually..." 
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="h-11 rounded-xl bg-slate-50/50 border-none font-bold"
                        />
                      </td>
                      <td className="px-4 py-6 w-24">
                        <Input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Math.max(1, Number(e.target.value)))}
                          className="h-11 rounded-xl text-center bg-slate-50/50 border-none font-bold"
                        />
                      </td>
                      <td className="px-4 py-6 w-44">
                        <Input 
                          type="number"
                          placeholder="Price"
                          value={item.unitPrice || ""}
                          onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                          className="h-11 rounded-xl text-right bg-slate-50/50 border-none font-bold"
                        />
                      </td>
                      <td className="px-8 py-6 text-right w-20">
                        <Button 
                          type="button"
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
               <Hash className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-headline font-bold uppercase tracking-widest text-primary-foreground/50 text-[11px]">Tax Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-1">
                <p className="text-xs font-bold text-primary-foreground/60 uppercase tracking-widest">Grand Total (Inc. VAT)</p>
                <div className="text-5xl font-black tracking-tighter">
                   <span className="text-lg mr-1 opacity-50 font-normal">KES</span>
                   {totalAmount.toLocaleString()}
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/10">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="opacity-50">Excl. VAT (16%)</span>
                    <span>KES {vatableAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="opacity-50">VAT Amount</span>
                    <span className="text-accent">KES {vatAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest pt-2">
                    <span className="opacity-50">Customer</span>
                    <span className="truncate max-w-[120px]">{customerName || 'N/A'}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="opacity-50">Method</span>
                    <Badge className="bg-white/10 text-white font-black border-none py-0 h-5">{paymentMethod}</Badge>
                 </div>
              </div>

              <Button 
                type="button"
                onClick={handleGenerateReceipt}
                className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-black rounded-2xl shadow-xl shadow-accent/20 text-lg transition-transform active:scale-95"
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Printer className="mr-2" />}
                {isGenerating ? "PREPARING..." : "GENERATE RECEIPT"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
               <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-accent" />
                  <CardTitle className="text-xs font-bold uppercase tracking-widest">Recent Sales</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y max-h-[450px] overflow-y-auto">
                  {receiptsLoading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
                  ) : filteredReceipts.length > 0 ? filteredReceipts.map((rec: any) => (
                    <div key={rec.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => {
                      setCustomerName(rec.customerName);
                      setCustomerPhone(rec.customerPhone);
                      setCustomerPin(rec.customerPin || "");
                      setPaymentMethod(rec.paymentMethod);
                      setItems(rec.items);
                      setReceiptNumber(rec.receiptNumber);
                      setShowPrintPreview(true);
                    }}>
                       <div className="space-y-0.5 min-w-0">
                          <p className="font-black text-primary truncate text-sm uppercase">{rec.customerName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono font-bold">{rec.receiptNumber} • {rec.createdAt?.toDate ? rec.createdAt.toDate().toLocaleDateString() : 'Just now'}</p>
                       </div>
                       <div className="text-right flex items-center gap-3">
                          <div className="text-sm font-black text-primary">K {rec.totalAmount?.toLocaleString()}</div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(rec.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-accent transition-colors" />
                       </div>
                    </div>
                  )) : (
                    <div className="p-20 text-center text-[10px] text-muted-foreground italic font-bold uppercase tracking-widest">No previous receipts.</div>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold text-primary text-xl">Delete Receipt Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this receipt from history? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReceipt}
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
