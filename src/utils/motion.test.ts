import { describe, expect, it, vi } from 'vitest';
import { prefersReducedMotion, shouldUseLenis } from '@/utils/motion';

describe('motion utils', () => {
  it('respects reduced motion media query', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    expect(prefersReducedMotion()).toBe(true);
    expect(shouldUseLenis()).toBe(false);
  });
});
