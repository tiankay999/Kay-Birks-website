import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/prisma";

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      featured: true,
    },
    include: {
      variants: true,
    },
    take: 4,
  });

  return products.map((p) => ({
    ...p,
    basePrice: Number(p.basePrice),
    variants: p.variants.map((v) => ({
      ...v,
      priceAdjust: Number(v.priceAdjust),
    })),
  }));
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-muted/50 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Premium Birkenstock
              <br />
              Powered by Crypto
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Shop authentic Birkenstock sandals and pay securely with Ethereum or USDC.
              Fast, transparent, and decentralised.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/shop">
                <Button size="lg">
                  Browse Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Payments</h3>
              <p className="text-muted-foreground text-sm">
                Smart contract powered payments ensure your transactions are secure and transparent.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Instant Settlement</h3>
              <p className="text-muted-foreground text-sm">
                Blockchain technology enables rapid payment confirmation and order processing.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Global Access</h3>
              <p className="text-muted-foreground text-sm">
                Shop from anywhere in the world with cryptocurrency. No borders, no limits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground">
              Discover our handpicked selection of premium Birkenstock sandals
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured products available yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Check back soon or browse our full collection.
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/shop">
              <Button size="lg" variant="outline">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Step into Web3?</h2>
            <p className="text-muted-foreground mb-8">
              Connect your wallet and experience the future of online shopping today.
            </p>
            <Link href="/shop">
              <Button size="lg">
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
