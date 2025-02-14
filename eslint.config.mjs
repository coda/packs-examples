import ban from "eslint-plugin-ban";
import filenames from "eslint-plugin-filenames";
import local from "eslint-plugin-local";
import preferLet from "eslint-plugin-prefer-let";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends("./tools/eslint/base_rules.js"), {
    plugins: {
        ban,
        filenames,
        local,
        "prefer-let": preferLet,
        "@typescript-eslint": typescriptEslint,
        prettier,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.commonjs,
            ...globals.node,
            ...globals.mocha,
            ...globals.jest,
        },

        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "module",

        parserOptions: {
            project: ["./tsconfig.json"],
        },
    },

    settings: {},

    rules: {
        "@typescript-eslint/restrict-plus-operands": "error",

        "@typescript-eslint/no-unused-vars": ["error", {
            varsIgnorePattern: "_.*|response|datasourceUrl|MySchema",
            argsIgnorePattern: "_.*|context|param",
        }],

        "object-shorthand": ["error", "never"],

        "max-len": ["error", {
            code: 80,
            ignoreUrls: true,
            ignoreRegExpLiterals: true,
            ignoreStrings: true,
            ignorePattern: "^import ",
        }],

        quotes: ["error", "double", {
            avoidEscape: true,
        }],

        "prefer-const": "off",
        "prefer-let/prefer-let": 2,
        "prefer-template": "off",
        "comma-dangle": ["error", "always-multiline"],
        semi: ["error", "always"],
        "prettier/prettier": "error",
    },
}, {
    files: ["**/*_test.{ts,tsx}"],

    rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
    },
}, {
    files: ["**/*.d.ts"],

    rules: {
        "@typescript-eslint/no-unused-vars": "off",
        camelcase: "off",
    },
}, {
    files: ["**/types.ts"],

    rules: {
        camelcase: "off",
    },
}, {
    files: ["examples/template/**/*.ts"],

    rules: {
        "@typescript-eslint/consistent-type-imports": "off",
    },
}];