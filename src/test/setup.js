import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = {
  getItem: (key) => localStorageMock.store[key] || null,
  setItem: (key, value) => {
    localStorageMock.store[key] = value.toString();
  },
  removeItem: (key) => {
    delete localStorageMock.store[key];
  },
  clear: () => {
    localStorageMock.store = {};
  },
  store: {},
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Reset localStorage before each test
beforeAll(() => {
  localStorageMock.clear();
});

afterAll(() => {
  localStorageMock.clear();
});

