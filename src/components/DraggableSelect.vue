<template>
  <div
    class="draggable-select ns-resize-cursor"
    ref="draggableSelectBody"
    @pointerdown="requestPointerLock"
    @pointerup="exitPointerLock"
    @touchstart.prevent
    @touchmove.prevent
    @touchend.prevent
    @touchcancel.prevent
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
      mouseButtonDown: false,
      lastPointerPosition: { x: 0, y: 0 }
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
    requestPointerLock(e) {
      const {
        $refs: { draggableSelectBody }
      } = this;

      document.addEventListener(
        "pointerlockchange",
        this.lockChangeAlert,
        false
      );

      if (draggableSelectBody.requestPointerLock) {
        draggableSelectBody.requestPointerLock();
      } else {
        // Only used for browsers without the Pointer Lock API, such as the WebMIDI Browser for iOS
        e.preventDefault();
        document.addEventListener("pointermove", this.mouseMove, false);
        document.addEventListener("pointerup", this.mouseUp);
      }

      this.mouseButtonDown = true;
    },

    exitPointerLock() {
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }

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
      // first touch
      // I feel I've overengineered this somewhat
      let firstTouch = false;
      if (this.lastPointerPosition.x < 0) {
        firstTouch = true;
        this.lastPointerPosition.x = e.clientX;
        this.lastPointerPosition.y = e.clientY;
      }

      const yDelta = e.movementY || -this.lastPointerPosition.y + e.clientY;

      this.lastPointerPosition.x = e.clientX;
      this.lastPointerPosition.y = e.clientY;

      const { internalValue, values } = this;
      const newValue =
        (firstTouch && yDelta !== 0 ? 0 : -yDelta) + internalValue;
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
