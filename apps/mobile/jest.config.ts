import type { Config } from "jest";

const config: Config = {
  preset: "jest-expo",
  // setupFilesAfterEnv runs AFTER the test framework is installed,
  // so it doesn't need to be transformed by Babel
  // (unlike setupFiles which runs BEFORE and needs transformation)
  setupFilesAfterEnv: ["./jest.setup.ts"],
  // Match jest-expo's pattern but also include our additional packages
  transformIgnorePatterns: [
    "/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|react-native-safe-area-context|react-native-paper|@todo-app))",
    "/node_modules/react-native-reanimated/plugin/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default config;
