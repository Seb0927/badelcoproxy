const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.json()); // To parse JSON bodies

// Create an HTTPS agent that disables SSL certificate validation
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

app.all('/api/*', async (req, res) => {
  const path = req.params[0]; // Get the path after /api/
  const query = req.query; // Get the query parameters
  const targetUrl = `https://dev.same.com.co/api/public/${path}`;

  // Retrieve headers from the incoming request
  const incomingHeaders = req.headers;

  // Set up headers for the target request
  const headers = {
    ...incomingHeaders,
    'apiKey': process.env.VITE_API_KEY,
    'secretKey': process.env.VITE_SECRET_KEY,
  };

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: headers,
      params: query,
      data: req.body, // Forward the request body if present
      httpsAgent: httpsAgent, // Use the HTTPS agent that disables SSL certificate validation
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});