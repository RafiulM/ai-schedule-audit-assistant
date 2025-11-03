# Frontend Guideline Document

This document outlines the frontend architecture, design principles, styling, component structure, and best practices for the `ai-schedule-audit-assistant` project. It’s written in everyday language, so anyone can understand how our frontend is set up and why.

## 1. Frontend Architecture

### Frameworks and Libraries
- **Next.js (App Router)**: Our core framework. It handles both server and client code through its file-based routing in the `/app` directory.
- **React 18**: The UI library that powers components and state updates.
- **TypeScript**: Adds type safety across code, reducing bugs when data moves between AI, API, and UI.
- **Tailwind CSS**: A utility-first CSS framework for quick, consistent styling.
- **shadcn/ui**: A set of ready-made, accessible UI primitives built on Tailwind.
- **@ai-sdk/react & assistant-ui**: Tools for building the AI-powered chat interface.

### Scalability, Maintainability, Performance
- **File-based routing** keeps pages organized in `/app` and scales as you add features.
- **Component-driven** code in `/components` encourages reuse and makes maintenance easier.
- **Server & Client Components** let us offload heavy logic (like AI calls) to the server, improving performance.
- **TypeScript** and **Drizzle ORM** (on the backend) ensure data contracts remain consistent.

## 2. Design Principles

1. **Usability**: Simple, clear layouts. Controls and content are easy to find and use.
2. **Accessibility**: All components (via shadcn/ui) support keyboard navigation, proper ARIA attributes, and sufficient color contrast.
3. **Responsiveness**: Layouts adapt to mobile, tablet, and desktop using Tailwind’s responsive utilities.
4. **Consistency**: Common patterns (buttons, cards, inputs) come from the same UI library so they look and behave the same.

### Application in UI
- **Chat Interface**: Clear message bubbles, input always visible, focus states for keyboard users.
- **Calendar & Metrics**: Grid layouts that collapse on small screens, filter controls remain accessible.
- **Theme Switcher**: Easy toggle between light/dark modes with consistent colors and typography.

## 3. Styling and Theming

### CSS Methodology
- **Utility-First** with Tailwind CSS: We build UI by applying small, single-purpose classes directly in JSX.
- **Component Variants** from shadcn/ui: Use pre-defined variants (primary, secondary) for uniform styling.

### Theming
- **Light/Dark Mode**: A toggle in the header writes to a React Context. Tailwind’s `media` and `class` strategies switch themes globally.
- **Consistent Look**: Colors, spacing, and typography scale using a shared design token file.

### Visual Style
- **Style**: Modern flat design with subtle glassmorphism accents for cards and modals.
- **Color Palette**:
  • Primary: #3B82F6 (blue-500)  
  • Secondary: #10B981 (emerald-500)  
  • Accent: #F59E0B (amber-500)  
  • Neutral Light: #F3F4F6 (gray-100)  
  • Neutral Dark: #1F2937 (gray-800)  
  • Background Light: #FFFFFF  
  • Background Dark: #111827  
  • Text Light: #111827  
  • Text Dark: #F9FAFB

- **Font**: Inter (system font stack fallback), chosen for readability and modern feel.

## 4. Component Structure

### Organization
- **`/app`**: Page routes and layout files.
- **`/components`**: Reusable UI components, grouped by feature (e.g., `/components/chat`, `/components/calendar`).
- **`/components/ui`**: Wrappers around shadcn/ui primitives for app-wide variants.

### Key Components
- **ChatInterface** (`components/chat-interface.tsx`): Handles AI chat using `@ai-sdk/react` and renders messages.
- **CalendarView** (`components/calendar-view.tsx`): Displays events in daily/weekly/monthly layouts.
- **MetricCard** (`components/metric-card.tsx`): Shows summary stats (hours worked, productivity score).
- **ThemeToggle** (`components/theme-toggle.tsx`): Switches between light/dark mode.

### Benefits of Component-Based Architecture
- **Reusability**: Build once, use everywhere.
- **Isolation**: Each component handles its own logic and styles.
- **Testability**: Smaller units are easier to test and debug.

## 5. State Management

- **Local State**: React `useState` for component-specific data (e.g., form inputs).
- **Global State**: React Context for theme and auth status.
- **Data Fetching & Caching**: `useSWR` or React Query for API calls (e.g., fetching calendar events).
- **AI Chat State**: Managed by `@ai-sdk/react` under the hood, exposing hooks to our components.

## 6. Routing and Navigation

- **File-Based Routes**: Every folder in `/app` becomes a route. Nested folders create sub-routes.
- **Navigation Structure**:
  • `/dashboard` → Main chat screen  
  • `/dashboard/calendar` → Calendar & metrics view  
- **Layout Files** (`layout.tsx`): Shared UI (header, sidebar) across child routes.
- **Linking**: Use Next.js’s `<Link>` component for client-side transitions.

## 7. Performance Optimization

1. **Server Components**: Offload AI calls and database access to the server, sending only the rendered HTML to the client.
2. **Code Splitting**: Next.js automatically splits per route. Dynamic `import()` for heavy components (e.g., `react-big-calendar`).
3. **Lazy Loading**: Use `next/image` for optimized images, and lazy load charts or calendar views.
4. **Asset Optimization**: Tailwind’s purge removes unused CSS. Next.js optimizes JS bundles in production.

These strategies reduce initial load time and keep interactions snappy.

## 8. Testing and Quality Assurance

- **Unit Tests**: Jest + React Testing Library for components (chat bubbles, metric cards).
- **Integration Tests**: Testing API routes and React Query logic (e.g., fetching events).
- **End-to-End Tests**: Cypress to simulate user flows (sign-in, chat conversation, calendar navigation).
- **Linting & Formatting**: ESLint (with Next.js plugin) and Prettier ensure code consistency.
- **Type Checking**: `tsc --noEmit` in CI catches type errors before merge.

## 9. Conclusion and Overall Frontend Summary

This frontend is built on Next.js with React 18, TypeScript, and Tailwind CSS. We follow modern design principles—usability, accessibility, and responsiveness—applied through a component-driven architecture and utility-first styling. Theming is seamless, and performance is optimized via server components and code splitting. State is managed locally, with Context for global concerns. Routing uses Next.js’s App Router, and testing covers unit, integration, and end-to-end layers.

Together, these guidelines ensure a scalable, maintainable, and high-performing frontend that aligns with our goal: to deliver a smooth, secure, and engaging AI-powered schedule audit assistant.
