# CryptoTrader — Implementation Steps

> Each step is small enough to be implemented and tested in one session.  
> Implement one step at a time. Mark `[x]` when done.

---

## Step 1 — Database Schema ✅ Starting now
- [ ] Add `TradingLog`, `Strategy`, `TradingAccount` models to `schema.prisma`
- [ ] Add relations to `User` model
- [ ] Run `prisma migrate dev --name add-crypto-trading`
- [ ] Verify tables created in Prisma Studio

---

## Step 2 — TradingLog Backend (after Step 1)
- [ ] Create `trading-log/` module inside `backend/src/modules/trading/`
- [ ] Create DTOs in `shared/`: `CreateTradingLogDto`, `UpdateTradingLogDto`
- [ ] Implement `TradingLogRepository` (filter by month, week, date)
- [ ] Implement `TradingLogService`
- [ ] Implement `TradingLogController`:
  - `GET /trading/logs?month=YYYY-MM`
  - `GET /trading/logs?week=YYYY-WNN`
  - `GET /trading/logs/:id`
  - `POST /trading/logs`
  - `PUT /trading/logs/:id`
  - `DELETE /trading/logs/:id`

---

## Step 3 — Strategy Backend (after Step 1)
- [ ] Create `strategy/` module inside `backend/src/modules/trading/`
- [ ] Create DTOs: `CreateStrategyDto`, `UpdateStrategyDto`, `ReorderStrategiesDto`
- [ ] Implement `StrategyRepository`, `StrategyService`, `StrategyController`:
  - `GET /trading/strategies`
  - `POST /trading/strategies`
  - `PUT /trading/strategies/:id`
  - `DELETE /trading/strategies/:id`
  - `PATCH /trading/strategies/reorder`

---

## Step 4 — Trading Frontend Layout (after Steps 2 & 3)
- [ ] Create `frontend/src/app/(protection)/trading/` route group
- [ ] Create `layout.tsx` with 4-tab nav (Logs, Strategies, Binance, News)
- [ ] Add placeholder `page.tsx` files for each tab route
- [ ] Add "Trading" link to the main sidebar navigation

---

## Step 5 — Daily Logs UI (after Step 4)
- [ ] Install `@tiptap/react` + required extensions
- [ ] Build `TradingViewChart` client component (TradingView free embed)
- [ ] Build `/trading` page with split-panel layout (chart left, editor right)
- [ ] Build monthly calendar with sentiment-colored dots
- [ ] Build week list view toggle
- [ ] Build log editor: TipTap + sentiment selector + auto-save
- [ ] Build log streak counter

---

## Step 6 — Strategies UI (after Step 4)
- [ ] Install `@dnd-kit/core` + `@dnd-kit/sortable`
- [ ] Build `/trading/strategies` page (chart top half, cards bottom half)
- [ ] Implement drag-and-drop; persist order via `PATCH /reorder`
- [ ] Build strategy create/edit slide-in panel with TipTap
- [ ] Build strategy detail view

---

## Step 7 — Binance Backend (after Step 1)
- [ ] Create `CryptoService` for AES-256 encryption/decryption
- [ ] Add `ENCRYPTION_KEY` to `.env`
- [ ] Implement `BinanceAccountService` (connect, disconnect, fetch balance)
- [ ] Implement price fetcher endpoint
- [ ] Routes: `/trading/binance/connect`, `/disconnect`, `/account`, `/prices`

---

## Step 8 — Binance UI (after Step 7)
- [ ] Build `useBinanceTicker` WebSocket hook for live prices
- [ ] Build `/trading/binance` page (connection form + balance display)
- [ ] Show Connected / Disconnected status badge

---

## Step 9 — News Backend (after Step 1)
- [ ] Register CryptoPanic API key → add to `.env`
- [ ] Create `news/` module with `NewsService` (proxy + coin filter)
- [ ] Route: `GET /trading/news?currencies=BTC,ETH`

---

## Step 10 — News UI (after Step 9)
- [ ] Build `/trading/news` page with coin filter tabs
- [ ] Build news card list (headline, source, sentiment badge)
- [ ] Add "Save to Log" action
- [ ] Add 5-min auto-refresh via React Query

---

## Step 11 — i18n & Polish (final)
- [ ] Add all new text keys to `en.json` + `vn.json`
- [ ] Add loading skeletons to all async components
- [ ] Add empty state UIs (no logs yet, no strategies yet)
- [ ] Verify responsive layout and dark mode consistency
