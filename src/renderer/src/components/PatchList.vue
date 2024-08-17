<template>
  <grid columns="2">
    <c span="2">
      <label class="select" @pointerdown="openSelect">
        <input
          v-model="instrumentName"
          class="instrument-name-input"
          type="text"
        />
        <select ref="select" v-model="instrumentIndex">
          <option
            v-for="({ name }, i) in patches"
            :key="`${i}+${name}`"
            :value="i"
          >
            {{ `${i + 1}`.padStart(3, "0") }}: {{ name }}
          </option>
        </select>
        <DropdownArrow />
        <div class="blocker"></div>
      </label>
    </c>
  </grid>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from "vue";
import { useStore } from "@renderer/store";
import DropdownArrow from "../assets/graphics/select-dropdown.svg";

const store = useStore();

const select = ref<HTMLSelectElement | null>(null);

// Computed properties
const patches = computed(() => store.state.patches);

const instrumentIndex = computed({
  get: () => store.state.instrumentIndex,
  set: (value: number) => store.dispatch("setInstrumentIndex", value),
});

const instrumentName = computed({
  get: () => patches.value[instrumentIndex.value].name,
  set: (value: string) => {
    store.dispatch("setPatchName", {
      index: instrumentIndex.value,
      name: value,
    });
  },
});

// Methods
const openSelect = () => {
  nextTick(() => {
    if (select.value) {
      select.value.click();
    }
  });
};
</script>

<style scoped>
input[type="text"].instrument-name-input {
  background-color: var(--background-color);
  position: absolute;
  height: 28px;
  left: 26px;
  top: 1px;
  width: 99px;
  border: none;
}

.blocker {
  position: absolute;
  height: 30px;
  width: 28px;
}
</style>
