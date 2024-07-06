<template>
  <div class="algorithm">
    <Component :is="`a${index}`" />
  </div>
</template>

<script>
import a0 from "../assets/graphics/algorithms/Algorithm_0.svg";
import a1 from "../assets/graphics/algorithms/Algorithm_1.svg";
import a2 from "../assets/graphics/algorithms/Algorithm_2.svg";
import a3 from "../assets/graphics/algorithms/Algorithm_3.svg";
import a4 from "../assets/graphics/algorithms/Algorithm_4.svg";
import a5 from "../assets/graphics/algorithms/Algorithm_5.svg";
import a6 from "../assets/graphics/algorithms/Algorithm_6.svg";
import a7 from "../assets/graphics/algorithms/Algorithm_7.svg";

export default {
  components: {
    a0,
    a1,
    a2,
    a3,
    a4,
    a5,
    a6,
    a7
  },

  computed: {
    value() {
      return this.$store.state[`channel${this.$store.state.channel}`][14];
    },

    index() {
      return Math.round((this.value / 127) * 7);
    }
  }
};
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

@media (prefers-color-scheme: dark) {
  svg {
    filter: invert();
  }
}
</style>
