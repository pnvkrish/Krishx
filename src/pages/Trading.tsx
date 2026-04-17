import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PriceCard from '../components/PriceCard';
import TradeForm from '../components/TradeForm';
import { supabase } from '../supabase/supabaseClient';
import { BinanceWebSocket } from '../services/binanceWebSocket';
import { fetchGoldPrice } from '../services/goldApi';
import { fetchAAPLPrice } from '../services/stockApi';
import { Profile, Prices } from '../types';

const Trading: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prices, setPrices] = useState<Prices>({ BTC: null, ETH: null, GOLD: null, AAPL: null });
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) setProfile(data as Profile);
    setLoading(false);
  }, [navigate]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // WebSocket for live BTC/ETH prices
  useEffect(() => {
    const ws = new BinanceWebSocket((btc, eth) => {
      setPrices((prev) => ({
        ...prev,
        ...(btc !== null ? { BTC: btc } : {}),
        ...(eth !== null ? { ETH: eth } : {}),
      }));
    });
    ws.connect();
    return () => ws.disconnect();
  }, []);

  // Poll Gold every 25 seconds
  useEffect(() => {
    const load = async () => {
      const p = await fetchGoldPrice();
      if (p) setPrices((prev) => ({ ...prev, GOLD: p }));
    };
    load();
    const id = setInterval(load, 25000);
    return () => clearInterval(id);
  }, []);

  // Poll AAPL every 60 seconds
  useEffect(() => {
    const load = async () => {
      const p = await fetchAAPLPrice();
      if (p) setPrices((prev) => ({ ...prev, AAPL: p }));
    };
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading KRISHX...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">Trade</h2>
          <span className="page-subtitle">Buy and sell assets at live market prices</span>
        </div>

        {/* Live prices row */}
        <div className="prices-grid">
          <PriceCard symbol="BTC" name="Bitcoin" price={prices.BTC} icon="₿" />
          <PriceCard symbol="ETH" name="Ethereum" price={prices.ETH} icon="Ξ" />
          <PriceCard symbol="GOLD" name="Gold (oz)" price={prices.GOLD} icon="⊕" />
          <PriceCard symbol="AAPL" name="Apple Inc." price={prices.AAPL} icon="" />
        </div>

        <div className="trading-layout">
          {/* Trade form */}
          <TradeForm
            profile={profile}
            prices={prices}
            onTradeComplete={loadProfile}
          />

          {/* Balance summary */}
          <div className="balance-panel">
            <h3 className="section-title">Account</h3>
            <div className="balance-item">
              <span className="label">Cash Balance</span>
              <span className="value-green">
                ${profile.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="balance-item">
              <span className="label">BTC</span>
              <span>{profile.btc.toLocaleString('en-US', { maximumFractionDigits: 6 })}</span>
            </div>
            <div className="balance-item">
              <span className="label">ETH</span>
              <span>{profile.eth.toLocaleString('en-US', { maximumFractionDigits: 6 })}</span>
            </div>
            <div className="balance-item">
              <span className="label">GOLD (oz)</span>
              <span>{profile.gold.toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
            </div>
            <div className="balance-item">
              <span className="label">AAPL (shares)</span>
              <span>{profile.aapl.toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Trading;
