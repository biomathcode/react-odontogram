import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		setupFiles: "./tests/setup.ts",
		passWithNoTests: true,
		coverage: {
			include: ["{src,tests}/**/*"],
		},
	},
});
