<template><div></div></template>

<script>
export default {
  computed: {
    theme() {
      return this.$store.state.theme;
    },

    backgroundImage() {
      return this.$store.state.backgroundImage;
    },

    rotation() {
      return this.$store.state.rotation;
    },
  },

  watch: {
    theme() {
      this.applyClass();
    },

    backgroundImage() {
      this.applyClass();
    },

    rotation() {
      this.applyClass();
    },
  },

  mounted() {
    this.applyClass();
  },

  methods: {
    applyClass() {
      const { body } = document;

      body.classList.remove(
        "theme-light",
        "theme-dark",
        "no-rotation",
        "no-background",
      );
      body.classList.add(`theme-${this.theme}`);

      const themeChangeEvent = new CustomEvent("theme-change");
      body.dispatchEvent(themeChangeEvent);

      body.classList.add(!this.backgroundImage && "no-background");
      body.classList.add(!this.rotation && "no-rotation");
    },
  },
};
</script>
