<template>
  <button class="button" @click="generateY12">Export Y12</button>
</template>

<script>
import { GenMDMParser } from "genmdm-parser/dist/main.js";

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

      downloadBlob(y12data, "genmdm-patch.y12", "application/octet-stream");

      console.log(y12data);
    }
  }
};
</script>
