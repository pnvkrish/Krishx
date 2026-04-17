// Core data types for the KRISHX trading simulator

export interface Profile {
  id: string;
  balance: number;
  btc: number;
  eth: number;
  gold: number;
  aapl: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'buy' | 'sell';
  asset: 'BTC' | 'ETH' | 'GOLD' | 'AAPL';
  amount: number;
  price: number;
  created_at: string;
}

export interface Prices {
  BTC: number | null;
  ETH: number | null;
  GOLD: number | null;
  AAPL: number | null;
}

export type AssetKey = 'BTC' | 'ETH' | 'GOLD' | 'AAPL';
