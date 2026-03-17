
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  LogOut, 
  ChevronRight,
  Menu,
  Loader2,
  BarChart2,
  Warehouse
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const auth = useAuth();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [user, loading, router, isLoginPage]);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
    { name: "Warehouses", href: "/admin/warehouses", icon: Warehouse },
    { name: "Inventory", href: "/admin/products", icon: Package },
    { name: "Sales", href: "/admin/sales", icon: ShoppingCart },
    { name: "Deliveries", href: "/admin/deliveries", icon: Truck },
  ];

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        router.push("/admin/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse font-headline">Checking Authorization...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-primary text-primary-foreground">
      <div className="p-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <span className="text-xl font-headline font-bold">
            Dockwood<span className="text-accent"> Furnitures</span>
          </span>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? "bg-accent text-white" 
                  : "hover:bg-white/10 text-primary-foreground/70 hover:text-white"
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-primary-foreground/50 group-hover:text-white")} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="mb-4 px-4 text-xs text-primary-foreground/50 truncate">
          {user?.email}
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-primary-foreground/70 hover:text-white hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 shadow-xl z-20">
        <SidebarContent />
      </aside>

      <div className="flex-1 lg:pl-64 flex flex-col">
        <header className="lg:hidden h-16 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-30">
          <Link href="/admin" className="text-xl font-headline font-bold text-primary">
            Dockwood<span className="text-accent"> Furnitures</span>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 flex flex-col">
              <SheetHeader className="sr-only">
                <SheetTitle>Admin Navigation</SheetTitle>
              </SheetHeader>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="p-4 md:p-8 lg:p-10 flex-grow animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
