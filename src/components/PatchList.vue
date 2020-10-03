<template>
  <grid columns="2">
    <c span="2">
      <select v-model="selectedInstrument">
        <option
          v-for="({ name }, i) in instrumentData"
          :value="i"
          :key="`${i}+${name}`"
          >{{ `${i + 1}`.padStart(3, "0") }}: {{ name }}</option
        >
      </select>
    </c>
    <c>
      <button @click="loadInstrument">Load slot</button>
    </c>
    <c><TFIFileDownload /></c>
  </grid>
</template>

<script>
import TFIFileDownload from "./TFIFileDownload";

export default {
  components: {
    TFIFileDownload
  },

  data() {
    return {
      selectedInstrument: 0
    };
  },

  computed: {
    instrumentData() {
      return this.$store.state.patches;
    }
  },

  methods: {
    loadInstrument() {
      const { data } = this.instrumentData[this.selectedInstrument];
      if (!data) {
        return;
      }

      this.$store.dispatch("setCCValues", data);
    }
  },

  watch: {
    selectedInstrument(value) {
      this.$emit("input", value);
    }
  }
};
</script>

<style></style>
