<template>
  <grid columns="8">
    <c span="2">
      <MDMControlGroup
        :cc-values="[
          20 + operator - 1,
          24 + operator - 1,
          39 + operator - 1,
          70 + operator - 1,
          90 + operator - 1
        ]"
      />
    </c>
    <c span="6">
      <canvas ref="canvas" class="asdr-canvas"></canvas>
    </c>
    <c span="8" class="envelope-dials">
      <MDMDial
        :value="displayPositions[0][0]"
        :inverse="true"
        :quantise="32"
        :cc="ADSR_CC_NUMBERS[0]"
        :ccOffset="operator - 1"
      />
      <MDMDial
        :value="displayPositions[0][1]"
        :quantise="128"
        :cc="ADSR_CC_NUMBERS[1]"
        :ccOffset="operator - 1"
      />
      <MDMDial
        :value="displayPositions[1][0]"
        :quantise="32"
        :inverse="true"
        :cc="ADSR_CC_NUMBERS[2]"
        :ccOffset="operator - 1"
      />
      <MDMDial
        :value="displayPositions[1][1]"
        :quantise="16"
        :inverse="true"
        :cc="ADSR_CC_NUMBERS[3]"
        :ccOffset="operator - 1"
      />
      <MDMDial
        :value="displayPositions[2][0]"
        :quantise="32"
        :inverse="true"
        :cc="ADSR_CC_NUMBERS[4]"
        :ccOffset="operator - 1"
      />
      <MDMDial
        :value="displayPositions[3][0]"
        :quantise="16"
        :inverse="true"
        :cc="ADSR_CC_NUMBERS[5]"
        :ccOffset="operator - 1"
      />
    </c>
  </grid>
</template>

<script>
import MDMDial from "./MDMDial";
import MDMControlGroup from "./MDMControlGroup";
import genmdmMapping from "../genmdm-mapping";

const ADSR_CC_NUMBERS = [43, 16, 47, 55, 51, 59];

export default {
  props: {
    color: { type: String, default: "#000000" },
    operator: { type: Number, required: true },
    width: { type: Number, default: 298 },
    height: { type: Number, default: 156 }
  },

  components: {
    MDMDial,
    MDMControlGroup
  },

  data() {
    return {
      context: null,
      mouseDown: true,
      nodeSelected: -1,
      storeUnsubscribe: null,
      ADSR_CC_NUMBERS
    };
  },

  computed: {
    channel() {
      return this.$store.state.channel;
    },

    displayPositions() {
      const channel = this.$store.state[`channel${this.channel}`];
      const operator = this.operator - 1;
      const positions = [
        [0.5, 0.5],
        [0.5, 0.5],
        [0.5, 0.5],
        [0.5, 1]
      ];

      positions[0][0] = channel[ADSR_CC_NUMBERS[0] + operator] / 127;
      positions[0][1] = channel[ADSR_CC_NUMBERS[1] + operator] / 127;
      positions[1][0] = 1 - channel[ADSR_CC_NUMBERS[2] + operator] / 127;
      positions[1][1] = 1 - channel[ADSR_CC_NUMBERS[3] + operator] / 127;
      positions[2][0] = 1 - channel[ADSR_CC_NUMBERS[4] + operator] / 127;
      positions[3][0] = 1 - channel[ADSR_CC_NUMBERS[5] + operator] / 127;

      return positions;
    }
  },

  mounted() {
    const { canvas } = this.$refs;
    this.context = canvas.getContext("2d");

    this.resize();
    this.draw();

    this.storeUnsubscribe = this.$store.subscribe(mutation => {
      if (mutation.type === "SET_CC_VALUE") {
        const cc = parseInt(mutation.payload.cc, 10) - (this.operator - 1);

        if (ADSR_CC_NUMBERS.indexOf(cc) > -1) {
          this.draw();
        }
      }
    });
  },

  beforeDestroy() {
    this.storeUnsubscribe();
  },

  methods: {
    resize() {
      const {
        $refs: { canvas },
        context,
        width,
        height
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
      const { context, $refs, getXYFromPosition } = this;
      const {
        canvas: { width: cw, height: ch }
      } = $refs;

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

      context.beginPath();
      context.moveTo(0 + 0.5, ch + 0.5);
      context.lineTo(pos1.x + 0.5, pos1.y + 0.5);
      context.stroke();

      context.beginPath();
      context.moveTo(pos1.x + 0.5, pos1.y + 0.5);
      context.lineTo(pos2.x + 0.5, pos2Y);
      context.stroke();

      context.beginPath();
      context.moveTo(pos2.x + 0.5, pos2Y);
      context.lineTo(pos3.x + 0.5, pos3Y);
      context.stroke();

      context.beginPath();
      context.moveTo(pos3.x + 0.5, pos3Y);
      context.lineTo(pos4.x + 0.5, ch + 0.5);
      context.stroke();

      context.save();
      context.setLineDash([4.5 * dpr, 2 * dpr, 1.5 * dpr, 2 * dpr]);

      context.beginPath();
      context.moveTo(0, pos1.y + 0.5);
      context.lineTo(cw, pos1.y + 0.5);
      context.stroke();

      context.beginPath();
      context.moveTo(0, pos2Y);
      context.lineTo(cw, pos2Y);
      context.stroke();

      context.beginPath();
      context.moveTo(pos1.x + 0.5, pos1.y);
      context.lineTo(pos1.x + 0.5, ch);
      context.stroke();

      context.beginPath();
      context.moveTo(pos2.x + 0.5, pos2Y);
      context.lineTo(pos2.x + 0.5, ch);
      context.stroke();

      context.beginPath();
      context.moveTo(pos3.x + 0.5, pos3Y);
      context.lineTo(pos3.x + 0.5, ch);
      context.stroke();

      context.restore();
    },

    getXYFromPosition(index = 0) {
      const { canvas } = this.$refs;
      const qw = Math.floor(canvas.width / 4);

      let lowerX = 0;
      if (index > 0) {
        lowerX = this.getXYFromPosition(index - 1).x;
      }

      const position = this.displayPositions[index];

      if (index === 0) {
        return {
          x: lowerX + (1 - position[0]) * qw, //Math.pow(cw, position[0]),
          y: Math.floor((1 - position[1]) * canvas.height)
        };
      }

      return {
        x: lowerX + Math.floor(position[0] * qw),
        y: Math.floor(position[1] * canvas.height)
      };
    },

    generateValues(newPositions) {
      const { operator } = this;
      const positions = newPositions || this.displayPositions;

      const values = {};

      const ar = Math.floor(
        positions[0][0] * (genmdmMapping[ADSR_CC_NUMBERS[0]].range - 1)
      );
      const tl = Math.floor(
        positions[0][1] * (genmdmMapping[ADSR_CC_NUMBERS[1]].range - 1)
      );
      const dr1 = Math.floor(
        positions[1][0] * (genmdmMapping[ADSR_CC_NUMBERS[2]].range - 1)
      );
      const sa = Math.floor(
        positions[1][1] * (genmdmMapping[ADSR_CC_NUMBERS[3]].range - 1)
      );
      const dr2 = Math.floor(
        positions[2][0] * (genmdmMapping[ADSR_CC_NUMBERS[4]].range - 1)
      );
      const rr = Math.floor(
        positions[3][0] * (genmdmMapping[ADSR_CC_NUMBERS[5]].range - 1)
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
    }
  }
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
