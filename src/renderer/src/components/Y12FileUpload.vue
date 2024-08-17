<template>
  <label class="button">
    <input id="input" type="file" accept=".y12" @change="fileAdded" />
  </label>
</template>

<script lang="ts" setup>
import { GenMDMParser } from "genmdm-parser/dist/main.js";
import { useStore } from "@renderer/store";

const store = useStore();

function fileAdded(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const arrayBuffer = reader.result as ArrayBuffer;
    const array = new Uint8Array(arrayBuffer);

    parseY12DataToMappedCC(array);
    target.value = "";
  };

  try {
    reader.readAsArrayBuffer(file);
  } catch (err) {
    console.error("Can't read file", err);
  }
}

function parseY12DataToMappedCC(data: Uint8Array) {
  const parser = new GenMDMParser();
  const parsed = parser.parseY12(data);

  console.log(parsed);

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
}
</script>

<style scoped>
input {
  display: none;
}

label::before {
  content: "Import Y12";
}
</style>
