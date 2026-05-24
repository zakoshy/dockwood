
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  History,
  Mail,
  MapPin,
  Globe,
  Hash,
  Info,
  Building
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

  // Form States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPin, setCustomerPin] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [items, setItems] = useState<ReceiptItem[]>([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const [docNumber, setDocNumber] = useState("");
  const [terms, setTerms] = useState("Goods once sold are not returnable. Thank you for your business!");
  
  const companyPin = "P051234567A"; 

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
    if (!customerName || items.some(i => !i.description || i.unitPrice <= 0)) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please provide customer name and item details." });
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
          terms,
          createdAt: serverTimestamp(),
        });
      }
      setShowPrintPreview(true);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save record." });
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
      toast({ title: "Record Removed", description: "The document has been deleted from history." });
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
    return (
      <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-8 pb-20">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { margin: 0; size: auto; }
            body { margin: 0; -webkit-print-color-adjust: exact; }
            header, aside, .print-hidden { display: none !important; }
            #printable-doc { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; height: auto !important; }
          }
        `}} />
        
        <div className="flex justify-between items-center print-hidden bg-white p-4 rounded-2xl border shadow-sm sticky top-0 z-50">
          <Button type="button" variant="ghost" onClick={() => setShowPrintPreview(false)} className="rounded-xl font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Editor
          </Button>
          <div className="flex gap-3">
            <Button type="button" onClick={resetForm} variant="outline" className="rounded-xl font-bold border-2">New Document</Button>
            <Button 
              type="button"
              onClick={handlePrint} 
              className="bg-accent hover:bg-accent/90 rounded-xl font-bold shadow-xl shadow-accent/20 px-8"
            >
              <Printer className="mr-2 h-5 w-5" /> PRINT {docType.toUpperCase()}
            </Button>
          </div>
        </div>

        <div id="printable-doc" className="bg-white shadow-2xl rounded-none border-t-8 border-accent overflow-hidden print:shadow-none print:border-none min-h-[1100px] flex flex-col">
          {/* Corporate Header Section */}
          <div className="bg-[#1e293b] text-white p-12 relative">
             <div className="absolute top-0 right-0 w-1/3 h-full bg-accent -skew-x-12 translate-x-16"></div>
             <div className="relative z-10 flex justify-between items-center">
                <div className="flex items-center gap-6">
                   <div className="h-20 w-20 bg-white rounded-2xl p-1 shadow-2xl">
                      <div className="relative h-full w-full rounded-xl overflow-hidden">
                        <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" />
                      </div>
                   </div>
                   <div>
                      <h1 className="text-3xl font-black tracking-tight leading-none mb-1">DOCKWOOD FURNITURES</h1>
                      <p className="text-accent font-bold tracking-widest text-xs uppercase opacity-90">Premium Timber & Bespoke Craftsmanship</p>
                   </div>
                </div>
                <div className="text-right">
                   <h2 className="text-6xl font-black text-white/10 uppercase tracking-tighter leading-none mb-2">{docType}</h2>
                </div>
             </div>
          </div>

          <div className="p-12 flex-1">
             {/* Company Contact Info */}
             <div className="grid grid-cols-2 gap-12 mb-12 border-b pb-8 border-slate-100">
                <div className="space-y-3">
                   <div className="flex items-start gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4 text-accent mt-0.5" />
                      <span>Bombolulu, Kisimani, Opposite Petrocity, Mombasa</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Phone className="h-4 w-4 text-accent" />
                      <span>+254 711 662 626</span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Mail className="h-4 w-4 text-accent" />
                      <span>info@dockwoodfurnitures.com</span>
                   </div>
                </div>
                <div className="text-right space-y-1">
                   <p className="text-xs font-black uppercase text-slate-300">Dockwood PIN:</p>
                   <p className="text-primary font-black text-xl tracking-wider">{companyPin}</p>
                </div>
             </div>

             {/* Billing Addresses */}
             <div className="grid grid-cols-2 gap-20 mb-16">
                <div>
                   <Badge className="bg-accent text-white font-bold mb-4 rounded-md h-7 px-4">{docType === "Quotation" ? "QUOTATION FOR" : "INVOICE TO"}</Badge>
                   <h3 className="text-2xl font-black text-primary mb-2">{customerName}</h3>
                   <div className="text-sm text-slate-500 space-y-1 font-medium">
                      {customerAddress && <p>{customerAddress}</p>}
                      {customerPhone && <p>Phone: {customerPhone}</p>}
                      {customerEmail && <p>Email: {customerEmail}</p>}
                      {customerPin && <p className="font-bold text-slate-600 mt-2">Customer PIN: {customerPin}</p>}
                   </div>
                </div>
                <div className="text-right">
                   <div className="space-y-4">
                      <div className="flex justify-end items-center gap-4">
                         <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{docType} No:</span>
                         <span className="text-lg font-black text-accent">{docNumber}</span>
                      </div>
                      <div className="flex justify-end items-center gap-4">
                         <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Date:</span>
                         <span className="text-base font-bold text-primary">{new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-100">
                         <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Payment Method:</span>
                         <span className="text-sm font-black text-primary uppercase">{paymentMethod}</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Items Table */}
             <div className="mb-12 overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full">
                   <thead>
                      <tr className="bg-[#1e293b] text-white">
                         <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Product Description</th>
                         <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest w-24">Price</th>
                         <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest w-20">QTY</th>
                         <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest w-32">Total</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {items.map((item, i) => (
                         <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                            <td className="px-6 py-5">
                               <p className="font-bold text-primary text-base">{item.description}</p>
                            </td>
                            <td className="px-6 py-5 text-center text-slate-600 font-medium">{item.unitPrice.toLocaleString()}</td>
                            <td className="px-6 py-5 text-center text-slate-600 font-bold">{item.quantity}</td>
                            <td className="px-6 py-5 text-right font-black text-primary">{item.total.toLocaleString()}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             {/* Footer Totals & Terms */}
             <div className="grid grid-cols-12 gap-12 pt-8">
                <div className="col-span-7">
                   <div className="mb-8">
                      <Badge className="bg-accent text-white font-bold mb-3 rounded-md h-6 px-3">Terms & Conditions</Badge>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                         {terms}
                      </p>
                   </div>
                   <div className="pt-12">
                      <p className="text-lg font-black text-primary italic">Thanks for Your Business</p>
                   </div>
                </div>
                <div className="col-span-5 space-y-3">
                   <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                      <span>Sub Total:</span>
                      <span className="text-slate-600">KES {vatableAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                      <span>Vat (16%):</span>
                      <span className="text-slate-600">KES {vatAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                   </div>
                   <div className="flex justify-between items-center pt-6 border-t-4 border-slate-100 mt-4">
                      <span className="text-sm font-black text-primary uppercase tracking-widest">Grand Total:</span>
                      <span className="text-3xl font-black text-accent tracking-tighter">KES {totalAmount.toLocaleString()}</span>
                   </div>
                   
                   <div className="pt-12 text-right">
                      <div className="inline-block w-48 border-b-2 border-slate-200 mb-2"></div>
                      <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Authorize Signature</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Solid Bottom Banner */}
          <div className="bg-[#1e293b] h-12 flex items-center justify-center">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">© {new Date().getFullYear()} DOCKWOOD FURNITURES KENYA</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-headline font-black text-primary tracking-tight">Billing Center</h1>
          <p className="text-muted-foreground font-medium">Generate corporate Invoices, Receipts & Quotations.</p>
        </div>
        <div className="flex gap-2 p-1 bg-white border rounded-2xl shadow-sm">
           {(["Invoice", "Receipt", "Quotation"] as DocType[]).map((type) => (
             <Button
               key={type}
               variant="ghost"
               onClick={() => setDocType(type)}
               className={cn(
                 "rounded-xl h-10 px-6 text-xs font-black transition-all",
                 docType === type ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-muted-foreground hover:bg-slate-50"
               )}
             >
               {type.toUpperCase()}
             </Button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 pb-6 border-b">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 rounded-xl bg-primary text-white">
                    <User className="h-5 w-5" />
                 </div>
                 <CardTitle className="text-lg font-bold">{docType === "Quotation" ? "Client Quote Information" : "Customer Billing Details"}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-primary/80">Full Customer/Company Name</Label>
                  <Input 
                    placeholder="e.g. Samuel Maina or Tech Solutions Ltd" 
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-primary/80">Email Address</Label>
                  <Input 
                    type="email"
                    placeholder="customer@example.com" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="h-12 rounded-2xl bg-slate-50 border-none shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary/80">Physical Address</Label>
                  <Input 
                    placeholder="e.g. Nyali, Mombasa" 
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="h-12 rounded-2xl bg-slate-50 border-none shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary/80">Customer KRA PIN (Optional)</Label>
                  <Input 
                    placeholder="e.g. A012345678Z" 
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
              <Button type="button" onClick={addItem} variant="outline" className="rounded-xl h-9 text-xs font-black border-accent text-accent hover:bg-accent hover:text-white">
                 <Plus className="mr-2 h-3.5 w-3.5" /> ADD ITEM
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-muted-foreground border-b">
                  <tr>
                    <th className="px-8 py-4 text-left">Product / Service Description</th>
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
                          placeholder="What is the customer buying?" 
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

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 pb-4 border-b">
               <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-accent" />
                  <CardTitle className="text-sm font-bold">Terms, Conditions & Payment Info</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <Label className="font-bold">Payment Mode</Label>
                     <div className="flex gap-2">
                        {['Cash', 'M-Pesa', 'Bank'].map(m => (
                           <Button 
                              key={m}
                              variant="ghost" 
                              onClick={() => setPaymentMethod(m)}
                              className={cn(
                                 "flex-1 rounded-xl h-12 font-bold",
                                 paymentMethod === m ? "bg-primary text-white" : "bg-slate-50"
                              )}
                           >
                              {m}
                           </Button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-2">
                     <Label className="font-bold">Terms & Conditions</Label>
                     <Textarea 
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        placeholder="e.g. Valid for 30 days..."
                        className="rounded-xl h-12 min-h-[48px] bg-slate-50 border-none shadow-inner"
                     />
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl bg-primary text-white rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Hash className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-headline font-bold uppercase tracking-widest text-primary-foreground/50 text-[11px]">{docType} Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-1">
                <p className="text-xs font-bold text-primary-foreground/60 uppercase tracking-widest">Grand Total (KES)</p>
                <div className="text-5xl font-black tracking-tighter">
                   {totalAmount.toLocaleString()}
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-white/10">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="opacity-50">Document #</span>
                    <span className="text-accent">{docNumber}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="opacity-50">VATable Amount</span>
                    <span>KES {vatableAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="opacity-50">VAT (16%)</span>
                    <span>KES {vatAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                 </div>
              </div>

              <Button 
                type="button"
                onClick={handleSaveAndPreview}
                className="w-full h-14 bg-accent hover:bg-accent/90 text-white font-black rounded-2xl shadow-xl shadow-accent/20 text-lg transition-transform active:scale-95"
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Printer className="mr-2" />}
                {isGenerating ? "PREPARING..." : `GENERATE ${docType.toUpperCase()}`}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 p-6">
               <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-accent" />
                  <CardTitle className="text-xs font-bold uppercase tracking-widest">Recent Documents</CardTitle>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y max-h-[550px] overflow-y-auto">
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
                      setTerms(rec.terms || "");
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
                          <p className="text-[10px] text-muted-foreground font-mono font-bold">{rec.receiptNumber} • {rec.createdAt?.toDate ? rec.createdAt.toDate().toLocaleDateString() : 'Just now'}</p>
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
                    <div className="p-20 text-center text-[10px] text-muted-foreground italic font-bold uppercase tracking-widest">No document history.</div>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold text-primary text-xl">Delete Document Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this record from history? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRecord}
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
