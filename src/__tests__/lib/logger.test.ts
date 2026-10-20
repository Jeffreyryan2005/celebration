import { logger } from '@/lib/logger';

describe('Logger', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('logs info messages cleanly', () => {
    logger.info('Event plan created', { eventId: 'evt-1' });
    expect(logSpy).toHaveBeenCalled();
  });

  it('redacts sensitive API keys from log strings', () => {
    const rawApiKey = 'AQ.mock_dummy_test_key_placeholder_for_unit_testing';
    logger.info(`Initialized with key: ${rawApiKey}`);
    expect(logSpy).toHaveBeenCalled();
    const calledArg = logSpy.mock.calls[0][0];
    expect(calledArg).not.toContain(rawApiKey);
  });

  it('redacts secret object keys', () => {
    logger.warn('Auth issue', { apiKey: 'secret-123', clientToken: 'abc' });
    expect(warnSpy).toHaveBeenCalled();
    const calledContext = warnSpy.mock.calls[0][1];
    expect(calledContext.apiKey).toBe('[REDACTED]');
    expect(calledContext.clientToken).toBe('[REDACTED]');
  });

  it('logs errors with stack traces', () => {
    const err = new Error('Database connection timed out');
    logger.error('Failed operation', err);
    expect(errorSpy).toHaveBeenCalled();
  });
});
