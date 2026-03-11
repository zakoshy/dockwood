"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, FileText, Download } from "lucide-react";

const MOCK_SALES = [
  { id: "S101", product: "Mahogany Bed", qty: 1, date: "2024-03-20 14:30", stockAfter: 11, total: "KES 45,000" },
  { id: "S102", product: "Cypress Timber", qty: 20, date: "2024-03-19 11:20", stockAfter: 25, total: "KES 18,000" },
  { id: "S103", product: "Kitchen Table", qty: 1, date: "2024-03-19 09:15", stockAfter: 7, total: "KES 22,500" },
  { id: "S104", product: "Dining Chairs (Set)", qty: 6, date: "2024-03-18 16:45", stockAfter: 9, total: "KES 36,000" },
];

export default function AdminSales() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-10 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div>
              <h1 className="text-3xl font-headline font-bold text-primary">Sales History</h1>
              <p className="text-muted-foreground">Tracking revenue and stock adjustments.</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none">
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button className="bg-primary flex-1 md:flex-none">
                <FileText className="mr-2 h-4 w-4" /> Record New Sale
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Filter sales by product..." className="pl-10 h-10" />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">March 2024</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-primary uppercase bg-slate-100">
                    <tr>
                      <th className="px-6 py-4">Sale ID</th>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4">Qty Sold</th>
                      <th className="px-6 py-4">Sale Date</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4">Stock Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_SALES.map((sale) => (
                      <tr key={sale.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium">{sale.id}</td>
                        <td className="px-6 py-4 font-bold text-primary">{sale.product}</td>
                        <td className="px-6 py-4">{sale.qty}</td>
                        <td className="px-6 py-4 text-muted-foreground">{sale.date}</td>
                        <td className="px-6 py-4 font-bold text-accent">{sale.total}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            sale.stockAfter < 5 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {sale.stockAfter} units left
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}