export default {
  created() {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", this.draw);

    document.body.addEventListener("theme-change", this.draw);
  },

  beforeDestroy() {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .removeEventListener("change", this.draw);

    document.body.removeEventListener("theme-change", this.draw);
  },
};
