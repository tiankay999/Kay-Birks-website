import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

async function getProducts() {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      variants: true,
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
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

export const metadata = {
  title: "Shop | Kay Birks Crypto",
  description: "Browse our collection of premium Birkenstock sandals available for purchase with cryptocurrency.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Shop All Products</h1>
        <p className="text-muted-foreground">
          Explore our complete collection of premium Birkenstock sandals
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">No products available yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please check back soon for new arrivals.
          </p>
        </div>
      )}
    </div>
  );
}
