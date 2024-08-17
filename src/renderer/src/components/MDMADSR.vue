<template>
  <grid columns="8">
    <c span="2">
      <MDMControlGroup
        :cc-values="[
          20 + operator - 1,
          24 + operator - 1,
          39 + operator - 1,
          70 + operator - 1,
          90 + operator - 1,
        ]"
        :channel="channel"
      />
    </c>
    <c span="6">
      <canvas ref="canvas" class="asdr-canvas"></canvas>
    </c>
    <c span="8" class="envelope-dials">
      <MDMDial
        :inverse="true"
        :quantise="32"
        :cc="ADSR_CC_NUMBERS[0]"
        :cc-offset="operator - 1"
        :range="ADSR_DIAL_RANGES[0]"
        :title="ADSR_TITLES[0]"
        :channel="channel"
        @pointerdown="setHighlight(0)"
        @pointerup="setHighlight(null)"
      />
      <MDMDial
        :cc="ADSR_CC_NUMBERS[1]"
        :cc-offset="operator - 1"
        :range="ADSR_DIAL_RANGES[1]"
        :title="ADSR_TITLES[1]"
        :channel="channel"
        @pointerdown="setHighlight(1)"
        @pointerup="setHighlight(null)"
      />
      <MDMDial
        :quantise="32"
        :inverse="true"
        :cc="ADSR_CC_NUMBERS[2]"
        :cc-offset="operator - 1"
        :range="ADSR_DIAL_RANGES[2]"
        :title="ADSR_TITLES[2]"
        :channel="channel"
        @pointerdown="setHighlight(2)"
        @pointerup="setHighlight(null)"
      />
      <MDMDial
        :quantise="16"
        :inverse="true"
        :cc="ADSR_CC_NUMBERS[3]"
        :cc-offset="operator - 1"
        :range="ADSR_DIAL_RANGES[3]"
        :title="ADSR_TITLES[3]"
        :channel="channel"
        @pointerdown="setHighlight(3)"
        @pointerup="setHighlight(null)"
      />
      <MDMDial
        :quantise="32"
        :inverse="true"
        :cc="ADSR_CC_NUMBERS[4]"
        :cc-offset="operator - 1"
        :range="ADSR_DIAL_RANGES[4]"
        :title="ADSR_TITLES[4]"
        :channel="channel"
        @pointerdown="setHighlight(4)"
        @pointerup="setHighlight(null)"
      />
      <MDMDial
        :quantise="16"
        :inverse="true"
        :cc="ADSR_CC_NUMBERS[5]"
        :cc-offset="operator - 1"
        :range="ADSR_DIAL_RANGES[5]"
        :title="ADSR_TITLES[5]"
        :channel="channel"
        @pointerdown="setHighlight(5)"
        @pointerup="setHighlight(null)"
      />
    </c>
  </grid>
</template>

<script>
import { HighResCanvasRenderingContext2D } from "@vcync/hires-canvas2d";
import MDMDial from "./MDMDial.vue";
import MDMControlGroup from "./MDMControlGroup.vue";
import genmdmMapping from "../genmdm-mapping";
import redrawOnColorschemeChange from "./mixins/redraw-on-colorscheme-change";

const ADSR_CC_NUMBERS = [43, 16, 47, 55, 51, 59];
const ADSR_DIAL_RANGES = ADSR_CC_NUMBERS.map((cc) => genmdmMapping[cc].range);
const ADSR_TITLES = ADSR_CC_NUMBERS.map((cc) => genmdmMapping[cc].label);

