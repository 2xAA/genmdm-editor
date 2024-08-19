<template>
  <label class="button">
    <input id="input" type="file" accept=".tfi" @change="fileAdded" />
  </label>
</template>

<script>
import { GenMDMParser } from "genmdm-parser/dist/main.js";

export default {
  methods: {
    fileAdded(e) {
      const {
        files: { 0: file },
      } = e.target;

      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const array = new Uint8Array(arrayBuffer);

        this.parseTfiDataToMappedCC(array);
        e.target.value = "";
      };

      try {
        reader.readAsArrayBuffer(file);
      } catch (e) {
        console.log("Can't read file", e);
      }
    },

    parseTfiDataToMappedCC(data) {
      const parser = new GenMDMParser();
      const parsed = parser.parseTfi(data);
      const ccValues = Object.fromEntries(parsed.toGenMDM());

      ccValues[70] = 0;
      ccValues[71] = 0;
      ccValues[72] = 0;
      ccValues[73] = 0;
      ccValues[74] = 0;
      ccValues[75] = 0;
      ccValues[76] = 0;
      ccValues[77] = 127;

      this.$store.dispatch("setCCValues", {
        values: ccValues,
        ignoreSameValues: false,
        channel: this.$store.state.channel,
      });
    },
  },
};
</script>

<style scoped>
input {
  display: none;
}

label::before {
  content: "Import TFI";
}
</style>
