# Birkenstock Shop Backend

This is the backend server for the Birkenstock Shop, handling payment processing via Paystack and order management.

## Features

- Mobile Money payment integration with Paystack
- Order processing and management
- Email notifications for successful orders
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Paystack account and API keys
- Gmail account for sending order notifications (or configure another email service)

## Setup

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the backend directory and add your environment variables:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Paystack Configuration
   PAYSTACK_SECRET_KEY=your_paystack_secret_key_here
   PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
   PAYSTACK_BASE_URL=https://api.paystack.co

   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password_or_app_password
   ADMIN_EMAIL=tiankay999@gmail.com
   ```

   **Note for Gmail users:**
   - You'll need to generate an "App Password" if you have 2FA enabled
   - Alternatively, enable "Less secure app access" in your Google Account settings (not recommended for production)

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will be available at `http://localhost:5000`

## API Endpoints

### Initialize Payment
- **URL:** `POST /api/paystack/initialize`
- **Description:** Initialize a new payment transaction
- **Request Body:**
  ```json
  {
    "email": "customer@example.com",
    "amount": 5000,
    "metadata": {
      "orderId": "ORDER123",
      "items": [
        {
          "name": "Product 1",
          "price": 2500,
          "quantity": 2
        }
      ],
      "shippingAddress": "123 Main St, City, Country",
      "phone": "+1234567890"
    }
  }
  ```
- **Success Response:**
  ```json
  {
    "status": true,
    "message": "Authorization URL created",
    "data": {
      "authorization_url": "https://checkout.paystack.com/xxx",
      "access_code": "xxx",
      "reference": "xxx"
    }
  }
  ```

### Verify Payment
- **URL:** `GET /api/paystack/verify/:reference`
- **Description:** Verify a payment transaction
- **Success Response:**
  ```json
  {
    "status": true,
    "message": "Verification successful",
    "data": {
      "amount": 5000,
      "status": "success",
      "reference": "xxx",
      "customer": {
        "email": "customer@example.com"
      },
      "metadata": {
        "orderId": "ORDER123"
      }
    }
  }
  ```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| PORT | Port to run the server on | No | 5000 |
| NODE_ENV | Node environment (development/production) | No | development |
| PAYSTACK_SECRET_KEY | Your Paystack secret key | Yes | - |
| PAYSTACK_PUBLIC_KEY | Your Paystack public key | Yes | - |
| PAYSTACK_BASE_URL | Paystack API base URL | No | https://api.paystack.co |
| EMAIL_SERVICE | Email service provider (e.g., gmail) | Yes | - |
| EMAIL_USER | Email address for sending notifications | Yes | - |
| EMAIL_PASS | Email password or app password | Yes | - |
| ADMIN_EMAIL | Admin email to receive order notifications | Yes | - |

## Security Considerations

- Never commit your `.env` file to version control
- Use environment variables for all sensitive information
- Enable CORS only for trusted domains in production
- Implement rate limiting for API endpoints
- Use HTTPS in production

## License

MIT
