// Fetches live gold spot price from metals.live (free, no API key required)

export async function fetchGoldPrice(): Promise<number | null> {
  try {
    const response = await fetch('https://api.metals.live/v1/spot/gold');
    if (!response.ok) return null;
    const data = await response.json();
    // Response is an array like [{ gold: 1950.23 }]
    if (Array.isArray(data) && data.length > 0 && data[0].gold) {
      return parseFloat(data[0].gold);
    }
    return null;
  } catch {
    return null;
  }
}
