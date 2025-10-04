import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatCrypto,
  truncateAddress,
  generateOrderNumber,
  calculateTax,
  calculateShipping,
} from "@/lib/utils";

describe("Utils", () => {
  describe("formatCurrency", () => {
    it("formats GBP correctly", () => {
      expect(formatCurrency(100, "GBP")).toBe("£100.00");
      expect(formatCurrency(99.99, "GBP")).toBe("£99.99");
    });

    it("handles string inputs", () => {
      expect(formatCurrency("50.5", "GBP")).toBe("£50.50");
    });
  });

  describe("formatCrypto", () => {
    it("formats crypto amounts with symbol", () => {
      expect(formatCrypto(1.234567, "ETH")).toBe("1.234567 ETH");
      expect(formatCrypto("100.5", "USDC")).toBe("100.500000 USDC");
    });
  });

  describe("truncateAddress", () => {
    it("truncates Ethereum addresses", () => {
      const address = "0x1234567890abcdef1234567890abcdef12345678";
      expect(truncateAddress(address)).toBe("0x1234...5678");
      expect(truncateAddress(address, 6)).toBe("0x123456...345678");
    });

    it("handles empty addresses", () => {
      expect(truncateAddress("")).toBe("");
    });
  });

  describe("generateOrderNumber", () => {
    it("generates unique order numbers", () => {
      const order1 = generateOrderNumber();
      const order2 = generateOrderNumber();
      
      expect(order1).toMatch(/^ORD-/);
      expect(order2).toMatch(/^ORD-/);
      expect(order1).not.toBe(order2);
    });
  });

  describe("calculateTax", () => {
    it("calculates 20% VAT by default", () => {
      expect(calculateTax(100)).toBe(20);
      expect(calculateTax(50)).toBe(10);
    });

    it("accepts custom tax rate", () => {
      expect(calculateTax(100, 0.1)).toBe(10);
    });
  });

  describe("calculateShipping", () => {
    it("returns free shipping for orders over £100", () => {
      expect(calculateShipping(100)).toBe(0);
      expect(calculateShipping(150)).toBe(0);
    });

    it("charges £5.99 for UK orders under £100", () => {
      expect(calculateShipping(50, "GB")).toBe(5.99);
    });

    it("charges £12.99 for international orders under £100", () => {
      expect(calculateShipping(50, "US")).toBe(12.99);
    });
  });
});
