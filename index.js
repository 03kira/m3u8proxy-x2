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

router.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl || !targetUrl.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid or missing URL' });
    }

    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
            'Accept': '*/*',
            'Referer': 'https://dwish.pro/',
            'Accept-Encoding': 'identity',
        };

        const response = await axios.get(targetUrl, {
            headers,
            responseType: 'stream',
        });

        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Content-Type': response.headers['content-type'] || 'application/octet-stream',
            'Cache-Control': 'no-cache',
        });

        response.data.pipe(res);
    } catch (err) {
        console.error('Proxy Error:', err.message);
        res.status(500).json({ error: 'Proxy failed', detail: err.message });
    }
});

// Mount the router
app.use('/', router);

// Export the app for Vercel
module.exports = app;
