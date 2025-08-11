
export default {
  testEnvironment: 'jsdom',
  transform: {},
  setupFiles: ['jest-fetch-mock'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: { '\\.(css|less|scss)$': 'identity-obj-proxy' }
};
