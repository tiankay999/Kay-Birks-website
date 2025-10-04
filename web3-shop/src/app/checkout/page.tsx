"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/store";
import { formatCurrency, formatCrypto, generateOrderNumber } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { PAYMENT_PROCESSOR_ABI, ERC20_ABI } from "@/lib/contract-abi";
import { Loader2, Wallet, CreditCard } from "lucide-react";
import { convertFiatToCrypto } from "@/lib/price-oracle";

const PAYMENT_CONTRACT = process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS as `0x${string}`;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS as `0x${string}`;

type PaymentMethod = "ETH" | "USDC";

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { items, clearCart, getTotal } = useCartStore();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ETH");
  const [cryptoAmount, setCryptoAmount] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [orderId, setOrderId] = useState("");

  const subtotal = getTotal();
  const shipping = subtotal >= 100 ? 0 : 5.99;
  const tax = subtotal * 0.2;
  const total = subtotal + shipping + tax;

  const calculateCryptoAmount = async () => {
    setIsCalculating(true);
    try {
      const amount = await convertFiatToCrypto(total, "GBP", paymentMethod);
      if (amount) {
        setCryptoAmount(amount);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch crypto price. Using mock rate.",
          variant: "destructive",
        });
        // Mock conversion for development
        const mockRate = paymentMethod === "ETH" ? 0.0005 : 1.2;
        setCryptoAmount((total * mockRate).toFixed(6));
      }
    } catch (error) {
      console.error("Price calculation error:", error);
      const mockRate = paymentMethod === "ETH" ? 0.0005 : 1.2;
      setCryptoAmount((total * mockRate).toFixed(6));
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePayment = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!cryptoAmount) {
      await calculateCryptoAmount();
      return;
    }

    const newOrderId = generateOrderNumber();
    setOrderId(newOrderId);

    try {
      // Create order in database first
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items,
          subtotal,
          tax,
          shippingCost: shipping,
          total,
          cryptoAmount,
          cryptoCurrency: paymentMethod,
          walletAddress: address,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const order = await orderResponse.json();

      // Execute blockchain payment
      if (paymentMethod === "ETH") {
        writeContract({
          address: PAYMENT_CONTRACT,
          abi: PAYMENT_PROCESSOR_ABI,
          functionName: "payWithETH",
          args: [order.orderNumber],
          value: parseEther(cryptoAmount),
        });
      } else {
        // For USDC, need to approve first then pay
        const usdcAmount = parseUnits(cryptoAmount, 6); // USDC has 6 decimals
        
        writeContract({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [PAYMENT_CONTRACT, usdcAmount],
        });

        // After approval, call payWithToken
        setTimeout(() => {
          writeContract({
            address: PAYMENT_CONTRACT,
            abi: PAYMENT_PROCESSOR_ABI,
            functionName: "payWithToken",
            args: [order.orderNumber, USDC_ADDRESS, usdcAmount],
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment.",
        variant: "destructive",
      });
    }
  };

  if (isSuccess && hash) {
    clearCart();
    router.push(`/order-confirmation?tx=${hash}&orderId=${orderId}`);
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isConnected ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Connect your wallet to continue with crypto payment
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={paymentMethod === "ETH" ? "default" : "outline"}
                      onClick={() => {
                        setPaymentMethod("ETH");
                        setCryptoAmount("");
                      }}
                      className="h-20"
                    >
                      <div className="text-center">
                        <CreditCard className="h-6 w-6 mx-auto mb-2" />
                        <div className="font-semibold">Ethereum</div>
                        <div className="text-xs opacity-70">Pay with ETH</div>
                      </div>
                    </Button>

                    <Button
                      variant={paymentMethod === "USDC" ? "default" : "outline"}
                      onClick={() => {
                        setPaymentMethod("USDC");
                        setCryptoAmount("");
                      }}
                      className="h-20"
                    >
                      <div className="text-center">
                        <CreditCard className="h-6 w-6 mx-auto mb-2" />
                        <div className="font-semibold">USDC</div>
                        <div className="text-xs opacity-70">Stablecoin</div>
                      </div>
                    </Button>
                  </div>

                  {cryptoAmount && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Amount to pay:</span>
                        <span className="font-bold text-lg">
                          {formatCrypto(cryptoAmount, paymentMethod)}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex justify-between text-sm">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT (20%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {!cryptoAmount ? (
                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={calculateCryptoAmount}
                  disabled={!isConnected || isCalculating}
                >
                  {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Calculate Crypto Amount
                </Button>
              ) : (
                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isPending || isConfirming || !email}
                >
                  {(isPending || isConfirming) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isPending
                    ? "Confirm in Wallet..."
                    : isConfirming
                    ? "Processing..."
                    : `Pay ${formatCrypto(cryptoAmount, paymentMethod)}`}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
