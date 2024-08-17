<template>
  <component :is="component" v-show="ssgegValue > 0" />
</template>

<script lang="ts" setup>
import { computed, defineProps } from "vue";
import { useStore } from "@renderer/store";

import s0 from "../assets/graphics/ssg-eg/SSG-EG_0.svg";
import s1 from "../assets/graphics/ssg-eg/SSG-EG_1.svg";
import s2 from "../assets/graphics/ssg-eg/SSG-EG_2.svg";
import s3 from "../assets/graphics/ssg-eg/SSG-EG_3.svg";
import s4 from "../assets/graphics/ssg-eg/SSG-EG_4.svg";
import s5 from "../assets/graphics/ssg-eg/SSG-EG_5.svg";
import s6 from "../assets/graphics/ssg-eg/SSG-EG_6.svg";
import s7 from "../assets/graphics/ssg-eg/SSG-EG_7.svg";

const ssgegValues = [0, 32, 36, 40, 44, 48, 52, 56, 60];
const components = {
  s0,
  s1,
  s2,
  s3,
  s4,
  s5,
  s6,
  s7,
};

const props = defineProps<{
  operator: number;
}>();

const store = useStore();

const ssgegValue = computed(() => {
  const channel = store.state[`channel${store.state.channel}`];
  return channel[90 + (props.operator - 1)];
});

const component = computed(() => {
  const x = ssgegValues.indexOf(ssgegValue.value) - 1;
  return components[`s${x}`];
});
</script>

<style scoped>
@media (prefers-color-scheme: dark) {
  svg {
    filter: invert();
  }
}
</style>
