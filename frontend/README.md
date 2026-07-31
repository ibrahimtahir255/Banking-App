# PIG Bank — React frontend

Implements the `Banking Wireframes.dc.html` design (screens 2a, 1a, 1b, 1c, 1d)
against the FastAPI + MongoDB Atlas backend in `Banking-App/`.

## Run it

```bash
npm install
cp .env.example .env      # point VITE_API_BASE_URL at your running FastAPI server
npm run dev
```

The backend needs CORS enabled for the Vite dev origin (`http://localhost:5173`).
FastAPI example, add to `app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## What's real vs. mocked

The backend currently has no `/login` route and no "list accounts for a
user" route — only fetch-by-single-id. Rather than block on that, this
build talks to the **real** API for everything money-related, and mocks
only the identity/session layer:

| Real (hits your FastAPI + MongoDB) | Mocked (browser localStorage) |
|---|---|
| Creating a user (`POST /api/users`) | Password verification (no endpoint exists) |
| Creating an account (`POST /api/accounts`) | Which account IDs belong to which logged-in email |
| Account balances (`GET /api/accounts/{id}`) | |
| Deposits / withdrawals | |
| Transaction history | |

See `src/api/mockAuth.js` — it's a single file and fully commented. When
you add real `POST /api/auth/login` and `GET /api/users/{id}/accounts`
endpoints, swap the calls in `src/context/AuthContext.jsx` for real ones;
nothing else in the app needs to change, since every screen already reads
account/transaction data straight from the real API.

## Structure

```
src/
  api/            fetch wrappers — client.js, usersApi.js, accountsApi.js, mockAuth.js
  context/        AuthContext (session state)
  components/     LoginPage, Sidebar, Overview, AccountDetail, MoneyMoveModal
  utils/format.js money/date formatting + the wireframe's playful copy
  index.css       design tokens (fonts, colors, borders) mirroring the .dc.html theme
```

## Design tokens

`src/index.css` mirrors the CSS custom properties from the wireframe's
theme script (loose-sketch fidelity, graphite/none palette). Swap the
`:root` values to reskin — same mechanism the wireframe itself uses for
its palette picker.
