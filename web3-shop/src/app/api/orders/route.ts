import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

const createOrderSchema = z.object({
  email: z.string().email(),
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().positive(),
      price: z.number(),
    })
  ),
  subtotal: z.number(),
  tax: z.number(),
  shippingCost: z.number(),
  total: z.number(),
  cryptoAmount: z.string().optional(),
  cryptoCurrency: z.string().optional(),
  walletAddress: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    const orderNumber = generateOrderNumber();

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        email: validatedData.email,
        status: "AWAITING_PAYMENT",
        subtotal: validatedData.subtotal,
        tax: validatedData.tax,
        shippingCost: validatedData.shippingCost,
        total: validatedData.total,
        items: {
          create: validatedData.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
          })),
        },
        payment: validatedData.cryptoAmount
          ? {
              create: {
                method: validatedData.cryptoCurrency === "ETH" ? "CRYPTO_ETH" : "CRYPTO_USDC",
                status: "PENDING",
                amount: validatedData.total,
                cryptoAmount: validatedData.cryptoAmount,
                cryptoCurrency: validatedData.cryptoCurrency,
                walletAddress: validatedData.walletAddress,
              },
            }
          : undefined,
      },
      include: {
        items: true,
        payment: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { email },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
