# Procurement Hub

React and Vite app with four tabs: News, Categories, Indexes and Quiz.

- **News**: daily brief plus topic feeds, pulled from Google News RSS by `api/news.js`.
- **Categories**: 10 categories, each with a market condition tag and summary, price drivers, a supplier map and table, and its own news.
- **Indexes**: commodity benchmarks plus synthetic category indexes (equal weighted baskets of public suppliers, base 100). Tap any row to expand the chart.
- **Quiz**: 10 question rounds on sourcing strategy, plus questions built from the current price data.

Prices come from Yahoo Finance through `api/quotes.js`. If the feed fails, the app shows clearly labeled sample data.

## Run locally

```
npm install
npm run dev
```

The dev server also serves the `/api` functions, so no extra CLI is needed.

## Deploy to Vercel

Import the repo, set **Root Directory** to `procurement-hub`, and deploy. Framework preset is Vite. No environment variables needed.

## Edit content

- `src/data/categories.js`: categories, price symbols, supplier baskets, suppliers, news queries
- `src/data/quiz.js`: quiz questions
- `src/data/symbols.js`: display names and sample data levels
