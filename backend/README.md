# ShopKart — Customer Authentication Service

## Setup
```bash
cd backend
npm install
cp .env.example .env   # then fill in JWT_SECRET and MONGO_URI
npm run dev             # or: npm start
```
Requires a running MongoDB instance (local or Atlas) matching `MONGO_URI`.

## Endpoints
| Method | Endpoint | Protected |
|---|---|---|
| POST | /customers/register | No |
| POST | /customers/login | No |
| GET | /customers/me | Yes |
| POST | /customers/logout | Yes |
| PATCH | /customers/change-password | Yes (bonus) |

## Testing with Postman
1. Register: POST `/customers/register` with `fullName, email, password, phone` in JSON body.
2. Login: POST `/customers/login` with `email, password`. In Postman, enable cookies (Postman handles this automatically per-domain) — the `token` HttpOnly cookie gets stored.
3. Profile: GET `/customers/me` — Postman will automatically resend the stored cookie.
4. Logout: POST `/customers/logout` — clears the cookie.
5. Change password: PATCH `/customers/change-password` with `oldPassword, newPassword` (must be logged in).

## Viva — quick answers
- **bcrypt vs encryption**: bcrypt is a one-way hash with built-in salting, so passwords can never be decrypted back — only compared. Encryption is reversible, which is unsafe if the key leaks.
- **JWT payload**: keep it minimal — typically just the user id (`{ id }`) plus standard claims (`iat`, `exp`). Never put the password or sensitive data in it since JWT payloads are only base64-encoded, not encrypted.
- **HttpOnly cookie**: prevents client-side JavaScript from reading the cookie via `document.cookie`, which blocks XSS attacks from stealing the token.
- **Why never return the password**: even a hash gives an attacker something to brute-force offline; the schema uses `select: false` so it's excluded by default from every query.
- **Auth middleware purpose**: centralizes token verification and user lookup so route handlers don't repeat that logic, and it rejects unauthenticated requests before they reach the controller.
