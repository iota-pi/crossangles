import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        extends: 'app/vite.config.ts',
        test: {
          name: 'app',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['app/src/setupTests.ts'],
          include: ['app/**/*.spec.ts', 'app/**/*.test.ts', 'app/**/*.spec.tsx', 'app/**/*.test.tsx'],
        },
      },
      {
        test: {
          name: 'backend',
          environment: 'node',
          globals: true,
          include: [
            'contact/**/*.spec.ts',
            'scraper/**/*.spec.ts',
          ],
        },
      },
    ],
  },
})
