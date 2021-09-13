import Vue from "vue";
import VueTippy, { TippyComponent } from "vue-tippy";
import App from "./App.vue";
import store from "./store";

import "./assets/css/raster.css";
import "tippy.js/themes/light.css";
import "./assets/css/genmdm.css";
import { getColors } from "./utils/get-colors";

Vue.config.productionTip = false;
Vue.config.ignoredElements = ["grid", "c"];

Vue.use(VueTippy);
Vue.component("tippy", TippyComponent);

Object.defineProperty(Vue.prototype, "$colors", {
  get() {
    return getColors();
  }
});

new Vue({
  render: h => h(App),
  store
}).$mount("#app");
