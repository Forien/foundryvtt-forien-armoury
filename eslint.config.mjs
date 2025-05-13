// noinspection ES6PreferShortImport

import babelParser      from "@babel/eslint-parser";
import js               from "@eslint/js";
import stylisticJs      from "@stylistic/eslint-plugin-js";
import globals          from "globals";
import {foundryGlobals} from "./utils/_globals.mjs";

export default [
  js.configs.recommended,
  {
    plugins: {
      "@stylistic/js": stylisticJs,
    },

    languageOptions: {
      globals: {
        ...foundryGlobals,
        ...globals.browser,
        ...globals.node,
        ...globals.jquery,
      },

      parser: babelParser,
      ecmaVersion: 2018,
      sourceType: "module",

      parserOptions: {
        requireConfigFile: false,
      },
    },

    rules: {
      "array-bracket-newline": ["error", "consistent"],
      "array-bracket-spacing": ["error", "never"],
      "array-element-newline": ["error", "consistent"],

      "arrow-parens": ["error", "as-needed"],
      "arrow-spacing": ["error", {before: true, after: true}],

      "block-spacing": ["error", "always"],
      "brace-style": ["error", "1tbs", {allowSingleLine: true}],

      "comma-dangle": ["warn", "only-multiline"],
      "comma-spacing": ["error", {before: false, after: true}],
      "comma-style": ["error", "last"],

      "computed-property-spacing": ["error", "never"],

      "dot-location": ["error", "property"],

      "eol-last": ["error", "always"],

      "func-call-spacing": ["error", "never"],
      "function-call-argument-newline": ["error", "consistent"],
      "function-paren-newline": ["warn", "consistent"],

      "generator-star-spacing": ["error", {before: false, after: true}],

      "implicit-arrow-linebreak": ["error", "beside"],

      indent: [
        "error", 2, {
          SwitchCase: 1,
          MemberExpression: "off",
          CallExpression: {arguments: "first"},
          ObjectExpression: "first",
          ImportDeclaration: "first",
          FunctionDeclaration: {parameters: "first"},
          FunctionExpression: {parameters: "first"},
        },
      ],

      "jsx-quotes": ["warn", "prefer-double"],

      "key-spacing": ["error", {beforeColon: false, afterColon: true}],

      "keyword-spacing": ["error", {before: true, after: true}],

      "line-comment-position": ["off"],
      "linebreak-style": ["off", "unix"],
      "lines-between-class-members": ["error", "always"],

      "max-len": ["warn", 120, 2, {ignoreComments: false, ignoreStrings: true, ignoreTemplateLiterals: true}],
      "max-statements-per-line": ["error", {max: 1}],

      "multiline-comment-style": ["off", "starred-block"],
      "multiline-ternary": ["warn", "always-multiline"],

      "new-parens": ["error", "always"],

      "newline-per-chained-call": ["error", {ignoreChainWithDepth: 2}],

      "no-case-declarations": ["off"],
      "no-confusing-arrow": ["error", {allowParens: true}],
      "no-empty": ["error", {allowEmptyCatch: true}],
      "no-extra-parens": [
        "warn", "all", {
          nestedBinaryExpressions: false,
          enforceForArrowConditionals: false,
          ternaryOperandBinaryExpressions: false,
        },
      ],
      "no-extra-semi": ["error"],
      "no-floating-decimal": ["off"],
      "no-mixed-operators": ["off"],
      "no-mixed-spaces-and-tabs": ["error"],
      // for whatever reason doesn't work with imports
      "no-multi-spaces": ["off", {exceptions: {Property: true, ImportAttribute: true}}],
      "no-multiple-empty-lines": ["error", {max: 2, maxEOF: 1}],
      "no-tabs": ["error"],
      "no-trailing-spaces": ["warn"],
      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          destructuredArrayIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-whitespace-before-property": ["error"],

      "nonblock-statement-body-position": [
        "error",
        "below",
        {overrides: {if: "any", else: "any"}},
      ],

      "object-curly-newline": ["error", {consistent: true}],
      "object-curly-spacing": ["error", "never"],
      "object-property-newline": ["error", {allowAllPropertiesOnSameLine: true}],

      "one-var-declaration-per-line": ["off"],

      "operator-linebreak": ["error", "before", {overrides: {"=": "after"}}],

      "padded-blocks": ["warn", "never"],

      "padding-line-between-statements": [
        "warn",
        {blankLine: "always", prev: "*", next: "return"},
        {blankLine: "never", prev: "*", next: ["case", "break", "continue", "default"]},
        {blankLine: "never", prev: ["case", "break", "continue", "default"], next: "*"},
      ],

      "quote-props": ["error", "as-needed"],
      quotes: [
        "warn", "double", {
          avoidEscape: true,
          allowTemplateLiterals: false,
        },
      ],

      "rest-spread-spacing": ["error", "never"],

      semi: ["error", "always"],
      "semi-spacing": ["error", {before: false, after: true}],
      "semi-style": ["error", "last"],

      "space-before-blocks": ["error", "always"],
      "space-before-function-paren": ["error", {anonymous: "never", named: "never", asyncArrow: "always"}],
      "space-in-parens": ["error", "never"],
      "space-infix-ops": ["error", {int32Hint: false}],
      "space-unary-ops": ["error", {words: true, nonwords: false}],

      "spaced-comment": ["warn", "always", {markers: ["/"]}],

      "switch-colon-spacing": ["error", {after: true, before: false}],

      "template-curly-spacing": ["error", "never"],
      "template-tag-spacing": ["error", "never"],

      "wrap-iife": ["off"],
      "wrap-regex": ["off"],

      "yield-star-spacing": ["error", "after"],
    },
  },
];
