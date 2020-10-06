<template>
  <button @click="generateDMP">Export DMP</button>
</template>

<script>
import defaultMapping from "../default-mapping";
import mapToRange from "../utils/map-to-range";
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
    getUnscaledValue(cc) {
      const channel = this.$store.state[`channel${this.$store.state.channel}`];
      return mapToRange(channel[cc], 127, defaultMapping[cc].range - 1);
    },

    generateDMP() {
      const { getUnscaledValue } = this;
      const dmpData = new Uint8Array(32);

      // file version
      dmpData[0x00] = 0x0b;

      // system
      dmpData[0x01] = 0x02;

      // system
      dmpData[0x02] = 0x01;

      // fm lfo
      dmpData[0x03] = getUnscaledValue(75);

      // feedback
      dmpData[0x04] = getUnscaledValue(15);

      // algorithm
      dmpData[0x05] = getUnscaledValue(14);

      // am lfo
      dmpData[0x06] = getUnscaledValue(76);

      for (let i = 0; i < 4; ++i) {
        // Multiple
        dmpData[0x07 + 11 * i] = getUnscaledValue(20 + i);

        // Total Level
        dmpData[0x08 + 11 * i] = 127 - getUnscaledValue(16 + i);

        // Attack Rate
        dmpData[0x09 + 11 * i] = getUnscaledValue(43 + i);

        // First Decay Rate
        dmpData[0x0a + 11 * i] = getUnscaledValue(47 + i);

        // Secondary Amplitude Level
        dmpData[0x0b + 11 * i] = getUnscaledValue(55 + i);

        // Release Rate
        dmpData[0x0c + 11 * i] = getUnscaledValue(59 + i);

        // AM
        dmpData[0x0d + 11 * i] = getUnscaledValue(70 + i);

        // Rate Scaling
        dmpData[0x0e + 11 * i] = getUnscaledValue(39 + i);

        // Detune
        dmpData[0x0f + 11 * i] = getUnscaledValue(24 + i);

        // Secondary Decay Rate
        dmpData[0x10 + 11 * i] = getUnscaledValue(51 + i);

        // SSG-EG Operator
        dmpData[0x11 + 11 * i] = getUnscaledValue(90 + i);
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

      downloadBlob(dmpData, "genmdm-patch.dmp", "application/octet-stream");

      console.log(dmpData);
    }
  }
};
</script>
