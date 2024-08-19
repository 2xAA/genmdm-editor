import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { sharedConfig } from "./shared.vite.config";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
      },
    },
    plugins: [
      ...sharedConfig.renderer.plugins,
      nodePolyfills({
        include: ["events"],
      }),
    ],
    define: {
      "process.env.ELECTRON_BUILD": true,
    },
  },
});
