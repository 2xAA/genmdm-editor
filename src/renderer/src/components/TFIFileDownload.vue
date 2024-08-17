<template>
  <button class="button" @click="generateTFI">Export TFI</button>
</template>

<script lang="ts" setup>
import { useStore } from "@renderer/store";
import { GenMDMParser } from "genmdm-parser/dist/main.js";
import { saveFile } from "../utils/save-file";

const store = useStore();

const generateTFI = () => {
  const channel = store.state[`channel${store.state.channel}`];

  const parser = new GenMDMParser();

  const map = new Map<number, number>();
  Object.keys(channel).forEach((key) => {
    const value = channel[key];
    map.set(parseInt(key, 10), value);
  });

  const instrument = parser.parseGenMDM(map);
  const tfiData = instrument.toTFI();

  saveFile("genmdm-patch.tfi", tfiData);
};
</script>
