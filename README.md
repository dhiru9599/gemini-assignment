# Gemini Backend Clone Assignment

## Overview

This project is a Gemini-style backend system for Kuvaka Tech, featuring user-specific chatrooms, OTP-based login, Gemini API-powered AI conversations, and subscription handling via Stripe. It demonstrates backend architecture, authentication, third-party integration, and clean code practices.

---

## Features

- **User Authentication:** OTP-based login (mobile only), JWT sessions, password reset/change.
- **Chatroom Management:** Users can create/manage chatrooms, send messages, and receive Gemini-powered responses (async via queue).
- **Google Gemini API Integration:** All chat messages are processed via Gemini API (see note below).
- **Subscription & Payments:** Stripe integration for Basic (free, 5 prompts/day) and Pro (paid, unlimited) tiers. Webhook support for subscription status.
- **Rate Limiting:** Basic users limited to 5 prompts/day.
- **Caching:** Redis caching for chatroom list endpoint.
- **Queue System:** BullMQ (Redis) for async Gemini API calls.

---

## Tech Stack

- **Node.js (Express)**
- **PostgreSQL** (Sequelize ORM)
- **Redis** (Upstash or local)
- **BullMQ** (message queue)
- **Stripe** (sandbox/test mode)
- **JWT** (authentication)

---

## Setup & Run

1. **Clone the repo:**
   ```sh
   git clone <your-repo-url>
   cd google-gemini
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in:
     - `DATABASE_URL` (Postgres)
     - `REDIS_URL` (Upstash/local)
     - `JWT_SECRET`
     - `STRIPE_SECRET_KEY` (test key)
     - `STRIPE_PRO_PRICE_ID` (from Stripe dashboard)
     - `STRIPE_WEBHOOK_SECRET` (from Stripe CLI or dashboard)
     - `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`
     - `GEMINI_API_KEY` (see Gemini API note below)
4. **Start the server:**
   ```sh
   npm run dev
   ```
5. **Start the Gemini worker (in a new terminal):**
   ```sh
   node src/queues/geminiWorker.js
   ```

---

## Architecture Overview

- **Modular Express app** with clear separation of concerns (controllers, services, models, routes, middlewares).
- **Sequelize** for DB models and migrations.
- **BullMQ** for async message processing (Gemini API calls).
- **Redis** for caching and rate limiting.
- **Stripe** for subscription management.

---

## Queue System Explanation

- **BullMQ** is used to queue chat messages for Gemini API processing.
- Messages are added to the queue via `/chatroom/:id/message`.
- The worker (`src/queues/geminiWorker.js`) processes jobs, calls Gemini API, and saves responses.

---

## Gemini API Integration

- **Note:** The Gemini API integration is implemented and ready for use. My API key/project currently only has access to the `embedding-gecko-001` model (for embeddings), not the generative chat models (e.g., `gemini-pro`).
- The backend calls the real Gemini API and returns a real response (embedding vector) for each message.
- If/when access to a generative model is granted, you only need to update the model name in the code and the backend will work with the real Gemini chat model with no code changes required.
- This limitation is documented for assignment review. The code is production-ready for generative models as soon as access is available.

---

## How to Integrate with Google Gemini API

### 1. **Get Gemini API Access**

- Sign up for Google Gemini API access if you haven’t already.
- Obtain your API key and endpoint URL.

### 2. **Update Your `.env`**

Add your Gemini API key:

```
GEMINI_API_KEY=your_gemini_api_key
```

### 3. **Update `src/services/geminiService.js`**

Replace the mock function with a real HTTP request to the Gemini API.  
Here’s a template using `axios`:

```js
const axios = require("axios");

async function sendToGemini(message) {
  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/embedding-gecko-001:embedContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        content: {
          parts: [{ text: message }],
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // Return the embedding array as a string for demo
    return JSON.stringify(response.data.embedding || response.data);
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return "Error contacting Gemini API";
  }
}

module.exports = { sendToGemini };
```

- Make sure to adjust the endpoint and response parsing to match the latest Gemini API docs.

### 4. **Test the Integration**

- Send a message via your `/chatroom/:id/message` endpoint.
- The Gemini worker will now call the real API and save the actual embedding response.

---

## Assumptions & Design Decisions

- OTPs are mocked (returned in API response, not sent via SMS).
- Stripe webhooks are best tested locally using the Stripe CLI (`stripe listen --forward-to localhost:5000/webhook/stripe`).
- Rate limiting is enforced via Redis per user per day.
- Caching is used for chatroom lists to improve performance.
- Consistent JSON responses and proper HTTP status codes throughout.

---

## How to Test via Postman

- Import the provided Postman collection (`postman_collection.json`).
- Use the following flow:
  1. **Signup:** `POST /auth/signup` with `{ "mobile": "1234567890" }`
  2. **Send OTP:** `POST /auth/send-otp` with `{ "mobile": "1234567890" }`
  3. **Verify OTP:** `POST /auth/verify-otp` with `{ "mobile": "1234567890", "otp": "xxxxxx" }` (get token)
  4. **Create Chatroom:** `POST /chatroom` with `{ "name": "My Chatroom" }` (auth required)
  5. **Send Message:** `POST /chatroom/:id/message` with `{ "content": "Hello" }` (auth required, rate limited for Basic)
  6. **List Messages:** `GET /chatroom/:id/messages` (auth required)
  7. **Subscribe Pro:** `POST /subscribe/pro` (auth required, follow Stripe Checkout URL)
  8. **Check Subscription:** `GET /subscription/status` (auth required)
- For protected endpoints, set `Authorization: Bearer <token>` in headers.

---

## Deployment Notes

- Can be deployed to Render, Railway, Fly.io, etc.
- Use managed Postgres (Render) and Redis (Upstash) for cloud deployment.
- Set all environment variables in your cloud provider’s dashboard.

---

## Stripe Webhook & Local Testing

- Stripe webhooks require a public URL. For local testing, use the Stripe CLI:
  ```sh
  stripe listen --forward-to localhost:5000/webhook/stripe
  ```
- Copy the webhook secret from the CLI output and set it as `STRIPE_WEBHOOK_SECRET` in your `.env`.
- If you do not set up webhooks locally, you can manually update subscription status in the database for demo/testing.
- **Document this limitation in your submission.**

---

## Submission Checklist

- [x] Source code (modular, commented)
- [x] Postman collection
- [x] Deployment (if required)
- [x] Public GitHub repo
- [x] README.md (this file)

---

## Contact

For any questions, contact: Dhiraj Kumar (rajdhiraj1800@gmail.com) 9599212427
