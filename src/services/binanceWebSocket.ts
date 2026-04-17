// Connects to Binance WebSocket stream for real-time BTC and ETH prices

type PriceCallback = (btc: number | null, eth: number | null) => void;

export class BinanceWebSocket {
  private ws: WebSocket | null = null;
  private onPriceUpdate: PriceCallback;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(onPriceUpdate: PriceCallback) {
    this.onPriceUpdate = onPriceUpdate;
  }

  connect() {
    // Subscribe to both BTC and ETH mini-ticker streams
    const url = 'wss://stream.binance.com:9443/stream?streams=btcusdt@miniTicker/ethusdt@miniTicker';

    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const ticker = data.data;
        if (!ticker) return;

        const symbol: string = ticker.s;
        const price: number = parseFloat(ticker.c);

        if (symbol === 'BTCUSDT') {
          this.onPriceUpdate(price, null);
        } else if (symbol === 'ETHUSDT') {
          this.onPriceUpdate(null, price);
        }
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      // Auto-reconnect after 5 seconds
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}
