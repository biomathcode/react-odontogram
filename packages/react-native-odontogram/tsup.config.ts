import { type Options, defineConfig } from "tsup";

const common: Options = {
	entry: ["src/index.tsx"],
	treeshake: false,
	sourcemap: "inline",
	minify: true,
	clean: true,
	dts: true,
	splitting: false,
	format: ["cjs", "esm"],
	external: ["react", "react-native", "react-native-svg"],
	injectStyle: false,
};

export default defineConfig(common);
