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

<script lang="ts" setup>
import { computed } from "vue";
import { useStore } from "@renderer/store";
import MDMControlGroup from "./MDMControlGroup.vue";
import MDMWaveform from "./MDMWaveform.vue";

const store = useStore();

const channel = computed(() => store.state.channel);
const mdmiCompatibility = computed(() => store.state.mdmiCompatibility);
</script>
