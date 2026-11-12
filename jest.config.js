/** Jest runs only the pure rules engine tests (no React Native needed). */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/engine'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: { module: 'commonjs', target: 'es2020', strict: true, esModuleInterop: true, types: ['jest'] },
      },
    ],
  },
};
