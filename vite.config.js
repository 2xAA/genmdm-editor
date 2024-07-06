import { defineConfig } from "vite";
import { sharedConfig } from "./shared.vite.config";

export default defineConfig({
  root: "./src/renderer",
  build: {
    outDir: "../../out/renderer",
  },
  plugins: [...sharedConfig.renderer.plugins],
  define: {
    "process.env.ELECTRON_BUILD": false,
  },
});
