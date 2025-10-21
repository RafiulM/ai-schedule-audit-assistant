# Tech Stack Document

This document explains the technology choices behind the **ai-schedule-audit-assistant** project in simple, everyday language. It covers the tools used for building the app’s front end, back end, hosting, security, and more—so anyone can understand why each part was chosen and how it contributes to the overall experience.

## 1. Frontend Technologies
These tools shape everything your eyes see and how you interact with the assistant.

- **Next.js (App Router)**
  - A popular framework that makes building React websites easier. It splits code into server-side and client-side parts automatically, helping pages load faster.
  - Lets us create dedicated folders for each screen (like `/dashboard`), keeping the code organized.

- **React 18**
  - The foundation for building user interfaces. It handles updating the screen when your data changes.
  - Integrates smoothly with the AI chat libraries we use.

- **Tailwind CSS**
  - A utility-first styling system that provides ready-to-use CSS classes (for colors, spacing, layouts, etc.).
  - Speeds up design work and keeps styles consistent across the app.

- **shadcn/ui**
  - A collection of pre-built, accessible components (buttons, cards, dialogs) that follow modern design patterns.
  - Works on top of Tailwind, so everything looks cohesive.

- **assistant-ui & @ai-sdk/react**
  - Libraries provided by Vercel for building chat interfaces. They handle message input, streaming replies, and formatting chat bubbles.
  - Let us plug in an AI model with minimal setup and focus on the conversation flow.

- **Calendar Component (e.g., react-big-calendar)**
  - A popular calendar library for React that displays events in day/week/month views.
  - We style it with Tailwind to match the rest of the app.

## 2. Backend Technologies
These pieces work behind the scenes to store your data, run AI logic, and keep everything in sync.

- **Next.js API Routes & Server Actions**
  - Built-in endpoints where we handle incoming chat messages and talk to the AI model.
  - Support streaming responses, which makes the chat feel real-time.

- **Better Auth**
  - A secure authentication system that signs users in and protects routes.
  - Ensures each person only sees their own chat history and schedule.

- **PostgreSQL Database**
  - A reliable, open-source database used to save user accounts, chat history, and schedule events.
  - Runs locally in a Docker container for easy setup, mirroring production.

- **Drizzle ORM**
  - A toolkit that maps database tables to TypeScript code. It makes database queries readable and type-safe.
  - Lets us define clear schemas for users, messages, and events.

- **TypeScript**
  - A version of JavaScript with built-in checks that catch mistakes early.
  - Used everywhere—from front end to back end—to keep data consistent and reduce bugs.

## 3. Infrastructure and Deployment
How the app is hosted, updated, and managed.

- **Vercel Platform**
  - A hosting service tailored for Next.js apps. Deployments happen automatically whenever code is pushed to GitHub.
  - Provides preview links for testing before updates go live.

- **Git & GitHub**
  - Version control to track changes, collaborate, and manage code history.
  - GitHub integration with Vercel triggers deployments on each pull request.

- **Docker (for Local Development)**
  - Encapsulates the database in a container, so developers can run the same setup on any machine.
  - Simplifies onboarding—just `docker-compose up` and the database is ready.

- **CI/CD (Continuous Integration / Continuous Deployment)**
  - Automated tests and builds run on every code change (via Vercel’s pipeline or GitHub Actions).
  - Ensures that new features or bug fixes don’t break the app before they reach users.

## 4. Third-Party Integrations
External services that add key functionality without reinventing the wheel.

- **Vercel AI SDK**
  - Wraps OpenAI (or other AI models) in an easy-to-use interface.
  - Supports streaming, tool-enabled parsing, and structured JSON output.

- **OpenAI (via Vercel AI SDK)**
  - Provides the underlying AI models that power the chat assistant.
  - Converts natural language prompts into helpful schedule audits or structured event data.

- **Sentry (Error Tracking)**
  - Monitors runtime errors in both front end and back end.
  - Alerts the team to issues quickly, helping us maintain a stable experience.

## 5. Security and Performance Considerations
Steps we've taken to keep your data safe and the app running smoothly.

- **Secure Authentication**
  - Every API route checks user sessions via Better Auth, so only authorized users can read or write data.
  - Passwords and session tokens are never exposed to the client.

- **Environment Variables**
  - Sensitive keys (like database passwords or AI API keys) are stored outside the code in `.env` files.
  - Vercel and local Docker setups load these securely at runtime.

- **Input Validation & Sanitization**
  - We use Zod (a validation library) to check AI output and user inputs before saving to the database.
  - Prevents malformed data and guards against injection attacks.

- **Performance Optimizations**
  - Server-side rendering for faster initial page loads.
  - Streaming chat replies for real-time feel.
  - Tailwind’s utility approach reduces unused CSS, keeping page sizes small.
  - Database indexing on key fields ensures quick lookups for schedules and messages.

## 6. Conclusion and Overall Tech Stack Summary
- We chose **Next.js**, **React**, and **Tailwind** to build a responsive, modern user interface.
- **Better Auth**, **PostgreSQL**, and **Drizzle ORM** form a secure, type-safe back end for storing user data and schedules.
- **Vercel** handles hosting and deployment, while **Docker** ensures a consistent local environment.
- Integrations like the **Vercel AI SDK**, **OpenAI**, and **Sentry** enable powerful AI chat, structured data extraction, and real-time error tracking.
- Security measures (authentication, environment variables, validation) and performance tweaks (streaming, SSR, CSS optimization) keep the app safe and fast.

Together, these technologies provide a solid, scalable foundation for the AI-powered schedule audit assistant. The stack is designed to let developers focus on adding new AI features and visualizations, knowing that user management, data storage, and deployment are already taken care of.