require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const nodemailer = require('nodemailer');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Configure Paystack
const paystack = axios.create({
  baseURL: process.env.PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Birkenstock Backend API' });
});

// Initialize payment
app.post('/api/paystack/initialize', async (req, res) => {
  try {
    const { email, amount, metadata } = req.body;
    
    const response = await paystack.post('/transaction/initialize', {
      email,
      amount: amount * 100, // Convert to kobo
      currency: 'GHS', // Ghanaian Cedi for mobile money
      channels: ['mobile_money'],
      metadata,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Payment initialization error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to initialize payment',
      details: error.response?.data || error.message 
    });
  }
});

// Verify payment
app.get('/api/paystack/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const response = await paystack.get(`/transaction/verify/${reference}`);
    
    if (response.data.data.status === 'success') {
      // Send email notification for successful payment
      await sendOrderConfirmationEmail(response.data.data);
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Payment verification failed',
      details: error.response?.data || error.message 
    });
  }
});

// Send order confirmation email
async function sendOrderConfirmationEmail(paymentData) {
  try {
    const { customer, amount, metadata } = paymentData;
    const orderItems = metadata.items || [];
    
    const mailOptions = {
      from: `"Birkenstock Store" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Order #${metadata.orderId || 'N/A'}`,
      html: `
        <h2>New Order Received</h2>
        <p><strong>Order ID:</strong> ${metadata.orderId || 'N/A'}</p>
        <p><strong>Customer:</strong> ${customer.email}</p>
        <p><strong>Amount:</strong> GHS ${(amount / 100).toFixed(2)}</p>
        <h3>Order Items:</h3>
        <ul>
          ${orderItems.map(item => `
            <li>
              ${item.name} - ${item.quantity} x GHS ${item.price.toFixed(2)}
              ${item.color ? `<br>Color: ${item.color}` : ''}
              ${item.size ? `<br>Size: ${item.size}` : ''}
            </li>
          `).join('')}
        </ul>
        <p><strong>Shipping Address:</strong></p>
        <p>${metadata.shippingAddress || 'N/A'}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent');
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
