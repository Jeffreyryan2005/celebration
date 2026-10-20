# Changelog

All notable changes to **CelebrationAI** are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) with [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.0] - 2026-10-20

### Added
- **Expanded Test Coverage to 120 Tests (12 Suites)**:
  - `gemini.additional.test.ts`: Context injection verification across weddings, birthdays, community festivals, and corporate events
  - `validators.additional.test.ts`: Advanced XSS attack vector stripping, onclick injections, malicious image payloads, schema boundary tests
  - `rateLimit.additional.test.ts`: Concurrency simulation, boundary window throttling, and LRU cache integration
  - `storage.additional.test.ts`: Full CRUD test coverage for LocalStorage persistence, multi-event isolation, and date math
- Added `CONTRIBUTING.md` guidelines for open source collaboration

### Fixed
- Fixed strict type casting in `getFallbackBudget` category assignment in `src/lib/gemini.ts`
- Updated live demo production URL references to `https://celebration-rho.vercel.app`

---

## [1.2.0] - 2026-10-20

### Added
- **Export to JSON**: One-click full event plan export as `.json` file from EventHeader
- **Print / PDF**: Browser print dialog for run-of-show formatted layouts
- **ErrorBoundary**: React error boundary catches and recovers from any component failure
- **`/planner/[id]` dynamic route**: Full-featured multi-tab planner workspace per event
- **Sliding Window Rate Limiter** (`src/lib/rateLimit.ts`): Per-IP throttling with X-RateLimit headers
- **LRU Response Cache** (`src/lib/cache.ts`): TTL-based in-memory cache for AI generations
- **Structured Logger** (`src/lib/logger.ts`): API key and secret redaction before any console output
- **Zod Schema Validation** (`src/lib/validators.ts`): Runtime validation for all API route payloads
- **8 Test Suites (52 Tests)**: Comprehensive unit coverage for validators, cache, logger, rate limiter, security, storage, constants, and gemini prompt construction

### Changed
- Upgraded **Gemini model** from `gemini-1.5-flash` to `gemini-2.5-flash` with automatic fallback to `gemini-flash-latest`
- **`/api/chat`**: Now validates via Zod schema and uses sliding-window rate limiting
- **`/api/generate`**: Now uses `responseMimeType: 'application/json'` for structured generation with LRU caching
- **`EventHeader`**: Added export and print buttons, improved accessible countdown timer

### Fixed
- Removed `any` TypeScript types across all source files
- Fixed `EventDetails.createdAt`/`updatedAt` as optional fields to resolve Zod/TypeScript type mismatches

---

## [1.1.0] - 2026-10-20

### Added
- **Security hardening**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy headers via `next.config.ts`
- **`postcss.config.mjs`**: Proper Tailwind CSS v4 PostCSS integration for Vercel production deployments
- **`SECURITY.md`**: Security policy, responsible disclosure process, and threat model

### Fixed
- CSS rendering on Vercel: replaced legacy `@tailwind` directives with `@import "tailwindcss"` (Tailwind v4)
- `poweredByHeader: false` to prevent server version disclosure

---

## [1.0.0] - 2026-10-20

### Added
- **Landing page**: Event type selector (Wedding, Birthday, Corporate, Community, Anniversary, Graduation), event detail form with budget and guest count
- **AI Chat Panel**: Streaming Gemini assistant with event-context system prompts, typing indicator, quick prompts, stop button
- **Budget Panel**: AI-generated category allocations, manual item management, paid/unpaid tracking, overbudget alert
- **Timeline Panel**: AI-generated milestone checklist, priority grouping (high/medium/low), progress ring, completion tracking
- **Vendor Panel**: Vendor CRM with status pipeline (researching → confirmed), category filtering, price tracking
- **Ideas Panel**: AI-generated theme and experience ideas, manual addition, clipboard copy, visual card grid
- **localStorage persistence**: All event plans saved and loaded from browser storage
- **Full TypeScript**: Strict mode, zero build errors across all 31 source files
- **Accessibility**: ARIA roles, skip navigation, progressbars, live regions, keyboard navigation, WCAG 2.1 AA

---

## [0.1.0] - 2026-10-20

### Added
- Initial project scaffold with Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS v4
- Google Gemini API integration via `@google/generative-ai` SDK
- Core type definitions for EventPlan, BudgetItem, TimelineItem, VendorItem, ChatMessage
- Constants: event types, budget categories, default allocation percentages
