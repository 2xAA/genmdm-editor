<template>
  <!-- https://github.com/saintplay/vue-flexible-link/blob/master/src/FlexibleLink.vue -->
  <a :class="customClass" :href="href" :target="target">
    <slot></slot>
  </a>
</template>

<script>
export default {
  name: "FlexibleLink",
  props: {
    native: {
      type: Boolean,
      default: true,
    },
    customClass: {
      type: String,
      default: null,
    },
    href: {
      type: String,
      default: "/",
    },
    target: {
      type: String,
      default: "_self",
    },
  },
  methods: {},
};
</script>
