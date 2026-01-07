module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  projects: [
    {
      displayName: 'app',
      preset: 'ts-jest/presets/default-esm',
      testEnvironment: 'node',
      testMatch: ["<rootDir>/app/**/?(*.)+(spec|test).ts?(x)"],
      extensionsToTreatAsEsm: ['.ts', '.tsx', '.mts'],
      setupFilesAfterEnv: ['<rootDir>/app/src/setupTests.ts'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      transform: {
        '^.+\\.m?[tj]sx?$': [
          'ts-jest',
          {
            useESM: true,
          },
        ],
      },
    },
    {
      displayName: 'scraper',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ["<rootDir>/scraper/**/?(*.)+(spec|test).ts?(x)"],
    },
    {
      displayName: 'contact',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ["<rootDir>/contact/**/?(*.)+(spec|test).ts?(x)"],
    },
    {
      displayName: 'lambda-shared',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ["<rootDir>/lambda-shared/**/?(*.)+(spec|test).ts?(x)"],
    }
  ]
};
