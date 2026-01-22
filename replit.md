# Discord Payment Bot

## Overview
A full-stack web application that serves as a dashboard for managing a Discord payment bot. The application allows users to manage an automated store and view real-time transactions.

## Tech Stack
- **Frontend**: React 18 with Vite, TailwindCSS, Radix UI components
- **Backend**: Express.js 5 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query

## Project Structure
```
├── client/              # React frontend
│   ├── src/            # Frontend source code
│   └── index.html      # HTML entry point
├── server/             # Express backend
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   ├── db.ts           # Database connection
│   ├── discord.ts      # Discord bot integration
│   └── vite.ts         # Vite dev server middleware
├── shared/             # Shared code between client/server
│   ├── schema.ts       # Database schema (Drizzle)
│   └── routes.ts       # Shared route definitions
├── script/
│   └── build.ts        # Production build script
└── attached_assets/    # Static assets
```

## Development Commands
- `npm run dev` - Start development server (port 5000)
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run db:push` - Push database schema changes

## Configuration
- **Port**: 5000 (both API and frontend served together)
- **Database**: PostgreSQL via DATABASE_URL environment variable
- **Discord**: Optional DISCORD_TOKEN for bot functionality

## Database Schema
The app uses a single `invoices` table to track payment transactions with fields for:
- Payment ID, status, address, amount, currency
- Order description
- User ID (Discord user)
- Product ID
- Timestamps

## External Deployment (Render.com)
To host this on Render.com with a custom domain:

### Step 1: Create a Web Service
1. Sign in to [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.

### Step 2: Configure Build & Start Commands
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`

### Step 3: Environment Variables
Add these in the **Environment** tab:
- `NODE_ENV`: `production`
- `PORT`: `5000`
- `DATABASE_URL`: Your PostgreSQL connection string (Internal or External)
- `DISCORD_TOKEN`: Your Discord Bot Token
- `MONEYMOTION_API_KEY`: Your Moneymotion API key
- `NOWPAYMENTS_API_KEY`: Your NOWPayments API key
- `NOWPAYMENTS_IPN_SECRET`: Your NOWPayments IPN secret
- `APP_URL`: The URL of your Render service (e.g., `https://your-app.onrender.com`)

### Step 4: Database Setup (Optional)
This version of the bot uses in-memory storage, so you don't strictly need a database to start. However, if you want your transaction history to persist after a restart, you can still connect a PostgreSQL database via `DATABASE_URL`.

### Custom Domain
The app is configured to listen on `0.0.0.0`, so it will automatically work with your custom domain once pointed to Render.
