import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		exclude: ['node_modules', 'dist'],
		environment: 'node',

		include: ['./tests/*.test.ts'],

		watch: true,
	},
});
