import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "ChangeMe123!Secure",
    10
  );

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@kaybirks.shop" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "admin@kaybirks.shop",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create categories
  const sandalsCategory = await prisma.category.upsert({
    where: { slug: "sandals" },
    update: {},
    create: {
      name: "Sandals",
      slug: "sandals",
      description: "Classic Birkenstock sandals for everyday comfort",
    },
  });

  const clogsCategory = await prisma.category.upsert({
    where: { slug: "clogs" },
    update: {},
    create: {
      name: "Clogs",
      slug: "clogs",
      description: "Comfortable Birkenstock clogs",
    },
  });

  console.log("✅ Categories created");

  // Create products with variants
  const arizonaProduct = await prisma.product.upsert({
    where: { slug: "birkenstock-arizona-classic" },
    update: {},
    create: {
      name: "Birkenstock Arizona Classic",
      slug: "birkenstock-arizona-classic",
      description:
        "The iconic two-strap design from Birkenstock. Comfortable, durable, and timeless. Features a contoured cork footbed that moulds to your feet.",
      basePrice: 65.0,
      categoryId: sandalsCategory.id,
      type: "PHYSICAL",
      status: "ACTIVE",
      featured: true,
      images: ["/products/arizona-tan.jpg"],
      tags: ["classic", "two-strap", "unisex"],
      seoTitle: "Birkenstock Arizona Classic Sandals | Kay Birks Crypto",
      seoDescription:
        "Buy authentic Birkenstock Arizona sandals with crypto. Free shipping over £100.",
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: arizonaProduct.id,
        sku: "BIRK-AZ-TAN-39",
        name: "Tan / Size EU 39",
        priceAdjust: 0,
        stock: 25,
        attributes: { color: "Tan", size: "39" },
      },
      {
        productId: arizonaProduct.id,
        sku: "BIRK-AZ-TAN-40",
        name: "Tan / Size EU 40",
        priceAdjust: 0,
        stock: 30,
        attributes: { color: "Tan", size: "40" },
      },
      {
        productId: arizonaProduct.id,
        sku: "BIRK-AZ-TAN-41",
        name: "Tan / Size EU 41",
        priceAdjust: 0,
        stock: 28,
        attributes: { color: "Tan", size: "41" },
      },
      {
        productId: arizonaProduct.id,
        sku: "BIRK-AZ-BLACK-40",
        name: "Black / Size EU 40",
        priceAdjust: 5.0,
        stock: 20,
        attributes: { color: "Black", size: "40" },
      },
    ],
    skipDuplicates: true,
  });

  const bostonProduct = await prisma.product.upsert({
    where: { slug: "birkenstock-boston-clog" },
    update: {},
    create: {
      name: "Birkenstock Boston Clog",
      slug: "birkenstock-boston-clog",
      description:
        "The Boston clog is a classic all-year-round style. Featuring a closed-toe design with adjustable strap for a perfect fit.",
      basePrice: 85.0,
      categoryId: clogsCategory.id,
      type: "PHYSICAL",
      status: "ACTIVE",
      featured: true,
      images: ["/products/boston-taupe.jpg"],
      tags: ["clog", "closed-toe", "suede"],
      seoTitle: "Birkenstock Boston Clogs | Kay Birks Crypto",
      seoDescription:
        "Authentic Birkenstock Boston clogs available with cryptocurrency payment.",
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: bostonProduct.id,
        sku: "BIRK-BS-TAUPE-39",
        name: "Taupe Suede / Size EU 39",
        priceAdjust: 0,
        stock: 15,
        attributes: { color: "Taupe", size: "39", material: "Suede" },
      },
      {
        productId: bostonProduct.id,
        sku: "BIRK-BS-TAUPE-40",
        name: "Taupe Suede / Size EU 40",
        priceAdjust: 0,
        stock: 18,
        attributes: { color: "Taupe", size: "40", material: "Suede" },
      },
    ],
    skipDuplicates: true,
  });

  const mayariProduct = await prisma.product.upsert({
    where: { slug: "birkenstock-mayari" },
    update: {},
    create: {
      name: "Birkenstock Mayari",
      slug: "birkenstock-mayari",
      description:
        "The Mayari features a unique toe loop design for enhanced stability. Perfect for warm weather with premium materials.",
      basePrice: 72.0,
      categoryId: sandalsCategory.id,
      type: "PHYSICAL",
      status: "ACTIVE",
      featured: true,
      images: ["/products/mayari-cognac.jpg"],
      tags: ["thong", "toe-loop", "womens"],
      seoTitle: "Birkenstock Mayari Sandals | Kay Birks Crypto",
      seoDescription: "Shop Birkenstock Mayari with crypto payments. Fast global shipping.",
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: mayariProduct.id,
        sku: "BIRK-MY-COG-38",
        name: "Cognac / Size EU 38",
        priceAdjust: 0,
        stock: 22,
        attributes: { color: "Cognac", size: "38" },
      },
      {
        productId: mayariProduct.id,
        sku: "BIRK-MY-COG-39",
        name: "Cognac / Size EU 39",
        priceAdjust: 0,
        stock: 25,
        attributes: { color: "Cognac", size: "39" },
      },
    ],
    skipDuplicates: true,
  });

  const gizehProduct = await prisma.product.upsert({
    where: { slug: "birkenstock-gizeh" },
    update: {},
    create: {
      name: "Birkenstock Gizeh",
      slug: "birkenstock-gizeh",
      description:
        "The Gizeh thong sandal is a minimalist classic with a toe post design. Lightweight and versatile for any occasion.",
      basePrice: 68.0,
      categoryId: sandalsCategory.id,
      type: "PHYSICAL",
      status: "ACTIVE",
      featured: true,
      images: ["/products/gizeh-white.jpg"],
      tags: ["thong", "minimalist", "unisex"],
    },
  });

  await prisma.productVariant.createMany({
    data: [
      {
        productId: gizehProduct.id,
        sku: "BIRK-GZ-WHT-39",
        name: "White / Size EU 39",
        priceAdjust: 0,
        stock: 20,
        attributes: { color: "White", size: "39" },
      },
      {
        productId: gizehProduct.id,
        sku: "BIRK-GZ-WHT-40",
        name: "White / Size EU 40",
        priceAdjust: 0,
        stock: 18,
        attributes: { color: "White", size: "40" },
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Products and variants created");

  // Create discount codes
  await prisma.discount.upsert({
    where: { code: "CRYPTO10" },
    update: {},
    create: {
      code: "CRYPTO10",
      description: "10% off for crypto payments",
      type: "PERCENTAGE",
      value: 10,
      isActive: true,
      expiresAt: new Date("2025-12-31"),
    },
  });

  await prisma.discount.upsert({
    where: { code: "WELCOME20" },
    update: {},
    create: {
      code: "WELCOME20",
      description: "£20 off your first order over £100",
      type: "FIXED",
      value: 20,
      minPurchase: 100,
      maxUses: 1000,
      isActive: true,
      expiresAt: new Date("2025-12-31"),
    },
  });

  console.log("✅ Discount codes created");

  // Initialize price cache
  await prisma.priceCache.upsert({
    where: { currency: "ETH" },
    update: { priceUSD: 2000.0 },
    create: { currency: "ETH", priceUSD: 2000.0 },
  });

  await prisma.priceCache.upsert({
    where: { currency: "USDC" },
    update: { priceUSD: 1.0 },
    create: { currency: "USDC", priceUSD: 1.0 },
  });

  console.log("✅ Price cache initialized");

  console.log("\n🎉 Database seed completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - Admin user: ${admin.email}`);
  console.log(`   - Password: ${process.env.ADMIN_PASSWORD || "ChangeMe123!Secure"}`);
  console.log("   - Categories: 2");
  console.log("   - Products: 4");
  console.log("   - Discount codes: 2 (CRYPTO10, WELCOME20)");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
