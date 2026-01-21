import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import solidPlugin from 'eslint-plugin-solid';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Window & Document
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        // Timers
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        requestIdleCallback: 'readonly',
        cancelIdleCallback: 'readonly',
        queueMicrotask: 'readonly',
        // Network & Workers
        fetch: 'readonly',
        WebSocket: 'readonly',
        Worker: 'readonly',
        // Storage & IndexedDB
        localStorage: 'readonly',
        indexedDB: 'readonly',
        IDBDatabase: 'readonly',
        IDBOpenDBRequest: 'readonly',
        IDBTransactionMode: 'readonly',
        IDBObjectStore: 'readonly',
        // Crypto
        crypto: 'readonly',
        // Binary & URL
        SharedArrayBuffer: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        Image: 'readonly',
        // DOM Elements
        HTMLDivElement: 'readonly',
        // Events
        Event: 'readonly',
        MouseEvent: 'readonly',
        DragEvent: 'readonly',
        KeyboardEvent: 'readonly',
        ClipboardEvent: 'readonly',
        MessageEvent: 'readonly',
        ErrorEvent: 'readonly',
        CloseEvent: 'readonly',
        // Audio
        AudioContext: 'readonly',
        AudioBuffer: 'readonly',
        OscillatorType: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      solid: solidPlugin,
      import: importPlugin,
    },
    rules: {
      // TypeScript rules
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // SolidJS rules
      ...solidPlugin.configs.recommended.rules,

      // Import rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
  },
];
