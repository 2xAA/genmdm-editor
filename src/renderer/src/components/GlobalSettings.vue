<template>
  <div>
    <h2>Global Settings</h2>
    <MDMControlGroup :cc-values="ccValues" :channel="channel" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useStore } from "@renderer/store";
import MDMControlGroup from "./MDMControlGroup.vue";

const store = useStore();

const channel = computed(() => store.state.channel);

const ccValues = computed(() => {
  const values = [/*84,*/ /*83,*/ 74, 1, /*85,*/ /*81,*/ 80];

  if (!store.state.mdmiCompatibility) {
    values.splice(0, 0, 84);
    values.splice(1, 0, 83);
    values.splice(4, 0, 85);
    values.splice(5, 0, 81);
  }

  return values;
});
</script>
