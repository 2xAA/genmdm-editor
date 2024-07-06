<template>
  <Arrow />
</template>

<script>
import Arrow from "../assets/graphics/arrow.svg";

export default {
  components: {
    Arrow
  }
};
</script>

<style scoped>
svg {
  margin-top: 2.5em;
}

svg path {
  fill: var(--foreground-color);
}
</style>
