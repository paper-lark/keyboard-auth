module.exports = {
  clearMocks: true,
  moduleDirectories: [
    'node_modules',
  ],
  testEnvironment: 'node',
  verbose: false,
  rootDir: '../src',
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
}