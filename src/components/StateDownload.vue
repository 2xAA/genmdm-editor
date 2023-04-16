<template>
  <button class="button" @click="saveState">Save State</button>
</template>

<script>
import { compress } from "compress-json";
import { saveFile } from "../utils/save-file";

export default {
  methods: {
    saveState() {
      const compressed = compress(this.$store.state);
      saveFile("state.ged", JSON.stringify(compressed));
    }
  }
};
</script>
