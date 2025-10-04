/**
 * Price Oracle Service
 * Fetches crypto prices and converts between fiat and crypto
 */

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const CACHE_DURATION = 60 * 1000; // 1 minute

interface PriceData {
  usd: number;
  gbp: number;
  eur: number;
  lastUpdated: number;
}

const priceCache = new Map<string, PriceData>();

export async function getCryptoPrice(coinId: string): Promise<PriceData | null> {
  const cached = priceCache.get(coinId);
  
  if (cached && Date.now() - cached.lastUpdated < CACHE_DURATION) {
    return cached;
  }

  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd,gbp,eur`
    );

    if (!response.ok) {
      console.error("Failed to fetch crypto price");
      return cached || null;
    }

    const data = await response.json();
    const priceData: PriceData = {
      usd: data[coinId].usd,
      gbp: data[coinId].gbp,
      eur: data[coinId].eur,
      lastUpdated: Date.now(),
    };

    priceCache.set(coinId, priceData);
    return priceData;
  } catch (error) {
    console.error("Error fetching crypto price:", error);
    return cached || null;
  }
}

export async function convertFiatToCrypto(
  fiatAmount: number,
  fiatCurrency: string,
  cryptoSymbol: string
): Promise<string | null> {
  const coinId = cryptoSymbol.toLowerCase() === "eth" ? "ethereum" : "usd-coin";
  const price = await getCryptoPrice(coinId);

  if (!price) return null;

  const fiatPrice = price[fiatCurrency.toLowerCase() as keyof PriceData];
  if (typeof fiatPrice !== "number") return null;

  const cryptoAmount = fiatAmount / fiatPrice;
  return cryptoAmount.toFixed(cryptoSymbol.toLowerCase() === "eth" ? 6 : 2);
}

export async function getEthPrice(): Promise<number | null> {
  const price = await getCryptoPrice("ethereum");
  return price?.gbp || null;
}

export async function getUsdcPrice(): Promise<number | null> {
  const price = await getCryptoPrice("usd-coin");
  return price?.gbp || null;
}
