<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
import redrawOnColorschemeChange from "./mixins/redraw-on-colorscheme-change";

export default {
  mixins: [redrawOnColorschemeChange],

  props: {
    size: {
      type: Number,
      default: 188,
    },
  },

  data() {
    return {
      context: null,
      segments: 14,
      values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ccValues: {},
      storeUnsubscribe: null,
    };
  },

  computed: {
    segmentWidth() {
      return this.size / this.segments;
    },
  },

  computed: {
    segmentWidth() {
      return this.size / this.segments;
    },
  },

  created() {
    this.updateFromStore();

    this.storeUnsubscribe = this.$store.subscribe((mutation) => {
      let redraw = false;

      if (mutation.type === "SET_CC_VALUE") {
        const { cc, value } = mutation.payload;

        if (
          cc > 99 &&
          cc < 100 + this.segments &&
          this.ccValues[cc] !== value
        ) {
          this.ccValues[cc] = value;
          this.values[100 - cc] = value / 127;
          redraw = true;
        }
      } else if (mutation.type === "SET_STATE") {
        redraw = true;
        this.updateFromStore();
      }

      if (redraw) {
        this.draw();
      }
    });
  },

  mounted() {
    const { canvas } = this.$refs;

    this.context = canvas.getContext("2d");

    this.resize();

    canvas.addEventListener("pointerdown", this.down);
  },

  beforeUnmount() {
    const { canvas } = this.$refs;
    canvas.removeEventListener("pointerdown", this.down);
    document.removeEventListener("pointerup", this.up);
    document.removeEventListener("pointermove", this.move);

    this.storeUnsubscribe();
  },

  methods: {
    updateFromStore() {
      for (let i = 0; i < this.segments; i += 1) {
        this.ccValues[100 + i] = this.$store.state.channel1[100 + i];
        this.values[i] = this.ccValues[100 + i] / 127;
      }
    },

    updateFromStore() {
      for (let i = 0; i < this.segments; i += 1) {
        this.ccValues[100 + i] = this.$store.state.channel1[100 + i];
        this.values[i] = this.ccValues[100 + i] / 127;
      }
    },

    down() {
      document.addEventListener("pointerup", this.up);
      document.addEventListener("pointermove", this.move);
    },

    up(e) {
      this.updateValue(e);

      document.removeEventListener("pointerup", this.up);
      document.removeEventListener("pointermove", this.move);
      this.$store.dispatch("setCCValues", {
        values: this.ccValues,
        channel: this.$store.state.channel,
      });
    },

    move(e) {
      this.updateValue(e);
    },

    resize() {
      const {
        $refs: { canvas },
        context,
        size,
      } = this;
      const dpr = window.devicePixelRatio;

      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      context.lineWidth = 1 * dpr;
      context.lineCap = "round";

      requestAnimationFrame(this.draw);
    },

    draw() {
      if (!this.$refs.canvas) {
        return;
      }

      const {
        context,
        $refs: {
          canvas: { width: cw, height: ch },
        },
      } = this;

      const dpr = window.devicePixelRatio;

      context.clearRect(0, 0, cw, ch);
      context.strokeStyle = this.$colors.foreground;
      context.strokeRect(0, 0, cw, ch);

      for (let i = 0; i < this.values.length; ++i) {
        context.strokeRect(
          Math.floor(this.segmentWidth * dpr * i) + 0.5,
          ch,
          Math.floor(this.segmentWidth * dpr),
          Math.floor(-this.values[i] * ch) + 0.5,
        );
      }
    },

    updateValue(e) {
      const segment = Math.floor(e.offsetX / this.segmentWidth);

      if (
        segment > this.segments - 1 ||
        segment < 0 ||
        e.offsetY > this.size ||
        e.offsetY < 0
      ) {
        return;
      }

      const yValue = 1 - e.offsetY / this.size;

      const q = 1 / 127;

      const value = Math.round(yValue / q) * q;
      const cc = Math.round(value * 127);

      // Value isn't directly here.
      // Converting it to the rounded CC value quantises it,
      // so the segments don't jump when restoring state
      this.values[segment] = cc / 127;

      requestAnimationFrame(this.draw);

      this.ccValues[100 + segment] = cc;
    },
  },
};
</script>

<style scoped>
canvas {
  margin-top: 8px;
  touch-action: none;
}
</style>
