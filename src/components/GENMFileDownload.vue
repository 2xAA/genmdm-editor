<template>
  <button @click="generateGENM">Export GENM</button>
</template>

<script>
/* GENM format
 * ----------
 * A .GENM file is used to store GenMDM patch files.
 *
 * Each patch file can store up to 128 different instrument settings for an FM channel of a GenMDM interface.
 *
 * A .GENM file is in a standard text format.
 *
 * Each instrument is stored in the following way:
 * [Instrument Index], [Algorithm] [LFO FM] [LFO AM] [FM Feedback] [Panning] [OP1 Level] [OP2 Level] [OP3 Level] [OP4 Level] [OP1 Detune] [OP2 Detune] [OP3 Detune] [OP4 Detune] [OP1 Attack] [OP2 Attack] [OP3 Attack] [OP4 Attack] [OP1 Decay 1] [OP2 Decay 1] [OP3 Decay 1] [OP4 Decay 1] [OP1 Decay 2] [OP2 Decay 2] [OP3 Decay 2] [OP4 Decay 2] [OP1 Mul] [OP2 Mul] [OP3 Mul] [OP4 Mul] [OP1 Rate Scaling] [OP2 Rate Scaling] [OP3 Rate Scaling] [OP4 Rate Scaling] [OP1 Amp2] [OP2 Amp2] [OP3 Amp2] [OP4 Amp2] [OP1 Release] [OP2 Release] [OP3 Release] [OP4 Release] [OP1 LFO Enable] [OP2 LFO Enable] [OP3 LFO Enable] [OP4 LFO Enable] [OP1 SSG Data] [OP2 SSG Data] [OP3 SSG Data] [OP4 SSG Data] [Instrument Name Symbol String];
 *
 * • Instrument index is indexed at 0
 * • Instrument index does not need need to be in order in the file
 * • TL is given as 127 - TL for each level parameter for each operator
 * • LFO enable is 0 for not enabled, 1 for enabled
 * • All other data fields are given as actual register data, not unscaled raw data
 * • Instrument name can be up to 256 characters long
 */
import mapToRange from "../utils/map-to-range";
export default {
  methods: {
    generateGENM() {
      const {
        patches,
        patches: { length: patchesLength }
      } = this.$store.state;

      const genmData = [];

      for (let i = 0; i < patchesLength; i += 1) {
        const { name, data } = patches[i];

        if (!data) {
          continue;
        }

        let patchString = `${i}, `;

        // algorithm
        patchString += `${mapToRange(data[14], 127, 7)} `;
        // lfo fm
        patchString += `${mapToRange(data[75], 127, 7)} `;
        // lfo am
        patchString += `${mapToRange(data[76], 127, 7)} `;
        // fm feedback
        patchString += `${mapToRange(data[15], 127, 7)} `;
        // panning
        patchString += `${mapToRange(data[77], 127, 3)} `;

        for (let j = 0; j < 4; j += 1) {
          // Multiple
          patchString += `${mapToRange(data[20 + j], 127, 15)} `;

          // Detune
          patchString += `${mapToRange(data[24 + j], 127, 7)} `;

          // Total Level
          patchString += `${mapToRange(127 - data[16 + j], 127, 127)} `;

          // Rate Scaling
          patchString += `${mapToRange(data[39 + j], 127, 3)} `;

          // Attack Rate
          patchString += `${mapToRange(data[43 + j], 127, 31)} `;

          // First Decay Rate
          patchString += `${mapToRange(127 - data[47 + j], 127, 31)} `;

          // Secondary Decay Rate
          patchString += `${mapToRange(data[51 + j], 127, 31)} `;

          // Release Rate
          patchString += `${mapToRange(data[59 + j], 127, 15)} `;

          // Secondary Amplitude Level
          patchString += `${mapToRange(data[55 + j], 127, 15)} `;

          // SSG-EG Operator
          patchString += `${mapToRange(data[90 + j], 127, 15)} `;
        }

        patchString += name;
        patchString += ";";
        genmData.push(patchString);
      }

      const genmString = genmData.join("\n");

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
