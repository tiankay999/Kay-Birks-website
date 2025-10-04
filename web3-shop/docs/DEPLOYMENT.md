# Deployment Guide

## Step-by-Step Deployment to Production

### 1. Prepare Database

**Option A: Neon (Recommended)**
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to Vercel environment variables

**Option B: Supabase**
1. Create project at [supabase.com](https://supabase.com)
2. Get PostgreSQL connection string
3. Add to environment variables

### 2. Deploy Smart Contract

```bash
# Ensure you have testnet ETH
# Deploy to Sepolia
pnpm contract:deploy

# Verify on Etherscan
pnpm contract:verify
```

Save the contract address.

### 3. Configure Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables (see .env.example)
4. Deploy

### 4. Run Database Migrations

```bash
# After first deploy
npx prisma migrate deploy
npx prisma db seed
```

### 5. Post-Deployment

- Test wallet connections
- Verify payment flow
- Check admin access
- Monitor logs

## Environment Variables Checklist

- [ ] DATABASE_URL
- [ ] NEXTAUTH_URL (production domain)
- [ ] NEXTAUTH_SECRET (new, secure)
- [ ] NEXT_PUBLIC_ALCHEMY_API_KEY
- [ ] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
- [ ] NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS
- [ ] MERCHANT_WALLET_ADDRESS

## Production Checklist

- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Database backups enabled
- [ ] Monitoring setup
- [ ] Error tracking (Sentry)
- [ ] Admin password changed
- [ ] Contract verified on Etherscan
- [ ] Test transactions completed
- [ ] Analytics configured
