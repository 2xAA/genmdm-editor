<template>
  <label class="button">
    <input id="input" type="file" accept=".ged" @change="fileAdded" />
  </label>
</template>

<script>
import { decompress } from "compress-json";
import { createDefaultChannelState } from "../store";

export default {
  methods: {
    fileAdded(e) {
      const {
        files: { 0: file },
      } = e.target;

      const reader = new FileReader();
      reader.onload = () => {
        const newState = decompress(JSON.parse(reader.result));

        const defaultChannelState = createDefaultChannelState();

        // To account for old state saves.
        // Not a problem with GenMDM, but new MDMI features somtimes require
        // new CC values.
        for (let i = 0; i < 6; i += 1) {
          newState[`channel${i + 1}`] = {
            ...defaultChannelState[`channel${i + 1}`],
            ...newState[`channel${i + 1}`],
          };
        }

        this.$store.commit("SET_STATE", newState);
        e.target.value = "";
      };

      try {
        reader.readAsText(file);
      } catch (e) {
        console.log("Can't read file", e);
      }
    },
  },
};
</script>

<style scoped>
input {
  display: none;
}

label::before {
  content: "Load State";
}
</style>
