export default {
  created() {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", this.draw);
  },

  beforeDestroy() {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .removeEventListener("change", this.draw);
  },
};
