<template>
  <label class="button">
    <input type="file" id="input" accept=".ged" @change="fileAdded" />
  </label>
</template>

<script>
import { decompress } from "compress-json";

export default {
  methods: {
    fileAdded(e) {
      const {
        files: { 0: file }
      } = e.target;

      const reader = new FileReader();
      reader.onload = () => {
        const newState = decompress(JSON.parse(reader.result));
        this.$store.commit("SET_STATE", newState);
        e.target.value = "";
      };

      try {
        reader.readAsText(file);
      } catch (e) {
        console.log("Can't read file", e);
      }
    }
  }
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
