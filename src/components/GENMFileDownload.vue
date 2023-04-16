<template>
  <button class="button" @click="generateGENM">Save GENM</button>
</template>

<script>
import { GenMDMParser } from "genmdm-parser/dist/main.js";
import { saveFile } from "../utils/save-file";

export default {
  methods: {
    generateGENM() {
      const { patches } = this.$store.state;

      const parser = new GenMDMParser();
      const genMInstruments = [];

      patches.forEach((patch, index) => {
        const { data, name } = patch;
        if (!data) {
          return;
        }

        const map = new Map();
        Object.keys(data).forEach(key => {
          const value = data[key];
          map.set(parseInt(key, 10), value);
        });

        const instrument = parser.parseGenMDM(map);
        instrument.instrumentName = name;
        instrument.instrumentIndex = index;
        genMInstruments.push(instrument.toString());
      });

      const genmString = parser.generateGenm(genMInstruments);

      if (!genmString.length) {
        return;
      }

      saveFile("genmdm-bank.genm", genmString);
    }
  }
};
</script>
