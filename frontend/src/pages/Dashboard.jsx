import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionApi, analyticsApi } from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [monthlySpending, setMonthlySpending] = useState([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [newTransaction, setNewTransaction] = useState({ amount: '', category: '', notes: '' });

    const fetchData = async () => {
        try {
            const txRes = await transactionApi.get('/transactions/');
            setTransactions(txRes.data);

            // Fetch analytics - passing user_id as query param for the simplified service
            const monthlyRes = await analyticsApi.get('/analytics/monthly', { params: { user_id: user.username } });
            setMonthlySpending(monthlyRes.data);

            const catRes = await analyticsApi.get('/analytics/category', { params: { user_id: user.username } });
            setCategoryBreakdown(catRes.data);
        } catch (e) {
            console.error("Failed to fetch data", e);
            // Ensure transactions is always an array even if fetch fails or returns weird data
            if (!Array.isArray(transactions)) setTransactions([]);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            await transactionApi.post('/transactions/', newTransaction);
            setNewTransaction({ amount: '', category: '', notes: '' });
            fetchData();
        } catch (e) {
            console.error("Failed to add transaction", e);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Welcome, {user.username}</h1>
                <button onClick={logout} style={{ padding: '8px', background: 'red', color: 'white' }}>Logout</button>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h2>Monthly Spending</h2>
                    <BarChart width={300} height={200} data={monthlySpending}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <CartesianGrid stroke="#f5f5f5" />
                        <Bar dataKey="total" fill="#8884d8" />
                    </BarChart>
                </div>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h2>Category Breakdown</h2>
                    <BarChart width={300} height={200} data={categoryBreakdown}>
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <CartesianGrid stroke="#f5f5f5" />
                        <Bar dataKey="total" fill="#82ca9d" />
                    </BarChart>
                </div>
            </div>

            <h2>Add Transaction</h2>
            <form onSubmit={handleAddTransaction} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="number"
                    placeholder="Amount"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Notes"
                    value={newTransaction.notes}
                    onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                />
                <button type="submit">Add</button>
            </form>

            <h2>Recent Transactions</h2>
            <ul>
                {transactions.map((tx) => (
                    <li key={tx.id}>
                        {tx.date.split('T')[0]} - {tx.category}: ${tx.amount} ({tx.notes})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
