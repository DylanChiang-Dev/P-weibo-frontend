import js from "@eslint/js"
import tsPlugin from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import jsxA11yPlugin from "eslint-plugin-jsx-a11y"
import astroPlugin from "eslint-plugin-astro"

export default [
    // Ignore patterns
    {
        ignores: ["node_modules/**", "dist/**", ".astro/**", "**/*.min.js"],
    },

    // JavaScript/TypeScript files
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
            globals: {
                browser: true,
                es2021: true,
                node: true,
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
            "jsx-a11y": jsxA11yPlugin,
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            ...tsPlugin.configs.recommended.rules,
            ...reactPlugin.configs.recommended.rules,
            ...reactHooksPlugin.configs.recommended.rules,
            ...jsxA11yPlugin.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "warn",
            "react/prop-types": "off",
        },
    },

    // Astro files
    {
        files: ["**/*.astro"],
        ...astroPlugin.configs.recommended,
    },
]
