<template>
  <div>
    <h2>Global Settings</h2>
    <MDMControlGroup :cc-values="ccValues" :channel="channel" />
  </div>
</template>

<script>
import MDMControlGroup from "./MDMControlGroup.vue";

export default {
  components: {
    MDMControlGroup,
  },

  computed: {
    channel() {
      return this.$store.state.channel;
    },

    ccValues() {
      const values = [/*84,*/ /*83,*/ 74, 1, /*85,*/ /*81,*/ 80];

      if (!this.$store.state.mdmiCompatibility) {
        values.splice(0, 0, 84);
        values.splice(1, 0, 83);
        values.splice(4, 0, 85);
        values.splice(5, 0, 81);
      }

      return values;
    },
  },
};
</script>
