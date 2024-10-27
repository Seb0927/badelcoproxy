const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/api/*', async (req, res) => {
  const { path, query } = req;
  const targetUrl = `https://dev.same.com.co${path.replace('/api', '')}`;

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'apiKey': process.env.VITE_API_KEY,
        'secretKey': process.env.VITE_SECRET_KEY,
      },
      params: query,
    });

    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});