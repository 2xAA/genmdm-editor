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

<script lang="ts" setup>
import { computed, defineEmits, defineProps } from "vue";
import { useStore } from "@renderer/store";
import VDialog from "./Dialog.vue";
import VoiceConfig from "./VoiceConfig.vue";

defineEmits(["close"]);

defineProps<{
  show: boolean;
}>();

const store = useStore();

const height = computed(() => (store.state.mdmiCompatibility ? 480 : 200));
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
