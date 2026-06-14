import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionApi, analyticsApi } from '../api/axios';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Shopping', 'Health', 'Entertainment', 'Other'];

const CATEGORY_COLORS = {
  Food: '#6366f1',
  Transport: '#22d3ee',
  Utilities: '#f59e0b',
  Shopping: '#ec4899',
  Health: '#10b981',
  Entertainment: '#8b5cf6',
  Other: '#94a3b8',
};

const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#94a3b8'];

// ── Styles ───────────────────────────────────────────────────────────────────

const s = {
  layout: {
    display: 'flex', minHeight: '100vh', background: '#0f1117', color: '#e2e8f0',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  sidebar: {
    width: '220px', background: '#1a1d27', borderRight: '1px solid #2d3148',
    display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0,
  },
  logo: {
    padding: '0 24px 32px', fontSize: '20px', fontWeight: '700',
    color: '#6366f1', letterSpacing: '-0.5px',
  },
  navItem: (active) => ({
    padding: '10px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
    color: active ? '#6366f1' : '#94a3b8',
    background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
    borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
    transition: 'all 0.15s',
  }),
  main: { flex: 1, padding: '32px', overflowY: 'auto' },
  topbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px',
  },
  pageTitle: { fontSize: '22px', fontWeight: '700', color: '#f1f5f9', margin: 0 },
  logoutBtn: {
    padding: '8px 16px', background: 'transparent', border: '1px solid #374151',
    color: '#94a3b8', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
    transition: 'all 0.15s',
  },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  statCard: (color) => ({
    flex: '1', minWidth: '140px', background: '#1a1d27', border: `1px solid ${color}33`,
    borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden',
  }),
  statLabel: { fontSize: '12px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue: (color) => ({ fontSize: '26px', fontWeight: '700', color }),
  statSub: { fontSize: '12px', color: '#475569', marginTop: '4px' },
  chartsRow: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  card: {
    background: '#1a1d27', border: '1px solid #2d3148', borderRadius: '12px',
    padding: '20px', flex: 1, minWidth: '280px',
  },
  cardTitle: { fontSize: '14px', fontWeight: '600', color: '#cbd5e1', marginBottom: '16px' },
  alertBanner: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
    color: '#fca5a5', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
  },
  warnBanner: {
    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
    borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
    color: '#fcd34d', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
  },
  addBtn: {
    padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    transition: 'background 0.15s',
  },
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalBox: {
    background: '#1a1d27', border: '1px solid #2d3148', borderRadius: '16px',
    padding: '28px', width: '380px', maxWidth: '90vw',
  },
  modalTitle: { fontSize: '16px', fontWeight: '700', color: '#f1f5f9', marginBottom: '20px' },
  label: { display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' },
  input: {
    width: '100%', padding: '10px 12px', background: '#0f1117', border: '1px solid #2d3148',
    borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px',
  },
  select: {
    width: '100%', padding: '10px 12px', background: '#0f1117', border: '1px solid #2d3148',
    borderRadius: '8px', color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px',
  },
  modalActions: { display: 'flex', gap: '10px', marginTop: '8px' },
  cancelBtn: {
    flex: 1, padding: '10px', background: 'transparent', border: '1px solid #374151',
    color: '#94a3b8', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  },
  submitBtn: {
    flex: 1, padding: '10px', background: '#6366f1', border: 'none',
    color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    padding: '10px 12px', textAlign: 'left', color: '#475569', fontWeight: '600',
    borderBottom: '1px solid #2d3148', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  td: { padding: '12px', borderBottom: '1px solid #1e2130', color: '#cbd5e1' },
  categoryBadge: (cat) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
    background: `${CATEGORY_COLORS[cat] || '#94a3b8'}22`,
    color: CATEGORY_COLORS[cat] || '#94a3b8',
  }),
  progressBar: (pct, color) => ({
    height: '6px', borderRadius: '3px', background: '#2d3148', position: 'relative', marginBottom: '12px',
    overflow: 'hidden',
  }),
  progressFill: (pct, color) => ({
    height: '100%', width: `${Math.min(pct, 100)}%`,
    background: pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : color,
    borderRadius: '3px', transition: 'width 0.4s ease',
  }),
  budgetRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#475569', fontSize: '14px' },
};

