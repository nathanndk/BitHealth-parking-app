module.exports = {
  // Hapus preset ts-jest
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/src/tests/setupMocks.ts"],
  moduleNameMapper: {
    "^\\.\\.$": "<rootDir>/src",
    "^\\.\\./(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": "babel-jest", // Gunakan babel-jest
  },
};
