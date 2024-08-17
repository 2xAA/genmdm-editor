<template>
  <label class="button">
    <input id="input" type="file" accept=".ged" @change="fileAdded" />
  </label>
</template>

<script lang="ts" setup>
import { decompress } from "compress-json";
import {
  createDefaultChannelState,
  GenMDMEditorState,
  useStore,
} from "@renderer/store";

const fileAdded = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    if (!reader.result) return;

    const result =
      typeof reader.result === "string"
        ? reader.result
        : Buffer.from(reader.result).toString();

    const newState: GenMDMEditorState = decompress(JSON.parse(result));

    const defaultChannelState = createDefaultChannelState();

    // To account for old state saves.
    for (let i = 0; i < 6; i += 1) {
      newState[`channel${i + 1}`] = {
        ...defaultChannelState[`channel${i + 1}`],
        ...newState[`channel${i + 1}`],
      };
    }

    const store = useStore();
    store.commit("SET_STATE", newState);

    target.value = "";
  };

  try {
    reader.readAsText(file);
  } catch (e) {
    console.log("Can't read file", e);
  }
};
</script>

<style scoped>
input {
  display: none;
}

label::before {
  content: "Load State";
}
</style>
