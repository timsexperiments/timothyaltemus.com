import { sync as globSync } from "glob";
import { RollupOptions } from "rollup";
import esbuild from "rollup-plugin-esbuild";

export type PackageConfigOptions = {
  /** The input folder for all of the files to bundle. */
  src?: string;
  extensions?: string[];
  outDir?: string;
  esmOut?: string;
  esmExt?: string;
  cjsOut?: string;
  cjsExt?: string;
};

export function packageConfig({
  src: dir = "src",
  extensions = ["ts", "js"],
  outDir = "dist",
  esmOut = "esm",
  esmExt = "js",
  cjsOut = "cjs",
  cjsExt = "js",
}: PackageConfigOptions = {}): RollupOptions[] {
  const files = globSync(`${dir}/**/*.{${extensions.join(",")}}`);
  return [
    {
      input: files,
      output: {
        preserveModules: true,
        compact: true,
        format: "cjs",
        dir: `${outDir}/${cjsOut}`,
        entryFileNames: `[name].${cjsExt}`
      },
      plugins: [esbuild()],
    },
    {
      input: files,
      output: {
        preserveModules: true,
        compact: true,
        format: "esm",
        dir: `${outDir}/${esmOut}`,
        entryFileNames: `[name].${esmExt}`
      },
      plugins: [esbuild()],
    },
  ];
}
