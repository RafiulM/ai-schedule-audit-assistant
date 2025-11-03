# Backend Structure Document

This document describes the backend setup for the **ai-schedule-audit-assistant** project. It explains how the system is built, how data moves through it, and how everything is hosted and secured. You don’t need a deep technical background to understand it.

## 1. Backend Architecture

**Overall Design**
- The backend is built on **Next.js** (App Router) using both server and client components.
- Business logic and data access live in **API routes** and **Server Actions**, keeping frontend pages clean and focused on presentation.
- **Drizzle ORM** is used for talking to the database in a type-safe way, so code errors are caught early.

**Key Benefits**
- Scalability: Next.js runs serverless functions on demand, automatically handling traffic spikes.
- Maintainability: Clear separation between API endpoints, database schemas, and UI components makes it easy to add or change features.
- Performance: Streaming AI responses directly from server functions keeps the chat interface snappy. Static assets and pages can be cached at the edge by the CDN.

## 2. Database Management

**Technology**
- **PostgreSQL** (SQL database) for storing users, chat history, and schedule data.
- **Drizzle ORM** for defining schemas in code, running migrations, and querying data.
- Local development uses a **Docker container** replicating production settings.

**How Data Is Handled**
- Data is organized into tables (users, messages, events).
- The ORM ensures that every record follows a predefined structure (type safety).
- Migrations keep schema changes in version control, so each developer and the production server stay in sync.

## 3. Database Schema

All tables sit in the same PostgreSQL database. Here’s a human-friendly view, followed by SQL you could run to create them.

### Human-Readable Schema
- **Users** store basic account info.
- **Chat Messages** record each message with its role (user or assistant) and timestamp.
- **Schedule Events** store individual calendar entries with title, start, and end times.
- **Categories** (optional) let users tag events (e.g., “Work,” “Exercise”).

### SQL Schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Chat history
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Schedule events
CREATE TABLE schedule_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Event categories (optional)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```  

## 4. API Design and Endpoints

We follow a **RESTful** style, where each endpoint does one clear job. All endpoints check the logged-in user before returning or changing data.

- **Authentication** (`/api/auth/*`)
  - Handled by Better Auth to sign users in and out, manage sessions.

- **Chat Endpoint** (`POST /api/chat`)
  - Receives the user’s message.
  - Calls the Vercel AI SDK to generate a reply.
  - Parses any schedule details from the AI response and saves them to the database.
  - Streams the AI’s conversational reply back to the frontend.

- **Get Events** (`GET /api/schedule/events`)
  - Returns all calendar entries for the current user.

- **Create Event** (`POST /api/schedule/events`)
  - Allows manual event creation (title, start, end).
  - Validates input and stores it in the database.

- **Get Metrics** (`GET /api/metrics`)
  - Calculates totals like hours per category.
  - Returns data for dashboard charts.

## 5. Hosting Solutions

- **Vercel** is used to host the Next.js app. Key benefits:
  - **Serverless Functions**: API routes and Server Actions auto-scale.
  - **Global CDN**: Static assets and server-rendered pages are cached close to users.
  - **Zero-Config SSL**: Secure HTTPS by default.
  - **Easy Deploys**: Connect to GitHub; every push can create a preview or production deployment.
- **Docker (Local)**: Developers run a local PostgreSQL instance that matches production, ensuring consistency.

## 6. Infrastructure Components

- **Load Balancer & Edge Network**
  - Vercel handles traffic routing and spreads requests across its edge servers.
- **CDN (Content Delivery Network)**
  - Delivers static files (JS, CSS, images) from locations near the end user.
- **Caching**
  - HTTP headers on API responses and pages enable edge caching of repeated requests.
  - Drizzle query caching layers can be added to speed up repeated database queries (optional).

## 7. Security Measures

- **Authentication & Authorization**
  - Better Auth manages secure login flows, session cookies, and CSRF protection.
  - Every API route checks the user’s session and only returns that user’s data.
- **Data Encryption**
  - TLS/HTTPS encrypts data in transit.
  - For production, the database service typically offers encryption at rest.
- **Input Validation & Sanitization**
  - API route handlers check and clean incoming data to prevent injection attacks.
  - AI prompt inputs are sanitized to stop prompt injection.
- **Environment Variables**
  - Secrets (database URL, AI provider keys) live in environment variables, never in code.

## 8. Monitoring and Maintenance

- **Logging & Error Tracking**
  - Use **Sentry** (or similar) to capture and alert on runtime errors in serverless functions.
  - Vercel’s built-in logs show request details and function execution times.
- **Performance Monitoring**
  - Vercel Analytics for traffic, latency, and error rates.
  - Database dashboards or tools (e.g., pgAdmin) track query performance and resource usage.
- **Backups & Migrations**
  - Drizzle migrations are version-controlled; running `drizzle migrate` updates the schema safely.
  - Regular automated backups of the PostgreSQL database.
- **Continuous Integration**
  - GitHub Actions (or similar) run linting, type checks, and tests on every pull request.

## 9. Conclusion and Overall Backend Summary

The **ai-schedule-audit-assistant** backend is built for reliability, scalability, and clarity. By combining Next.js serverless functions, a type-safe ORM, and a managed SQL database, it:

- Secures user data with a proven authentication system.
- Processes AI-driven chat in real time, extracting and storing structured schedule events.
- Scales seamlessly on Vercel’s global edge network.
- Provides clear, modular code that’s easy to maintain and extend.

This setup ensures that as user needs grow—more chat features, richer analytics, or new integrations—the backend can evolve without major rewrites.