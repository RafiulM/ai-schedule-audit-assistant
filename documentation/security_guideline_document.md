# Security Guidelines for ai-schedule-audit-assistant

This document provides comprehensive security guidelines tailored to the **ai-schedule-audit-assistant** codebase. It aligns with industry best practices and the core security principles of Security by Design, Least Privilege, Defense in Depth, and Secure Defaults.

---

## Table of Contents
1. Introduction and Scope
2. Authentication & Access Control
3. Input Handling & Processing
4. Data Protection & Privacy
5. API & Service Security
6. Web Application Security Hygiene
7. Infrastructure & Configuration Management
8. Dependency Management
9. Monitoring, Logging, and Incident Response

---

## 1. Introduction and Scope
These guidelines apply to all components of the ai-schedule-audit-assistant application, including the Next.js frontend (App Router), API routes, Drizzle ORM schemas, and deployment configurations. The goal is to ensure that user data—especially personally identifiable information (PII), schedule events, and chat history—remains secure throughout its lifecycle.

---

## 2. Authentication & Access Control
- **Robust Authentication**
  - Use the built-in `better-auth` system with strong password policies: minimum length 12+, complexity (uppercase, lowercase, digit, special character), and account lockout after repeated failures.
  - Enforce multi-factor authentication (MFA) for all privileged users.
- **Secure Session Management**
  - Generate cryptographically strong session IDs.
  - Set tight idle and absolute timeouts (e.g., 15 minutes idle, 8 hours absolute).
  - Invalidate sessions on password change or logout to prevent session fixation.
- **Role-Based Access Control (RBAC)**
  - Define roles (e.g., `user`, `admin`) and map permissions for API routes (read/write schedules, view metrics).
  - Perform server-side authorization checks in every API route (`/api/chat`, `/api/events`).
  - Reject unauthorized access with HTTP 403 without revealing role details.

---

## 3. Input Handling & Processing
- **Prevent Injection Attacks**
  - Use Drizzle ORM parameterized queries—never concatenate SQL strings.
  - On any raw query, validate inputs with Zod schemas.
- **Server-Side Validation**
  - Validate all user-supplied data in API routes and server actions using Zod or Joi.
  - Reject invalid or out-of-range values with generic error messages.
- **Prompt Injection Mitigation**
  - Sanitize user messages before sending to the AI SDK: strip control characters, enforce a reasonable length limit (e.g., 2,000 chars).
  - Use a whitelist of allowed fields when parsing the AI’s structured response.
- **Secure File Handling (if applicable)**
  - For avatar uploads or attachments, validate MIME type, extension, and file size.
  - Store files outside of `public/` with randomized filenames and restrictive ACLs.

---

## 4. Data Protection & Privacy
- **Encryption in Transit**
  - Enforce HTTPS/TLS 1.2+ for all front-end and API traffic. Redirect HTTP to HTTPS.
  - Use HSTS (`Strict-Transport-Security`) with a long max-age in production.
- **Encryption at Rest**
  - Enable database-level encryption for PostgreSQL.
  - Encrypt backups and snapshots in the cloud provider.
- **Secrets Management**
  - Store API keys (OpenAI, database credentials) in a secrets vault or environment variables—not in source code.
  - Rotate secrets regularly and on any suspected compromise.
- **Sensitive Data Handling**
  - Hash user passwords with Argon2id or bcrypt and a unique per-user salt.
  - Mask or truncate PII in logs (e.g., email addresses, schedule descriptions).
  - Comply with GDPR/CCPA: implement user data export and deletion endpoints.

---

## 5. API & Service Security
- **Endpoint Protection**
  - Require authentication for all `/api/*` routes.
  - Return minimal error details (e.g., “Unauthorized” vs. stack traces).
- **Rate Limiting & Throttling**
  - Implement IP-based and user-based rate limiting (e.g., 100 requests/minute) to mitigate abuse.
- **CORS Policy**
  - Restrict allowed origins to the official domain(s).
  - Enable `Access-Control-Allow-Credentials` only if necessary, and never allow wildcard origins with credentials.
- **HTTP Method Enforcement**
  - Use `GET` for reads, `POST` for creations, `PATCH` for updates, and `DELETE` for removals.
- **API Versioning**
  - Namespace critical endpoints under `/api/v1/` to allow controlled upgrades.

---

## 6. Web Application Security Hygiene
- **Security Headers**
  - Content-Security-Policy: restrict scripts, styles, and frames.
  - X-Content-Type-Options: `nosniff`.
  - X-Frame-Options: `DENY` or CSP `frame-ancestors 'none'`.
  - Referrer-Policy: `strict-origin-when-cross-origin`.
- **CSRF Protection**
  - Implement anti-CSRF tokens for state-changing form submissions and API calls.
- **Secure Cookies**
  - Set `HttpOnly`, `Secure`, and `SameSite=Strict` for session cookies.
- **Client-Side Storage**
  - Avoid storing tokens or sensitive data in localStorage/sessionStorage.
  - Use cookies with the above attributes instead.
- **Subresource Integrity**
  - Add SRI hashes for any CDN-hosted scripts or styles.

---

## 7. Infrastructure & Configuration Management
- **Server Hardening**
  - Disable all unnecessary ports and services on the database and application servers.
  - Enforce least-privilege on OS users and database roles.
- **TLS Configuration**
  - Use strong cipher suites (e.g., ECDHE, AES-GCM).
  - Disable SSLv3, TLS 1.0, and TLS 1.1.
- **Secure Defaults**
  - Ensure Docker containers run with non-root users.
  - Default feature flags to “off” for new functionality.
- **Software Updates**
  - Regularly patch the OS, Next.js, Node.js, and all dependencies.
  - Automate security updates where feasible.

---

## 8. Dependency Management
- **Use Trusted Libraries**
  - Select well-maintained NPM packages for React, Drizzle, and the AI SDK.
- **Lockfiles & Audits**
  - Commit `package-lock.json` and run `npm audit` in CI pipelines.
  - Block merges with critical or high-severity vulnerabilities.
- **Minimize Footprint**
  - Remove unused dependencies and code to reduce attack surface.

---

## 9. Monitoring, Logging, and Incident Response
- **Centralized Logging**
  - Send application logs (errors, warnings) to a secure aggregator (e.g., Sentry, Datadog).
  - Mask sensitive fields before logging.
- **Alerts & Metrics**
  - Monitor auth failures, rate-limit triggers, and error rates.
  - Set up alerts for unusual patterns (e.g., burst of 401s or 5xx errors).
- **Incident Response**
  - Define a runbook for security incidents: detection, containment, eradication, recovery.
  - Perform post-mortem reviews and rotate compromised credentials.

---

By following these guidelines, the ai-schedule-audit-assistant codebase will maintain a robust security posture, protect user privacy, and ensure the integrity of schedule data and AI chat interactions. Regular reviews and updates to these practices will help defend against evolving threats.