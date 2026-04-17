import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PortfolioCard from '../components/PortfolioCard';
import PriceCard from '../components/PriceCard';
import { supabase } from '../supabase/supabaseClient';
import { BinanceWebSocket } from '../services/binanceWebSocket';
import { fetchGoldPrice } from '../services/goldApi';
import { fetchAAPLPrice } from '../services/stockApi';
import { Profile, Prices } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prices, setPrices] = useState<Prices>({ BTC: null, ETH: null, GOLD: null, AAPL: null });
  const [loading, setLoading] = useState(true);

  // Load user profile from Supabase
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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // WebSocket for BTC/ETH live prices
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

  // Poll Gold price every 25 seconds
  useEffect(() => {
    const loadGold = async () => {
      const price = await fetchGoldPrice();
      if (price) setPrices((prev) => ({ ...prev, GOLD: price }));
    };
    loadGold();
    const interval = setInterval(loadGold, 25000);
    return () => clearInterval(interval);
  }, []);

  // Poll AAPL price every 60 seconds (respects Alpha Vantage rate limit)
  useEffect(() => {
    const loadAAPL = async () => {
      const price = await fetchAAPLPrice();
      if (price) setPrices((prev) => ({ ...prev, AAPL: price }));
    };
    loadAAPL();
    const interval = setInterval(loadAAPL, 60000);
    return () => clearInterval(interval);
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
          <h2 className="page-title">Dashboard</h2>
          <span className="page-subtitle">Welcome back, trader</span>
        </div>

        {/* Live market prices */}
        <div className="prices-grid">
          <PriceCard symbol="BTC" name="Bitcoin" price={prices.BTC} icon="₿" />
          <PriceCard symbol="ETH" name="Ethereum" price={prices.ETH} icon="Ξ" />
          <PriceCard symbol="GOLD" name="Gold (oz)" price={prices.GOLD} icon="⊕" />
          <PriceCard symbol="AAPL" name="Apple Inc." price={prices.AAPL} icon="" />
        </div>

        {/* Portfolio overview */}
        <PortfolioCard profile={profile} prices={prices} />
      </main>
    </div>
  );
};

export default Dashboard;
