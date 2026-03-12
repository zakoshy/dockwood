
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, FileText, Download, TrendingUp } from "lucide-react";

const MOCK_SALES = [
  { id: "S101", product: "Mahogany Bed", qty: 1, date: "2024-03-20 14:30", total: "KES 45,000" },
  { id: "S102", product: "Cypress Timber", qty: 20, date: "2024-03-19 11:20", total: "KES 18,000" },
  { id: "S103", product: "Kitchen Table", qty: 1, date: "2024-03-19 09:15", total: "KES 22,500" },
  { id: "S104", product: "Dining Chairs (Set)", qty: 6, date: "2024-03-18 16:45", total: "KES 36,000" },
];

export default function AdminSales() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Sales History</h1>
          <p className="text-muted-foreground">Detailed logs of all customer purchases.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <FileText className="mr-2 h-4 w-4" /> New Sale
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-white border-none shadow-lg shadow-primary/20">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-primary-foreground/70 text-sm">Monthly Revenue</span>
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            <div className="text-3xl font-bold">KES 1.2M</div>
            <div className="text-xs text-primary-foreground/50 mt-2">+12% from last month</div>
          </CardContent>
        </Card>
        {/* Add more sales summary cards if needed */}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Filter by product..." className="pl-10 h-10 bg-slate-50 border-none" />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">Select Period</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-primary uppercase bg-slate-100">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_SALES.map((sale) => (
                  <tr key={sale.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{sale.id}</td>
                    <td className="px-6 py-4 font-bold text-primary">{sale.product}</td>
                    <td className="px-6 py-4">{sale.qty}</td>
                    <td className="px-6 py-4 text-muted-foreground">{sale.date}</td>
                    <td className="px-6 py-4 font-bold text-accent">{sale.total}</td>
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
