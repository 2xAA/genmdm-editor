<template>
  <button class="button" @click="saveState">Save State</button>
</template>

<script>
import { compress } from "compress-json";
import { saveFile } from "../utils/save-file";

export default {
  methods: {
    saveState() {
      const stateCopy = { ...this.$store.state };
      delete stateCopy.midiInputId;
      delete stateCopy.midiOutputId;

      const compressed = compress(stateCopy);
      saveFile("state.ged", JSON.stringify(compressed));
    },
  },
};
</script>
