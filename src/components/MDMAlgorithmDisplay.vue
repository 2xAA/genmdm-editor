<template>
  <div class="algorithm">
    <img :src="algorithm">
  </div>
</template>

<script>
import mapToCCRange from '../utils/map-to-cc-range';

export default {
  computed: {
    value() {
      return this.$store.state[`channel${this.$store.state.channel}`][14]
    },

    algorithm() {
      return this.sources[this.value];
    },

    sources() {
      return [...Array(8).keys()].reduce((obj, x, index) => {
        const key = mapToCCRange(index, 7);
        const value = `/graphics/Algorithm_${index}.svg`;

        obj[key] = value;
        return obj;
      }, {});
    }
  }
}
</script>

<style scoped>
.algorithm {
  width: 262px;
  height: 209px;

  border: 1px dashed var(--foreground-color);
  box-sizing: border-box;

  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
