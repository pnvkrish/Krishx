import React from 'react';

interface PriceCardProps {
  symbol: string;
  name: string;
  price: number | null;
  icon: string;
}

const PriceCard: React.FC<PriceCardProps> = ({ symbol, name, price, icon }) => {
  return (
    <div className="price-card">
      <div className="price-card-header">
        <span className="asset-icon">{icon}</span>
        <div>
          <div className="asset-symbol">{symbol}</div>
          <div className="asset-name">{name}</div>
        </div>
      </div>
      <div className="asset-price">
        {price !== null ? (
          <>
            <span className="price-value">
              ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="price-live-dot" title="Live price" />
          </>
        ) : (
          <span className="price-loading">Loading...</span>
        )}
      </div>
    </div>
  );
};

export default PriceCard;
