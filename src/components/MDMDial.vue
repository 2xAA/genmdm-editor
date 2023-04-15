<template>
  <div class="dial">
    <canvas
      :title="title"
      ref="canvas"
      class="ns-resize-cursor"
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
import genmdmMapping from "../genmdm-mapping";
import redrawOnColorschemeChange from "./mixins/redraw-on-colorscheme-change";

export default {
  mixins: [redrawOnColorschemeChange],

  props: {
    cc: {
      type: Number,
      required: true
    },

    ccOffset: {
      type: Number,
      default: 0
    },

    size: {
      type: Number,
      default: 60
    },

    quantise: {
      type: Number,
      default: -1
    },

    inverse: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      context: null,
      movementValue: 0,
      storeUnsubscribe: null,
      mouseButtonDown: false,
      lastPointerPosition: { x: -1, y: -1 }
    };
  },

  created() {
    this.updateFromStore();

    this.storeUnsubscribe = this.$store.subscribe(mutation => {
      if (mutation.type === "SET_CC_VALUE") {
        const { cc, value, channel } = mutation.payload;

        if (
          cc === this.cc + this.ccOffset &&
          !this.mouseButtonDown &&
          channel === this.$store.state.channel
        ) {
          this.movementValue = this.inverse ? -value + 127 : value;
          this.draw();
        }
      }
    });
  },

  mounted() {
    const { canvas } = this.$refs;

    this.context = canvas.getContext("2d");
    this.resize();

    this.draw();
  },

  beforeDestroy() {
    document.removeEventListener("pointerup", this.mouseUp);
    document.removeEventListener("pointermove", this.mouseMove);
    document.body.classList.remove("ns-resize-cursor");
    this.storeUnsubscribe();
  },

  computed: {
    q() {
      return 1 / (this.quantise - 1);
    },

    internalValue() {
      const { q, quantise, movementValue } = this;

      let value = movementValue / 127;

      if (quantise > -1) {
        value = Math.floor(value / q) * q;
      }

      return value;
    },

    scaledValue() {
      return Math.floor(
        this.internalValue * (genmdmMapping[this.cc].range - 1)
      );
    },

    title() {
      return genmdmMapping[this.cc].label;
    }
  },

  methods: {
    requestPointerLock(e) {
      const {
        $refs: { canvas }
      } = this;

      document.addEventListener(
        "pointerlockchange",
        this.lockChangeAlert,
        false
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
        false
      );
    },

    lockChangeAlert() {
      const {
        $refs: { canvas }
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

      const newValue =
        (firstTouch && yDelta !== 0 ? 0 : -yDelta) + this.movementValue;
      const clampedNewValue = Math.max(0, Math.min(127, newValue));

      this.movementValue = clampedNewValue;
      this.downY = e.pageY;
      this.$store.dispatch("setCCValues", {
        values: {
          [this.cc + this.ccOffset]: this.inverse
            ? 127 - clampedNewValue
            : clampedNewValue
        }
      });
    },

    resize() {
      const {
        $refs: { canvas },
        context,
        size
      } = this;
      const dpr = window.devicePixelRatio;

      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      context.lineWidth = 1 * dpr;
      context.lineCap = "round";
    },

    draw() {
      const {
        $refs: {
          canvas: { width: cw, height: ch }
        },
        context,
        size,
        internalValue,
        quantise
      } = this;

      const dpr = window.devicePixelRatio;

      requestAnimationFrame(() => {
        context.clearRect(0, 0, cw, ch);
        context.strokeStyle = this.$colors.foreground;

        context.fillStyle = this.mouseButtonDown
          ? this.$colors.foreground
          : "transparent";

        context.beginPath();
        context.arc(cw / 2, ch / 2, ((size - 6) / 2 - 2) * dpr, 0, Math.PI * 2);
        context.stroke();
        context.fill();

        context.strokeStyle = this.$colors.foreground;

        if (quantise > 0) {
          for (let i = 0; i < quantise; ++i) {
            context.save();
            context.translate(cw / 2, ch / 2);
            context.rotate((i / (quantise - 1)) * 270 * (Math.PI / 180));
            context.translate(-cw / 2, -ch / 2);

            context.beginPath();
            context.moveTo(
              size * 0.150555556 * dpr,
              cw - size * 0.150555556 * dpr
            );
            context.lineTo(
              size * 0.173888889 * dpr,
              cw - size * 0.173888889 * dpr
            );
            context.stroke();

            context.restore();
          }
        }

        context.save();
        context.translate(cw / 2, ch / 2);
        context.rotate(internalValue * 270 * (Math.PI / 180));
        context.translate(-cw / 2, -ch / 2);

        context.strokeStyle = this.mouseButtonDown
          ? this.$colors.background
          : this.$colors.foreground;

        context.beginPath();
        context.arc(
          cw / 2 - (size / 5) * dpr,
          ch / 2 + (size / 5) * dpr,
          (size / 25) * dpr,
          0,
          Math.PI * 2
        );
        context.stroke();
        context.restore();
      });
    },

    updateFromStore() {
      const { channel } = this.$store.state;
      const value = this.$store.state[`channel${channel}`][
        this.cc + this.ccOffset
      ];

      this.movementValue = this.inverse ? -value + 127 : value;
    }
  },

  watch: {
    "$store.state.channel"() {
      this.updateFromStore();
    },

    movementValue() {
      this.draw();
    }
  }
};
</script>

<style scoped>
canvas {
  user-select: none;
  touch-action: none;
}

.dial {
  margin-right: 0.5em;
  text-align: center;
}
</style>
