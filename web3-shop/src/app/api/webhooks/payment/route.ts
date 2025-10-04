import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const paymentWebhookSchema = z.object({
  orderId: z.string(),
  txHash: z.string(),
  blockNumber: z.string().optional(),
  status: z.enum(["CONFIRMED", "FAILED"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, txHash, blockNumber, status } = paymentWebhookSchema.parse(body);

    // Find the order by order number
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    // Update payment and order status
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        status,
        txHash,
        blockNumber: blockNumber ? BigInt(blockNumber) : null,
        confirmations: status === "CONFIRMED" ? 1 : 0,
        paidAt: status === "CONFIRMED" ? new Date() : null,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: status === "CONFIRMED" ? "PAID" : "CANCELLED",
      },
    });

    // Update inventory
    if (status === "CONFIRMED") {
      for (const item of order.items) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment webhook error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid webhook data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
