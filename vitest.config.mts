import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"react-native-svg": fileURLToPath(
				new URL("./tests/mocks/react-native-svg.tsx", import.meta.url),
			),
		},
	},
	test: {
		environment: "jsdom",
		setupFiles: fileURLToPath(new URL("./tests/setup.ts", import.meta.url)),
		passWithNoTests: true,
		coverage: {
			include: ["{src,tests,packages/react-native-odontogram}/**/*"],
		},
	},
});
