"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertCircle, Eye, EyeOff, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Forgot Password States
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!auth) throw new Error("Auth not initialized");
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome Back",
        description: "Authenticated successfully. Redirecting to dashboard...",
      });
      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !resetEmail) return;

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: "Reset Link Sent",
        description: `A password reset link has been sent to ${resetEmail}.`,
      });
      setIsResetDialogOpen(false);
      setResetEmail("");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: err.message || "Could not send reset email.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="mb-8">
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary transition-colors font-bold">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Main Site
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden rounded-3xl">
        <CardHeader className="space-y-2 text-center bg-white pb-8 pt-10">
          <div className="flex justify-center mb-6">
            <div className="relative h-28 w-28 rounded-3xl overflow-hidden shadow-2xl border-4 border-white p-1 bg-white">
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image 
                  src="/logo.jpeg" 
                  alt="Dockwood Furnitures Logo" 
                  fill 
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-bold text-primary tracking-tight">Admin Portal</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Secure management for Dockwood Furnitures.
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white px-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="rounded-2xl border-none bg-red-50 text-red-900 shadow-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-bold">Login Error</AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-primary/80 ml-1">Admin Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@dockwood.com" 
                required 
                className="h-12 rounded-xl bg-slate-50 border-none shadow-inner focus-visible:ring-accent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="password" title="Enter your password"  className="font-bold text-primary/80 ml-1">Secure Password</Label>
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="px-0 h-auto text-[10px] uppercase tracking-wider text-accent font-black hover:no-underline opacity-70 hover:opacity-100">
                      Reset?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl sm:max-w-md p-8 border-none shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold font-headline text-primary">Reset Access</DialogTitle>
                      <DialogDescription className="text-muted-foreground pt-2">
                        Enter your admin email address and we'll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleResetPassword} className="space-y-4 pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email" className="font-bold">Admin Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="admin@dockwood.com"
                          required
                          className="h-12 rounded-2xl bg-slate-50 border-none"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                      </div>
                      <DialogFooter className="pt-4">
                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-primary font-bold rounded-2xl shadow-lg"
                          disabled={resetLoading}
                        >
                          {resetLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Link
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="h-12 rounded-xl bg-slate-50 border-none shadow-inner pr-12 focus-visible:ring-accent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 bg-primary hover:bg-primary/95 font-bold rounded-2xl text-lg shadow-xl mt-4 tracking-tight transition-all active:scale-95"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 justify-center border-t border-slate-100 p-8 bg-slate-50/50 mt-8">
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/50">
            © {new Date().getFullYear()} Dockwood Furnitures
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}