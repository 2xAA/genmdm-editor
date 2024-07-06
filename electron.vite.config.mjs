import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { sharedConfig } from "./shared.vite.config";

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
    plugins: [...sharedConfig.renderer.plugins],
    define: {
      "process.env.ELECTRON_BUILD": true,
    },
  },
});
