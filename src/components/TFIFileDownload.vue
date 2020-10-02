<template>
  <button @click="generateTFI">Export TFI</button>
</template>

<script>
import mapToRange from "../utils/map-to-range";
export default {
  methods: {
    generateTFI() {
      const channel = this.$store.state[`channel${this.$store.state.channel}`];

      const tfiData = new Uint8Array(42);

      // algorithm
      tfiData[0] = mapToRange(channel[14], 127, 8);

      // feedback
      tfiData[1] = mapToRange(channel[15], 127, 8);

      for (let i = 0; i < 4; ++i) {
        // Multiple
        tfiData[2 + 10 * i] = mapToRange(channel[20 + i], 127, 16);

        // Detune
        tfiData[3 + 10 * i] = mapToRange(channel[24 + i], 127, 7);

        // Total Level
        tfiData[4 + 10 * i] = mapToRange(127 - channel[16 + i], 127, 127);

        // Rate Scaling
        tfiData[5 + 10 * i] = mapToRange(channel[39 + i], 127, 4);

        // Attack Rate
        tfiData[6 + 10 * i] = mapToRange(channel[43 + i], 127, 32);

        // First Decay Rate
        tfiData[7 + 10 * i] = mapToRange(channel[47 + i], 127, 32);

        // Secondary Decay Rate
        tfiData[8 + 10 * i] = mapToRange(channel[51 + i], 127, 32);

        // Release Rate
        tfiData[9 + 10 * i] = mapToRange(channel[59 + i], 127, 16);

        // Secondary Amplitude Level
        tfiData[10 + 10 * i] = mapToRange(channel[55 + i], 127, 16);

        // SSG-EG Operator
        tfiData[11 + 10 * i] = mapToRange(channel[90 + i], 127, 16);
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

      downloadBlob(tfiData, "genmdm-patch.tfi", "application/octet-stream");

      console.log(tfiData);
    }
  }
};
</script>
