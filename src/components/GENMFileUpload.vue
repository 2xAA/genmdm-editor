<template>
  <label>
    <input type="file" id="input" accept=".genm" @change="fileAdded" />
  </label>
</template>

<script>
import { GenMDMParser } from "genmdm-parser/dist/main.js";

export default {
  methods: {
    fileAdded(e) {
      const {
        files: { 0: file }
      } = e.target;

      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;

        this.parseGenmData(text);
      };
      reader.readAsText(file);
    },

    parseGenmData(text) {
      const parser = new GenMDMParser();
      const parsed = parser.parseGenm(text);
      const instrumentData = [];

      parsed
        .map(instrument => Object.fromEntries(instrument.toGenMDM()))
        .forEach((ccData, index) => {
          instrumentData.push({
            name: parsed[index].instrumentName,
            data: ccData
          });
        });

      this.$store.dispatch("setPatches", instrumentData);
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

  content: "Load GENM";
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
