<template>
  <div>
    Load TFI:
    <input type="file" id="input" accept=".tfi" @change="fileAdded">

    <b>WARNING: this will overwrite your current parameters</b>
  </div>
</template>

<script>
import defaultMapping from '../default-mapping';
import mapToCCRange from '../utils/map-to-cc-range';
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
 *   3, 13, 23, 33 | Detune        | 0 - 7
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

      try {
        reader.readAsArrayBuffer(file);
      } catch (e) {
        console.log("Can't read file", e)
      }
    },

    parseTfiDataToMappedCC(data) {
      const parsed = {
        // algorithm
        14: mapToCCRange(data[0], defaultMapping[14].range - 1),

        // feedback
        15: mapToCCRange(data[1], defaultMapping[15].range - 1)
      };

      for (let i = 0; i < 4; ++i) {
        // Multiple
        parsed[20 + i] =
          mapToCCRange(data[2 + 10 * i], defaultMapping[20].range - 1)
          // data[2 + 10 * i];


        // Detune
        parsed[24 + i] =
          mapToCCRange(data[3 + 10 * i], defaultMapping[24].range - 1)
          // data[3 + 10 * i]


        // Total Level
        parsed[16 + i] =
          mapToCCRange(127 - data[4 + 10 * i], defaultMapping[16].range - 1)
          // 127 - data[4 + 10 * i];

        // Rate Scaling
        parsed[39 + i] =
          mapToCCRange(data[5 + 10 * i], defaultMapping[39].range - 1)
          // data[5 + 10 * i]

        // Attack Rate
        parsed[43 + i] =
          mapToCCRange(data[6 + 10 * i], defaultMapping[43].range - 1)
          // data[6 + 10 * i]

        // First Decay Rate
        parsed[47 + i] =
          mapToCCRange(31 - data[7 + 10 * i], defaultMapping[47].range - 1)
          // 31 - data[7 + 10 * i]

        // Secondary Decay Rate
        parsed[51 + i] =
          mapToCCRange(data[8 + 10 * i], defaultMapping[51].range - 1)
          // data[8 + 10 * i];

        // Release Rate
        parsed[59 + i] =
          mapToCCRange(data[9 + 10 * i], defaultMapping[59].range - 1)
          // data[9 + 10 * i];

        // Secondary Amplitude Level
        parsed[55 + i] =
          mapToCCRange(data[10 + 10 * i], defaultMapping[55].range - 1)
          // data[10 + 10 * i];

        // SSG-EG Operator
        parsed[90 + i] =
          mapToCCRange(data[11 + 10 * i], defaultMapping[90].range - 1)
          // data[11 + 10 * i];

        // if less than 8, set to 0
        // weird line in the tfi spec for this
        // (tfi spec found in the help section of
        // tfm maker)

        if (data[11 + 10 * i] < 8) {
          parsed[90 + i] = 0;
        }
      }

      this.$store.dispatch("setCCValues", parsed);
    }
  }
};
</script>

