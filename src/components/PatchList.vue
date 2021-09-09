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
  </grid>
</template>

<script>
export default {
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
    },

    writeToSlot() {
      this.$store.dispatch("writePatch", {
        index: this.selectedInstrument,
        patch: {
          data: { ...this.$store.state[`channel${this.channel}`] },
          name: "instrument " + this.selectedInstrument
        }
      });
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
