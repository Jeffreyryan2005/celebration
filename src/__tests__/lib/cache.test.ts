import { SimpleCache, aiResponseCache } from '@/lib/cache';

describe('SimpleCache', () => {
  let cache: SimpleCache<string>;

  beforeEach(() => {
    cache = new SimpleCache<string>(3, 500); // 3 max items, 500ms TTL
  });

  it('stores and retrieves items correctly', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('returns null for missing keys', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('evicts oldest items when max entries is reached (LRU)', () => {
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');
    cache.set('d', '4'); // Should evict 'a'

    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBe('2');
    expect(cache.get('c')).toBe('3');
    expect(cache.get('d')).toBe('4');
  });

  it('expires entries after TTL', async () => {
    cache.set('temp', 'tempVal', 50); // 50ms TTL
    expect(cache.get('temp')).toBe('tempVal');

    await new Promise((resolve) => setTimeout(resolve, 70));
    expect(cache.get('temp')).toBeNull();
  });

  it('reports correct size and clears successfully', () => {
    cache.set('k1', 'v1');
    cache.set('k2', 'v2');
    expect(cache.size()).toBe(2);

    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get('k1')).toBeNull();
  });

  it('aiResponseCache singleton is defined', () => {
    expect(aiResponseCache).toBeInstanceOf(SimpleCache);
  });
});
