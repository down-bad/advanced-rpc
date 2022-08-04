import copy from "rollup-plugin-copy";
import versionInjector from "rollup-plugin-version-injector";
import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import dotenv from "dotenv";

dotenv.config();

const DEV = process.env.NODE_ENV !== "production";
const OUTPUT_DIR =
  DEV && process.env.OUTPUT_DIR ? process.env.OUTPUT_DIR : "dist";

export default {
  input: ["src/index.js", "src/index.frontend.js"],
  output: {
    dir: OUTPUT_DIR,
    format: "cjs",
  },
  external: ["path", "fs", "electron"],
  plugins: [
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
      ],
    }),
    json(),
    versionInjector(),
  ],
};
