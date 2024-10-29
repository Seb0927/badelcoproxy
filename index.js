const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mercadopago = require('mercadopago');

const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

app.use(cors());
app.use(express.json()); // To parse JSON bodies

const client = new mercadopago.MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });

app.all('/api/*', async (req, res) => {
  const path = req.params[0]; // Get the path after /api/
  const query = req.query; // Get the query parameters
  delete req.headers.host; // For avoiding certification error
  delete req.headers.referer; // For avoiding certification error
  const targetUrl = `https://dev.same.com.co/api/public/${path}`;

  // Retrieve headers from the incoming request
  const incomingHeaders = req.headers;

  // Remove 'apiKey' and 'secretKey' from the headers
  const { apiKey, secretKey, ...filteredHeaders } = incomingHeaders;

  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: filteredHeaders,
      params: query,
      data: req.body, // Forward the request body if present
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

// New endpoint to create a Mercado Pago preference
app.post('/create_preference', async (req, res) => {
  const { title, unit_price, quantity, email, name, surname, phone_number } = req.body;
  console.log(title)

  const elements = {
    items: [
      {
        title,
        unit_price,
        quantity,
      },
    ],
    back_urls: {
      success: 'https://your-website.com/success',
      failure: 'https://your-website.com/failure',
      pending: 'https://your-website.com/pending',
    },
    "binary_mode": true,
    payment_methods: {
      excluded_payment_methods: [],
      excluded_payment_types: [
        {
          id: "credit_card"
        },
        {
          id: "debit_card"
        },
        {
          id: "ticket"
        }
      ],
      installments: 1
    },
    payer: {
      phone: {
        area_code: '57',
        number: phone_number
      },
      email: email,
      name: name,
      surname: surname,
    },
    statement_descriptor: "BADELCO",
    
  };

  try {
    const preference = new mercadopago.Preference(client);
    const response = await preference.create({ body: elements });
    res.json(response);
  } catch (error) {
    console.error('Error creating preference:', error);
    res.status(500).send('Error creating preference');
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});