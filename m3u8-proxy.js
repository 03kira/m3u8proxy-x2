// video-proxy.js
const express = require('express');
const axios = require('axios');
const app = express();

app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl || !targetUrl.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid or missing URL' });
    }

    try {
        // Proxy headers (simulate a real browser request)
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
            'Accept': '*/*',
            'Referer': 'https://dwish.pro/', // you can replace this if needed
            'Accept-Encoding': 'identity', // don't gzip video segments
        };

        // Stream response
        const response = await axios.get(targetUrl, {
            headers,
            responseType: 'stream',
        });

        // Set CORS headers
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Content-Type': response.headers['content-type'],
            'Cache-Control': 'no-cache',
        });

        response.data.pipe(res);
    } catch (err) {
        console.error('Proxy Error:', err.message);
        res.status(500).json({ error: 'Proxy failed', detail: err.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Video proxy running on http://localhost:${PORT}`);
});
