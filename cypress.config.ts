import { defineConfig } from 'cypress';
import { join } from 'path';
import { existsSync, rmSync } from 'fs';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    video: false,
    retries: { runMode: 1, openMode: 0 },
    viewportWidth: 1280,
    viewportHeight: 720,
    experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      const downloads = join(__dirname, 'cypress', 'downloads')
      if (existsSync(downloads)) {
        rmSync(downloads, { recursive: true, force: true })
      }

      on('after:run', () => {
        if (existsSync(downloads)) {
          rmSync(downloads, { recursive: true, force: true })
        }
      })
      return config
    },
  },
});
