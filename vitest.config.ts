import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { config as loadDotenv } from 'dotenv';

const parsed = loadDotenv({ path: '/home/ubuntu/.bw_env' }).parsed ?? {};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    env: parsed,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
