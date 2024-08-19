<template>
  <grid columns="2">
    <c span="2">
      <label class="select" @pointerdown="openSelect">
        <input
          v-model="instrumentName"
          class="instrument-name-input"
          type="text"
        />
        <select ref="select" v-model="instrumentIndex">
          <option
            v-for="({ name }, i) in patches"
            :key="`${i}+${name}`"
            :value="i"
          >
            {{ `${i + 1}`.padStart(3, "0") }}: {{ name }}
          </option>
        </select>
        <DropdownArrow />
        <div class="blocker"></div>
      </label>
    </c>
  </grid>
</template>

<script>
import DropdownArrow from "../assets/graphics/select-dropdown.svg";

export default {
  components: {
    DropdownArrow,
  },

  data() {
    return {
      selectStyles: {
        pointerEvents: "none",
      },
    };
  },

  computed: {
    patches() {
      return this.$store.state.patches;
    },

    instrumentName: {
      get() {
        return this.patches[this.instrumentIndex].name;
      },

      set(value) {
        this.$store.dispatch("setPatchName", {
          index: this.instrumentIndex,
          name: value,
        });
      },
    },

    instrumentIndex: {
      get() {
        return this.$store.state.instrumentIndex;
      },

      set(value) {
        this.$store.dispatch("setInstrumentIndex", value);
      },
    },
  },

  methods: {
    openSelect() {
      this.selectStyles.pointerEvents = "auto";
      this.$nextTick(() => {
        this.$refs.select.click();
      });
    },

    closeSelect() {
      this.selectStyles.pointerEvents = "none";
    },
  },
};
</script>

<style scoped>
input[type="text"].instrument-name-input {
  background-color: var(--background-color);
  position: absolute;
  height: 28px;
  left: 28px;
  top: 1px;
  width: 99px;
  border: none;
}

.blocker {
  position: absolute;
  height: 30px;
  width: 28px;
}
</style>
