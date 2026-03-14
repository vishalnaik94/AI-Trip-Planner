# AI Trip Planner

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![NestJS](https://img.shields.io/badge/NestJS-11-red)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Gemini](https://img.shields.io/badge/Google_Gemini-AI-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

An intelligent travel planning platform that generates personalized, end-to-end itineraries using **Google Gemini (LLM)** and **RAG (Retrieval-Augmented Generation)**. Real hotel, flight & activity data integrated via third-party APIs.

## Architecture

```
User Input
    |
    v
Next.js Frontend (3000) --> NestJS REST API (3001)
                                  |
                  +---------------+----------------+
                  |               |                |
             Auth Service    AI Orchestrator   Data Service
             (JWT/OAuth)          |            (PostgreSQL)
                          +-------+------+
                          |              |
                   Gemini LLM       RAG Pipeline
                   (Itinerary)    (LangChain + Pinecone)
                          |
                   Third-Party APIs
                 (Amadeus, Google Maps)
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Next.js 16 | SSR, dynamic UI, itinerary display |
| Styling | Tailwind CSS v4 | Responsive, modern design |
| Backend | Node.js + NestJS 11 | REST API, modular architecture |
| AI Layer | Google Gemini API | Itinerary generation via LLM |
| RAG | LangChain + Pinecone | Private data context injection |
| Database | PostgreSQL | Users, trips, itinerary storage |
| Cache | Redis | API response caching, rate limiting |
| External APIs | Amadeus | Live flight & hotel data |
| Auth | JWT + OAuth 2.0 | Secure user authentication |

## Features

- **AI Itinerary Generation** — Gemini creates day-by-day plans with activities, meals, hotels, costs
- **RAG Pipeline** — Grounded responses using curated travel knowledge via Pinecone vector store
- **Multi-Step Trip Planner** — Clean UI for destination, dates, budget, interests, traveler type
- **Flight Search** — Amadeus API integration for live flight data
- **Hotel Search** — Hotel listings with pricing based on budget level
- **User Auth** — JWT + Google OAuth 2.0 with protected routes
- **Trip Dashboard** — View, manage, and delete saved trips
- **Swagger API Docs** — Full REST API documentation at `/api`
- **Docker Compose** — One-command setup for PostgreSQL + Redis + backend + frontend

---

## Quick Start (Local Development)

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** 14+ (via Homebrew: `brew install postgresql@14`)
- **Redis** (via Homebrew: `brew install redis`)

### Step 1: Clone & Install

```bash
git clone https://github.com/your-username/AI-Trip-Planner.git
cd AI-Trip-Planner

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 2: Start PostgreSQL & Redis

```bash
# macOS (Homebrew)
brew services start postgresql@14
brew services start redis

# Verify they are running
pg_isready          # should say "accepting connections"
redis-cli ping      # should say "PONG"
```

### Step 3: Create Database

```bash
psql postgres -c "CREATE USER \"user\" WITH PASSWORD 'password' CREATEDB;"
psql postgres -c "CREATE DATABASE tripplanner OWNER \"user\";"
```

### Step 4: Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in your API keys. At minimum you need:

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

The database and Redis defaults work out of the box with the local setup above.

### Step 5: Start the Backend

```bash
cd backend
npm run start:dev
```

You should see:
```
🚀 Server running on http://localhost:3001
📚 Swagger docs at http://localhost:3001/api
```

### Step 6: Start the Frontend (new terminal)

```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 16.x
- Local: http://localhost:3000
```

### Step 7: Open the App

- **App**: http://localhost:3000
- **API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api

---

## Quick Start (Docker Compose)

> Requires Docker Desktop running with the Compose plugin.

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

docker compose up -d
```

- App: http://localhost:3000
- API: http://localhost:3001

---

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key |
| `JWT_SECRET` | No (has default) | Secret for JWT signing |
| `DB_HOST` | No (default: localhost) | PostgreSQL host |
| `DB_PORT` | No (default: 5432) | PostgreSQL port |
| `DB_USERNAME` | No (default: user) | PostgreSQL username |
| `DB_PASSWORD` | No (default: password) | PostgreSQL password |
| `DB_NAME` | No (default: tripplanner) | PostgreSQL database name |
| `REDIS_URL` | No (default: redis://localhost:6379) | Redis connection URL |
| `PINECONE_API_KEY` | No | Pinecone vector store key (for RAG) |
| `AMADEUS_CLIENT_ID` | No | Amadeus flight API (mock fallback if missing) |
| `AMADEUS_CLIENT_SECRET` | No | Amadeus flight API secret |
| `GOOGLE_MAPS_API_KEY` | No | Google Maps API key |
| `FRONTEND_URL` | No (default: http://localhost:3000) | Frontend URL for CORS |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login with email/password |
| GET | `/auth/google` | No | Google OAuth login |
| GET | `/auth/profile` | JWT | Get current user profile |
| POST | `/trips` | JWT | Create a new trip |
| GET | `/trips` | JWT | Get all user trips |
| GET | `/trips/:id` | JWT | Get specific trip |
| POST | `/trips/:id/generate` | JWT | Generate AI itinerary |
| GET | `/trips/:id/itinerary` | JWT | Get trip itinerary |
| DELETE | `/trips/:id` | JWT | Delete a trip |
| GET | `/flights/search` | JWT | Search flights |
| GET | `/hotels/search` | JWT | Search hotels |

## Project Structure

```
AI-Trip-Planner/
├── backend/                    # NestJS API (port 3001)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # JWT, OAuth, guards, user entity
│   │   │   ├── trips/          # Trip CRUD, itinerary generation
│   │   │   ├── ai/             # Gemini integration, prompt builder
│   │   │   ├── rag/            # Pinecone vector store, embeddings
│   │   │   ├── flights/        # Amadeus API integration
│   │   │   └── hotels/         # Hotel search (mock data)
│   │   ├── common/             # Global filters, interceptors
│   │   ├── config/             # Database config
│   │   └── main.ts             # App bootstrap, CORS, Swagger
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── frontend/                   # Next.js App (port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── login/          # Login page
│   │   │   ├── register/       # Registration page
│   │   │   ├── dashboard/      # Trip dashboard
│   │   │   ├── planner/        # Multi-step trip planner
│   │   │   ├── itinerary/[id]/ # AI-generated itinerary view
│   │   │   └── auth/callback/  # OAuth callback handler
│   │   ├── components/         # Navbar
│   │   └── lib/                # API client, auth helpers
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml          # PostgreSQL + Redis + backend + frontend
├── .gitignore
└── README.md
```

## What This Demonstrates

- **AI / LLM Integration** — Gemini API with structured prompt engineering and JSON output parsing
- **RAG Pipeline** — LangChain + Pinecone for knowledge-grounded itinerary generation
- **REST API Design** — NestJS modular API with auth, trips, AI, and external integrations
- **Third-Party APIs** — Amadeus, Google Maps, Hotels, Weather — orchestrated in one flow
- **Full-Stack** — Next.js frontend + NestJS backend + PostgreSQL + Redis
- **Auth & Security** — JWT, OAuth 2.0, route guards
- **Database Design** — Normalized PostgreSQL schema with TypeORM entities
- **Clean Code** — Modular NestJS structure, TypeScript, Swagger API docs

## License

MIT

---

**Author:** Vishal N. | 2026
