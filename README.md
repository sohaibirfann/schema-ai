<div align="center">

  <span style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:8px;background:#111;color:#fff;font-weight:700;font-size:24px;font-family:system-ui">E</span>

  # EasySchema

  **From natural language to production-ready SQL schemas in seconds.**

  [![CI](https://github.com/sohaibirfann/easyschema/actions/workflows/ci.yml/badge.svg)](https://github.com/sohaibirfann/easyschema/actions/workflows/ci.yml)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.138-009688?style=flat-square)](https://fastapi.tiangolo.com)
  [![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
  [![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
  [![Pydantic](https://img.shields.io/badge/Pydantic-2-E92063?style=flat-square)](https://docs.pydantic.dev)
  [![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

  [**Live demo**](https://easyschema.vercel.app) • [Overview](#overview) • [Architecture](#architecture) • [Getting started](#getting-started) • [Features](#features)

  > Hosted on free tiers — the backend spins down when idle, so the first request after a while may take up to ~30s to wake up. The UI tells you when this is happening instead of just looking stuck.

</div>

## Overview

EasySchema is a full-stack application that translates plain English descriptions of database structures into complete, executable SQL — both `CREATE TABLE` DDL and `INSERT` seed DML — powered by Groq's LLM and enforced through Pydantic schema validation.

> [!TIP]
> You don't need any database setup to use EasySchema. Just describe what you want and copy the generated SQL.

## Architecture

```
easyschema/
├── backend/                    # FastAPI server
│   ├── main.py                 # Entry point, CORS allowlist
│   ├── routers/schema.py       # GET /api/health, POST /api/generate (rate-limited)
│   ├── models/schema.py        # Pydantic models
│   ├── services/
│   │   ├── ai_service.py       # Async Groq caller, retries transient failures
│   │   └── sql_generator.py    # Schema validation + DDL/DML formatter
│   ├── requirements.txt
│   └── test_service.py         # pytest suite
│
├── frontend/                   # Next.js App Router
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # Landing page
│       │   ├── layout.tsx          # Root layout (Outfit, Inter, Fira Code)
│       │   ├── globals.css         # Tailwind theme
│       │   └── generator/page.tsx  # Workspace dashboard
│       └── components/
│           └── WakingUpNotice.tsx  # Cold-start messaging
│
├── .github/workflows/
│   ├── ci.yml                  # pytest + tsc + fallow on push/PR
│   └── keep-warm.yml           # pings /api/health every 10 min
│
└── .agents/
    └── skills/                 # Agent skills
```

### How it works

1. You type a schema description in natural language (e.g. *"E-commerce store with orders, items, inventory and users"*)
2. The frontend sends it to `POST /api/generate`
3. The backend calls Groq's `llama-3.3-70b-versatile` model with strict JSON mode, enforcing the Pydantic schema
4. The AI returns structured table definitions with seed data
5. The backend rejects malformed results (duplicate table/column names) before compiling formatted `CREATE TABLE` and `INSERT` SQL statements
6. The frontend displays columns in a metadata table and SQL in copyable/downloadable panels

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 20+
- A [Groq API key](https://console.groq.com/keys)

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt

# Create .env with your API key
cp .env.example .env
# Edit .env: GROQ_API_KEY=your_key_here

uvicorn main:app --port 8000
```

Run the test suite with `pytest`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The dev proxy in `next.config.ts` routes `/api/*` requests to the backend (`BACKEND_URL` env var, defaults to `http://localhost:8000`).

## Features

- **Natural language to SQL** — Describe your schema in plain English, get valid `CREATE TABLE` and `INSERT` statements
- **Pydantic-enforced output** — The AI response is validated against a strict schema, with an additional guard rejecting duplicate table/column names before any SQL is generated
- **Resilient to API hiccups** — Transient Groq failures (rate limits, 5xx) are retried automatically with backoff
- **Structured column viewer** — Per-table breakdown of columns, types, and constraints in a readable table
- **Per-table SQL panels** — Copy DDL or seed DML to clipboard, or download as `.sql` files
- **Schema history** — A collapsible right-side drawer stores up to 20 previous generations in local storage, with relative timestamps and one-click restore
- **3 preset prompts** — Quick-start buttons for common schema types (e-commerce, blog, project board)
- **Rate-limited API** — IP-based limiting on `/api/generate` protects the shared Groq key from abuse
