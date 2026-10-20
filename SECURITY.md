# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Measures

### API Key Protection
- `GEMINI_API_KEY` is stored as a server-side environment variable and **never exposed to the client**
- All AI API calls are proxied through Next.js API routes (`/api/chat`, `/api/generate`)
- The `.env.local` file is gitignored by default

### Input Validation
- All incoming request bodies are validated for required fields and correct types
- Message content is sanitized and capped at 4000 characters per message
- Message history is trimmed to the last 20 messages to prevent token overflow attacks
- HTTP method validation is enforced on all API routes

### Rate Limiting
- Per-IP rate limiting (default: 20 requests/minute) is applied to all AI endpoints
- Configurable via the `RATE_LIMIT_RPM` environment variable
- Returns `429 Too Many Requests` with a user-friendly error message

### Response Headers
- `X-Content-Type-Options: nosniff` on streaming responses
- `Cache-Control: no-store` on generated content to prevent sensitive data caching

### Data Privacy
- No user data is stored server-side
- All event plans are persisted in the user's own browser `localStorage`
- No analytics, tracking, or third-party data collection

## Reporting a Vulnerability

If you discover a security vulnerability, please open a GitHub issue with the `security` label.
