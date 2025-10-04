import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kay Birks Crypto Shop | Premium Birkenstock with Crypto Payments",
  description: "Shop premium Birkenstock sandals and pay with cryptocurrency. Ethereum and USDC accepted.",
  keywords: ["Birkenstock", "crypto payments", "Web3", "Ethereum", "USDC", "online shop"],
  openGraph: {
    title: "Kay Birks Crypto Shop",
    description: "Premium Birkenstock sandals available for purchase with cryptocurrency",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
