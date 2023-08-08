import { defineConfig } from "rollup";
import copy from "rollup-plugin-copy";
import versionInjector from "rollup-plugin-version-injector";
import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import dotenv from "dotenv";
import watch from "rollup-plugin-watch";

dotenv.config();

const DEV = process.env.NODE_ENV !== "production";
const OUTPUT_DIR =
  DEV && process.env.OUTPUT_DIR ? process.env.OUTPUT_DIR : "dist";

export default defineConfig([
  {
    input: ["src/index.js"],
    output: {
      dir: OUTPUT_DIR,
      format: "cjs",
      exports: "auto",
    },
    external: ["path", "fs", "electron"],
    plugins: [
      watch({ dir: "src" }),
      commonjs(),
      babel({ babelHelpers: "bundled" }),
      nodeResolve({
        "jsnext:main": true,
      }),
      copy({
        targets: [
          { src: "package.json", dest: OUTPUT_DIR },
          { src: "README.md", dest: OUTPUT_DIR },
          { src: "src/advancedrpc.less", dest: OUTPUT_DIR },
          { src: "src/colors.less", dest: OUTPUT_DIR },
          { src: "src/fonts", dest: OUTPUT_DIR },
        ],
      }),
      json(),
      versionInjector(),
    ],
  },
  {
    output: {
      dir: OUTPUT_DIR,
      format: "iife",
      exports: "auto",
      name: "AdvancedRPC",
      esModule: false,
    },
    input: "src/index.frontend.js",
    plugins: [
      watch({ dir: "src" }),
      commonjs(),
      babel({ babelHelpers: "bundled" }),
      nodeResolve({
        "jsnext:main": true,
      }),
      json(),
      versionInjector({
        injectInTags: {
          dateFormat: "longDate",
        },
      }),
    ],
  },
]);
