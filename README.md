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

## Testing

- **Prechecks (lint + unit tests, like the backend)**  
  - `npm run check` – lint + unit tests (run before commit/CI).  
  - `npm run check:e2e` – install Playwright browsers (if needed) then run E2E tests. Use this if `npm run test:e2e` fails with “Executable doesn’t exist” (browsers not installed).

- **Unit & integration (Vitest + React Testing Library)**  
  - `npm run test` – run once  
  - `npm run test:watch` – watch mode  
  - `npm run test:coverage` – coverage report  
  - Tests: `src/**/*.test.{ts,tsx}` (e.g. `format.test.ts`, `api.test.ts`, `header.test.tsx`, `login/page.test.tsx`).

- **E2E (Playwright)**  
  - First time or after Playwright upgrade: run `npm run check:e2e` once (installs browsers), or `npx playwright install`.  
  - `npm run test:e2e` – runs E2E tests (starts the app on port 3002 if not already running).  
  - `npm run test:e2e:ui` – Playwright UI.  
  - Specs: `e2e/*.spec.ts`.  
  - If the dev server fails to start in your environment, run `npm run dev` in another terminal, then run `npm run test:e2e` (it will reuse the existing server).

## Docker

- **Build and run**  
  ```bash
  docker build -t ticketing-ui .
  docker run -p 3002:3002 ticketing-ui
  ```
  App is served at [http://localhost:3002](http://localhost:3002). Set `NEXT_PUBLIC_API_URL` via `-e` if the API is not at the default.

- **Run prechecks in Docker (lint + unit tests)**  
  ```bash
  docker build --target check -t ticketing-ui:check .
  docker run --rm ticketing-ui:check
  ```
