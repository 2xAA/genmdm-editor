<template>
  <button class="button" @click="generateY12">Export Y12</button>
</template>

<script>
import { GenMDMParser } from "genmdm-parser/dist/main.js";
import { saveFile } from "../utils/save-file";

export default {
  methods: {
    generateY12() {
      const channel = this.$store.state[`channel${this.$store.state.channel}`];

      const parser = new GenMDMParser();

      const map = new Map();
      Object.keys(channel).forEach(key => {
        const value = channel[key];
        map.set(parseInt(key, 10), value);
      });

      const instrument = parser.parseGenMDM(map);
      instrument.instrumentName = "genmdm-patch";
      const y12data = instrument.toY12();

      saveFile("genmdm-patch.y12", y12data);
    }
  }
};
</script>
