# Kay Birks Web3 E-commerce Platform

A production-ready e-commerce website that accepts cryptocurrency payments, built with Next.js 14, TypeScript, and Ethereum smart contracts.

## Features

- 🛍️ **Full E-commerce Functionality**: Product catalogue, cart, checkout, and order management
- 💎 **Crypto Payments**: Accept ETH and USDC via smart contracts on EVM networks
- 🔐 **Secure**: Smart contract powered payments with on-chain verification
- 🎨 **Modern UI**: Built with shadcn/ui, Tailwind CSS, and responsive design
- 📱 **Mobile-First**: Fully responsive design that works on all devices
- 🔌 **Web3 Integration**: WalletConnect and MetaMask support via wagmi
- 👤 **Customer Accounts**: Order history and saved addresses
- 🛡️ **Admin Dashboard**: Product, order, and inventory management
- ✅ **Type-Safe**: Full TypeScript coverage with Zod validation
- 🧪 **Tested**: Unit tests, component tests, and E2E tests

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: Zustand for cart, wagmi for Web3
- **Forms**: React Hook Form with Zod validation
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Web3**: viem, wagmi, WalletConnect
- **Smart Contracts**: Solidity, Hardhat
- **Testing**: Vitest, Testing Library, Playwright
- **Package Manager**: npm

## Prerequisites

- Node.js 20+ LTS
- npm (comes with Node.js)
- PostgreSQL database
- Ethereum wallet for testing
- Alchemy or Infura API key
- WalletConnect Project ID

## Quick Start

### 1. Clone and Install

```bash
cd web3-shop
npm install
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/web3shop"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Web3
NEXT_PUBLIC_ALCHEMY_API_KEY="your-alchemy-key"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-project-id"

# Contract addresses (after deployment)
NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_USDC_TOKEN_ADDRESS="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"

# Network
NEXT_PUBLIC_CHAIN_ID="11155111"
NEXT_PUBLIC_NETWORK_NAME="sepolia"

# Merchant
MERCHANT_WALLET_ADDRESS="0x..."
PRIVATE_KEY="your-private-key"
```

### 3. Database Setup

```bash
# Push schema to database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed with sample data
npm run db:seed
```

### 4. Deploy Smart Contract

```bash
# Compile contracts
npm run contract:compile

# Deploy to Sepolia testnet
npm run contract:deploy

# Verify on Etherscan (optional)
npm run contract:verify
```

After deployment, update `NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS` in `.env`.

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint

# Run all checks (CI)
npm run test:ci
```

## Admin Access

After seeding, you can access the admin panel:

- **Email**: `admin@kaybirks.shop`
- **Password**: `ChangeMe123!Secure` (change in production!)

## Smart Contract

The `PaymentProcessor` contract is located in `contracts/PaymentProcessor.sol`.

### Key Features

- Accept ETH and ERC20 token payments
- Register orders on-chain
- Merchant withdrawal functions
- Pausable for emergency stops
- Events for order tracking

### Contract Functions

- `payWithETH(orderId)` - Pay for order with ETH
- `payWithToken(orderId, token, amount)` - Pay with ERC20
- `isOrderPaid(orderId)` - Check payment status
- `withdrawETH(amount)` - Withdraw ETH (admin)
- `withdrawToken(token, amount)` - Withdraw tokens (admin)

## Project Structure

```
web3-shop/
├── contracts/              # Solidity smart contracts
├── scripts/                # Deployment scripts
├── src/
│   ├── app/               # Next.js app router pages
│   │   ├── api/           # API routes
│   │   ├── checkout/      # Checkout flow
│   │   └── ...
│   ├── components/        # React components
│   │   ├── ui/           # shadcn UI components
│   │   └── ...
│   └── lib/              # Utilities and configs
├── prisma/               # Database schema and migrations
├── e2e/                  # Playwright E2E tests
├── public/               # Static assets
└── docs/                 # Documentation
```

## API Endpoints

- `POST /api/orders` - Create order
- `GET /api/orders?email=` - Get user orders
- `GET /api/products` - List products
- `POST /api/webhooks/payment` - Payment webhook

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database

Use a managed PostgreSQL provider:
- Neon (recommended)
- Supabase
- Railway
- Render

### Environment Variables

Ensure all production environment variables are set:
- Database connection string
- NextAuth secret (generate new)
- RPC provider keys
- Contract addresses
- Merchant wallet

### Post-Deployment Checklist

- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Generate new `NEXTAUTH_SECRET`
- [ ] Configure custom domain
- [ ] Enable SSL/HTTPS
- [ ] Run database migrations
- [ ] Test payment flow on testnet
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure CORS if needed
- [ ] Test all wallet connections
- [ ] Verify contract on Etherscan

## Network Configuration

The app is configured for Sepolia testnet by default. To switch networks:

1. Update `NEXT_PUBLIC_CHAIN_ID` in `.env`
2. Update RPC URLs in `src/lib/wagmi-config.ts`
3. Deploy contract to new network
4. Update contract addresses

### Supported Networks

- **Sepolia** (default): ChainID 11155111
- **Mainnet**: ChainID 1 (production)
- **Local Hardhat**: ChainID 1337 (development)

## Adding Solana Pay (Future)

The codebase includes an adapter interface for adding Solana Pay support:

1. Implement Solana payment adapter
2. Add Solana wallet connectors
3. Deploy Solana program
4. Update payment selection UI

## Troubleshooting

### Wallet Connection Issues

- Ensure WalletConnect Project ID is valid
- Check network matches contract deployment
- Clear browser cache and reconnect

### Transaction Failures

- Verify sufficient gas in wallet
- Check contract is not paused
- Ensure token approval for ERC20 payments

### Database Connection

- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Run `pnpm db:push` to sync schema

## Security

- Never commit `.env` file
- Store private keys securely
- Use environment variables for secrets
- Validate all user inputs
- Rate limit API endpoints
- Keep dependencies updated

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Run `pnpm test:ci`
5. Submit pull request

## License

MIT License - See LICENSE file

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@kaybirks.shop

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Web3 powered by [wagmi](https://wagmi.sh)
- Smart contracts with [Hardhat](https://hardhat.org)

---

**Happy Shopping with Crypto! 🚀**
