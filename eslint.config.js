import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  // START_MODIFICATION
  // Configuration for the service worker file
  {
    files: ["public/sw.js"],
    languageOptions: {
      globals: globals.serviceworker
    }
  },
  // END_MODIFICATION
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      // "no-console": "off",
      // "no-unused-vars": "off",
      // "no-undef": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { "varsIgnorePattern": "^_", "argsIgnorePattern": "^_" }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: [
      "dist/*",
      "node_modules/*",
      "build/*",
      ".idea/*",
      ".github/*"
    ]
  }

];