<template>
  <button class="button" @click="generateGENM">Save GENM</button>
</template>

<script>
import { GenMDMParser } from "genmdm-parser/dist/main.js";

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

      var downloadBlob, downloadURL;

      downloadBlob = function(data, fileName, mimeType) {
        var blob, url;
        blob = new Blob([data], {
          type: mimeType
        });
        url = window.URL.createObjectURL(blob);
        downloadURL(url, fileName);
        setTimeout(function() {
          return window.URL.revokeObjectURL(url);
        }, 1000);
      };

      downloadURL = function(data, fileName) {
        var a;
        a = document.createElement("a");
        a.href = data;
        a.download = fileName;
        document.body.appendChild(a);
        a.style = "display: none";
        a.click();
        a.remove();
      };

      downloadBlob(genmString, "genmdm-bank.genm", "application/octet-stream");

      console.log(genmString);
    }
  }
};
</script>
