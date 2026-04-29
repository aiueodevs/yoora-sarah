import nextPluginModule from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";

const nextPlugin = nextPluginModule.default ?? nextPluginModule;
const nextFlatConfig = nextPluginModule.flatConfig ?? nextPlugin.flatConfig ?? {};

const config = [
  {
    ignores: [".next/**", "next-env.d.ts", "node_modules/**"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...(nextFlatConfig.coreWebVitals?.rules ?? {}),
    },
  },
];

export default config;
