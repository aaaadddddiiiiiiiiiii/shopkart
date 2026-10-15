# ShopKart — Login → Home Flow (Lab 02)

React frontend for the ShopKart customer auth flow, built against the
Lab 01 backend (`POST /customers/register`, `POST /customers/login`,
`GET /customers/me`, `POST /customers/logout`).

## Setup

```bash
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if the backend isn't on :3000
npm run dev
```

Make sure the backend from Lab 01 is running first (`npm run dev` inside
the `backend` folder), since every page here depends on its API.

## Pages

| Route       | Page              | Notes                                             |
|-------------|-------------------|----------------------------------------------------|
| `/register` | Register          | Controlled form, client-side validation           |
| `/login`    | Login             | Sends credentials with `withCredentials: true`    |
| `/home`     | Protected Home    | Fetches `/customers/me`; redirects to `/login` if not authenticated |

Logout (navbar button) calls `POST /customers/logout` and redirects to `/login`.

## Why `withCredentials: true`?

The backend sets the auth token as an **HttpOnly cookie**, which
JavaScript can never read (`document.cookie` won't show it — that's the
point, it blocks XSS token theft). `withCredentials: true` tells the
browser to still attach that cookie automatically on every request to
the backend's origin, and to store any `Set-Cookie` response from login.
Without it, the cookie is silently dropped.

## Why fetch `/customers/me` instead of storing the user client-side?

The cookie can't be read by JS, so the frontend has no reliable way to
know who — or whether anyone — is logged in except by asking the
backend. `/customers/me` is the single source of truth: if it succeeds,
the session is valid and returns fresh user data; if it 401s, the user
is redirected to `/login`. Storing a user object in `localStorage`
instead would go stale the moment the token expires or the account
changes.
