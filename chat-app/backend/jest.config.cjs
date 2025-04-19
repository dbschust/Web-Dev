module.exports = {
   preset: "@shelf/jest-mongodb",
   testEnvironment: "node",
   setupFilesAfterEnv: ['./jest.setup.js'],
   transform: {
      "^.+\\.(js|jsx)$": "babel-jest",
   },
};