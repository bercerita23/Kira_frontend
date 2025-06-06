import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '',
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', props);
  },
}));

// Mock ResizeObserver for jsdom
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  // @ts-ignore
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
} 