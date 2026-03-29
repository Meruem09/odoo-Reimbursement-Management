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