// ── Component ─────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newTx, setNewTx] = useState({ amount: '', category: 'Food', notes: '', type: 'expense' });
  const [budgets, setBudgets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fs_budgets') || '{}'); } catch { return {}; }
  });
  const [budgetEdit, setBudgetEdit] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, monthlyRes, catRes] = await Promise.all([
        transactionApi.get('/transactions/'),
        analyticsApi.get('/analytics/monthly', { params: { user_id: user.username } }),
        analyticsApi.get('/analytics/category', { params: { user_id: user.username } }),
      ]);
      setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
      setMonthlySpending(monthlyRes.data || []);
      setCategoryBreakdown(catRes.data || []);
    } catch (e) {
      console.error('Fetch failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleAddTx = async (e) => {
    e.preventDefault();
    try {
      await transactionApi.post('/transactions/', {
        amount: parseFloat(newTx.amount),
        category: newTx.category,
        notes: newTx.notes,
      });
      setNewTx({ amount: '', category: 'Food', notes: '', type: 'expense' });
      setShowAddModal(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const saveBudgets = () => {
    const merged = { ...budgets };
    Object.entries(budgetEdit).forEach(([k, v]) => {
      if (v) merged[k] = parseFloat(v);
    });
    setBudgets(merged);
    localStorage.setItem('fs_budgets', JSON.stringify(merged));
    setShowBudgetModal(false);
    setBudgetEdit({});
  };

  // Derived stats
  const totalSpent = transactions.reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthSpent = transactions
    .filter(t => t.date && t.date.startsWith(thisMonth))
    .reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const txCount = transactions.length;

  // Budget alerts
  const catSpendMap = {};
  categoryBreakdown.forEach(c => { catSpendMap[c.category] = parseFloat(c.total); });
  const alerts = Object.entries(budgets)
    .map(([cat, limit]) => ({ cat, limit, spent: catSpendMap[cat] || 0, pct: ((catSpendMap[cat] || 0) / limit) * 100 }))
    .filter(a => a.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#1a1d27', border: '1px solid #2d3148', borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }}>
        <div style={{ color: '#94a3b8', marginBottom: '4px' }}>{label}</div>
        <div style={{ color: '#6366f1', fontWeight: '600' }}>₹{parseFloat(payload[0].value).toFixed(2)}</div>
      </div>
    );
  };

  return (
    <div style={s.layout}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.logo}>💰 FinSave</div>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'transactions', label: '💳 Transactions' },
          { id: 'budgets', label: '🎯 Budgets' },
        ].map(item => (
          <div key={item.id} style={s.navItem(activeTab === item.id)} onClick={() => setActiveTab(item.id)}>
            {item.label}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '0 24px', fontSize: '12px', color: '#475569' }}>
          Signed in as<br />
          <span style={{ color: '#94a3b8', fontWeight: '600' }}>{user?.username}</span>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <div style={s.topbar}>
          <h1 style={s.pageTitle}>
            {activeTab === 'overview' && 'Overview'}
            {activeTab === 'transactions' && 'Transactions'}
            {activeTab === 'budgets' && 'Budget Goals'}
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'transactions' && (
              <button style={s.addBtn} onClick={() => setShowAddModal(true)}>+ Add Transaction</button>
            )}
            {activeTab === 'budgets' && (
              <button style={s.addBtn} onClick={() => setShowBudgetModal(true)}>Set Budgets</button>
            )}
            <button style={s.logoutBtn} onClick={logout}>Sign out</button>
          </div>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            {/* Alerts */}
            {alerts.filter(a => a.pct >= 100).map(a => (
              <div key={a.cat} style={s.alertBanner}>
                🚨 <strong>{a.cat}</strong> budget exceeded — spent ₹{a.spent.toFixed(0)} of ₹{a.limit} limit
              </div>
            ))}
            {alerts.filter(a => a.pct >= 80 && a.pct < 100).map(a => (
              <div key={a.cat} style={s.warnBanner}>
                ⚠️ <strong>{a.cat}</strong> at {a.pct.toFixed(0)}% of budget — ₹{(a.limit - a.spent).toFixed(0)} remaining
              </div>
            ))}

            {/* Stat cards */}
            <div style={s.statsRow}>
              {[
                { label: 'Total Spent', value: `₹${totalSpent.toFixed(2)}`, sub: 'All time', color: '#6366f1' },
                { label: 'This Month', value: `₹${thisMonthSpent.toFixed(2)}`, sub: new Date().toLocaleString('default', { month: 'long' }), color: '#22d3ee' },
                { label: 'Transactions', value: txCount, sub: 'Total records', color: '#10b981' },
                { label: 'Categories', value: categoryBreakdown.length, sub: 'Active', color: '#f59e0b' },
              ].map(c => (
                <div key={c.label} style={s.statCard(c.color)}>
                  <div style={s.statLabel}>{c.label}</div>
                  <div style={s.statValue(c.color)}>{c.value}</div>
                  <div style={s.statSub}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={s.chartsRow}>
              <div style={s.card}>
                <div style={s.cardTitle}>Monthly Spending Trend</div>
                {monthlySpending.length === 0 ? (
                  <div style={s.emptyState}>No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={monthlySpending}>
                      <CartesianGrid stroke="#2d3148" strokeDasharray="4 4" />
                      <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div style={{ ...s.card, minWidth: '260px', maxWidth: '320px' }}>
                <div style={s.cardTitle}>Spending by Category</div>
                {categoryBreakdown.length === 0 ? (
                  <div style={s.emptyState}>No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={categoryBreakdown} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={70} label={false}>
                        {categoryBreakdown.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `₹${parseFloat(v).toFixed(2)}`} contentStyle={{ background: '#1a1d27', border: '1px solid #2d3148', borderRadius: '8px', fontSize: '13px' }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recent transactions preview */}
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={s.cardTitle}>Recent Transactions</div>
                <span style={{ fontSize: '12px', color: '#6366f1', cursor: 'pointer' }} onClick={() => setActiveTab('transactions')}>View all →</span>
              </div>
              {transactions.slice(0, 5).length === 0 ? (
                <div style={s.emptyState}>No transactions yet</div>
              ) : (
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Date</th>
                      <th style={s.th}>Category</th>
                      <th style={s.th}>Notes</th>
                      <th style={{ ...s.th, textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map(tx => (
                      <tr key={tx.id}>
                        <td style={s.td}>{tx.date?.split('T')[0] || '—'}</td>
                        <td style={s.td}><span style={s.categoryBadge(tx.category)}>{tx.category}</span></td>
                        <td style={{ ...s.td, color: '#64748b' }}>{tx.notes || '—'}</td>
                        <td style={{ ...s.td, textAlign: 'right', color: '#ef4444', fontWeight: '600' }}>₹{parseFloat(tx.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ── TRANSACTIONS TAB ── */}
        {activeTab === 'transactions' && (
          <div style={s.card}>
            {loading ? (
              <div style={s.emptyState}>Loading...</div>
            ) : transactions.length === 0 ? (
              <div style={s.emptyState}>
                No transactions yet.<br />
                <button style={{ ...s.addBtn, marginTop: '16px' }} onClick={() => setShowAddModal(true)}>Add your first transaction</button>
              </div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>#</th>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Category</th>
                    <th style={s.th}>Notes</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, i) => (
                    <tr key={tx.id}>
                      <td style={{ ...s.td, color: '#475569' }}>{i + 1}</td>
                      <td style={s.td}>{tx.date?.split('T')[0] || '—'}</td>
                      <td style={s.td}><span style={s.categoryBadge(tx.category)}>{tx.category}</span></td>
                      <td style={{ ...s.td, color: '#64748b' }}>{tx.notes || '—'}</td>
                      <td style={{ ...s.td, textAlign: 'right', color: '#ef4444', fontWeight: '600' }}>₹{parseFloat(tx.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── BUDGETS TAB ── */}
        {activeTab === 'budgets' && (
          <>
            {Object.keys(budgets).length === 0 ? (
              <div style={{ ...s.card, ...s.emptyState }}>
                No budgets set yet.<br />
                <button style={{ ...s.addBtn, marginTop: '16px' }} onClick={() => setShowBudgetModal(true)}>Set your first budget</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {Object.entries(budgets).map(([cat, limit]) => {
                  const spent = catSpendMap[cat] || 0;
                  const pct = (spent / limit) * 100;
                  return (
                    <div key={cat} style={{ ...s.card, minWidth: '220px', maxWidth: '260px' }}>
                      <div style={s.budgetRow}>
                        <span style={s.categoryBadge(cat)}>{cat}</span>
                        <span style={{ fontSize: '12px', color: pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981', fontWeight: '600' }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div style={{ marginTop: '10px', marginBottom: '4px' }}>
                        <div style={s.progressBar(pct)}>
                          <div style={s.progressFill(pct, CATEGORY_COLORS[cat] || '#6366f1')} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                        <span>₹{spent.toFixed(0)} spent</span>
                        <span>₹{limit} limit</span>
                      </div>
                      {pct >= 100 && <div style={{ marginTop: '8px', fontSize: '11px', color: '#ef4444' }}>🚨 Budget exceeded</div>}
                      {pct >= 80 && pct < 100 && <div style={{ marginTop: '8px', fontSize: '11px', color: '#f59e0b' }}>⚠️ Approaching limit</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── ADD TRANSACTION MODAL ── */}
      {showAddModal && (
        <div style={s.modal} onClick={() => setShowAddModal(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>Add Transaction</div>
            <form onSubmit={handleAddTx}>
              <label style={s.label}>Amount (₹)</label>
              <input style={s.input} type="number" placeholder="0.00" step="0.01" min="0"
                value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })} required />
              <label style={s.label}>Category</label>
              <select style={s.select} value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label style={s.label}>Notes (optional)</label>
              <input style={s.input} type="text" placeholder="What was this for?"
                value={newTx.notes} onChange={e => setNewTx({ ...newTx, notes: e.target.value })} />
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" style={s.submitBtn}>Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SET BUDGET MODAL ── */}
      {showBudgetModal && (
        <div style={s.modal} onClick={() => setShowBudgetModal(false)}>
          <div style={{ ...s.modalBox, width: '420px' }} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>Set Monthly Budgets</div>
            <div style={{ maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
              {CATEGORIES.map(cat => (
                <div key={cat} style={{ marginBottom: '14px' }}>
                  <label style={s.label}>{cat} <span style={{ color: '#475569' }}>(current: {budgets[cat] ? `₹${budgets[cat]}` : 'not set'})</span></label>
                  <input style={s.input} type="number" placeholder={`Budget for ${cat}`} min="0"
                    value={budgetEdit[cat] || ''}
                    onChange={e => setBudgetEdit({ ...budgetEdit, [cat]: e.target.value })} />
                </div>
              ))}
            </div>
            <div style={s.modalActions}>
              <button type="button" style={s.cancelBtn} onClick={() => { setShowBudgetModal(false); setBudgetEdit({}); }}>Cancel</button>
              <button type="button" style={s.submitBtn} onClick={saveBudgets}>Save Budgets</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
