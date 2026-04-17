import React from 'react';
import { Profile, Prices } from '../types';

interface PortfolioCardProps {
  profile: Profile;
  prices: Prices;
}

// Calculates the USD value of each holding
function holdingValue(amount: number, price: number | null): number {
  if (!price) return 0;
  return amount * price;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ profile, prices }) => {
  const btcValue = holdingValue(profile.btc, prices.BTC);
  const ethValue = holdingValue(profile.eth, prices.ETH);
  const goldValue = holdingValue(profile.gold, prices.GOLD);
  const aaplValue = holdingValue(profile.aapl, prices.AAPL);
  const totalPortfolio = profile.balance + btcValue + ethValue + goldValue + aaplValue;

  const assets = [
    { label: 'BTC', amount: profile.btc, value: btcValue, icon: '₿' },
    { label: 'ETH', amount: profile.eth, value: ethValue, icon: 'Ξ' },
    { label: 'GOLD', amount: profile.gold, value: goldValue, icon: '⊕' },
    { label: 'AAPL', amount: profile.aapl, value: aaplValue, icon: '' },
  ];

  return (
    <div className="portfolio-card">
      <h3 className="section-title">Portfolio</h3>

      <div className="portfolio-total">
        <span className="label">Total Value</span>
        <span className="total-value">
          ${totalPortfolio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="portfolio-row">
        <span className="label">Cash Balance</span>
        <span className="value-green">
          ${profile.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="portfolio-holdings">
        {assets.map((a) => (
          <div key={a.label} className="holding-row">
            <span className="holding-icon">{a.icon}</span>
            <span className="holding-label">{a.label}</span>
            <span className="holding-amount">
              {a.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })}
            </span>
            <span className="holding-value">
              ${a.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioCard;
