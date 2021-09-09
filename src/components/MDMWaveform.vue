<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
export default {
  props: {
    size: {
      type: Number,
      default: 188
    }
  },

  data() {
    return {
      context: null,
      segments: 14,
      values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ccValues: {}
    };
  },

  mounted() {
    const { canvas } = this.$refs;

    this.context = canvas.getContext("2d");

    this.resize();

    canvas.addEventListener("mousedown", this.down);
  },

  beforeDestroy() {
    const { canvas } = this.$refs;
    canvas.removeEventListener("mousedown", this.down);
    document.removeEventListener("mouseup", this.up);
    document.removeEventListener("mousemove", this.move);
  },

  computed: {
    segmentWidth() {
      return this.size / this.segments;
    }
  },

  methods: {
    down() {
      document.addEventListener("mouseup", this.up);
      document.addEventListener("mousemove", this.move);
    },

    up(e) {
      this.updateValue(e);

      document.removeEventListener("mouseup", this.up);
      document.removeEventListener("mousemove", this.move);
      this.$store.dispatch("setCCValues", {
        values: this.ccValues
      });
    },

    move(e) {
      this.updateValue(e);
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

      requestAnimationFrame(this.draw);
    },

    draw() {
      const {
        context,
        $refs: {
          canvas: { width: cw, height: ch }
        }
      } = this;
      context.clearRect(0, 0, cw, ch);
      context.strokeStyle = this.$colors.foreground;
      context.strokeRect(0, 0, cw, ch);

      for (let i = 0; i < this.values.length; ++i) {
        context.strokeRect(
          Math.floor(this.segmentWidth * i) + 0.5,
          ch,
          Math.floor(this.segmentWidth),
          Math.floor(-this.values[i] * ch) + 0.5
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

      const q = 1 / 128;

      const value = Math.round(yValue / q) * q;

      this.values[segment] = value;

      requestAnimationFrame(this.draw);

      this.ccValues[100 + segment] = value * 127;
    }
  }
};
</script>

<style scoped>
canvas {
  margin-top: 8px;
}
</style>
