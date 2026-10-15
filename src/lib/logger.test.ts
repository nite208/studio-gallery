import { describe, it, expect, vi } from 'vitest';
import { logServer } from './logger';

describe('logServer', () => {
  it('logs info messages with timestamp and level', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const entry = logServer('info', 'Server started', { port: 3000 });

    expect(entry.level).toBe('info');
    expect(entry.message).toBe('Server started');
    expect(entry.context).toEqual({ port: 3000 });
    expect(consoleSpy).toHaveBeenCalledOnce();

    consoleSpy.mockRestore();
  });

  it('logs error messages using console.error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const entry = logServer('error', 'Operation failed');

    expect(entry.level).toBe('error');
    expect(entry.message).toBe('Operation failed');
    expect(errorSpy).toHaveBeenCalledOnce();

    errorSpy.mockRestore();
  });
});
