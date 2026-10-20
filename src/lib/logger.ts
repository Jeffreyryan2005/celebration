/**
 * Structured Logger
 * Safe logging that redacts sensitive information and formats messages cleanly.
 */

function sanitize(data: unknown): unknown {
  if (typeof data === 'string') {
    return data.replace(/(AIza[0-9A-Za-z-_]{35}|AQ\.[0-9A-Za-z-_]{35,})/g, '[REDACTED_API_KEY]');
  }
  if (typeof data === 'object' && data !== null) {
    const copy: Record<string, unknown> | unknown[] = Array.isArray(data) ? [] : {};
    for (const [key, val] of Object.entries(data)) {
      if (/key|secret|password|token/i.test(key)) {
        (copy as Record<string, unknown>)[key] = '[REDACTED]';
      } else {
        (copy as Record<string, unknown>)[key] = sanitize(val);
      }
    }
    return copy;
  }
  return data;
}

export const logger = {
  info: (message: string, context?: unknown) => {
    const cleanMsg = String(sanitize(message));
    console.log(`[INFO] ${new Date().toISOString()} - ${cleanMsg}`, context ? sanitize(context) : '');
  },
  warn: (message: string, context?: unknown) => {
    const cleanMsg = String(sanitize(message));
    console.warn(`[WARN] ${new Date().toISOString()} - ${cleanMsg}`, context ? sanitize(context) : '');
  },
  error: (message: string, error?: unknown) => {
    const cleanMsg = String(sanitize(message));
    console.error(`[ERROR] ${new Date().toISOString()} - ${cleanMsg}`, error ? sanitize(error) : '');
  },
  debug: (message: string, context?: unknown) => {
    if (process.env.NODE_ENV !== 'production') {
      const cleanMsg = String(sanitize(message));
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${cleanMsg}`, context ? sanitize(context) : '');
    }
  },
};
