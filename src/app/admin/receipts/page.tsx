
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2, 
  ArrowLeft,
  ChevronRight,
  History,
  Mail,
  MapPin,
  Hash,
  Info,
  Calendar,
  CreditCard
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

type DocType = "Invoice" | "Receipt" | "Quotation";

export default function DocumentGenerator() {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [docType, setDocType] = useState<DocType>("Invoice");
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Corporate Constants
  const companyPin = "P051234567A"; 
  const fixedTerms = "1. Goods once sold are not returnable. 2. Payments should be made to the account details provided below. 3. This is a computer-generated document and is valid without a physical stamp.";

  // Form States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPin, setCustomerPin] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [items, setItems] = useState<ReceiptItem[]>([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const [docNumber, setDocNumber] = useState("");

  // Auto-generate doc number on type change
  useEffect(() => {
    const prefix = docType === "Invoice" ? "INV" : docType === "Quotation" ? "QTN" : "REC";
    setDocNumber(`${prefix}-${Math.floor(100000 + Math.random() * 900000)}`);
  }, [docType]);

  const receiptsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "receipts"), orderBy("createdAt", "desc"));
  }, [db, user]);

  const { data: history, loading: historyLoading } = useCollection(receiptsQuery);

  const filteredHistory = useMemo(() => {
    if (!history) return [];
    return history.filter((r: any) => 
      r.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

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

  const handleSaveAndPreview = async () => {
    if (!customerName || items.some(i => !i.description || i.unitPrice < 0)) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please provide customer name and item details." });
      return;
    }

    setIsGenerating(true);
    try {
      if (db) {
        await addDoc(collection(db, "receipts"), {
          type: docType,
          receiptNumber: docNumber,
          customerName,
          customerPhone,
          customerEmail,
          customerAddress,
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
      toast({ variant: "destructive", title: "System Error", description: "Failed to save document record." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDeleteRecord = async () => {
    if (!db || !deleteId) return;
    try {
      await deleteDoc(doc(db, "receipts", deleteId));
      toast({ title: "Record Deleted", description: "The document has been removed from history." });
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
    setCustomerEmail("");
    setCustomerAddress("");
    setCustomerPin("");
    setPaymentMethod("Cash");
    setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    const prefix = docType === "Invoice" ? "INV" : docType === "Quotation" ? "QTN" : "REC";
    setDocNumber(`${prefix}-${Math.floor(100000 + Math.random() * 900000)}`);
    setShowPrintPreview(false);
  };

  if (showPrintPreview) {
    const headerLabel = docType === "Invoice" ? "INVOICE TO" : docType === "Quotation" ? "QUOTATION FOR" : "RECEIPT TO";
    return (
      <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-8 pb-20">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { margin: 0; size: auto; }
            body { margin: 0; -webkit-print-color-adjust: exact; }
            header, aside, nav, .print-hidden { display: none !important; }
            #printable-doc { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; height: auto !important; }
          }
        `}} />
        
        <div className="flex justify-between items-center print-hidden bg-white p-4 rounded-2xl border shadow-sm sticky top-0 z-50">
          <Button type="button" variant="ghost" onClick={() => setShowPrintPreview(false)} className="rounded-xl font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
          </Button>
          <div className="flex gap-3">
            <Button type="button" onClick={resetForm} variant="outline" className="rounded-xl font-bold border-2">New Entry</Button>
            <Button 
              type="button"
              onClick={handlePrint} 
              className="bg-accent hover:bg-accent/90 rounded-xl font-bold shadow-xl shadow-accent/20 px-8"
            >
              <Printer className="mr-2 h-5 w-5" /> PRINT DOCUMENT
            </Button>
          </div>
        </div>

        <div id="printable-doc" className="bg-white shadow-2xl border-t-[12px] border-accent min-h-[1100px] flex flex-col font-sans">
          {/* Top Banner */}
          <div className="bg-primary text-white p-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-1/3 h-full bg-accent -skew-x-12 translate-x-16 opacity-90"></div>
             <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-6">
                   <div className="h-20 w-20 bg-white rounded-2xl p-1 shadow-2xl">
                      <div className="relative h-full w-full rounded-xl overflow-hidden">
                        <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" />
                      </div>
                   </div>
                   <div>
                      <h1 className="text-3xl font-black tracking-tighter uppercase leading-none mb-1">DOCKWOOD FURNITURES</h1>
                      <p className="text-accent font-black tracking-[0.2em] text-[10px] uppercase">Timber & Bespoke Craftsmanship</p>
                   </div>
                </div>
                <div className="text-right">
                   <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{docType}</h2>
                   <div className="mt-4 flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Document Number</span>
                      <span className="text-xl font-black text-accent">{docNumber}</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="p-12 flex-1 flex flex-col">
             {/* Info Bar */}
             <div className="grid grid-cols-2 gap-12 mb-12 border-b border-slate-100 pb-8">
                <div className="space-y-3">
                   <div className="flex items-start gap-2 text-[13px] font-medium text-slate-600">
                      <MapPin className="h-4 w-4 text-accent mt-0.5" />
                      <span>Bombolulu, Kisimani, Opposite Petrocity, Mombasa</span>
                   </div>
                   <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
                      <Phone className="h-4 w-4 text-accent" />
                      <span>+254 711 662 626</span>
                   </div>
                   <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
                      <Mail className="h-4 w-4 text-accent" />
                      <span>info@dockwoodfurnitures.com</span>
                   </div>
                </div>
                <div className="text-right space-y-1">
                   <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Dockwood KRA PIN</p>
                   <p className="text-primary font-black text-2xl tracking-tighter">{companyPin}</p>
                </div>
             </div>

             {/* Addresses */}
             <div className="grid grid-cols-2 gap-20 mb-16">
                <div className="space-y-4">
                   <Badge className="bg-accent text-white font-black text-[10px] uppercase tracking-widest rounded-sm h-7 px-4">{headerLabel}</Badge>
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black text-primary leading-tight">{customerName}</h3>
                      <div className="text-sm text-slate-500 font-medium space-y-1">
                         {customerAddress && <p>{customerAddress}</p>}
                         {customerPhone && <p>Phone: {customerPhone}</p>}
                         {customerEmail && <p>Email: {customerEmail}</p>}
                         {customerPin && <p className="font-bold text-slate-700 mt-3 border-t pt-2 border-slate-100 inline-block">Customer PIN: {customerPin}</p>}
                      </div>
                   </div>
                </div>
                <div className="text-right pt-4">
                   <div className="space-y-6">
                      <div className="flex flex-col items-end gap-1">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</span>
                         <span className="text-lg font-bold text-primary">{new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Mode</span>
                         <span className="text-sm font-black text-accent uppercase">{paymentMethod}</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Corporate Table */}
             <div className="mb-12 overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full">
                   <thead>
                      <tr className="bg-primary text-white">
                         <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest">Description of Products/Services</th>
                         <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest w-24">Unit Price</th>
                         <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest w-20">Qty</th>
                         <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-widest w-32">Amount (KES)</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {items.map((item, i) => (
                         <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                            <td className="px-6 py-5">
                               <p className="font-bold text-primary text-base leading-tight">{item.description}</p>
                            </td>
                            <td className="px-6 py-5 text-center text-slate-600 font-semibold">{item.unitPrice.toLocaleString()}</td>
                            <td className="px-6 py-5 text-center text-slate-600 font-black">{item.quantity}</td>
                            <td className="px-6 py-5 text-right font-black text-primary">{item.total.toLocaleString()}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             {/* Final Totals Section */}
             <div className="mt-auto pt-8 border-t-2 border-slate-100">
                <div className="grid grid-cols-12 gap-12">
                   <div className="col-span-7 space-y-6">
                      <div className="space-y-3">
                         <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-accent" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Terms & Conditions</span>
                         </div>
                         <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-md italic">
                            {fixedTerms}
                         </p>
                      </div>
                      <div className="pt-8">
                         <p className="text-xl font-black text-primary opacity-20 uppercase tracking-widest">Dockwood Furnitures Ltd</p>
                      </div>
                   </div>
                   <div className="col-span-5 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                         <span>Sub-Total:</span>
                         <span className="text-slate-700">KES {vatableAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                         <span>VAT (16%):</span>
                         <span className="text-slate-700">KES {vatAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between items-center pt-6 border-t-4 border-slate-900 mt-4">
                         <span className="text-sm font-black text-primary uppercase tracking-widest">Total Amount</span>
                         <span className="text-4xl font-black text-accent tracking-tighter">KES {totalAmount.toLocaleString()}</span>
                      </div>
                      
                      <div className="pt-16 text-right">
                         <div className="inline-block w-48 border-b-2 border-slate-200 mb-2"></div>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Authorize Official Sign</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Solid Bottom Banner */}
          <div className="bg-primary h-14 flex items-center justify-center">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Quality Woodwork That Lasts a Lifetime</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-black text-primary tracking-tight">Billing & Documents</h1>
          <p className="text-muted-foreground font-medium">Create and manage corporate records for your clients.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-white border shadow-sm rounded-2xl">
           {(["Invoice", "Receipt", "Quotation"] as DocType[]).map((type) => (
             <Button
               key={type}
               variant="ghost"
               onClick={() => setDocType(type)}
               className={cn(
                 "rounded-xl h-11 px-8 text-[11px] font-black transition-all",
                 docType === type ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-muted-foreground hover:bg-slate-50"
               )}
             >
               {type.toUpperCase()}
             </Button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 pb-6 border-b">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 rounded-xl bg-primary text-white">
                    <User className="h-5 w-5" />
                 </div>
                 <CardTitle className="text-lg font-bold">Client Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-primary/80">Customer Name / Company</Label>
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
                    placeholder="e.g. 0711 000 000" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-12 rounded-2xl bg-slate-50 border-none shadow-inner"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-primary/80">Email Address</Label>
                  <Input 
                    type="email"
                    placeholder="client@mail.com" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="h-12 rounded-2xl bg-slate-50 border-none shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary/80">Physical Location</Label>
                  <Input 
                    placeholder="e.g. Nyali, Mombasa" 
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="h-12 rounded-2xl bg-slate-50 border-none shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary/80">Client PIN (Optional)</Label>
                  <Input 
                    placeholder="e.g. A0123..." 
                    value={customerPin}
                    onChange={(e) => setCustomerPin(e.target.value)}
                    className="h-12 rounded-2xl bg-slate-50 border-none shadow-inner uppercase"
                  />
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
                 <CardTitle className="text-lg font-bold">Line Items</CardTitle>
              </div>
              <Button type="button" onClick={addItem} variant="outline" className="rounded-xl h-10 px-6 text-[11px] font-black border-accent text-accent hover:bg-accent hover:text-white">
                 <Plus className="mr-2 h-4 w-4" /> ADD ITEM
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-muted-foreground border-b">
                  <tr>
                    <th className="px-8 py-5 text-left">Description</th>
                    <th className="px-4 py-5 text-center">Qty</th>
                    <th className="px-4 py-5 text-right">Unit Price</th>
                    <th className="px-8 py-5 text-right w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, index) => (
                    <tr key={index} className="group">
                      <td className="px-8 py-6">
                        <Input 
                          placeholder="What is the item?" 
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="h-12 rounded-xl bg-slate-50/50 border-none font-bold"
                        />
                      </td>
                      <td className="px-4 py-6 w-24">
                        <Input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Math.max(1, Number(e.target.value)))}
                          className="h-12 rounded-xl text-center bg-slate-50/50 border-none font-bold"
                        />
                      </td>
                      <td className="px-4 py-6 w-44">
                        <Input 
                          type="number"
                          placeholder="Price"
                          value={item.unitPrice || ""}
                          onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                          className="h-12 rounded-xl text-right bg-slate-50/50 border-none font-bold"
                        />
                      </td>
                      <td className="px-8 py-6 text-right">
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

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white opacity-80 grayscale-[0.5]">
            <CardHeader className="bg-slate-50/50 py-4 border-b">
               <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-accent" />
                  <CardTitle className="text-xs font-bold uppercase tracking-widest">Document Terms (Standard)</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-8">
               <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-xs font-medium text-slate-500 italic leading-relaxed">
                     {fixedTerms}
                  </p>
                  <p className="text-[10px] mt-4 font-black text-slate-400 uppercase tracking-widest">Note: Terms are fixed for all corporate documents.</p>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl bg-primary text-white rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Hash className="h-32 w-32" />
            </div>
            <CardHeader>
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">{docType} Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-10">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Payable Grand Total</p>
                <div className="text-5xl font-black tracking-tighter">
                   KES {totalAmount.toLocaleString()}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                 <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                    <span className="opacity-40">Payment Mode</span>
                    <Badge className="bg-accent/20 text-accent hover:bg-accent/20 border-none">{paymentMethod}</Badge>
                 </div>
                 <div className="flex flex-col gap-2 mt-4">
                    <Label className="text-[10px] font-black text-white/40 uppercase">Select Mode</Label>
                    <div className="grid grid-cols-2 gap-2">
                       {['Cash', 'M-Pesa', 'Bank', 'Cheque'].map(m => (
                          <Button 
                            key={m}
                            type="button"
                            variant="ghost"
                            onClick={() => setPaymentMethod(m)}
                            className={cn(
                               "h-9 text-[10px] font-black rounded-lg transition-all",
                               paymentMethod === m ? "bg-accent text-white" : "bg-white/5 text-white/50"
                            )}
                          >
                             {m.toUpperCase()}
                          </Button>
                       ))}
                    </div>
                 </div>
              </div>

              <Button 
                type="button"
                onClick={handleSaveAndPreview}
                className="w-full h-16 bg-accent hover:bg-accent/90 text-white font-black rounded-2xl shadow-xl shadow-accent/20 text-xl transition-all active:scale-95"
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Printer className="mr-2" />}
                {isGenerating ? "PREPARING..." : "GENERATE DOC"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 p-6">
               <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-accent" />
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest">Recent Sales</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y max-h-[500px] overflow-y-auto">
                  {historyLoading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
                  ) : filteredHistory.length > 0 ? filteredHistory.map((rec: any) => (
                    <div key={rec.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => {
                      setDocType(rec.type || "Invoice");
                      setCustomerName(rec.customerName);
                      setCustomerPhone(rec.customerPhone || "");
                      setCustomerEmail(rec.customerEmail || "");
                      setCustomerAddress(rec.customerAddress || "");
                      setCustomerPin(rec.customerPin || "");
                      setPaymentMethod(rec.paymentMethod || "Cash");
                      setItems(rec.items);
                      setDocNumber(rec.receiptNumber);
                      setShowPrintPreview(true);
                    }}>
                       <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                             <span className={cn(
                               "text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase",
                               rec.type === 'Quotation' ? "bg-blue-100 text-blue-700" : 
                               rec.type === 'Invoice' ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                             )}>
                               {rec.type || 'Doc'}
                             </span>
                             <p className="font-black text-primary truncate text-sm uppercase">{rec.customerName}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono font-bold">{rec.receiptNumber}</p>
                       </div>
                       <div className="text-right flex items-center gap-3">
                          <div className="text-sm font-black text-primary">K {rec.totalAmount?.toLocaleString()}</div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-200 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <div className="p-20 text-center text-[10px] text-muted-foreground italic font-bold uppercase tracking-widest">No transaction history.</div>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold text-primary text-xl">Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              This document will be permanently removed from your history. This action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRecord}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
