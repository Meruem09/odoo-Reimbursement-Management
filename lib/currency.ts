/**
 * Resolves a country code (ISO 3166-1 alpha-2) to its primary currency
 * using restcountries.com. Result is cached in memory for the process lifetime.
 */

export interface CurrencyInfo {
  code: string;   // ISO 4217, e.g. "INR"
  symbol: string; // e.g. "₹"
  name: string;   // e.g. "Indian rupee"
}

type RestCountry = {
  cca2: string;
  currencies?: Record<string, { name: string; symbol: string }>;
};

// In-memory cache — populated once, reused
let countryCache: RestCountry[] | null = null;

async function getCountries(): Promise<RestCountry[]> {
  if (countryCache) return countryCache;
  const res = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,currencies,cca2",
    { next: { revalidate: 86400 } } // 24 h cache in Next.js fetch
  );
  if (!res.ok) throw new Error("Failed to fetch country data");
  countryCache = (await res.json()) as RestCountry[];
  return countryCache;
}

export async function getCurrencyForCountry(
  countryCode: string
): Promise<CurrencyInfo> {
  const countries = await getCountries();
  const match = countries.find(
    (c) => c.cca2.toLowerCase() === countryCode.toLowerCase()
  );

  if (!match) {
    throw new Error(`Country code not found: ${countryCode}`);
  }

  if (!match.currencies) {
    // Some territories (e.g. Antarctica) have no currency — use USD fallback
    return { code: "USD", symbol: "$", name: "United States dollar" };
  }

  const [code, info] = Object.entries(match.currencies)[0] as [
    string,
    { name: string; symbol: string }
  ];

  return {
    code,
    symbol: info.symbol ?? code,
    name: info.name ?? code,
  };
}

/**
 * Converts any currency amount to INR using the public exchangerate-api.com v4 endpoint.
 */
export async function convertToINR(amount: number, fromCurrency: string): Promise<number> {
  if (fromCurrency === "INR") return amount;

  const staticRates: Record<string, number> = {
    "USD": 83.5, "EUR": 90.2, "GBP": 105.8, "JPY": 0.55, "AED": 22.7, "SGD": 62.1
  };
  const fallbackRate = staticRates[fromCurrency] || 80;

  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`, {
      next: { revalidate: 3600 }, // Cache rates for 1 hour
    });

    if (!res.ok) throw new Error("Exchange API error");
    const data = await res.json();
    const rate = data.rates["INR"];
    return amount * rate;
  } catch (error) {
    console.error("Currency conversion error:", error);
    return amount * fallbackRate;
  }
}
