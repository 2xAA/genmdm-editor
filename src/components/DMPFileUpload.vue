<template>
  <label>
    <input type="file" id="input" accept=".dmp" @change="fileAdded" />
  </label>
</template>

<script>
import defaultMapping from "../default-mapping";
import mapToCCRange from "../utils/map-to-cc-range";
/* DMP format
 * 0x00 1 Byte:  FILE_VERSION, must be 11 (0x0B) for DefleMask v0.12.0
 * 0x01 1 Byte:  System:
 *               SYSTEM_GENESIS  0x02
 * 0x02 1 Byte:  Instrument Mode (1=FM, 0=STANDARD)
 *
 * // IF INSTRUMENT MODE IS FM ( = 1)
 * 0x03 1 Byte: LFO (FMS on YM2612, PMS on YM2151)
 * 0x04 1 Byte: FB
 * 0x05 1 Byte: ALG
 * 0x06 1 Byte: LFO2 (AMS on YM2612, AMS on YM2151)
 *
 *        Repeat this TOTAL_OPERATORS times
 * 0x07 + n  1 Byte: MULT
 * 0x08 + n  1 Byte: TL
 * 0x09 + n  1 Byte: AR
 * 0x0A + n  1 Byte: DR
 * 0x0B + n  1 Byte: SL
 * 0x0C + n  1 Byte: RR
 * 0x0D + n  1 Byte: AM
 * 0x0E + n  1 Byte: RS
 * 0x0F + n  1 Byte: DT (DT2<<4 | DT on YM2151)
 * 0x10 + n  1 Byte: D2R
 * 0x11 + n  1 Byte: SSGEG_Enabled <<3 | SSGEG
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

        this.parseDmpDataToMappedCC(array);
        e.target.value = "";
      };

      try {
        reader.readAsArrayBuffer(file);
      } catch (e) {
        console.log("Can't read file", e);
      }
    },

    parseDmpDataToMappedCC(data) {
      if (data[0x00] !== 11) {
        throw new Error(`DMP version error. Expecting 11 got ${data[0x00]}`);
      }

      if (data[0x01] !== 2) {
        throw new Error(`DMP system type error. Expecting 2 got ${data[0x01]}`);
      }

      if (data[0x02] !== 1) {
        throw new Error(
          `DMP instrument mode error. Expecting 1 got ${data[0x02]}`
        );
      }

      const parsed = {
        // LFO FM
        75: mapToCCRange(data[0x03], defaultMapping[75].range - 1),

        // feedback
        15: mapToCCRange(data[0x04], defaultMapping[15].range - 1),

        // algorithm
        14: mapToCCRange(data[0x05], defaultMapping[14].range - 1),

        // LFO AM
        76: mapToCCRange(data[0x06], defaultMapping[76].range - 1)
      };

      for (let i = 0; i < 4; ++i) {
        // Multiple
        parsed[20 + i] = mapToCCRange(
          data[0x07 + 11 * i],
          defaultMapping[20].range
        );

        // Total Level
        parsed[16 + i] = mapToCCRange(
          127 - data[0x08 + 11 * i],
          defaultMapping[16].range - 1
        );

        // Attack Rate
        parsed[43 + i] = mapToCCRange(
          data[0x09 + 11 * i],
          defaultMapping[43].range - 1
        );

        // First Decay Rate
        parsed[47 + i] = mapToCCRange(
          data[0x0a + 11 * i],
          defaultMapping[47].range - 1
        );

        // Secondary Amplitude Level (Sustain Level)
        parsed[55 + i] = mapToCCRange(
          data[0x0b + 11 * i],
          defaultMapping[55].range - 1
        );

        // Release Rate
        parsed[59 + i] = mapToCCRange(
          data[0x0c + 11 * i],
          defaultMapping[59].range - 1
        );

        // AM
        parsed[70 + i] = mapToCCRange(
          data[0x0d + 11 * i],
          defaultMapping[70].range
        );

        // Rate Scaling
        parsed[39 + i] = mapToCCRange(
          data[0x0e + 11 * i],
          defaultMapping[39].range - 1
        );

        // Detune
        parsed[24 + i] = mapToCCRange(
          data[0x0f + 11 * i],
          defaultMapping[24].range
        );

        // Secondary Decay Rate
        parsed[51 + i] = mapToCCRange(
          data[0x10 + 11 * i],
          defaultMapping[51].range - 1
        );

        // SSG-EG Operator
        parsed[90 + i] = mapToCCRange(
          data[0x11 + 11 * i],
          defaultMapping[90].range
        );

        // // if less than 8, set to 0
        // // weird line in the tfi spec for this
        // // (tfi spec found in the help section of
        // // tfm maker)

        // if (data[11 + 11 * i] < 8) {
        //   parsed[90 + i] = 0;
        // }
      }

      parsed[75] = mapToCCRange(
        defaultMapping[75].default,
        defaultMapping[75].range - 1
      );
      parsed[76] = mapToCCRange(
        defaultMapping[76].default,
        defaultMapping[76].range - 1
      );
      parsed[77] = mapToCCRange(
        defaultMapping[77].default,
        defaultMapping[77].range - 1
      );

      this.$store.dispatch("setCCValues", parsed);
    }
  }
};
</script>

<style scoped>
input {
  display: none;
}

label::before {
  appearance: button;
  padding: 1px 6px;

  content: "Import DMP";
  display: inline-block;
  border: 1px solid var(--foreground-color);
  color: var(--foreground-color);

  outline: none;
  white-space: nowrap;
  -webkit-user-select: none;
  font-size: 10pt;
  text-transform: uppercase;

  display: inline-block;
  text-align: center;
  width: -webkit-fill-available;
}
</style>
