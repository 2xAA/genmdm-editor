<template>
  <label :class="{ disabled }" :title="title">
    {{ currentLabel }}
    <input
      type="checkbox"
      :value="checked"
      :disabled="disabled"
      @change="onChange"
    />
  </label>
</template>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: () => false,
    },

    modelValue: {
      type: undefined,
    },

    labels: {
      type: Array,
      default: () => [],
    },

    emitBoolean: {
      type: Boolean,
      default: false,
    },

    title: {
      type: String,
      default: "",
    },
  },

  emits: ["update:modelValue"],

  data() {
    return {
      value: 0,
    };
  },

  computed: {
    checked() {
      return this.value > 63;
    },

    currentLabel() {
      return this.labels[this.checked ? 1 : 0];
    },
  },

  watch: {
    value(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.$emit(
          "update:modelValue",
          this.emitBoolean ? !!this.value : this.value,
        );
      }
    },

    modelValue(newValue, oldValue) {
      if (newValue !== oldValue) {
        if (this.emitBoolean) {
          this.value = !newValue ? 0 : 127;
        } else {
          this.value = newValue;
        }
      }
    },
  },

  created() {
    if (this.emitBoolean) {
      this.value = !this.modelValue ? 0 : 127;
    } else {
      this.value = this.modelValue;
    }
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

label:active:not(.disabled) {
  background: var(--foreground-color);
  color: var(--background-color);
  font-weight: bold;
}

label.disabled {
  text-decoration: line-through;
  cursor: not-allowed;
  color: light-dark(rgb(128, 128, 128), rgb(170, 170, 170));
}
</style>
