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
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.5',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Priority': 'u=1, i',
            'Sec-Ch-Ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Brave";v="138"',
            'Sec-Ch-Ua-Mobile': '?1',
            'Sec-Ch-Ua-Platform': '"Android"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Gpc': '1',
            'Cookie': 'lang=1'
        };

        const response = await axios.get(targetUrl, {
            headers,
            responseType: 'stream',
            // Important: Don't automatically decompress the response
            decompress: false
        });

        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Content-Type': response.headers['content-type'] || 'application/octet-stream',
            'Cache-Control': 'no-cache',
            // Forward important headers from the original response
            ...(response.headers['content-encoding'] && { 
                'Content-Encoding': response.headers['content-encoding'] 
            })
        });

        response.data.pipe(res);
    } catch (err) {
        console.error('Proxy Error:', err.message);
        res.status(500).json({ 
            error: 'Proxy failed', 
            detail: err.message,
            ...(err.response && { status: err.response.status })
        });
    }
});

// Mount the router
app.use('/', router);

// Export the app for Vercel
module.exports = app;
