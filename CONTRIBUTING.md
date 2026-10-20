# Contributing to CelebrationAI

Thank you for your interest in contributing to CelebrationAI!

## Code of Conduct
We are committed to providing a friendly, safe, and welcoming environment for all contributors.

## How to Contribute
1. **Fork the repository** and clone your fork locally.
2. **Create a branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run tests before making changes**:
   ```bash
   npm test
   ```
5. **Implement your changes** following our standards:
   - Strict TypeScript without `any` types.
   - All external inputs validated with Zod schemas.
   - Secure coding practices (no secret leakage, sanitized user inputs).
   - Full keyboard accessibility and ARIA landmarks.
6. **Add or update tests** to maintain high test coverage (>100 tests passing).
7. **Ensure clean build and type safety**:
   ```bash
   npx tsc --noEmit
   npm run build
   ```
8. **Submit a Pull Request** with a descriptive title and summary of changes.

## Security Vulnerabilities
Please do not report security vulnerabilities through public GitHub issues. Refer to [SECURITY.md](SECURITY.md) for our responsible disclosure procedure.
