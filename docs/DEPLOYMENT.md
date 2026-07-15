# Deployment Guide

## Vercel + Render

1. Deploy `frontend` to Vercel with `VITE_API_URL=https://your-api.example.com/api`.
2. Deploy `lms-backend` to Render with MongoDB Atlas, Redis, Cloudinary, Stripe, Razorpay, PayPal and OpenAI variables.
3. Set `CLIENT_URL` to the frontend origin.
4. Run `npm run seed` once against production only after reviewing seed users.

## Docker

```bash
docker compose up --build
```

## PM2

```bash
cd lms-backend
pm2 start ecosystem.config.cjs
```