export default {
  components: {
    MDMDial,
    MDMControlGroup,
  },
  mixins: [redrawOnColorschemeChange],

  inject: ["$colors"],

  props: {
    color: { type: String, default: "#000000" },
    operator: { type: Number, required: true },
    width: { type: Number, default: 298 },
    height: { type: Number, default: 156 },
    channel: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      context: null,
      mouseDown: true,
      storeUnsubscribe: null,
      highlight: null,
      ADSR_CC_NUMBERS,
      ADSR_DIAL_RANGES,
      ADSR_TITLES,
    };
  },

  computed: {
    displayPositions() {
      const channel = this.$store.state[`channel${this.channel}`];
      const operator = this.operator - 1;
      const positions = [
        [0.5, 0.5],
        [0.5, 0.5],
        [0.5, 0.5],
        [0.5, 1],
      ];

      positions[0][0] = channel[ADSR_CC_NUMBERS[0] + operator] / 127;
      positions[0][1] = channel[ADSR_CC_NUMBERS[1] + operator] / 127;
      positions[1][0] = 1 - channel[ADSR_CC_NUMBERS[2] + operator] / 127;
      positions[1][1] = 1 - channel[ADSR_CC_NUMBERS[3] + operator] / 127;
      positions[2][0] = 1 - channel[ADSR_CC_NUMBERS[4] + operator] / 127;
      positions[3][0] = 1 - channel[ADSR_CC_NUMBERS[5] + operator] / 127;

      return positions;
    },
  },

  watch: {
    displayPositions() {
      this.draw();
    },
  },

  mounted() {
    const { canvas } = this.$refs;
    this.context = new HighResCanvasRenderingContext2D(
      canvas.getContext("2d"),
      window.devicePixelRatio,
    );

    this.resize();
    this.draw();

    this.storeUnsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === "SET_CC_VALUE") {
        const cc = parseInt(mutation.payload.cc, 10) - (this.operator - 1);

        if (ADSR_CC_NUMBERS.indexOf(cc) > -1) {
          this.draw();
        }
      }
    });
  },

  beforeUnmount() {
    this.storeUnsubscribe();
  },

  methods: {
    setHighlight(index) {
      this.highlight = index;
      this.draw();
    },

    resize() {
      const {
        $refs: { canvas },
        context,
        width,
        height,
      } = this;
      const dpr = window.devicePixelRatio;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.lineWidth = 1 * dpr;
      context.lineCap = "round";
    },

    draw() {
      const dpr = window.devicePixelRatio;
      const {
        context,
        getXYFromPosition,
        width: cw,
        height: ch,
        highlight,
      } = this;

      context.restore();
      context.strokeStyle = this.$colors.foreground;

      context.clearRect(0, 0, cw, ch);
      context.strokeRect(0, 0, cw, ch);

      context.save();
      context.translate(0, -1);

      const pos1 = getXYFromPosition(0);
      const pos2 = getXYFromPosition(1);
      const pos3 = getXYFromPosition(2);
      const pos4 = getXYFromPosition(3);

      // pos1.y = ch - pos1.y;
      pos2.y = ch - pos2.y;

      const pos2Y = ch - ((ch - pos2.y) * ((ch - pos1.y) / ch) + 0.5);
      const pos3Y =
        ch -
        ((ch - pos3.y) * (((ch - pos1.y) / ch) * ((ch - pos2.y) / ch)) + 0.5);

      highlight === 0 && (context.lineWidth = 2 * dpr);
      context.beginPath();
      context.moveTo(0 + 0.5, ch + 0.5);
      context.lineTo(pos1.x + 0.5, pos1.y + 0.5);
      context.stroke();
      context.lineWidth = 1 * dpr;

      highlight === 2 && (context.lineWidth = 2 * dpr);
      context.beginPath();
      context.moveTo(pos1.x + 0.5, pos1.y + 0.5);
      context.lineTo(pos2.x + 0.5, pos2Y);
      context.stroke();
      context.lineWidth = 1 * dpr;

      highlight === 4 && (context.lineWidth = 2 * dpr);
      context.beginPath();
      context.moveTo(pos2.x + 0.5, pos2Y);
      context.lineTo(pos3.x + 0.5, pos3Y);
      context.stroke();
      context.lineWidth = 1 * dpr;

      highlight === 5 && (context.lineWidth = 2 * dpr);
      context.beginPath();
      context.moveTo(pos3.x + 0.5, pos3Y);
      context.lineTo(pos4.x + 0.5, ch + 0.5);
      context.stroke();
      context.lineWidth = 1 * dpr;

      context.save();
      context.setLineDash([4.5 * dpr, 2 * dpr, 1.5 * dpr, 2 * dpr]);

      highlight === 1 && (context.lineWidth = 2 * dpr);
      context.beginPath();
      context.moveTo(0, pos1.y + 0.5);
      context.lineTo(cw, pos1.y + 0.5);
      context.stroke();
      context.lineWidth = 1 * dpr;

      highlight === 3 && (context.lineWidth = 2 * dpr);
      context.beginPath();
      context.moveTo(0, pos2Y);
      context.lineTo(cw, pos2Y);
      context.stroke();
      context.lineWidth = 1 * dpr;

      highlight === 1 && (context.lineWidth = 2 * dpr);
      context.beginPath();
      context.moveTo(pos1.x + 0.5, pos1.y);
      context.lineTo(pos1.x + 0.5, ch);
      context.stroke();
      context.lineWidth = 1 * dpr;

      highlight === 3 && (context.lineWidth = 2 * dpr);
      context.beginPath();
      context.moveTo(pos2.x + 0.5, pos2Y);
      context.lineTo(pos2.x + 0.5, ch);
      context.stroke();
      context.lineWidth = 1 * dpr;

      context.beginPath();
      context.moveTo(pos3.x + 0.5, pos3Y);
      context.lineTo(pos3.x + 0.5, ch);
      context.stroke();
      context.lineWidth = 1 * dpr;

      context.restore();
    },

    getXYFromPosition(index = 0) {
      const { width, height } = this;
      const qw = Math.floor(width / 4);

      let lowerX = 0;
      if (index > 0) {
        lowerX = this.getXYFromPosition(index - 1).x;
      }

      const position = this.displayPositions[index];

      if (index === 0) {
        return {
          x: lowerX + (1 - position[0]) * qw, //Math.pow(cw, position[0]),
          y: Math.floor((1 - position[1]) * height),
        };
      }

      return {
        x: lowerX + Math.floor(position[0] * qw),
        y: Math.floor(position[1] * height),
      };
    },

    generateValues(newPositions) {
      const { operator } = this;
      const positions = newPositions || this.displayPositions;

      const values = {};

      const ar = Math.floor(
        positions[0][0] * (genmdmMapping[ADSR_CC_NUMBERS[0]].range - 1),
      );
      const tl = Math.floor(
        positions[0][1] * (genmdmMapping[ADSR_CC_NUMBERS[1]].range - 1),
      );
      const dr1 = Math.floor(
        positions[1][0] * (genmdmMapping[ADSR_CC_NUMBERS[2]].range - 1),
      );
      const sa = Math.floor(
        positions[1][1] * (genmdmMapping[ADSR_CC_NUMBERS[3]].range - 1),
      );
      const dr2 = Math.floor(
        positions[2][0] * (genmdmMapping[ADSR_CC_NUMBERS[4]].range - 1),
      );
      const rr = Math.floor(
        positions[3][0] * (genmdmMapping[ADSR_CC_NUMBERS[5]].range - 1),
      );

      values[ADSR_CC_NUMBERS[0] + (operator - 1)] = ar;
      values[ADSR_CC_NUMBERS[1] + (operator - 1)] = tl;
      values[ADSR_CC_NUMBERS[2] + (operator - 1)] = dr1;
      values[ADSR_CC_NUMBERS[3] + (operator - 1)] = sa;
      values[ADSR_CC_NUMBERS[4] + (operator - 1)] = dr2;
      values[ADSR_CC_NUMBERS[5] + (operator - 1)] = rr;

      return values;
    },

    setPosition(x, y, value) {
      const positions = this.displayPositions;
      positions[x][y] = value;

      this.displayPositions = this.generateValues(positions);
    },
  },
};
</script>

<style scoped>
.asdr-canvas {
  margin-left: 3px;
}

.envelope-dials {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}
</style>
