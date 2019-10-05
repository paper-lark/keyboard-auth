module.exports = {
  clearMocks: true,
  moduleDirectories: [
    'node_modules',
  ],
  testEnvironment: 'node',
  verbose: false,
  rootDir: '../',
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
}