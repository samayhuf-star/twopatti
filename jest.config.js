/** Jest runs the pure rules engine and pure lib tests (no React Native needed). */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/engine', '<rootDir>/src/lib'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: { module: 'commonjs', target: 'es2020', strict: true, esModuleInterop: true, types: ['jest'] },
      },
    ],
  },
};
