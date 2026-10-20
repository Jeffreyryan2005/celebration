# CelebrationAI — Celebration & Event Planner

> **[Challenge 5] Virtual PromptWars** — A GenAI-powered smart event planning assistant

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://celebration-planner.vercel.app)
[![Built with Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-blue?style=for-the-badge&logo=google)](https://aistudio.google.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

---

## 🎉 Overview

**CelebrationAI** is an intelligent, full-stack event planning assistant that helps users organize **weddings, birthdays, corporate events, community gatherings, anniversaries, and graduations** with:

- 🤖 **AI Chat Assistant** — Real-time streaming conversation powered by Google Gemini 1.5 Flash
- 💰 **Smart Budget Planner** — AI-generated budget allocations with live tracking and visual progress
- 📅 **Dynamic Timeline Generator** — Personalized milestone checklists from booking to event day
- 🏪 **Vendor Checklist** — Track catering, photography, music, transportation with status management
- 💡 **Personalized Ideas** — AI-generated theme concepts, décor ideas, and unique event touches

---

## 🎯 Chosen Vertical

**Challenge 5: Celebration & Event Planner**

Design a GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.

---

## 🏗️ Architecture & Approach

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS, custom animations |
| AI Engine | Google Gemini 1.5 Flash API |
| Storage | Browser localStorage (no backend DB needed) |
| Testing | Jest, React Testing Library |
| Deployment | Vercel |

### Application Flow

```
User → Event Setup → Planner Dashboard
                         ├── 🤖 AI Chat (streaming Gemini)
                         ├── 💰 Budget (AI-generated + manual)
                         ├── 📅 Timeline (AI-generated milestones)
                         ├── 🏪 Vendors (status tracking)
                         └── 💡 Ideas (AI + manual)
```

### AI Integration Logic

The application uses **Google Gemini 1.5 Flash** through three API endpoints:

1. **`/api/chat`** — Real-time streaming chat with context-aware system prompts that include the user's event details (type, budget, guest count, date, theme). The AI knows the full event context and gives personalized advice.

2. **`/api/generate`** — Three generation modes:
   - `budget`: AI generates itemized budget allocations summing to the user's total budget
   - `timeline`: AI creates 15-20 milestone tasks with priorities and relative due dates
   - `ideas`: AI generates 10 creative, themed ideas for the specific event type

### Decision-Making Logic

The AI system prompt is dynamically built to include:
- Event type (wedding/birthday/corporate/community/anniversary/graduation)
- Total budget with smart category allocation percentages
- Guest count for catering/venue scale recommendations
- Event date for timeline urgency calibration
- Theme for décor and entertainment personalization

---

## 🔒 Security Implementation

- **Server-side API key**: `GEMINI_API_KEY` never exposed to the client; all AI calls go through Next.js API routes
- **Rate limiting**: Per-IP rate limiting (20 req/min) on all API endpoints
- **Input sanitization**: Message length capping (4000 chars), role validation, array bounds checking
- **No sensitive data storage**: Only event planning data stored in browser localStorage

---

## ⚡ Efficiency Optimizations

- **Streaming responses**: Gemini responses stream token-by-token for instant feedback
- **React.memo**: All heavy components memoized to prevent unnecessary re-renders
- **useCallback**: Event handlers memoized throughout for stable references
- **Message history trimming**: Last 20 messages sent to API to prevent token overflow
- **Lazy tab rendering**: Planner tabs only render when active

---

## ♿ Accessibility Features

- **Skip to main content** link for keyboard/screen reader users
- **ARIA roles**: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `role="radiogroup"`, `role="log"` (chat), `role="progressbar"`, `role="timer"`
- **Semantic HTML**: `<header>`, `<main>`, `<nav>`, `<footer>`, `<table>` with proper `<thead>`/`<tbody>`/`<tfoot>`
- **Labels**: Every form input has an associated `<label>` or `aria-label`
- **Focus visible**: Consistent `:focus-visible` ring styles for keyboard navigation
- **Screen reader text**: `.sr-only` class for context-only text
- **`aria-live="polite"`** on chat messages for screen reader announcements
- **Color contrast**: All text meets WCAG 2.1 AA standards

---

## 🧪 Testing

Tests are located in `src/__tests__/`:

```bash
npm test              # Run all tests
npm run test:coverage # With coverage report
```

### Test Coverage
- `lib/storage.ts` — `formatCurrency`, `daysUntilEvent`, `createEmptyPlan`
- `lib/constants.ts` — Budget categories, event types, allocations
- `lib/gemini.ts` — `buildSystemPrompt` with event context

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Google Gemini API key ([Get one free](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/celebration-planner.git
cd celebration-planner

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key_here
RATE_LIMIT_RPM=20
```

### Build for Production

```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts       # Streaming AI chat endpoint
│   │   └── generate/route.ts   # Budget/timeline/ideas generation
│   ├── planner/[id]/page.tsx   # Dynamic planner dashboard
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Landing page + event setup
│   └── globals.css             # Global styles + animations
├── components/
│   ├── ChatPanel.tsx           # AI chat with streaming
│   ├── BudgetPanel.tsx         # Budget tracker with AI generation
│   ├── TimelinePanel.tsx       # Milestone timeline with progress
│   ├── VendorPanel.tsx         # Vendor management with status
│   ├── IdeasPanel.tsx          # AI-generated event ideas
│   └── EventHeader.tsx         # Event context header
├── lib/
│   ├── gemini.ts               # Gemini AI integration
│   ├── storage.ts              # localStorage utilities
│   └── constants.ts            # App-wide constants
├── types/
│   └── index.ts                # TypeScript type definitions
└── __tests__/
    └── lib/
        ├── storage.test.ts
        ├── gemini.test.ts
        └── constants.test.ts
```

---

## 💡 Key Assumptions

1. **Client-side storage**: Event plans are stored in `localStorage` for privacy and simplicity (no account required)
2. **Free-tier Gemini API**: Uses `gemini-1.5-flash` which has a generous free quota sufficient for hackathon use
3. **USD currency**: Budget figures are in USD; easily configurable in `lib/storage.ts`
4. **English language**: UI and AI responses are in English
5. **Modern browsers**: Requires ES2020+ support (Chrome, Firefox, Safari, Edge current versions)

---

## 🤖 Gen AI Services Used

| Service | Usage |
|---------|-------|
| **Google Gemini 1.5 Flash** | Streaming chat assistant with event-aware system prompts |
| **Google Gemini 1.5 Flash** | Budget allocation generation (structured JSON output) |
| **Google Gemini 1.5 Flash** | Timeline milestone generation (structured JSON output) |
| **Google Gemini 1.5 Flash** | Personalized event ideas generation |

All AI interactions are server-side via Next.js API routes, keeping the API key secure.

---

## 📋 Submission Details

- **Challenge**: [Challenge 5] Celebration & Event Planner
- **Platform**: Virtual PromptWars by Hack2Skill
- **Category**: AI-Powered Smart Assistant
- **AI Platform Used**: Google Antigravity (Gemini)

---

*Built with ❤️ using Google Gemini AI for PromptWars Virtual Challenge 5*
