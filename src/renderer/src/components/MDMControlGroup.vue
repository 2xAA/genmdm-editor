<template>
  <grid columns="8" class="control-group" :class="{ disabled }">
    <slot name="header"></slot>
    <template v-for="cc in ccValues" :key="`label-${cc}`">
      <c
        v-tippy="{ followCursor: true }"
        span="6"
        class="control-group__label"
        :content="controls[cc].description"
        >{{ controls[cc].label }}</c
      >
      <c span="2" class="control-group__control">
        <MDMControl :cc="cc" :channel="channel" />
      </c>
    </template>
    <slot name="footer"></slot>
  </grid>
</template>

<script lang="ts" setup>
import { computed, defineProps } from "vue";
import { useStore } from "@renderer/store";
import MDMControl from "./MDMControl.vue";

const props = defineProps<{
  channel: number;
  disabled?: boolean;
  ccValues?: number[];
}>();

const store = useStore();

const controls = computed(() => {
  const ccs = props.ccValues ?? [];
  const controls: Record<number, any> = {};

  ccs.forEach((cc) => {
    controls[cc] = store.getters.mapping[cc];
  });

  return controls;
});
</script>

<style>
.control-group {
  border: 1px solid var(--foreground-color);
  border-bottom: 0;
}

.control-group__label {
  border-right: 1px solid var(--foreground-color);
  display: flex;
  align-items: center;
  height: 30px;
}

.control-group__label,
.control-group__control {
  border-bottom: 1px solid var(--foreground-color);
}

.control-group__control {
  overflow: hidden;
}

.control-group.disabled,
.control-group.disabled .control-group__label,
.control-group.disabled .control-group__control {
  border-color: light-dark(rgb(128, 128, 128), rgb(170, 170, 170));
}
</style>
