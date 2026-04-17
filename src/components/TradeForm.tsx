import React, { useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { Profile, Prices, AssetKey } from '../types';

interface TradeFormProps {
  profile: Profile;
  prices: Prices;
  onTradeComplete: () => void;
}

const ASSETS: { key: AssetKey; label: string; icon: string }[] = [
  { key: 'BTC', label: 'Bitcoin (BTC)', icon: '₿' },
  { key: 'ETH', label: 'Ethereum (ETH)', icon: 'Ξ' },
  { key: 'GOLD', label: 'Gold (oz)', icon: '⊕' },
  { key: 'AAPL', label: 'Apple (AAPL)', icon: '' },
];

const TradeForm: React.FC<TradeFormProps> = ({ profile, prices, onTradeComplete }) => {
  const [asset, setAsset] = useState<AssetKey>('BTC');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentPrice = prices[asset];
  const totalCost = currentPrice ? parseFloat(amount || '0') * currentPrice : 0;

  const assetHolding = profile[asset.toLowerCase() as keyof Profile] as number;

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus('Enter a valid amount.');
      return;
    }
    if (!currentPrice) {
      setStatus('Price not available yet. Please wait.');
      return;
    }

    const qty = parseFloat(amount);
    setLoading(true);
    setStatus(null);

    if (tradeType === 'buy') {
      if (totalCost > profile.balance) {
        setStatus('Insufficient balance.');
        setLoading(false);
        return;
      }

      const newBalance = parseFloat((profile.balance - totalCost).toFixed(8));
      const newHolding = parseFloat((assetHolding + qty).toFixed(8));

      const { error } = await supabase
        .from('profiles')
        .update({
          balance: newBalance,
          [asset.toLowerCase()]: newHolding,
        })
        .eq('id', profile.id);

      if (error) {
        setStatus('Trade failed: ' + error.message);
        setLoading(false);
        return;
      }
    } else {
      if (qty > assetHolding) {
        setStatus(`Insufficient ${asset} holdings.`);
        setLoading(false);
        return;
      }

      const proceeds = parseFloat((qty * currentPrice).toFixed(8));
      const newBalance = parseFloat((profile.balance + proceeds).toFixed(8));
      const newHolding = parseFloat((assetHolding - qty).toFixed(8));

      const { error } = await supabase
        .from('profiles')
        .update({
          balance: newBalance,
          [asset.toLowerCase()]: newHolding,
        })
        .eq('id', profile.id);

      if (error) {
        setStatus('Trade failed: ' + error.message);
        setLoading(false);
        return;
      }
    }

    // Record transaction in history
    await supabase.from('transactions').insert({
      user_id: profile.id,
      type: tradeType,
      asset,
      amount: qty,
      price: currentPrice,
    });

    setStatus(`${tradeType === 'buy' ? 'Bought' : 'Sold'} ${qty} ${asset} successfully!`);
    setAmount('');
    setLoading(false);
    onTradeComplete();
  };

  return (
    <div className="trade-form">
      <h3 className="section-title">Place Order</h3>

      {/* Buy / Sell toggle */}
      <div className="trade-type-toggle">
        <button
          className={`toggle-btn ${tradeType === 'buy' ? 'active-buy' : ''}`}
          onClick={() => setTradeType('buy')}
        >
          Buy
        </button>
        <button
          className={`toggle-btn ${tradeType === 'sell' ? 'active-sell' : ''}`}
          onClick={() => setTradeType('sell')}
        >
          Sell
        </button>
      </div>

      {/* Asset selector */}
      <div className="form-group">
        <label className="form-label">Asset</label>
        <select
          className="form-select"
          value={asset}
          onChange={(e) => setAsset(e.target.value as AssetKey)}
        >
          {ASSETS.map((a) => (
            <option key={a.key} value={a.key}>
              {a.icon} {a.label}
            </option>
          ))}
        </select>
      </div>

      {/* Current price display */}
      <div className="form-group">
        <label className="form-label">Market Price</label>
        <div className="price-display">
          {currentPrice
            ? `$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : 'Loading...'}
        </div>
      </div>

      {/* Amount input */}
      <div className="form-group">
        <label className="form-label">
          Amount ({asset === 'GOLD' ? 'oz' : asset === 'AAPL' ? 'shares' : 'units'})
        </label>
        <input
          type="number"
          className="form-input"
          placeholder="0.00"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {/* Order summary */}
      <div className="order-summary">
        <span>Total {tradeType === 'buy' ? 'Cost' : 'Proceeds'}</span>
        <span className="order-total">
          ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="order-summary">
        <span>Available Balance</span>
        <span>${profile.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      <div className="order-summary">
        <span>{asset} Holdings</span>
        <span>{assetHolding.toLocaleString('en-US', { maximumFractionDigits: 6 })}</span>
      </div>

      <button
        className={`btn-trade ${tradeType === 'buy' ? 'btn-buy' : 'btn-sell'}`}
        onClick={handleTrade}
        disabled={loading}
      >
        {loading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${asset}`}
      </button>

      {status && (
        <div className={`trade-status ${status.includes('successfully') ? 'status-success' : 'status-error'}`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default TradeForm;
