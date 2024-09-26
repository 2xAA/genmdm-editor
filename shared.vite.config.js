import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";
import { ViteMinifyPlugin } from "vite-plugin-minify";

export const sharedConfig = {
  renderer: {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ["grid", "c"].includes(tag),
          },
        },
      }),
      svgLoader({
        svgo: false,
      }),
      ViteMinifyPlugin(),
    ],
  },
};
