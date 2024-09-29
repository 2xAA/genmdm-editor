<template>
  <VDialog :size="[840, height]" :show="show" @close="$emit('close')">
    <grid columns="6">
      <c span="6"><h2>Voice Configuration</h2></c>
      <c v-for="channel in 6" :key="channel" span="1">
        <VoiceConfig :channel="channel" />
      </c>
    </grid>
  </VDialog>
</template>

<script>
import VDialog from "./Dialog.vue";
import VoiceConfig from "./VoiceConfig.vue";

export default {
  components: {
    VDialog,
    VoiceConfig,
  },

  props: ["show"],

  emits: ["close"],

  data() {
    return {};
  },

  computed: {
    height() {
      return this.$store.state.mdmiCompatibility ? 580 : 300;
    },
  },
};
</script>

<style scoped>
grid {
  grid-column-gap: 1em;
}

.reset-state-dialog-text {
  color: var(--foreground-color);
  grid-gap: 25px;
}
</style>
