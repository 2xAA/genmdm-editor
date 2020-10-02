<template>
  <img :src="envelope" v-show="ssegValue > 0" />
</template>

<script>
import defaultMapping from "../default-mapping";

export default {
  props: {
    operator: {
      type: Number,
      required: true
    }
  },

  computed: {
    ssegValue() {
      return this.$store.state[`channel${this.$store.state.channel}`][
        90 + (this.operator - 1)
      ];
    },

    envelope() {
      return this.sources[this.ssegValue];
    },

    sources() {
      return defaultMapping[90 + (this.operator - 1)].values.reduce(
        (obj, x, index) => {
          const key = x;
          const value = `/graphics/SSS-EG_${index - 1}.svg`;

          obj[key] = value;
          return obj;
        },
        {}
      );
    }
  }
};
</script>
