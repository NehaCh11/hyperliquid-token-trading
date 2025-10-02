const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Production CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

app.use(express.json());

const API_URL = 'https://api.hyperliquid-testnet.xyz';

// Health check (Railway/Vercel need this)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error wrapper
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

app.post('/api/balances', asyncHandler(async (req, res) => {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Address required' });
    
    const response = await axios.post(`${API_URL}/info`, {
        type: 'spotClearinghouseState',
        user: address
    });
    res.json(response.data);
}));

app.post('/api/orderbook', asyncHandler(async (req, res) => {
    const { coin } = req.body;
    if (!coin) return res.status(400).json({ error: 'Coin required' });
    
    const response = await axios.post(`${API_URL}/info`, {
        type: 'l2Book',
        coin: coin
    });
    res.json(response.data);
}));

app.post('/api/open-orders', asyncHandler(async (req, res) => {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Address required' });
    
    const response = await axios.post(`${API_URL}/info`, {
        type: 'openOrders',
        user: address
    });
    res.json(response.data);
}));

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));