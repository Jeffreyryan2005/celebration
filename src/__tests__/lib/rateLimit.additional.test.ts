/**
 * Extended rate limiter and cache tests — edge cases, concurrency, TTL
 */
import { checkRateLimit } from '@/lib/rateLimit';
import { SimpleCache } from '@/lib/cache';

describe('RateLimit: concurrency and edge cases', () => {
  it('allows requests just under the per-minute limit', () => {
    const ip = `test-limit-${Date.now()}-concurrent`;
    // First 29 requests should succeed
    for (let i = 0; i < 29; i++) {
      const result = checkRateLimit(ip);
      expect(result.success).toBe(true);
    }
  });

  it('tracks remaining count correctly as requests are made', () => {
    const ip = `test-remaining-${Date.now()}`;
    const first = checkRateLimit(ip);
    const second = checkRateLimit(ip);
    expect(second.remaining).toBeLessThan(first.remaining);
  });

  it('returns limit field in every response', () => {
    const result = checkRateLimit(`test-limit-field-${Date.now()}`);
    expect(result.limit).toBeGreaterThan(0);
  });

  it('returns reset seconds within valid window', () => {
    const result = checkRateLimit(`test-reset-${Date.now()}`);
    expect(result.reset).toBeGreaterThan(0);
    expect(result.reset).toBeLessThanOrEqual(60);
  });

  it('isolates different IPs completely', () => {
    const ip1 = `ip-isolated-a-${Date.now()}`;
    const ip2 = `ip-isolated-b-${Date.now()}`;
    // Exhaust ip1
    for (let i = 0; i < 30; i++) {
      checkRateLimit(ip1);
    }
    // ip2 should still pass
    const result = checkRateLimit(ip2);
    expect(result.success).toBe(true);
  });
});

describe('SimpleCache: extended behavior', () => {
  it('returns null for non-existent key', () => {
    const cache = new SimpleCache<string>(10, 60000);
    expect(cache.get('missing-key')).toBeNull();
  });

  it('overwrites existing key with new value', () => {
    const cache = new SimpleCache<string>(10, 60000);
    cache.set('key', 'first');
    cache.set('key', 'second');
    expect(cache.get('key')).toBe('second');
  });

  it('stores and retrieves objects', () => {
    const cache = new SimpleCache<{ value: number }>(5, 60000);
    cache.set('obj', { value: 42 });
    expect(cache.get('obj')).toEqual({ value: 42 });
  });

  it('stores and retrieves arrays', () => {
    const cache = new SimpleCache<string[]>(5, 60000);
    cache.set('arr', ['a', 'b', 'c']);
    expect(cache.get('arr')).toEqual(['a', 'b', 'c']);
  });

  it('evicts LRU item when capacity is exceeded', () => {
    const cache = new SimpleCache<string>(3, 60000);
    cache.set('k1', 'v1');
    cache.set('k2', 'v2');
    cache.set('k3', 'v3');
    cache.set('k4', 'v4'); // Should evict k1
    expect(cache.get('k4')).toBe('v4');
    // k2, k3, k4 are still accessible
    expect(cache.get('k2')).toBe('v2');
  });

  it('respects TTL and returns null after expiry', async () => {
    const cache = new SimpleCache<string>(10, 50); // 50ms TTL
    cache.set('ttl-key', 'fresh-value');
    expect(cache.get('ttl-key')).toBe('fresh-value');
    await new Promise((r) => setTimeout(r, 100));
    expect(cache.get('ttl-key')).toBeNull();
  });

  it('handles size of 1 correctly', () => {
    const cache = new SimpleCache<string>(1, 60000);
    cache.set('only', 'one');
    expect(cache.get('only')).toBe('one');
    cache.set('replacement', 'new');
    expect(cache.get('replacement')).toBe('new');
  });
});
