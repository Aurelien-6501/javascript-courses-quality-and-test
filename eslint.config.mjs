import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
      },
    },
    ignores: [
      "coverage/**",
      "playwright-report/**",
      "node_modules/**",
      "dist/**",
    ],
  },
  {
    files: ["test/jest/*.test.js", "test/playwright/*.spec.js", "coverage/**"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.browser,
      },
    },
  },
  pluginJs.configs.recommended,
];
