<template>
  <div class="dial" :class="{ disabled }">
    <canvas
      ref="canvas"
      :title="title"
      class="ns-resize-cursor"
      :class="{ disabled }"
      @pointerdown="requestPointerLock"
      @pointerup="exitPointerLock"
      @touchstart.prevent
      @touchmove.prevent
      @touchend.prevent
      @touchcancel.prevent
    ></canvas>
    {{ scaledValue }}
  </div>
</template>

<script>
import { HighResCanvasRenderingContext2D } from "@vcync/hires-canvas2d";
import redrawOnColorschemeChange from "./mixins/redraw-on-colorscheme-change";

export default {
  mixins: [redrawOnColorschemeChange],

  props: {
    cc: {
      type: Number,
      required: true,
    },

    ccOffset: {
      type: Number,
      default: 0,
    },

    channel: {
      type: Number,
      required: true,
    },

    size: {
      type: Number,
      default: 60,
    },

    quantise: {
      type: Number,
      default: -1,
    },

    inverse: {
      type: Boolean,
      default: false,
    },

    range: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      default: "",
    },

    disabled: {
      type: Boolean,
      default: () => false,
    },
  },

  data() {
    return {
      context: null,
      movementValue: 0,
      storeUnsubscribe: null,
      mouseButtonDown: false,
      lastPointerPosition: { x: -1, y: -1 },
      lastTimeVibrate: 100,
      mouseMoveRaf: null,
    };
  },

  computed: {
    internalValue() {
      const { quantise, movementValue } = this;

      let value = movementValue / 127;

      if (quantise > -1) {
        const q = Math.floor((1 / (quantise - 1)) * 1000) / 1000;
        value = Math.round(value / q) * q;
      }

      return value;
    },

    scaledValue() {
      return Math.floor((this.internalValue * 127) / (128 / this.range));
    },
  },

  watch: {
    "$store.state.channel"() {
      this.updateFromStore();
    },

    disabled() {
      this.draw();
    },
  },

  created() {
    this.updateFromStore();

    this.storeUnsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "SET_CC_VALUE") {
        const { cc, value, channel } = mutation.payload;

        if (
          cc === this.cc + this.ccOffset &&
          !this.mouseButtonDown &&
          channel === this.channel
        ) {
          this.setMovementValue(value);
        }
      }

      if (mutation.type === "SET_STATE") {
        const value =
          state[`channel${this.$store.state.channel}`][this.cc + this.ccOffset];

        this.setMovementValue(value);
      }
    });
  },

  mounted() {
    const { canvas } = this.$refs;

    // this.context = canvas.getContext("2d");
    this.context = new HighResCanvasRenderingContext2D(
      canvas.getContext("2d"),
      window.devicePixelRatio,
    );

    this.resize();

    this.draw();
  },

  beforeUnmount() {
    document.removeEventListener("pointerup", this.mouseUp);
    document.removeEventListener("pointermove", this.mouseMove);
    document.body.classList.remove("ns-resize-cursor");
    this.storeUnsubscribe();
  },

  methods: {
    requestPointerLock(e) {
      const {
        $refs: { canvas },
        disabled,
      } = this;

      if (disabled) {
        e.preventDefault();
        return;
      }

      document.addEventListener(
        "pointerlockchange",
        this.lockChangeAlert,
        false,
      );

      if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
      } else {
        // Only used for browsers without the Pointer Lock API, such as the WebMIDI Browser for iOS
        e.preventDefault();
        document.addEventListener("pointermove", this.mouseMove, false);
        document.addEventListener("pointerup", this.mouseUp);
      }

      this.mouseButtonDown = true;
      this.draw();
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
    },

    lockChangeAlert() {
      const {
        $refs: { canvas },
      } = this;

      if (document.pointerLockElement === canvas) {
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
      this.mouseButtonDown = false;
      this.draw();
      this.lastPointerPosition = { x: -1, y: -1 };
    },

    mouseMove(e) {
      const { channel } = this;

      // first touch
      // I feel I've overengineered this somewhat
      let firstTouch = false;
      if (this.lastPointerPosition.x < 0) {
        firstTouch = true;
        this.lastPointerPosition.x = e.clientX + this.movementValue;
        this.lastPointerPosition.y = e.clientY + this.movementValue;
      }

      const yDelta = e.movementY || -this.lastPointerPosition.y + e.clientY;

      this.lastPointerPosition.x = e.clientX;
      this.lastPointerPosition.y = e.clientY;

      const lastValue = this.internalValue;

      const newValue =
        (firstTouch && yDelta !== 0 ? 0 : -yDelta) + this.movementValue;
      const clampedNewValue = Math.max(0, Math.min(127, newValue));

      if (this.mouseMoveRaf) {
        cancelAnimationFrame(this.mouseMoveRaf);
      }

      this.mouseMoveRaf = requestAnimationFrame(() => {
        this.movementValue = clampedNewValue;
        if (this.internalValue !== lastValue) {
          this.draw();
        }

        if (this.internalValue !== lastValue && this.lastTimeVibrate > 10) {
          this.lastTimeVibrate = Date.now();
          window.api.vibrate();
        }

        this.downY = e.pageY;
        if (this.internalValue !== lastValue) {
          this.$store.dispatch("setCCValues", {
            channel,
            values: {
              [this.cc + this.ccOffset]: this.inverse
                ? 127 - this.internalValue * 127
                : this.internalValue * 127,
            },
          });
        }
        this.mouseMoveRaf = null;
      });
    },

    resize() {
      const {
        $refs: { canvas },
        context,
        size,
      } = this;
      const dpr = window.devicePixelRatio;
      context.dpr = dpr;

      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      context.lineWidth = 1 * dpr;
      context.lineCap = "round";
    },

    draw() {
      if (!this.$refs.canvas) {
        return;
      }

      const { context, size, internalValue, range, $colors, disabled } = this;

      requestAnimationFrame(() => {
        context.clearRect(0, 0, size, size);
        context.strokeStyle = disabled ? "gray" : $colors.foreground;

        context.fillStyle = this.mouseButtonDown
          ? $colors.foreground
          : "transparent";

        context.beginPath();
        context.arc(size / 2, size / 2, (size - 6) / 2 - 2, 0, Math.PI * 2);
        context.stroke();
        context.fill();

        context.strokeStyle = disabled ? "gray" : $colors.foreground;

        if (range > 0) {
          for (let i = 0; i < range; ++i) {
            context.save();
            context.lineWidth =
              window.devicePixelRatio > 1
                ? 1 / (window.devicePixelRatio - 1.4)
                : 1;
            context.translate(size / 2, size / 2);
            context.rotate((i / (range - 1)) * 270 * (Math.PI / 180));
            context.translate(-size / 2, -size / 2);

            context.beginPath();
            context.moveTo(size * 0.150555556, size - size * 0.150555556);
            context.lineTo(size * 0.173888889, size - size * 0.173888889);
            context.stroke();

            context.restore();
          }
        }

        context.save();
        context.translate(size / 2, size / 2);
        context.rotate(internalValue * 270 * (Math.PI / 180));
        context.translate(-size / 2, -size / 2);

        context.strokeStyle = disabled
          ? "gray"
          : this.mouseButtonDown
            ? $colors.background
            : $colors.foreground;

        context.beginPath();
        context.arc(
          size / 2 - size / 5,
          size / 2 + size / 5,
          size / 25,
          0,
          Math.PI * 2,
        );
        context.stroke();
        context.restore();
      });
    },

    updateFromStore() {
      const { channel } = this;
      const value =
        this.$store.state[`channel${channel}`][this.cc + this.ccOffset];

      this.setMovementValue(value);
    },

    setMovementValue(value) {
      this.movementValue = this.inverse ? -value + 127 : value;
      this.draw();
    },
  },
};
</script>

<style scoped>
.dial {
  display: flex;
  flex-direction: column;
  align-items: center;
}

canvas {
  user-select: none;
  touch-action: none;
}

.dial {
  margin-right: 0.5em;
  text-align: center;
}
</style>
