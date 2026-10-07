# SauceDemo E2E (Playwright + TypeScript)

Automated checkout flow for https://www.saucedemo.com using `standard_user`.

## Setup
Requires Node.js 18+.

```bash
npm install
npx playwright install chromium
```

## Run
```bash
npm test               # headless
npm run test:headed    # watch it run
npm run report         # open HTML report (after a run)
```

Optional env vars: `BASE_URL`, `SAUCE_USER`, `SAUCE_PASS` (defaults are the public demo credentials).

## What is covered
| Test | Purpose |
|---|---|
| `standard_user completes checkout...` | Login -> add 2 items -> cart -> info -> overview (subtotal/tax/total recomputed) -> finish -> confirmation |
| `checkout form requires ...` | Negative path: required-field validation blocks progress |
| `should not allow checkout with an empty cart` | Documents DEFECT-1 using `test.fail` (expected to fail until fixed) |

## Design notes
- Page Object Model in `pages/`; selectors use `data-test` ids via `testIdAttribute` and role-based locators for buttons.
- No hard-coded waits; only Playwright auto-waiting and web-first assertions.
- Isolation: each test runs in a fresh browser context (cart lives in localStorage), logs in itself, shares no state.
- Prices are read from the UI and totals recomputed independently, so the test does not just echo what the app shows.

## Limitations
- Tax rate (8%) is inferred from observed behavior, not a documented requirement.
- Targets a public demo site: no data setup/teardown needed, but availability and behavior are outside our control.
- Chromium only; no cross-browser or mobile viewport coverage.
- Login is done through the UI in `beforeEach` (slower than seeding storage state; chosen for simplicity).
