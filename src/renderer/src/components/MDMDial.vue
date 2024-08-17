<template>
  <div class="dial" :class="{ disabled }">
    <canvas
      ref="canvas"
      :title="title"
      class="ns-resize-cursor"
      :class="{ disabled }"
      @contextmenu.prevent
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

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, inject } from "vue";
import { useStore } from "@renderer/store";
import { HighResCanvasRenderingContext2D } from "@vcync/hires-canvas2d";
import { useRedrawOnColorschemeChange } from "./composables/redraw-on-colorscheme-change";

// Props
const props = defineProps<{
  cc: number;
  ccOffset?: number;
  channel: number;
  size?: number;
  quantise?: number;
  inverse?: boolean;
  range: number;
  title?: string;
  disabled?: boolean;
}>();

const store = useStore();
const $colors = inject("$colors");
const $electron = inject("$electron");

const canvas = ref<HTMLCanvasElement | null>(null);
const context2d = ref<HighResCanvasRenderingContext2D | null>(null);
const movementValue = ref(0);
const mouseButtonDown = ref(false);
const lastPointerPosition = ref({ x: -1, y: -1 });
const lastTimeVibrate = ref(100);
let mouseMoveRaf: number | null = null;

const internalValue = computed(() => {
  let value = movementValue.value / 127;
  if (props.quantise && props.quantise > -1) {
    const q = Math.floor((1 / (props.quantise - 1)) * 1000) / 1000;
    value = Math.round(value / q) * q;
  }
  return value;
});

const scaledValue = computed(() => {
  return Math.floor((internalValue.value * 127) / (128 / props.range));
});

const updateFromStore = () => {
  const value =
    store.state[`channel${props.channel}`][props.cc + (props.ccOffset ?? 0)];
  setMovementValue(value);
};

const setMovementValue = (value: number) => {
  movementValue.value = props.inverse ? -value + 127 : value;
  draw();
};

const resize = () => {
  if (!canvas.value || !context2d.value) return;

  const dpr = window.devicePixelRatio;
  context2d.value.dpr = dpr;

  canvas.value.width = (props.size ?? 60) * dpr;
  canvas.value.height = (props.size ?? 60) * dpr;
  canvas.value.style.width = `${props.size ?? 60}px`;
  canvas.value.style.height = `${props.size ?? 60}px`;

  context2d.value.lineWidth = 1 * dpr;
  context2d.value.lineCap = "round";
};

const draw = () => {
  if (!canvas.value || !context2d.value) return;

  const { size = 60, range } = props;
  const context = context2d.value;

  requestAnimationFrame(() => {
    context.clearRect(0, 0, size, size);
    context.strokeStyle = props.disabled ? "gray" : $colors?.foreground;

    context.fillStyle = mouseButtonDown.value
      ? $colors?.foreground
      : "transparent";

    context.beginPath();
    context.arc(size / 2, size / 2, (size - 6) / 2 - 2, 0, Math.PI * 2);
    context.stroke();
    context.fill();

    context.strokeStyle = props.disabled ? "gray" : $colors?.foreground;

    if (range > 0) {
      for (let i = 0; i < range; ++i) {
        context.save();
        context.lineWidth =
          window.devicePixelRatio > 1 ? 1 / (window.devicePixelRatio - 1.4) : 1;
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
    context.rotate(internalValue.value * 270 * (Math.PI / 180));
    context.translate(-size / 2, -size / 2);

    context.strokeStyle = props.disabled
      ? "gray"
      : mouseButtonDown.value
        ? $colors?.background
        : $colors?.foreground;

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
};

useRedrawOnColorschemeChange(draw);

const requestPointerLock = (e: PointerEvent) => {
  if (props.disabled) return;

  document.addEventListener("pointerlockchange", lockChangeAlert, false);

  if (canvas.value?.requestPointerLock) {
    canvas.value.requestPointerLock();
  } else {
    e.preventDefault();
    document.addEventListener("pointermove", mouseMove, false);
    document.addEventListener("pointerup", mouseUp);
  }

  mouseButtonDown.value = true;
  draw();
};

const exitPointerLock = () => {
  if (document.exitPointerLock) {
    document.exitPointerLock();
  }

  document.removeEventListener("pointerlockchange", lockChangeAlert, false);
};

const lockChangeAlert = () => {
  if (document.pointerLockElement === canvas.value) {
    document.addEventListener("pointermove", mouseMove, false);
    document.addEventListener("pointerup", mouseUp);
  } else {
    document.removeEventListener("pointermove", mouseMove, false);
    mouseUp();
  }
};

const mouseUp = () => {
  document.removeEventListener("pointermove", mouseMove, false);
  document.removeEventListener("pointerup", mouseUp);
  document.body.style.cursor =
    lastPointerPosition.value.x === -1
      ? "default"
      : lastPointerPosition.value.x.toString();
  mouseButtonDown.value = false;
  draw();
  lastPointerPosition.value = { x: -1, y: -1 };
};

const mouseMove = (e: PointerEvent) => {
  const firstTouch = lastPointerPosition.value.x < 0;
  if (firstTouch) {
    lastPointerPosition.value.x = e.clientX + movementValue.value;
    lastPointerPosition.value.y = e.clientY + movementValue.value;
  }

  const yDelta = e.movementY || -lastPointerPosition.value.y + e.clientY;

  lastPointerPosition.value.x = e.clientX;
  lastPointerPosition.value.y = e.clientY;

  const lastValue = internalValue.value;
  const newValue =
    (firstTouch && yDelta !== 0 ? 0 : -yDelta) + movementValue.value;
  const clampedNewValue = Math.max(0, Math.min(127, newValue));

  if (mouseMoveRaf) {
    cancelAnimationFrame(mouseMoveRaf);
  }

  mouseMoveRaf = requestAnimationFrame(() => {
    movementValue.value = clampedNewValue;
    if (internalValue.value !== lastValue) {
      draw();
    }

    if (internalValue.value !== lastValue && lastTimeVibrate.value > 10) {
      lastTimeVibrate.value = Date.now();
      $electron.vibrate();
    }

    if (internalValue.value !== lastValue) {
      store.dispatch("setCCValues", {
        channel: props.channel,
        values: {
          [props.cc + (props.ccOffset ?? 0)]: props.inverse
            ? 127 - internalValue.value * 127
            : internalValue.value * 127,
        },
      });
    }
    mouseMoveRaf = null;
  });
};

watch(
  () => store.state.channel[props.cc + (props.ccOffset ?? 0)],
  () => {
    updateFromStore();
  },
);

watch(
  () => props.disabled,
  () => {
    draw();
  },
);

onMounted(() => {
  const ctx = canvas.value?.getContext("2d");
  if (ctx) {
    context2d.value = new HighResCanvasRenderingContext2D(
      ctx,
      window.devicePixelRatio,
    );
    resize();
    draw();
  }

  updateFromStore();
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerup", mouseUp);
  document.removeEventListener("pointermove", mouseMove);
  document.body.classList.remove("ns-resize-cursor");
});
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
