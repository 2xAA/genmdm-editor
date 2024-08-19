<template>
  <label class="button">
    <input id="input" type="file" accept=".dmp" @change="fileAdded" />
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
      const parser = new GenMDMParser();
      const parsed = parser.parseDMP(data);

      console.log(parsed);

      const ccValues = Object.fromEntries(parsed.toGenMDM());
      ccValues[77] = 127; // deflemask doesn't provide a panning parameter

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
  content: "Import DMP";
}
</style>
