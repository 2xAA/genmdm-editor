<template>
  <div class="dial">
    <canvas ref="canvas" class="ns-resize-cursor"></canvas>
    {{ scaledValue }}
  </div>
</template>

<script>
import defaultMapping from '../default-mapping';
export default {
  props: {
    cc: {
      type: Number,
      required: true
    },

    size: {
      type: Number,
      default: 60
    },

    value: {
      type: Number,
      default: 0
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

      mouseMovementRangeInPixels: 128,

      downY: -1,
      movementValue: 0
    };
  },

  created() {
    this.movementValue = this.value;
  },

  mounted() {
    const { canvas } = this.$refs;

    this.context = canvas.getContext("2d");
    this.resize();

    this.draw();

    canvas.addEventListener("mousedown", this.down);
  },

  beforeDestroy() {
    const { canvas } = this.$refs;
    canvas.removeEventListener("mousedown", this.down);
    document.removeEventListener("mouseup", this.up);
    document.removeEventListener("mousemove", this.move);
    document.body.classList.remove('ns-resize-cursor');
  },

  computed: {
    q() {
      return 1 / this.quantise;
    },

    internalValue() {
      const { q, quantise, movementValue } = this;

      let value = 0;

      if (quantise > -1) {
        if (this.inverse) {
          value = Math.floor(movementValue / q) * q;
        } else {
          value = Math.ceil(movementValue / q) * q;
        }
      } else {
        value = movementValue;
      }

      return value;
    },

    scaledValue() {
      if (this.inverse) {
        return Math.abs(Math.floor((this.value - 1) * (defaultMapping[this.cc].range - 1)))
      } else {
        return Math.floor(this.value * (defaultMapping[this.cc].range - 1))
      }
    }
  },

  methods: {
    down(e) {
      document.addEventListener("mouseup", this.up);

      this.downY = e.pageY;
      document.addEventListener("mousemove", this.move);
      document.body.classList.add('ns-resize-cursor');
    },

    up(e) {
      this.updateValue(e);

      this.downY = -1;
      document.removeEventListener("mouseup", this.up);
      document.removeEventListener("mousemove", this.move);
      document.body.classList.remove('ns-resize-cursor');
    },

    move(e) {
      this.updateValue(e);
    },

    updateValue(e) {
      let differenceInPixels = this.downY - e.pageY;

      const valueDifference =
        differenceInPixels / this.mouseMovementRangeInPixels;

      const newValue = valueDifference + this.movementValue;
      const clampedNewValue = Math.max(0, Math.min(1, newValue));
      this.movementValue = clampedNewValue;

      this.downY = e.pageY;
      if (this.inverse) {
        this.$emit("input", 1 - this.internalValue);
      } else {
        this.$emit("input", this.internalValue);
      }
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

        context.beginPath();
        context.arc(cw / 2, ch / 2, ((size - 6) / 2 - 2) * dpr, 0, Math.PI * 2);
        context.stroke();

        if (quantise > 0) {
          for (let i = 0; i < quantise; ++i) {
            context.save();
            context.translate(cw / 2, ch / 2);
            context.rotate((i / quantise) * 270 * (Math.PI / 180));
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
    }
  },

  watch: {
    value(value) {
      if (this.inverse) {
        this.movementValue = 1 - value;
      } else {
        this.movementValue = value;
      }
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
}

.dial {
  margin-right: 0.5em;
  text-align: center;
}
</style>
