
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
  MapPin,
  Hash,
  X,
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
  const companyPin = "A004777295T"; 
  const paybillNumber = "522533";
  const accountNumber = "8040733";
  const fixedTerms = "1. Goods once sold are not returnable. 2. Payments should be made via M-Pesa Paybill or Bank. 3. This is a computer-generated document valid without a physical stamp.";

  // Form States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPin, setCustomerPin] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("M-Pesa");
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
    if (!customerName || items.some(i => !i.description)) {
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
    setPaymentMethod("M-Pesa");
    setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    const prefix = docType === "Invoice" ? "INV" : docType === "Quotation" ? "QTN" : "REC";
    setDocNumber(`${prefix}-${Math.floor(100000 + Math.random() * 900000)}`);
    setShowPrintPreview(false);
  };

  const getRecipientLabel = () => {
    if (docType === "Invoice") return "Invoice To";
    if (docType === "Quotation") return "Quotation For";
    return "Receipt To";
  };

  // Generate empty rows for a realistic look
  const minRows = 8;
  const emptyRows = Math.max(0, minRows - items.length);

  if (showPrintPreview) {
    return (
      <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-8 pb-20">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { margin: 0; size: auto; }
            body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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

        <div id="printable-doc" className="bg-white shadow-none min-h-[1100px] flex flex-col font-sans">
          {/* Header Section */}
          <div className="bg-[#2d4b38] text-white p-8 relative overflow-hidden flex justify-between items-center h-40">
            <div className="relative z-10 flex items-center gap-4">
              <div className="h-14 w-14 bg-white rounded-full p-1 shadow-lg flex items-center justify-center">
                 <div className="relative h-10 w-10">
                   <Image src="/logo.jpeg" alt="Logo" fill className="object-contain" />
                 </div>
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight">DOCKWOOD FURNITURES</h1>
                <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Premium Timber & Craftsmanship</p>
              </div>
            </div>
            
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#e15d2a] skew-x-[-20deg] translate-x-12 z-0"></div>
            
            <div className="relative z-10 text-right pr-6">
              <h2 className="text-5xl font-black uppercase tracking-tighter text-white/90">{docType}</h2>
            </div>
          </div>

          {/* Contact Bar */}
          <div className="bg-white px-8 py-4 border-b flex justify-between items-center">
            <div className="flex gap-8">
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                  <MapPin className="h-3 w-3 text-[#e15d2a]" />
                  <span>Bombolulu, Mombasa, Kenya</span>
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                  <Phone className="h-3 w-3 text-[#e15d2a]" />
                  <span>+254 711 662 626</span>
               </div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              PIN: <span className="text-[#2d4b38]">{companyPin}</span>
            </div>
          </div>

          <div className="p-8 flex-grow">
            {/* Bill To & Meta Info */}
            <div className="grid grid-cols-2 gap-10 mb-8">
              <div className="space-y-3">
                <Badge className="bg-[#e15d2a] text-white uppercase font-black text-[9px] tracking-widest rounded-sm py-0.5 px-3 border-none">{getRecipientLabel()}</Badge>
                <div className="space-y-0.5">
                   <h3 className="text-lg font-black text-[#2d4b38] uppercase">{customerName}</h3>
                   <div className="text-[11px] text-slate-500 font-medium space-y-0.5">
                      <p>Phone: {customerPhone}</p>
                      <p>Email: {customerEmail}</p>
                      <p>Address: {customerAddress}</p>
                      {customerPin && <p className="font-bold text-slate-800">PIN: {customerPin}</p>}
                   </div>
                </div>
              </div>
              <div className="text-right space-y-3">
                <div className="space-y-0.5">
                  <div className="flex justify-end items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{docType} No:</span>
                    <span className="text-[#2d4b38] font-black text-sm">{docNumber}</span>
                  </div>
                  <div className="flex justify-end items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date:</span>
                    <span className="text-[#2d4b38] font-black text-sm">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
                
                <Badge className="bg-[#e15d2a] text-white uppercase font-black text-[9px] tracking-widest rounded-sm py-0.5 px-3 border-none">Payment Info</Badge>
                <div className="text-[11px] text-slate-500 font-medium space-y-0.5 mt-0.5">
                  <p>Mode: <span className="font-bold text-[#2d4b38]">{paymentMethod}</span></p>
                  <p>Paybill: <span className="font-bold text-[#e15d2a]">{paybillNumber}</span></p>
                  <p>Account: <span className="font-bold text-[#2d4b38]">{accountNumber}</span></p>
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div className="mb-8 rounded-sm overflow-hidden border border-slate-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#2d4b38] text-white">
                    <th className="px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest w-10 border-r border-white/10">#</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/10">Description</th>
                    <th className="px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest w-24 border-r border-white/10">Unit Price</th>
                    <th className="px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest w-16 border-r border-white/10">QTY</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-4 text-center text-slate-600 font-bold text-[11px] border-r border-slate-100">{i + 1}</td>
                      <td className="px-4 py-4 border-r border-slate-100">
                         <p className="font-bold text-[#2d4b38] text-[12px]">{item.description}</p>
                      </td>
                      <td className="px-3 py-4 text-center text-slate-600 font-semibold text-[11px] border-r border-slate-100">Ksh {item.unitPrice.toLocaleString()}</td>
                      <td className="px-3 py-4 text-center text-slate-600 font-black text-[11px] border-r border-slate-100">{item.quantity}</td>
                      <td className="px-4 py-4 text-right font-black text-[#2d4b38] text-[12px]">Ksh {item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                  {Array.from({ length: emptyRows }).map((_, i) => (
                    <tr key={`empty-${i}`} className="h-10">
                      <td className="border-r border-slate-100"></td>
                      <td className="border-r border-slate-100"></td>
                      <td className="border-r border-slate-100"></td>
                      <td className="border-r border-slate-100"></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-[#2d4b38]">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-[9px] font-black uppercase text-slate-500 tracking-widest">Sub Total</td>
                    <td colSpan={2} className="px-4 py-2 text-right font-bold text-[#2d4b38] border-l border-slate-100 text-[12px]">Ksh {calculateSubtotal().toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-[9px] font-black uppercase text-slate-500 tracking-widest">VAT (16%)</td>
                    <td colSpan={2} className="px-4 py-2 text-right font-bold text-[#2d4b38] border-l border-slate-100 text-[12px]">Ksh {vatAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td colSpan={3} className="px-4 py-3 text-right text-[10px] font-black uppercase text-[#2d4b38] tracking-widest">Grand Total</td>
                    <td colSpan={2} className="px-4 py-3 text-right font-black text-xl text-[#e15d2a] tracking-tighter border-l border-slate-100">Ksh {totalAmount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Footer Elements */}
            <div className="mt-12 grid grid-cols-2 gap-10 items-end">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Badge className="bg-[#e15d2a] text-white uppercase font-black text-[9px] tracking-widest rounded-sm py-0.5 px-3 border-none">Terms & Condition</Badge>
                  <p className="text-[9px] text-slate-400 font-medium leading-relaxed max-w-xs uppercase">
                    {fixedTerms}
                  </p>
                </div>
                <h4 className="text-md font-black text-[#2d4b38] uppercase italic opacity-40">Thanks For Your Business</h4>
              </div>
              <div className="text-right space-y-2">
                 <div className="inline-block w-40 border-b-2 border-slate-300"></div>
                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest pr-4">Authorize signature</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2d4b38] h-10 flex items-center justify-center mt-6">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30">DOCKWOOD FURNITURES LIMITED - QUALITY GUARANTEED</p>
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
                 <CardTitle className="text-lg font-bold">Document Items</CardTitle>
              </div>
              <Button type="button" onClick={addItem} variant="outline" className="rounded-xl h-10 px-6 text-[11px] font-black border-accent text-accent hover:bg-accent hover:text-white">
                 <Plus className="mr-2 h-4 w-4" /> ADD LINE
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-5 text-center border-r w-16">#</th>
                    <th className="px-8 py-5 text-left border-r">Item Description</th>
                    <th className="px-4 py-5 text-center border-r">Qty</th>
                    <th className="px-4 py-5 text-right border-r">Unit Price</th>
                    <th className="px-8 py-5 text-right w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, index) => (
                    <tr key={index} className="group">
                      <td className="px-4 py-6 text-center border-r font-black text-muted-foreground">{index + 1}</td>
                      <td className="px-8 py-6 border-r">
                        <Input 
                          placeholder="Product/Service name" 
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="h-12 rounded-xl bg-slate-50/50 border-none font-bold"
                        />
                      </td>
                      <td className="px-4 py-6 w-24 border-r">
                        <Input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Math.max(1, Number(e.target.value)))}
                          className="h-12 rounded-xl text-center bg-slate-50/50 border-none font-bold"
                        />
                      </td>
                      <td className="px-4 py-6 w-44 border-r">
                        <Input 
                          type="number"
                          placeholder="0"
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
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Grand Total</p>
                <div className="text-5xl font-black tracking-tighter">
                   Ksh {totalAmount.toLocaleString()}
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
                       {['M-Pesa', 'Cash', 'Bank', 'Cheque'].map(m => (
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
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest">Recent Documents</CardTitle>
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
                      setPaymentMethod(rec.paymentMethod || "M-Pesa");
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
                          <div className="text-sm font-black text-primary">Ksh {rec.totalAmount?.toLocaleString()}</div>
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
