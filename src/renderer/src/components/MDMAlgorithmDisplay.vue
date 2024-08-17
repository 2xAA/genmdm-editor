<template>
  <div class="algorithm">
    <Component :is="currentComponent" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useStore } from "@renderer/store";

import a0 from "../assets/graphics/algorithms/Algorithm_0.svg";
import a1 from "../assets/graphics/algorithms/Algorithm_1.svg";
import a2 from "../assets/graphics/algorithms/Algorithm_2.svg";
import a3 from "../assets/graphics/algorithms/Algorithm_3.svg";
import a4 from "../assets/graphics/algorithms/Algorithm_4.svg";
import a5 from "../assets/graphics/algorithms/Algorithm_5.svg";
import a6 from "../assets/graphics/algorithms/Algorithm_6.svg";
import a7 from "../assets/graphics/algorithms/Algorithm_7.svg";

const store = useStore();

const components = {
  a0,
  a1,
  a2,
  a3,
  a4,
  a5,
  a6,
  a7,
};

const value = computed(() => store.state[`channel${store.state.channel}`][14]);
const index = computed(() => Math.round((value.value / 127) * 7));

const currentComponent = computed(() => components[`a${index.value}`]);
</script>

<style scoped>
.algorithm {
  width: 262px;
  height: 209px;

  border: 1px dashed var(--foreground-color);
  box-sizing: border-box;

  display: flex;
  justify-content: center;
  align-items: center;
}

@media (prefers-color-scheme: dark) {
  svg {
    filter: invert();
  }
}
</style>
