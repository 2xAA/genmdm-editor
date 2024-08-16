<template>
  <div>
    <h2>DAC Control</h2>
    <MDMControlGroup
      v-if="!mdmiCompatibility"
      :cc-values="[78, 86, 88, 79, 89]"
      :channel="channel"
    />
    <MDMWaveform />
  </div>
</template>

<script>
import MDMControlGroup from "./MDMControlGroup.vue";
import MDMWaveform from "./MDMWaveform.vue";

export default {
  components: {
    MDMControlGroup,
    MDMWaveform,
  },

  computed: {
    channel() {
      return this.$store.state.channel;
    },

    mdmiCompatibility() {
      return this.$store.state.mdmiCompatibility;
    },
  },
};
</script>
