<template>
  <grid columns="8" class="control-group">
    <slot name="header"></slot>
    <template v-for="cc in ccValues">
      <c
        span="6"
        class="control-group__label"
        :key="`label-${cc}`"
        :content="controls[cc].description"
        v-tippy="{ followCursor: true }"
        >{{ controls[cc].label }}</c
      >
      <c span="2" class="control-group__control" :key="`control-${cc}`">
        <MDMControl :cc="cc" />
      </c>
    </template>
    <slot name="footer"></slot>
  </grid>
</template>

<script>
import genmdmMapping from "../genmdm-mapping.js";
import MDMControl from "./MDMControl";

export default {
  props: {
    ccValues: {
      type: Array,
      default: () => []
    }
  },

  components: {
    MDMControl
  },

  computed: {
    controls() {
      const controls = {};

      this.ccValues.forEach(cc => {
        controls[cc] = genmdmMapping[cc];
      });

      return controls;
    }
  }
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
</style>
