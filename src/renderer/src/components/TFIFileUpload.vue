<template>
  <label class="button">
    <input id="input" type="file" accept=".tfi" @change="fileAdded" />
  </label>
</template>

<script lang="ts" setup>
import { useStore } from "@renderer/store";
import { GenMDMParser } from "genmdm-parser/dist/main.js";

const store = useStore();

const fileAdded = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const arrayBuffer = reader.result as ArrayBuffer;
    const array = new Uint8Array(arrayBuffer);

    parseTfiDataToMappedCC(array);
    input.value = ""; // Clear the file input
  };

  try {
    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.error("Can't read file", error);
  }
};

const parseTfiDataToMappedCC = (data: Uint8Array) => {
  const parser = new GenMDMParser();
  const parsed = parser.parseTfi(data);
  const ccValues = Object.fromEntries(parsed.toGenMDM());

  ccValues[70] = 0;
  ccValues[71] = 0;
  ccValues[72] = 0;
  ccValues[73] = 0;
  ccValues[74] = 0;
  ccValues[75] = 0;
  ccValues[76] = 0;
  ccValues[77] = 127;

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
  content: "Import TFI";
}
</style>
