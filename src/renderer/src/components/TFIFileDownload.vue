<template>
  <button class="button" @click="generateTFI">Export TFI</button>
</template>

<script>
import { GenMDMParser } from "genmdm-parser/dist/main.js";
import { saveFile } from "../utils/save-file";

export default {
  methods: {
    generateTFI() {
      const channel = this.$store.state[`channel${this.$store.state.channel}`];

      const parser = new GenMDMParser();

      const map = new Map();
      Object.keys(channel).forEach(key => {
        const value = channel[key];
        map.set(parseInt(key, 10), value);
      });

      const instrument = parser.parseGenMDM(map);
      const tfiData = instrument.toTFI();

      saveFile("genmdm-patch.tfi", tfiData);
    }
  }
};
</script>
