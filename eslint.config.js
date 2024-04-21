import globals from 'globals';
import tseslint from 'typescript-eslint';

import path from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';

import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import typescriptParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: pluginJs.configs.recommended
});

export default [
	{
		ignores: [
			'**/.svelte-kit/**/*',
			'**/node_modules/**/*',
			'**/build/**/*',
			'svelte.config.js',
			'vite.config.js',
			'eslint.config.js'
		]
	},
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		}
	},
	...compat.extends('standard-with-typescript'),
	...compat.extends('plugin:sonarjs/recommended'),
	...compat.extends('plugin:unicorn/recommended'),
	...compat.extends('plugin:prettier/recommended'),
	...tseslint.configs.recommended,
	// temporary fix for flat config issue
	{
		rules: {
			'sonarjs/no-gratuitous-expressions': 'off',
			'sonarjs/no-empty-collection': 'off',
			'sonarjs/no-unused-collection': 'off',
			'security/detect-child-process': 'off',
			'sonarjs/no-use-of-empty-return-value': 'off',
			'sonarjs/no-extra-arguments': 'off',
			'sonarjs/no-redundant-jump': 'off',
			'sonarjs/no-one-iteration-loop': 'off',
			'unicorn/no-null': 'off',
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: typescriptParser,
				project: './tsconfig.eslint.json',
				extraFileExtensions: ['.svelte']
			}
		},
		plugins: {
			svelte: sveltePlugin,
			'@typescript-eslint': tseslint.plugin,
			prettier: prettierPlugin
		}
	},
	{
		files: ['**/*.ts'],
		plugins: {
			prettier: prettierPlugin
		}
	}
];
