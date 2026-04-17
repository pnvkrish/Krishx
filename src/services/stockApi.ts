// Fetches AAPL stock price from Alpha Vantage REST API
// Free tier: 5 requests per minute, 500 per day

const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_KEY || 'demo';

export async function fetchAAPLPrice(): Promise<number | null> {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const quote = data['Global Quote'];
    if (quote && quote['05. price']) {
      return parseFloat(quote['05. price']);
    }
    return null;
  } catch {
    return null;
  }
}
