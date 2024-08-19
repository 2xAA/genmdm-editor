<template>
  <button class="button" @click="generateDMP">Export DMP</button>
</template>

<script>
import { GenMDMParser } from "genmdm-parser/dist/main.js";
import { saveFile } from "../utils/save-file";

export default {
  methods: {
    generateDMP() {
      const channel = this.$store.state[`channel${this.$store.state.channel}`];

      const parser = new GenMDMParser();

      const map = new Map();
      Object.keys(channel).forEach(key => {
        const value = channel[key];
        map.set(parseInt(key, 10), value);
      });

      const instrument = parser.parseGenMDM(map);
      const dmpData = instrument.toDMP();

      saveFile("genmdm-patch.dmp", dmpData);
    }
  }
};
</script>
