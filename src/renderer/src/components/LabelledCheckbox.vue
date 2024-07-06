<template>
  <label>
    {{ currentLabel }}
    <input type="checkbox" @change="onChange" :value="checked" />
  </label>
</template>

<script>
export default {
  props: {
    default: {},

    labels: {
      type: Array,
      default: () => []
    },

    emitBoolean: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      value: 0
    };
  },

  computed: {
    checked() {
      return this.value > 63;
    },

    currentLabel() {
      return this.labels[this.checked ? 1 : 0];
    }
  },

  methods: {
    onChange() {
      if (this.value > 63) {
        this.value = 0;
      } else {
        this.value = 127;
      }
    }
  },

  watch: {
    value(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.$emit("input", this.emitBoolean ? !!this.value : this.value);
      }
    }
  }
};
</script>

<style scoped>
input {
  display: none;
}

label {
  width: 100%;
  height: 100%;
  user-select: none;

  display: flex;
  justify-content: center;
  align-items: center;
}

label:active {
  background: var(--foreground-color);
  color: var(--background-color);
  font-weight: bold;
}
</style>
