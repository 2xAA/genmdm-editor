<template>
<grid columns="8">
  <c span="2">
    <MDMControlGroup :cc-values="[
      20 + operator - 1,
      24 + operator - 1,
      39 + operator - 1,
      70 + operator - 1,
      90 + operator - 1
    ]" />
  </c>
  <c span="6">
    <canvas ref="canvas"></canvas>
  </c>
  <c span="8">
    <MDMDial :value="displayPositions[0][0]" @input="setPosition(0, 0, $event)" :quantise="32"/>
    <MDMDial
      :value="displayPositions[0][1]"
      @input="setPosition(0, 1, $event)"
      :quantise="127"
      :inverse="true"
    />
    <MDMDial :value="displayPositions[1][0]" @input="setPosition(1, 0, $event)" :quantise="32"/>
    <MDMDial
      :value="displayPositions[1][1]"
      @input="setPosition(1, 1, $event)"
      :quantise="32"
      :inverse="true"
    />
    <MDMDial :value="displayPositions[2][0]" @input="setPosition(2, 0, $event)" :quantise="16"/>
    <MDMDial :value="displayPositions[3][0]" @input="setPosition(3, 0, $event)" :quantise="16"/>
  </c>
</grid>
</template>

<script>
import MDMDial from "./MDMDial";
import MDMControlGroup from "./MDMControlGroup";

function radiusCollision(circle1, circle2) {
  var dx = circle1.x - circle2.x;
  var dy = circle1.y - circle2.y;
  var distance = Math.sqrt(dx * dx + dy * dy);

  return distance < circle1.radius + circle2.radius;
}

const ADSR_CC_NUMBERS = [43, 16, 47, 55, 51, 59];

export default {
  props: {
    value: { type: Object },
    color: { type: String, default: "#000000" },
    operator: { type: Number, required: true },
    width: { type: Number, default: 300 },
    height: { type: Number, default: 150 }
  },

  components: {
    MDMDial,
    MDMControlGroup
  },

  data() {
    return {
      context: null,
      mouseDown: true,
      nodeSelected: -1
    };
  },

  computed: {
    channel() {
      return this.$store.state.channel;
    },

    displayPositions: {
      get() {
        const channel = this.$store.state[`channel${this.channel}`];
        const positions = [[0.5, 0.5], [0.5, 0.5], [0.5, 0.5], [0.5, 1]];
        const operator = this.operator - 1;

        positions[0][0] = (127 - channel[ADSR_CC_NUMBERS[0] + operator]) / 127;
        positions[0][1] = (127 - channel[ADSR_CC_NUMBERS[1] + operator]) / 127;
        positions[1][0] = (127 - channel[ADSR_CC_NUMBERS[2] + operator]) / 127;
        positions[1][1] = (127 - channel[ADSR_CC_NUMBERS[3] + operator]) / 127;
        positions[2][0] = (127 - channel[ADSR_CC_NUMBERS[4] + operator]) / 127;
        positions[3][0] = (127 - channel[ADSR_CC_NUMBERS[5] + operator]) / 127;

        return positions;
      },

      set(values) {
        this.$store.dispatch("setCCValues", values);
      }
    }
  },

  // 32, 32, 16, 16

  mounted() {
    const { canvas } = this.$refs;
    this.context = canvas.getContext("2d");

    this.resize();
    this.draw();

    this.$store.subscribe((mutation) => {
      if (mutation.type === "SET_CC_VALUE") {
        const cc = parseInt(mutation.payload.cc, 10) - (this.operator - 1);

        if (ADSR_CC_NUMBERS.indexOf(cc) > -1) {
          this.draw();
        }
      }
    });
  },

  methods: {
    down() {
      this.mouseDown = true;
    },

    up() {
      this.mouseDown = false;

      const values = this.generateValues();
      this.$store.dispatch("setCCValues", values);
    },

    move(e) {
      const { canvas } = this.$refs;
      const qw = Math.floor(canvas.width / 4);
      const x = Math.floor(Math.max(0, e.offsetX));
      const y = Math.floor(Math.max(0, e.offsetY));

      if (!this.mouseDown) {
        let nodeSelected = -1;

        for (let i = 0; i < this.displayPositions.length; ++i) {
          const pos = this.getXYFromPosition(i);

          const collision = radiusCollision(
            { x, y, radius: 3 },
            { ...pos, radius: 3 }
          );
          if (collision) {
            nodeSelected = i;
            break;
          }
        }

        this.nodeSelected = nodeSelected;
      }

      if (this.mouseDown && this.nodeSelected > -1) {
        let lowerX = 0;

        if (this.nodeSelected > 0) {
          lowerX = this.getXYFromPosition(this.nodeSelected - 1).x;
        }

        const higherX = lowerX + qw;

        if (x > lowerX && x < higherX) {
          const value = (x - lowerX) / (higherX - lowerX);

          this.displayPositions[this.nodeSelected][0] = value;
        }

        const lowerY = 0;
        const higherY = canvas.height;

        if (y > lowerY && y < higherY) {
          const value = (y - lowerY) / (higherY - lowerY);

          this.displayPositions[this.nodeSelected][1] = value;
        }
      }

      this.draw();
    },

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
      const { context, $refs, getXYFromPosition, color } = this;
      const {
        canvas: { width: cw, height: ch }
      } = $refs;

      context.restore();

      context.clearRect(0, 0, cw, ch);
      context.strokeRect(0, 0, cw, ch);
      context.strokeStyle = "#000";

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

      context.fillStyle = color;

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
      const {
        canvas,
        canvas: { width: cw }
      } = this.$refs;
      const qw = Math.floor(canvas.width / 4);

      let lowerX = 0;
      if (index > 0) {
        lowerX = this.getXYFromPosition(index - 1).x;
      }

      const position = this.displayPositions[index];

      if (index === 0) {
        return {
          x: lowerX + Math.floor(position[0] * cw),
          y: Math.floor(position[1] * canvas.height)
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

      const ar = Math.floor(127 - positions[0][0] * 127);
      const tl = Math.floor(127 - positions[0][1] * 127);
      const dr1 = Math.floor(127 - positions[1][0] * 127);
      const sa = Math.floor(127 - positions[1][1] * 127);
      const dr2 = Math.floor(127 - positions[2][0] * 127);
      const rr = Math.floor(127 - positions[3][0] * 127);

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
