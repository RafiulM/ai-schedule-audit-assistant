# Project Requirements Document

## 1. Project Overview

This project is an AI-powered schedule and time audit assistant built as a web application. It lets users talk naturally to an AI chatbot about their day, automatically extracts events (like meetings or tasks), and stores them in a personal calendar. Users can then switch to a calendar view to see their schedule laid out in daily, weekly, or monthly formats, and review basic productivity metrics such as total hours spent per category.

We’re building this tool to help people understand and improve how they spend their time without manual entry. By combining a conversational interface with automated data extraction and visualization, the app removes friction from time tracking. Success for the first version means: users can sign up and log in, chat to add or update events, view those events in a calendar, and see summary cards with simple time metrics. The AI extraction must be accurate enough that users rarely need to correct parsed events.

---

## 2. In-Scope vs. Out-of-Scope

### In-Scope (First Version)
- User sign-up, login, logout, and session management via Better Auth
- Protected dashboard layout where only signed-in users can access data
- Real-time chat interface using `assistant-ui` and `@ai-sdk/react`
- Backend API route (`/api/chat`) that sends prompts to the Vercel AI SDK, streams responses, and returns structured event objects
- Automatic extraction of event details (title, start/end times) and saving them to PostgreSQL via Drizzle ORM
- Calendar view built with a library like `react-big-calendar` to display stored events
- Simple metric cards showing total hours per day or category
- Light/dark theme switcher
- Local development setup with Docker for PostgreSQL
- Type-safe schemas for users, chat messages, and schedule events (using Drizzle + Zod)

### Out-of-Scope (Later Phases)
- Integration with external calendars (e.g., Google Calendar, Outlook)
- Payment, subscription, or tiered access
- Advanced analytics or forecasting beyond basic time sums
- Mobile-specific UI or native mobile apps
- Team or multi-user shared calendars
- Custom AI model training or fine-tuning
- Offline functionality or local storage
- Detailed role-based permissions beyond one user = one account

---

## 3. User Flow

A new user arrives on the landing page and is prompted to sign up with email and password. After confirming their email and logging in, they land on the main dashboard. Here, they see a chat window at the center and a collapsible sidebar on the left for navigating between “Chat” and “Calendar.” A theme toggle sits in the top-right corner.

In the Chat view, the user types things like “I had a team meeting today from 10 to 11 and worked on reports from 11:30 to 1.” The chat UI sends their message to `/api/chat`. The backend calls the Vercel AI SDK, which returns a structured list of events. Those events are validated against a Zod schema and saved to the database. The AI’s reply appears in the chat pane. Next, the user clicks “Calendar” in the sidebar, sees their newly created events laid out, and bounces between daily, weekly, and monthly modes. Below the calendar, a row of cards shows total hours worked and other simple metrics for the selected date range.

---

## 4. Core Features

- **Authentication**: Register, login, logout with secure sessions (Better Auth).
- **Protected Dashboard**: Only authenticated users can reach `/dashboard` and its sub-routes.
- **AI Chat Component**: Built with `assistant-ui` and `@ai-sdk/react`, supporting streaming responses.
- **Chat API Route**: `/api/chat` handles incoming prompts, calls Vercel AI SDK, extracts structured events, and returns both AI text and parsed data.
- **Event Extraction Pipeline**: Uses Zod schemas to validate AI output, then saves events via Drizzle ORM into PostgreSQL.
- **Calendar View**: React component (e.g., `react-big-calendar`) displaying events; supports daily/weekly/monthly toggles.
- **Metric Cards**: Reusable component showing total time per category or day.
- **Theme Switcher**: Toggles light/dark mode across the UI.
- **Data Models**: Drizzle ORM schemas for `User`, `ChatMessage`, and `ScheduleEvent`.
- **Local Database Setup**: Docker Compose configuration for PostgreSQL mirroring production.
- **Error Handling & Logging**: Basic try/catch in API routes, console logs for now (later integrate Sentry).

---

## 5. Tech Stack & Tools

- **Frontend**: Next.js (App Router), React 18, TypeScript
- **Styling & UI Library**: Tailwind CSS, shadcn/ui component primitives
- **AI Integration**: Vercel AI SDK (GPT-4o), `assistant-ui`, `@ai-sdk/react`
- **Authentication**: Better Auth (session-based)
- **Backend**: Next.js API Routes & Server Actions
- **Database**: PostgreSQL (Docker), Drizzle ORM for type-safe schemas
- **Validation**: Zod (for AI output and request bodies)
- **Deployment**: Vercel (with automatic CI/CD)
- **IDE/Plugins**: VS Code, Cursor AI, Windsurf

---

## 6. Non-Functional Requirements

- **Performance**: AI responses streamed back in under 2 seconds; page navigation under 1 second.
- **Security**: All traffic over HTTPS; OWASP Top 10 best practices; sanitize inputs to prevent injection.
- **Compliance**: GDPR-ready (users can delete their data); secure storage of personally identifiable information.
- **Accessibility**: WCAG 2.1 AA compliance for core flows (keyboard navigation, ARIA roles).
- **Scalability & Availability**: Target 99.9% uptime on Vercel; support 1,000 concurrent users in Phase 1.
- **Maintainability**: 80% unit test coverage for parsing and data-mapping logic; clear component boundaries.

---

## 7. Constraints & Assumptions

- **AI Availability**: Assumes Vercel AI SDK and GPT-4o endpoints remain accessible and within rate limits.
- **Environment**: Developers have Docker installed for local DB; production runs on Vercel.
- **User Behavior**: Users will phrase schedule items in natural language that the AI can parse into times and titles.
- **Timezones**: Events are stored and displayed in the user’s local timezone.
- **Secrets Management**: All API keys and DB URLs are provided via environment variables (no hard-coding).

---

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: Exceeding AI call quotas could break chat. Mitigation: throttle requests, show a “try again later” message.
- **Parsing Errors**: AI might return malformed objects. Mitigation: validate with Zod, reject invalid events, and ask the user to clarify.
- **Timezone Ambiguity**: Users may not specify timezones. Mitigation: default to browser’s locale and clearly label all times.
- **Large Chat History**: Sending too much context can exceed model limits. Mitigation: only include the last 10 messages in the prompt.
- **Database Migrations**: Schema changes can conflict in production. Mitigation: use Drizzle’s migration tooling and version control migrations.
- **Calendar Library Styling**: Third-party calendar may need custom CSS overrides. Mitigation: wrap it in a styled component and test in both themes.

---

*This document is the single source of truth for building the AI Schedule Audit Assistant’s first version. All subsequent design, architecture, and coding guidelines must reference it to ensure alignment and avoid ambiguity.*