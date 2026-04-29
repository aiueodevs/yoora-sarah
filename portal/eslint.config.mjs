import js from "@eslint/js";
import nextPluginModule from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";

const nextPlugin = nextPluginModule.default ?? nextPluginModule;

const config = [
  {
    ignores: [".next/**", ".next-build/**", "next-env.d.ts", "node_modules/**"],
  },
  js.configs.recommended,
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
      ...(nextPlugin.configs.recommended?.rules ?? {}),
      ...(nextPlugin.configs["core-web-vitals"]?.rules ?? {}),
      "no-undef": "off",
    },
  },
];

export default config;
