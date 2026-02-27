# Ticketing UI

Next.js frontend for the ticketing API. Browse events, reserve seats, and complete checkout.

## Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local if API is not at http://localhost:3001
```

## Run

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002). Ensure the ticketing API is running at `http://localhost:3001`.

## Features

- **Home** – Hero and link to events
- **Events** – List published events (GET /events)
- **Event detail** – Single event (GET /events/:id)
- **Seats** – Seat map, reserve seats (GET /events/:id/seats, POST /reservations)
- **Checkout** – Payment intent (POST /orders/checkout)
- **Auth** – Login, Register (POST /auth/login, /auth/register)

## API

Configure `NEXT_PUBLIC_API_URL` to point at the ticketing API. Default: `http://localhost:3001`.
# ticketing-ui
