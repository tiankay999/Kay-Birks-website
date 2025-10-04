# Architecture Overview

## System Architecture

The Kay Birks Web3 E-commerce platform follows a modern full-stack architecture with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  Next.js 14 (App Router) + React + TypeScript + Tailwind   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │  Hooks   │  │  State   │   │
│  │          │  │   (UI)   │  │  (wagmi) │  │(Zustand) │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (Next.js)                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Products   │  │    Orders    │  │   Webhooks   │     │
│  │   /api/...   │  │   /api/...   │  │   /api/...   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Prisma ORM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                       │
│                                                              │
│  Products | Orders | Users | Payments | Variants | etc.    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Blockchain Layer                           │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Smart Contract  │◄────────┤  Web3 Provider   │         │
│  │ PaymentProcessor │         │  (Alchemy/RPC)   │         │
│  └──────────────────┘         └──────────────────┘         │
│         │                                                    │
│         │ Events                                            │
│         ▼                                                    │
│  ┌──────────────────┐                                       │
│  │  Event Listener  │─────► Update Database                │
│  │    (Webhook)     │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
src/
├── app/
│   ├── (routes)/          # Page components
│   ├── api/               # API route handlers
│   └── layout.tsx         # Root layout with providers
├── components/
│   ├── ui/                # Reusable UI components (shadcn)
│   ├── product-card.tsx   # Product display
│   ├── wallet-connect.tsx # Web3 wallet integration
│   ├── navbar.tsx         # Navigation
│   └── footer.tsx         # Footer
└── lib/
    ├── wagmi-config.ts    # Web3 configuration
    ├── prisma.ts          # Database client
    ├── store.ts           # State management
    └── utils.ts           # Utility functions
```

### Data Flow

1. **User browses products** → Server-side rendered pages with Prisma queries
2. **User adds to cart** → Client-side Zustand store (localStorage persistence)
3. **User proceeds to checkout** → API creates order in database
4. **User connects wallet** → wagmi handles wallet connection
5. **User initiates payment** → Smart contract interaction via viem
6. **Transaction confirmed** → Webhook updates order status
7. **Order fulfilled** → Admin dashboard or automated process

## Payment Flow Sequence

```
User                Frontend            API                Database          Blockchain
 │                     │                 │                    │                  │
 │──Add to Cart──────►│                 │                    │                  │
 │                     │──Store in───────┤                    │                  │
 │                     │  Zustand        │                    │                  │
 │                     │                 │                    │                  │
 │──Checkout─────────►│                 │                    │                  │
 │                     │──POST /orders──►│                    │                  │
 │                     │                 │──Create Order─────►│                  │
 │                     │                 │                    │                  │
 │                     │◄────orderData───│◄──orderNumber─────│                  │
 │                     │                 │                    │                  │
 │──Connect Wallet───►│                 │                    │                  │
 │                     │──wagmi connect──┤                    │                  │
 │                     │                 │                    │                  │
 │──Pay with ETH─────►│                 │                    │                  │
 │                     │──writeContract──┼────────────────────┼──payWithETH()──►│
 │                     │                 │                    │                  │
 │                     │                 │                    │                  │──Emit Event
 │                     │                 │                    │                  │  OrderPaid
 │                     │                 │                    │                  │
 │                     │◄────txHash──────┼────────────────────┼◄─────────────────│
 │                     │                 │                    │                  │
 │                     │                 │                    │                  │
 │                     │──────────────────┼──Webhook (txHash)─►│                  │
 │                     │                 │                    │                  │
 │                     │                 │──Update Status────►│                  │
 │                     │                 │   (PAID)           │                  │
 │                     │                 │                    │                  │
 │◄──Confirmation─────│                 │                    │                  │
 │  Page              │                 │                    │                  │
```

## Security Layers

1. **Input Validation**: Zod schemas on both client and server
2. **Authentication**: NextAuth.js with session management
3. **Authorization**: Role-based access control (USER, ADMIN)
4. **Smart Contract**: Audited Solidity code with security patterns
5. **Rate Limiting**: API endpoint protection
6. **Database**: Prisma with parameterized queries (SQL injection protection)

## State Management

- **Cart State**: Zustand with localStorage persistence
- **Web3 State**: wagmi hooks (account, network, transactions)
- **Server State**: React Query via wagmi
- **Form State**: React Hook Form

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel Edge                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js Application                      │  │
│  │  (SSR, API Routes, Static Assets)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │  PostgreSQL  │ │   Ethereum   │ │    Alchemy   │
   │   (Neon)     │ │   Sepolia    │ │   RPC API    │
   └──────────────┘ └──────────────┘ └──────────────┘
```

## Technology Decisions

### Why Next.js 14?
- Server Components for better performance
- App Router for modern routing
- API Routes for backend logic
- Built-in optimization

### Why Prisma?
- Type-safe database access
- Excellent TypeScript support
- Migration management
- Easy schema definition

### Why wagmi?
- Best-in-class React hooks for Ethereum
- Excellent TypeScript support
- Built on viem (lightweight alternative to ethers.js)
- Active development and community

### Why Zustand?
- Simple and minimal
- No boilerplate
- Great TypeScript support
- Perfect for cart state

## Performance Optimizations

1. **Server-Side Rendering**: Product pages pre-rendered
2. **Static Generation**: Static pages cached at edge
3. **Image Optimization**: Next.js Image component
4. **Code Splitting**: Automatic with Next.js
5. **Database Indexing**: Optimized Prisma schema
6. **API Route Caching**: Strategic cache headers

## Scalability Considerations

- **Horizontal Scaling**: Stateless Next.js instances on Vercel
- **Database**: Connection pooling with Prisma
- **CDN**: Static assets served from edge
- **Background Jobs**: Webhook processing for heavy operations
- **Caching**: Price oracle results cached
