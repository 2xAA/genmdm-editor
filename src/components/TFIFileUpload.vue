<template>
  <div>
    Load TFI:
    <input type="file" id="input" accept=".tfi" @change="fileAdded">
    
    <b>WARNING: this will overwrite your current parameters</b>
  </div>
</template>

<script>
import defaultMapping from "../default-mapping.js";
import mapToCCRange from "../utils/map-to-cc-range.js";

/* TFI format
 * ----------
 * Thank goodness for https://plutiedev.com/format-tfi
 * as this isn't documented anywhere else!
 *
 *
 *  Index          | Description   | Range
 * ----------------|---------------|---------
 *   0             | Algorithm     | 0 - 7
 *   1             | Feedback      | 0 - 7
 *   2, 12, 22, 32 | Multiplier    | 0 - 15
 *   3, 13, 23, 33 | Detune        | 0 - 6
 *   4, 14, 24, 34 | Total Level   | 0 - 127
 *   5, 15, 25, 35 | Rate Scaling  | 0 - 3
 *   6, 16, 26, 36 | Attack Rate   | 0 - 31
 *   7, 17, 27, 37 | Decay Rate 1  | 0 - 31
 *   8, 18, 28, 38 | Decay Rate 2  | 0 - 31
 *   9, 19, 29, 39 | Release Rate  | 0 - 15
 *  10, 20, 30, 40 | Sustain Level | 0 - 15
 *  11, 21, 31, 41 | SSG-EG        | 0 - 15
 *
 */
export default {
  methods: {
    fileAdded(e) {
      const {
        files: { 0: file }
      } = e.target;

      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const array = new Uint8Array(arrayBuffer);

        this.parseTfiDataToMappedCC(array);
      };
      reader.readAsArrayBuffer(file);
    },

    parseTfiDataToMappedCC(data) {
      const parsed = {
        // algorithm
        14: mapToCCRange(data[0], defaultMapping[14].range),

        // feedback
        15: mapToCCRange(data[1], defaultMapping[15].range)
      };

      for (let i = 0; i < 4; ++i) {
        // Multiple
        parsed[20 + i] = mapToCCRange(
          data[2 + 10 * i],
          defaultMapping[20].range
        );

        // Detune
        parsed[24 + i] = mapToCCRange(
          data[3 + 10 * i],
          defaultMapping[24].range
        );

        // Total Level
        parsed[16 + i] =
          127 - mapToCCRange(data[4 + 10 * i], defaultMapping[16].range);

        // Rate Scaling
        parsed[39 + i] = mapToCCRange(
          data[5 + 10 * i],
          defaultMapping[39].range
        );

        // Attack Rate
        parsed[43 + i] = mapToCCRange(
          data[6 + 10 * i],
          defaultMapping[43].range
        );

        // First Decay Rate
        parsed[47 + i] = mapToCCRange(
          data[7 + 10 * i],
          defaultMapping[47].range
        );

        // Secondary Decay Rate
        parsed[51 + i] = mapToCCRange(
          data[8 + 10 * i],
          defaultMapping[51].range
        );

        // Release Rate
        parsed[59 + i] = mapToCCRange(
          data[9 + 10 * i],
          defaultMapping[59].range
        );

        // Secondary Amplitude Level
        parsed[55 + i] =
          127 - mapToCCRange(data[10 + 10 * i], defaultMapping[55].range);

        // SSG-EG Operator
        parsed[90 + i] = mapToCCRange(
          data[11 + 10 * i],
          defaultMapping[90].range
        );
      }

      // this.$emit("loaded-data", parsed);
      this.$store.dispatch("setCCValues", parsed);
    }
  }
};
</script>

