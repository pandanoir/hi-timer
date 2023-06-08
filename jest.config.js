module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/__tests__/*'],
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      { configFile: './__tests__/babel.config.js' },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!lizod)'],
  moduleNameMapper: { '\\.(css|less)$': '<rootDir>/__tests__/styleMock.ts' },
};
