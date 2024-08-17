<template>
  <label class="button">
    <input id="input" type="file" accept=".dmp" @change="fileAdded" />
  </label>
</template>

<script lang="ts" setup>
import { GenMDMParser } from "genmdm-parser/dist/main.js";
import { useStore } from "@renderer/store";

const store = useStore();

const fileAdded = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const arrayBuffer = reader.result as ArrayBuffer;
    const array = new Uint8Array(arrayBuffer);

    parseDmpDataToMappedCC(array);
    target.value = "";
  };

  try {
    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.error("Can't read file", error);
  }
};

const parseDmpDataToMappedCC = (data: Uint8Array) => {
  const parser = new GenMDMParser();
  const parsed = parser.parseDMP(data);

  console.log(parsed);

  const ccValues = Object.fromEntries(parsed.toGenMDM());
  ccValues[77] = 127; // deflemask doesn't provide a panning parameter

  store.dispatch("setCCValues", {
    values: ccValues,
    ignoreSameValues: false,
    channel: store.state.channel,
  });
};
</script>

<style scoped>
input {
  display: none;
}

label::before {
  content: "Import DMP";
}
</style>
