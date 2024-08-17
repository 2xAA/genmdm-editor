<template>
  <label class="button">
    <input id="input" type="file" accept=".genm" @change="fileAdded" />
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
    const text = reader.result as string;
    parseGenmData(text);
  };
  reader.readAsText(file);
};

const parseGenmData = (text: string) => {
  const parser = new GenMDMParser();
  const parsed = parser.parseGenm(text);
  const instrumentData: { name: string; data: Record<number, any> }[] = [];

  parsed
    .map((instrument) => Object.fromEntries(instrument.toGenMDM()))
    .forEach((ccData, index) => {
      instrumentData.push({
        name: parsed[index].instrumentName,
        data: ccData || {},
      });
    });

  store.dispatch("setPatches", instrumentData);
};
</script>

<style scoped>
input {
  display: none;
}

label::before {
  content: "Load GENM";
}
</style>
