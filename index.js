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
        return res.status(400).json({ error: 'Invalid URL' });
    }

    try {
        // Use the exact Referer from where the HLS stream is loaded
        const referer = targetUrl.includes('/stream/') 
            ? 'https://dwish.pro/e/p7m9omw9h5if' 
            : 'https://dwish.pro/';

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': referer,
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Connection': 'keep-alive',
            'Cookie': 'lang=1', // Critical for session
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            // Cloudflare often checks these:
            'Accept-Encoding': 'identity', // Avoid compression issues
        };

        const response = await axios.get(targetUrl, {
            headers,
            responseType: 'stream',
            decompress: false, // Bypass automatic decompression
            timeout: 10000, // 10s timeout
        });

        // Forward critical headers
        const allowedHeaders = [
            'content-type',
            'content-length',
            'cache-control',
            'last-modified',
        ];

        allowedHeaders.forEach(header => {
            if (response.headers[header]) {
                res.set(header, response.headers[header]);
            }
        });

        res.set('Access-Control-Allow-Origin', '*');
        response.data.pipe(res);
    } catch (err) {
        console.error('Proxy Error:', err.response?.status, err.message);
        res.status(err.response?.status || 500).json({
            error: 'Proxy failed',
            status: err.response?.status,
            details: err.message,
        });
    }
});

// Mount the router
app.use('/', router);

// Export the app for Vercel
module.exports = app;
