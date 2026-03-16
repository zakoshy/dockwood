
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseProvider } from "@/firebase/provider";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Best Timber and Furniture in Mombasa | Dockwood Furnitures",
  description: "Dockwood Furnitures is a trusted timber and furniture supplier in Mombasa offering beds, chairs, tables and high-quality timber products with same-day delivery in Bombolulu and surrounding areas.",
  keywords: "timber suppliers in Mombasa, furniture shops in Mombasa, beds for sale in Mombasa, wood furniture Mombasa, timber Kenya, buy beds chairs tables Mombasa",
  openGraph: {
    title: "Best Timber and Furniture in Mombasa | Dockwood Furnitures",
    description: "Quality timber and furniture with same-day delivery in Mombasa.",
    url: 'https://dockwoodfurnitures.com',
    siteName: "Dockwood Furnitures",
    locale: 'en_KE',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen flex flex-col">
        <FirebaseProvider>
          {children}
          <Toaster />
          <Analytics />
        </FirebaseProvider>
      </body>
    </html>
  );
}
