<template>
  <button class="button" @click="saveState">Save State</button>
</template>

<script lang="ts" setup>
import { compress } from "compress-json";
import { saveFile } from "../utils/save-file";
import { useStore } from "@renderer/store";

const store = useStore();

const saveState = () => {
  const stateCopy: any = { ...store.state };
  delete stateCopy.midiInputId;
  delete stateCopy.midiOutputId;

  const compressed = compress(stateCopy);
  saveFile("state.ged", JSON.stringify(compressed));
};
</script>
