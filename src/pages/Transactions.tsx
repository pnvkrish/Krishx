import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../supabase/supabaseClient';
import { Transaction } from '../types';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate('/login'); return; }

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) setTransactions(data as Transaction[]);
    setLoading(false);
  }, [navigate]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">Trade History</h2>
          <span className="page-subtitle">All your past transactions</span>
        </div>

        {loading ? (
          <div className="app-loading">
            <div className="spinner" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions yet. Go to the <a href="/trading" className="auth-link">Trading page</a> to make your first trade!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Asset</th>
                  <th>Amount</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="tx-date">{formatDate(tx.created_at)}</td>
                    <td>
                      <span className={`tx-badge ${tx.type === 'buy' ? 'badge-buy' : 'badge-sell'}`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="tx-asset">{tx.asset}</td>
                    <td>{tx.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })}</td>
                    <td>${tx.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="tx-total">
                      ${(tx.amount * tx.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Transactions;
