"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    basePrice: number;
    images: string[];
    variants: {
      id: string;
      name: string;
      sku: string;
      priceAdjust: number;
    }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  const defaultVariant = product.variants[0];
  const price = product.basePrice + (defaultVariant?.priceAdjust || 0);
  const image = product.images[0] || "/placeholder-product.jpg";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!defaultVariant) {
      toast({
        title: "Product unavailable",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    addItem({
      variantId: defaultVariant.id,
      productId: product.id,
      name: product.name,
      variantName: defaultVariant.name,
      price: Number(price),
      image,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg truncate">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.description}
            </p>
          )}
          <p className="text-xl font-bold mt-2">{formatCurrency(Number(price))}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={!defaultVariant}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
