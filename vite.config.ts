/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/convex-hull-sim/',
  test: {
    include: ['src/__tests__/**/*.test.ts'],
  },
});
