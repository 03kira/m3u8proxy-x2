const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const router = express.Router();

// Enable global CORS
app.use(cors());

router.get("/", (req, res) => {
  res.end(`Welcome!`);
});

async function getFreshCookie() {
    const { headers } = await axios.get('https://dwish.pro', {
        headers: { 'User-Agent': 'Mozilla/5.0...' }
    });
    return headers['set-cookie']?.[0] || 'lang=1';
}

router.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: 'Missing URL' });

    try {
        const freshCookie = await getFreshCookie();
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0...',
                'Cookie': freshCookie,
                'Referer': 'https://dwish.pro/',
            },
            responseType: 'stream',
        });

        response.data.pipe(res);
    } catch (err) {
        res.status(500).json({ error: 'Proxy failed', details: err.message });
    }
});

// Mount the router
app.use('/', router);

// Export the app for Vercel
module.exports = app;
