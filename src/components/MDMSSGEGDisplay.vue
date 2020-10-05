<template>
  <Component :is="`s${index}`" v-show="ssgegValue > 0" />
</template>

<script>
import s0 from "../assets/graphics/ssg-eg/SSG-EG_0.svg";
import s1 from "../assets/graphics/ssg-eg/SSG-EG_1.svg";
import s2 from "../assets/graphics/ssg-eg/SSG-EG_2.svg";
import s3 from "../assets/graphics/ssg-eg/SSG-EG_3.svg";
import s4 from "../assets/graphics/ssg-eg/SSG-EG_4.svg";
import s5 from "../assets/graphics/ssg-eg/SSG-EG_5.svg";
import s6 from "../assets/graphics/ssg-eg/SSG-EG_6.svg";
import s7 from "../assets/graphics/ssg-eg/SSG-EG_7.svg";

export default {
  props: {
    operator: {
      type: Number,
      required: true
    }
  },

  components: {
    s0,
    s1,
    s2,
    s3,
    s4,
    s5,
    s6,
    s7
  },

  computed: {
    ssgegValue() {
      return this.$store.state[`channel${this.$store.state.channel}`][
        90 + (this.operator - 1)
      ];
    },

    index() {
      return Math.round((this.ssgegValue / 127) * 9) - 2;
    }
  }
};
</script>

<style scoped>
@media (prefers-color-scheme: dark) {
  svg {
    filter: invert();
  }
}
</style>
