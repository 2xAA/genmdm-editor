<template>
  <div
    ref="draggableSelectBody"
    class="draggable-select ns-resize-cursor"
    :class="{ active: mouseButtonDown, disabled }"
    @pointerdown="requestPointerLock"
    @pointerup="exitPointerLock"
    @contextmenu.prevent
  >
    <select
      class="select"
      ref="labelSelect"
      v-model="selectValue"
      class="select"
      :disabled="disabled"
      @touchstart.prevent
      @touchmove.prevent
      @touchend.prevent
      @touchcancel.prevent
    >
      <option
        v-for="[key, selectValue_value] in selectValues"
        :key="key"
        :value="key"
        :disabled="disabledItems.length && disabledItems[key + 1]"
      >
        {{ selectValue_value }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: () => false,
    },

    disabledItems: {
      type: Array,
      required: false,
      default: () => [],
    },

    values: {
      type: Array,
      required: true,
    },

    default: {},

    labels: {
      type: Array,
      default: () => [],
    },

    modelValue: {
      type: undefined,
      required: true,
    },

    emitArrayValue: {
      type: Boolean,
    },

    whatIs: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],

  data() {
    return {
      internalValue: -1,
      lastCursor: "",
      mouseButtonDown: false,
      lastPointerPosition: { x: 0, y: 0 },
      editable: false,
      lastTimeVibrate: 50,
    };
  },

  computed: {
    currentIndex() {
      return this.values[this.internalValue];
    },

    currentLabel() {
      return this.labels[this.internalValue];
    },

    selectValues() {
      const values = (this.labels.length ? this.labels : this.values).map(
        (item, index) => [
          this.values[index],
          this.labels.length ? item : this.values[index],
        ],
      );

      return values;
    },

    selectValue: {
      get() {
        const value = this.emitArrayValue
          ? this.modelValue
          : Math.floor(this.modelValue / (128 / this.values.length));
        return value;
      },

      set(key) {
        this.setAndEmitValue(this.values.indexOf(key));
      },
    },
  },

  watch: {
    modelValue(value) {
      if (!this.mouseButtonDown) {
        this.internalValue = this.emitArrayValue
          ? this.values[value]
          : Math.floor(value / (128 / this.values.length));
      }
    },
  },

  created() {
    this.internalValue = this.emitArrayValue
      ? this.modelValue
      : Math.floor(this.modelValue / (128 / this.values.length));
  },

  methods: {
    requestPointerLock(e) {
      if (
        (e.pointerType === "mouse" && e.button === 2) ||
        e.pointerType !== "mouse"
      ) {
        const {
          $refs: { draggableSelectBody },
        } = this;

        document.addEventListener(
          "pointerlockchange",
          this.lockChangeAlert,
          false,
        );

        if (draggableSelectBody.requestPointerLock) {
          draggableSelectBody.requestPointerLock();
        } else {
          // Only used for browsers without the Pointer Lock API, such as the WebMIDI Browser for iOS
          e.preventDefault();
          document.addEventListener("pointermove", this.mouseMove, false);
          document.addEventListener("pointerup", this.mouseUp);
        }

        this.lastPointerPosition.x = e.clientX;
        this.lastPointerPosition.y = e.clientY;
        this.mouseButtonDown = true;
      }
    },

    exitPointerLock() {
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }

      document.removeEventListener(
        "pointerlockchange",
        this.lockChangeAlert,
        false,
      );
      this.mouseButtonDown = false;
    },

    lockChangeAlert() {
      const {
        $refs: { draggableSelectBody },
      } = this;

      if (document.pointerLockElement === draggableSelectBody) {
        document.addEventListener("pointermove", this.mouseMove, false);
        document.addEventListener("pointerup", this.mouseUp);
      } else {
        document.removeEventListener("pointermove", this.mouseMove, false);
        this.mouseUp();
      }
    },

    mouseUp() {
      document.removeEventListener("pointermove", this.mouseMove, false);
      document.removeEventListener("pointerup", this.mouseUp);
      document.body.style.cursor =
        this.lastCursor === "ew-resize" ? "default" : this.lastCursor;
    },

    mouseMove(e) {
      const yDelta = e.movementY || -this.lastPointerPosition.y + e.clientY;

      const { internalValue, values } = this;
      const newValue = -yDelta + internalValue;
      const clampedNewIndex = Math.floor(
        Math.max(0, Math.min(values.length - 1, newValue)),
      );

      this.setAndEmitValue(clampedNewIndex);

      this.lastPointerPosition.x = e.clientX;
      this.lastPointerPosition.y = e.clientY;
    },

    setAndEmitValue(value) {
      const clampedNewMIDIValue = Math.floor(
        (value / (this.values.length - 1)) * 127,
      );

      if (this.internalValue !== value && !this.disabledItems[value]) {
        this.internalValue = value;
        this.lastTimeVibrate = Date.now();
        this.$electron.vibrate();

        const emitValue = this.emitArrayValue
          ? this.values[value]
          : clampedNewMIDIValue;
        this.$emit("update:modelValue", emitValue);
      }
    },

    toggleEditable() {
      this.editable = !this.editable;

      if (this.editable && this.labels.length) {
        this.$nextTick(() => {
          this.$refs.labelSelect.open();
        });
      }
    },
  },
};
</script>

<style scoped>
.draggable-select {
  height: 100%;
  overflow: hidden;
}

.draggable-select.active:not(.disabled) {
  background: var(--foreground-color);
  color: var(--background-color);
  font-weight: bold;
}

.draggable-select.disabled select {
  cursor: not-allowed;
  text-decoration: line-through;
  color: light-dark(rgb(128, 128, 128), rgb(170, 170, 170));
}
</style>
