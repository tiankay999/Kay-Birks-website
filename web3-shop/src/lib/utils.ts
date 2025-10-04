import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency: string = "GBP"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(num);
}

export function formatCrypto(amount: string | number, symbol: string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${num.toFixed(6)} ${symbol}`;
}

export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return "";
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

export function calculateTax(subtotal: number, taxRate: number = 0.2): number {
  return subtotal * taxRate;
}

export function calculateShipping(subtotal: number, country: string = "GB"): number {
  if (subtotal >= 100) return 0; // Free shipping over £100
  return country === "GB" ? 5.99 : 12.99;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
