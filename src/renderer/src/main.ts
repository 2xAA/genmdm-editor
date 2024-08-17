import { createApp } from "vue";
import VueTippy from "vue-tippy";
import App from "./App.vue";
import store, { key } from "./store";

import "./assets/css/raster.css";
import "tippy.js/themes/light.css";
import "./assets/css/genmdm.css";
import "tippy.js/dist/tippy.css";

const app = createApp(App);

app.use(VueTippy);
app.use(store, key);
app.mount("#app");
