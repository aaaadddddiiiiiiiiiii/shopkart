# ShopKart

Full auth flow: Express/Mongo backend (Lab 01) + React frontend (Lab 02).

```
shopkart/
├── backend/    # Express API — register, login, /me, logout
└── frontend/   # React (Vite) — Register, Login, Home pages
```

## Prerequisite: MongoDB running locally

The backend now connects to a real local MongoDB (not an in-memory one).

```bash
brew install mongodb-community
brew services start mongodb-community
```

This starts MongoDB in the background on `127.0.0.1:27017`, matching
`MONGO_URI` in `backend/.env`. Leave it running (`brew services list`
to check), you don't need a separate terminal for it.

## Run both together

**Terminal 1 — backend**
```bash
cd backend
npm install
npm run dev        # http://localhost:3000
```

**Terminal 2 — frontend**
```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
```

`.env` is already filled in on both sides:
- `backend/.env` → `FRONTEND_URL=http://localhost:5173` (used by the CORS middleware)
- `frontend/.env` → `VITE_API_BASE_URL=http://localhost:3000` (used by axios)

If you run either on a different port, update the matching `.env` value.

Open `http://localhost:5173` and go through Register → Login → Home → Products → Product Details → Logout.

## Product catalog (Lab-03)

The `products` collection starts empty. Seed a few sample products:
```bash
cd backend
node seed.js
```
This clears and repopulates `products` with 6 sample items across Electronics, Fashion, Books and Home.

New endpoints: `POST /products`, `GET /products` (supports `?search=`, `?category=`, `?sort=price_asc|price_desc`), `GET /products/:id`.
New pages: `/products` (search + category filter, loading/error/empty states) and `/products/:id` (details, Add to Cart is UI-only for now).

## Merging into one server for deployment (optional)

```bash
cd frontend && npm run build
cp -r dist/* ../backend/public/
```
Then in `backend/index.js`, after the routes, add:
```js
app.use(express.static('public'));
app.get(/^\/(?!customers).*/, (req, res) => {
  res.sendFile(require('path').join(__dirname, 'public', 'index.html'));
});
```
Now one process on one port serves both the API and the built frontend — no CORS needed since it's same-origin.


## Wishlist, Cart, Checkout & Orders (Labs 04-06)

**Razorpay setup (required for checkout):** put your Razorpay *Test Mode* keys in `backend/.env`
(the file currently has placeholders), then restart the backend:
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret
```
The Key Secret stays on the backend only. Test card details: use Razorpay's Test Mode test cards/UPI.

New backend endpoints (all protected by the JWT cookie):

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST / GET / DELETE | `/wishlist/:productId`, `/wishlist` | Add, list (populated), remove |
| POST / GET / PATCH / DELETE | `/cart/:productId`, `/cart` | Add (+1), list (populated), set quantity, remove |
| POST | `/orders/create-payment-order` | Validate cart + stock, create PENDING order + Razorpay order |
| POST | `/orders/verify-payment` | Verify HMAC signature, mark PAID/PLACED, clear cart |
| GET | `/orders`, `/orders/:id` | Current user's orders / one order (ownership enforced) |

New frontend routes: `/wishlist`, `/cart`, `/checkout`, `/order-success/:id`, `/orders`, `/orders/:id`.
Cart state is shared through `src/context/CartContext.jsx` (Context API).
