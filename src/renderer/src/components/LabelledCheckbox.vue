<template>
  <label>
    {{ currentLabel }}
    <input type="checkbox" :value="checked" @change="onChange" />
  </label>
</template>

<script>
export default {
  props: {
    default: {},

    labels: {
      type: Array,
      default: () => [],
    },

    emitBoolean: {
      type: Boolean,
      default: false,
    },

    modelValue: {},
  },

  emits: ["update:modelValue"],

  computed: {
    checked() {
      return this.modelValue > 63;
    },

    currentLabel() {
      return this.labels[this.modelValue ? 1 : 0];
    },
  },

  watch: {
    value(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.$emit(
          "update:modelValue",
          this.emitBoolean ? !!this.modelValue : this.modelValue,
        );
      }
    },
  },

  methods: {
    onChange() {
      if (this.value > 63) {
        this.value = 0;
      } else {
        this.value = 127;
      }
    },
  },
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
