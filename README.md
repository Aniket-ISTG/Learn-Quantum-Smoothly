# AI-Based QC Learning Platform

This project has two runtime parts:

- Frontend: Next.js app for the learner UI
- Backend: local AI service that talks to model and powers the chat/analyze/optimize features

## Prerequisites

- Node.js 20+
- npm
- A valid Grok API key in the backend environment file

## 1) Install dependencies

From the repository root:

```bash
cd frontend && npm install
cd ../backend && npm install
```

## 2) Configure the API key

Copy the example env file:

```bash
cd backend
cp .env.example .env.local
```

Then edit `backend/.env.local` and set your actual key:

```env
PORT=4000
```

## 3) Start the backend AI service

In one terminal:

```bash
cd backend
node server.js
```

You should see:

```bash
AI backend running on http://localhost:4000
```

## 4) Start the frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

## 5) Optional production build

Frontend build:

```bash
cd frontend
npm run build
```

Backend has no build step right now; it runs directly with Node.

## Notes

- The frontend chat panel calls the backend at `http://localhost:4000`.
- The backend is the source of truth for AI logic.
- If the backend is not running, the AI features will fail.

## Project layout

```text
backend/
  ai/
  server.js
  .env.example
  .env.local
frontend/
  app/
  components/
  public/
  package.json
```
