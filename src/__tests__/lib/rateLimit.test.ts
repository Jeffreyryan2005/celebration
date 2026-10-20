import { checkRateLimit } from '@/lib/rateLimit';

describe('Rate Limiter: checkRateLimit', () => {
  const testIp = '192.168.1.100';

  it('allows requests within limit', () => {
    const res = checkRateLimit(testIp, 5, 10000);
    expect(res.success).toBe(true);
    expect(res.remaining).toBeLessThan(5);
  });

  it('blocks requests when threshold is exceeded', () => {
    const spamIp = '10.0.0.99';
    // Exhaust limit of 3
    checkRateLimit(spamIp, 3, 10000);
    checkRateLimit(spamIp, 3, 10000);
    checkRateLimit(spamIp, 3, 10000);

    const fourth = checkRateLimit(spamIp, 3, 10000);
    expect(fourth.success).toBe(false);
    expect(fourth.remaining).toBe(0);
    expect(fourth.reset).toBeGreaterThan(0);
  });

  it('isolates rate limits per IP', () => {
    const ipA = '172.16.0.1';
    const ipB = '172.16.0.2';

    // Exhaust limit for ipA
    checkRateLimit(ipA, 1, 10000);
    const blockedA = checkRateLimit(ipA, 1, 10000);
    expect(blockedA.success).toBe(false);

    // ipB should still be permitted
    const allowedB = checkRateLimit(ipB, 1, 10000);
    expect(allowedB.success).toBe(true);
  });
});
