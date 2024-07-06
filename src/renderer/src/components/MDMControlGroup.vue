<template>
  <grid columns="8" class="control-group">
    <slot name="header"></slot>
    <template v-for="cc in ccValues" :key="`label-${cc}`">
      <c
        v-tippy="{ followCursor: true }"
        span="6"
        class="control-group__label"
        :content="controls[cc].description"
        >{{ controls[cc].label }}</c
      >
      <c span="2" class="control-group__control">
        <MDMControl :cc="cc" />
      </c>
    </template>
    <slot name="footer"></slot>
  </grid>
</template>

<script>
import genmdmMapping from "../genmdm-mapping.js";
import MDMControl from "./MDMControl.vue";

export default {
  components: {
    MDMControl,
  },
  props: {
    ccValues: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    controls() {
      const controls = {};

      this.ccValues.forEach((cc) => {
        controls[cc] = genmdmMapping[cc];
      });

      return controls;
    },
  },
};
</script>

<style>
.control-group {
  border: 1px solid var(--foreground-color);
  border-bottom: 0;
}

.control-group__label {
  border-right: 1px solid var(--foreground-color);
  display: flex;
  align-items: center;
  height: 30px;
}

.control-group__label,
.control-group__control {
  border-bottom: 1px solid var(--foreground-color);
}

.control-group__control {
  overflow: hidden;
}
</style>
