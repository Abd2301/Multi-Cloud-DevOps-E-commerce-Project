module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'apps/*/server.js',
    'apps/*/routes/*.js',
    'apps/*/controllers/*.js',
    'apps/*/middleware/*.js',
    '!apps/*/node_modules/**',
    '!apps/*/tests/**',
    '!apps/*/coverage/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000,
  verbose: true
};
