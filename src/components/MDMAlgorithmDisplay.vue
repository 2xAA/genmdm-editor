<template>
  <img :src="`/graphics/Algorithm_${algorithm}.svg`">
</template>

<script>
export default {
  computed: {
    algorithm() {
      return this.$store.state[`channel${this.$store.state.channel}`][14];
    }
  }
}
</script>
