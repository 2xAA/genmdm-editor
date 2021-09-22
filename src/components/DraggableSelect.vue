<template>
  <div
    class="draggable-select ns-resize-cursor"
    ref="draggableSelectBody"
    @mousedown="requestPointerLock"
    @mouseup="exitPointerLock"
  >
    <template v-if="labels.length">
      {{ currentLabel }}
    </template>

    <template v-else>
      {{ currentIndex }}
    </template>
  </div>
</template>

<script>
export default {
  props: {
    values: {
      type: Array,
      required: true
    },

    default: {},

    labels: {
      type: Array,
      default: () => []
    },

    value: {
      type: Number,
      required: true
    },

    emitArrayValue: {
      type: Boolean
    }
  },

  data() {
    return {
      internalValue: 0,
      lastCursor: "",
      mouseButtonDown: false
    };
  },

  created() {
    this.internalValue = Math.max(
      0,
      Math.min(this.values.length - 1, this.default)
    );
  },

  computed: {
    currentIndex() {
      return this.values[this.internalValue];
    },

    currentLabel() {
      return this.labels[this.internalValue];
    }
  },

  methods: {
    requestPointerLock() {
      const {
        $refs: { draggableSelectBody }
      } = this;

      document.addEventListener(
        "pointerlockchange",
        this.lockChangeAlert,
        false
      );
      draggableSelectBody.requestPointerLock();
      this.mouseButtonDown = true;
    },

    exitPointerLock() {
      document.exitPointerLock();
      document.removeEventListener(
        "pointerlockchange",
        this.lockChangeAlert,
        false
      );
      this.mouseButtonDown = false;
    },

    lockChangeAlert() {
      const {
        $refs: { draggableSelectBody }
      } = this;

      if (document.pointerLockElement === draggableSelectBody) {
        document.addEventListener("mousemove", this.mouseMove, false);
        document.addEventListener("mouseup", this.mouseUp);
      } else {
        document.removeEventListener("mousemove", this.mouseMove, false);
        this.mouseUp();
      }
    },

    mouseUp() {
      document.removeEventListener("mousemove", this.mouseMove, false);
      document.removeEventListener("mouseup", this.mouseUp);
      document.body.style.cursor =
        this.lastCursor === "ew-resize" ? "default" : this.lastCursor;
    },

    mouseMove(e) {
      const { internalValue, values } = this;
      const newValue = -e.movementY + internalValue;
      const clampedNewIndex = Math.floor(
        Math.max(0, Math.min(values.length - 1, newValue))
      );
      const clampedNewMIDIValue = Math.floor(
        (clampedNewIndex / (values.length - 1)) * 127
      );

      this.internalValue = clampedNewIndex;
      this.$emit(
        "input",
        this.emitArrayValue ? values[clampedNewIndex] : clampedNewMIDIValue
      );
    }
  },

  watch: {
    value(value) {
      if (!this.mouseButtonDown) {
        this.internalValue = Math.round(
          (value / 127) * (this.values.length - 1)
        );
      }
    }
  }
};
</script>

<style>
.draggable-select {
  width: 100%;
  height: 100%;
  user-select: none;

  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
