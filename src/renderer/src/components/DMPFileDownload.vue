<template>
  <button class="button" @click="generateDMP">Export DMP</button>
</template>

<script lang="ts" setup>
import { GenMDMParser } from "genmdm-parser/dist/main.js";
import { useStore } from "@renderer/store";
import { saveFile } from "../utils/save-file";

const store = useStore();

const generateDMP = () => {
  const channel = store.state[`channel${store.state.channel}`];

  const parser = new GenMDMParser();

  const map = new Map();
  Object.keys(channel).forEach((key) => {
    const value = channel[key];
    map.set(parseInt(key, 10), value);
  });

  const instrument = parser.parseGenMDM(map);
  const dmpData = instrument.toDMP();

  saveFile("genmdm-patch.dmp", dmpData);
};
</script>
