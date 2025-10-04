"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { truncateAddress } from "@/lib/utils";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const txHash = searchParams.get("tx");
  const orderId = searchParams.get("orderId");

  const explorerUrl = `https://sepolia.etherscan.io/tx/${txHash}`;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Order Number</h3>
              <p className="font-mono text-sm">{orderId}</p>
            </div>

            {txHash && (
              <div>
                <h3 className="font-semibold mb-2">Transaction Hash</h3>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm">{truncateAddress(txHash, 8)}</p>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">What's Next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• You will receive an email confirmation shortly</li>
                <li>• Your order will be processed within 24 hours</li>
                <li>• Tracking information will be sent to your email</li>
                <li>• Digital products are available in your account</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Link href="/shop" className="flex-1">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
              <Link href={`/orders/${orderId}`} className="flex-1">
                <Button className="w-full">View Order</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
