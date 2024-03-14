import { glob } from "glob";
import { extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { builtinModules } from "node:module";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import gzipPlugin from "rollup-plugin-gzip";
import { brotliCompress } from "zlib";
import { promisify } from "util";
import { copyFile, copyIndexFile } from "./plugins/copyFile.js";

const brotliPromise = promisify(brotliCompress);

export default {
  input: Object.fromEntries(
    glob
      .sync(
        [
          "*.ts",
          "api/**/*.ts",
          "db/*.ts",
          "db/**/*.ts",
          "server/**/*.ts",
          "server/*.ts"
        ],
        {
          ignore: ["**/*.d.ts", "**/*.test.ts"]
        }
      )
      .map(file => [
        file.slice(0, file.length - extname(file).length),
        fileURLToPath(new URL(file, import.meta.url))
      ])
  ),
  output: {
    dir: "build",
    format: "esm",
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: "."
  },
  external(id) {
    return id.includes(sep + "node_modules" + sep);
  },
  plugins: [
    // copyIndexFile("index.html", "/build/index.html", true),
    typescript({ moduleResolution: "bundler" }),
    resolve({ preferBuiltins: true }),
    commonjs({ ignoreDynamicRequires: true, ignore: builtinModules }),
    copyFile("robots.txt", "build/robots.txt")
    // gzipPlugin()
  ]
};
