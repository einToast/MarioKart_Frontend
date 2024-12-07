import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
    {rules: {
        // "no-console": "off",
        // "no-unused-vars": "off",
        // "no-undef": "off",
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { "varsIgnorePattern": "^_", "argsIgnorePattern": "^_" }
        ],
        "@typescript-eslint/no-explicit-any": "warn",
      },},
    {ignores: [
        "dist/*",
        "node_modules/*",
        "build/*",
        ".idea/*",
        ".github/*"
        ]
    }

];