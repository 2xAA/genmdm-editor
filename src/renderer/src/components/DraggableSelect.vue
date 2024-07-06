<template>
  <div
    ref="draggableSelectBody"
    class="draggable-select ns-resize-cursor"
    :class="{ active: mouseButtonDown }"
    @pointerdown="requestPointerLock"
    @pointerup="exitPointerLock"
    @contextmenu.prevent
  >
    <select
      ref="labelSelect"
      v-model="selectValue"
      class="select"
      @touchstart.prevent
      @touchmove.prevent
      @touchend.prevent
      @touchcancel.prevent
    >
      <option
        v-for="[key, selectValue_value] in selectValues"
        :key="key"
        :value="key"
      >
        {{ selectValue_value }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
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
  },
  emits: ["update:modelValue"],

  data() {
    return {
      internalValue: 0,
      lastCursor: "",
      mouseButtonDown: false,
      lastPointerPosition: { x: 0, y: 0 },
      editable: false,
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
          : Math.round((this.modelValue / 127) * (this.values.length - 1));
        return value;
      },

      set(key) {
        this.setAndEmitValue(this.values.indexOf(key));
      },
    },
  },

  watch: {
    value(value) {
      if (!this.mouseButtonDown) {
        this.internalValue = Math.round(
          (value / 127) * (this.values.length - 1),
        );
      }
    },
  },

  created() {
    this.internalValue = Math.max(
      0,
      Math.min(this.values.length - 1, this.default),
    );
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

    setAndEmitValue(index) {
      const clampedNewMIDIValue = Math.floor(
        (index / (this.values.length - 1)) * 127,
      );

      this.internalValue = index;

      this.$emit(
        "update:modelValue",
        this.emitArrayValue ? this.values[index] : clampedNewMIDIValue,
      );
    },

    toggleEditable() {
      this.editable = !this.editable;

      if (this.editable && this.labels.length) {
        this.$nextTick(() => {
          console.log(this.$refs.labelSelect);
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

.draggable-select.active {
  background: var(--foreground-color);
  color: var(--background-color);
  font-weight: bold;
}
</style>
