import { createApp } from "vue";
import VueTippy from "vue-tippy";
import App from "./App.vue";
import store from "./store";

import "./assets/css/raster.css";
import "tippy.js/themes/light.css";
import "./assets/css/genmdm.css";
import "tippy.js/dist/tippy.css";

import { getColors } from "./utils/get-colors";

const app = createApp(App);

Object.defineProperty(app.config.globalProperties, "$colors", {
  get() {
    return getColors();
  },
});

app.use(VueTippy);
app.use(store);
app.mount("#app");
