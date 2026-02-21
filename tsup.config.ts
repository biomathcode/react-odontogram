import { type Options, defineConfig } from "tsup";

const common: Options = {
	entry: ["src/index.ts"],
	treeshake: false,
	sourcemap: "inline",
	minify: true,
	clean: true,
	dts: true,
	splitting: false,
	format: ["cjs", "esm"],
	external: ["react"],
	injectStyle: false,
};

export default defineConfig(common);
