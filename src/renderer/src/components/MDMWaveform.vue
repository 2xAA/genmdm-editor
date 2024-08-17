<template>
  <canvas ref="canvas"></canvas>
</template>

<script lang="ts" setup>
import {
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  computed,
  watchEffect,
} from "vue";
import { useStore } from "@renderer/store";
import { inject } from "vue";
import { useRedrawOnColorschemeChange } from "./composables/redraw-on-colorscheme-change";

const props = defineProps<{
  size?: number;
}>();

const store = useStore();

const $colors = inject("$colors");

const size = props.size ?? 188;
const canvas = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);

const segments = 14;
const values = reactive(Array(segments).fill(0));
const ccValues = reactive<Record<number, number>>({});

const segmentWidth = computed(() => size / segments);

const updateFromStore = () => {
  for (let i = 0; i < segments; i += 1) {
    ccValues[100 + i] = store.state.channel1[100 + i];
    values[i] = ccValues[100 + i] / 127;
  }
};

const draw = () => {
  if (!canvas.value || !context.value) return;

  const { width: cw, height: ch } = canvas.value;
  const dpr = window.devicePixelRatio;

  context.value.clearRect(0, 0, cw, ch);
  context.value.strokeStyle = $colors.foreground;
  context.value.strokeRect(0, 0, cw, ch);

  for (let i = 0; i < values.length; ++i) {
    context.value.strokeRect(
      Math.floor(segmentWidth.value * dpr * i) + 0.5,
      ch,
      Math.floor(segmentWidth.value * dpr),
      Math.floor(-values[i] * ch) + 0.5,
    );
  }
};

useRedrawOnColorschemeChange(draw);

const resize = () => {
  if (!canvas.value || !context.value) return;
  const dpr = window.devicePixelRatio;

  canvas.value.width = size * dpr;
  canvas.value.height = size * dpr;
  canvas.value.style.width = `${size}px`;
  canvas.value.style.height = `${size}px`;

  context.value.lineWidth = 1 * dpr;
  context.value.lineCap = "round";

  requestAnimationFrame(draw);
};

const updateValue = (e: PointerEvent) => {
  if (!canvas.value) return;

  const rect = canvas.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const segment = Math.floor(x / segmentWidth.value);
  if (segment > segments - 1 || segment < 0 || y > size || y < 0) return;

  const yValue = 1 - y / size;
  const q = 1 / 127;
  const value = Math.round(yValue / q) * q;
  const cc = Math.round(value * 127);

  values[segment] = cc / 127;

  requestAnimationFrame(draw);

  ccValues[100 + segment] = cc;
};

const down = () => {
  document.addEventListener("pointerup", up);
  document.addEventListener("pointermove", move);
};

const up = (e: PointerEvent) => {
  updateValue(e);
  document.removeEventListener("pointerup", up);
  document.removeEventListener("pointermove", move);

  store.dispatch("setCCValues", {
    values: ccValues,
    channel: store.state.channel,
  });
};

const move = (e: PointerEvent) => {
  updateValue(e);
};

watchEffect(() => {
  const unsubscribe = store.subscribe((mutation) => {
    let redraw = false;
    if (mutation.type === "SET_CC_VALUE") {
      const { cc, value } = mutation.payload;
      if (cc > 99 && cc < 100 + segments && ccValues[cc] !== value) {
        ccValues[cc] = value;
        values[100 - cc] = value / 127;
        redraw = true;
      }
    } else if (mutation.type === "SET_STATE") {
      redraw = true;
      updateFromStore();
    }

    if (redraw) {
      draw();
    }
  });

  onBeforeUnmount(() => {
    unsubscribe();
  });
});

onMounted(() => {
  if (canvas.value) {
    context.value = canvas.value.getContext("2d");
    resize();
    canvas.value.addEventListener("pointerdown", down);
  }
});

onBeforeUnmount(() => {
  if (canvas.value) {
    canvas.value.removeEventListener("pointerdown", down);
  }
  document.removeEventListener("pointerup", up);
  document.removeEventListener("pointermove", move);
});
</script>

<style scoped>
canvas {
  margin-top: 8px;
  touch-action: none;
}
</style>
