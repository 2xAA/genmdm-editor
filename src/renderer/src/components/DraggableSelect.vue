<template>
  <div
    ref="draggableSelectBody"
    class="draggable-select ns-resize-cursor"
    :class="{ active: mouseButtonDown, disabled }"
    @pointerdown="requestPointerLock"
    @pointerup="exitPointerLock"
    @contextmenu.prevent
  >
    <select
      ref="labelSelect"
      v-model="selectValue"
      class="select"
      :disabled="disabled"
      @touchstart.prevent
      @touchmove.prevent
      @touchend.prevent
      @touchcancel.prevent
    >
      <option
        v-for="[key, selectValue_value] in selectValues"
        :key="key"
        :value="key"
        :disabled="disabledItems.length && disabledItems[key + 1]"
      >
        {{ selectValue_value }}
      </option>
    </select>
  </div>
</template>

<script lang="ts" setup>
import { inject } from "vue";
import { ref, computed, watch } from "vue";

interface PointerPosition {
  x: number;
  y: number;
}

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  disabledItems: {
    type: Array as () => number[],
    required: false,
    default: () => [],
  },
  values: {
    type: Array as () => number[],
    required: true,
  },
  default: Number,
  labels: {
    type: Array as () => string[],
    default: () => [],
  },
  modelValue: {
    type: Number,
    required: true,
  },
  emitArrayValue: {
    type: Boolean,
  },
});

const emit = defineEmits(["update:modelValue"]);

const internalValue = ref(-1);
const lastCursor = ref<string>("");
const mouseButtonDown = ref(false);
const lastPointerPosition = ref<PointerPosition>({ x: 0, y: 0 });
const lastTimeVibrate = ref<number>(50);

const draggableSelectBody = ref<HTMLDivElement | null>(null);
const labelSelect = ref<HTMLSelectElement | null>(null);

const $electron = inject("$electron");

const selectValues = computed(() => {
  return (props.labels.length ? props.labels : props.values).map(
    (item, index) => [
      props.values[index],
      props.labels.length ? item : props.values[index],
    ],
  );
});

const selectValue = computed({
  get() {
    return props.emitArrayValue
      ? props.modelValue
      : Math.floor(props.modelValue / (128 / props.values.length));
  },
  set(key) {
    setAndEmitValue(props.values.indexOf(key));
  },
});

watch(
  () => props.modelValue,
  (value) => {
    if (!mouseButtonDown.value) {
      internalValue.value = props.emitArrayValue
        ? props.values[value]
        : Math.floor(value / (128 / props.values.length));
    }
  },
);

internalValue.value = props.emitArrayValue
  ? props.modelValue
  : Math.floor(props.modelValue / (128 / props.values.length));

function requestPointerLock(e: PointerEvent) {
  if (
    (e.pointerType === "mouse" && e.button === 2) ||
    e.pointerType !== "mouse"
  ) {
    document.addEventListener("pointerlockchange", lockChangeAlert, false);

    if (draggableSelectBody.value?.requestPointerLock) {
      draggableSelectBody.value.requestPointerLock();
    } else {
      // For browsers without Pointer Lock API
      e.preventDefault();
      document.addEventListener("pointermove", mouseMove, false);
      document.addEventListener("pointerup", mouseUp);
    }

    lastPointerPosition.value.x = e.clientX;
    lastPointerPosition.value.y = e.clientY;
    mouseButtonDown.value = true;
  }
}

function exitPointerLock() {
  if (document.exitPointerLock) {
    document.exitPointerLock();
  }

  document.removeEventListener("pointerlockchange", lockChangeAlert, false);
  mouseButtonDown.value = false;
}

function lockChangeAlert() {
  if (document.pointerLockElement === draggableSelectBody.value) {
    document.addEventListener("pointermove", mouseMove, false);
    document.addEventListener("pointerup", mouseUp);
  } else {
    document.removeEventListener("pointermove", mouseMove, false);
    mouseUp();
  }
}

function mouseUp() {
  document.removeEventListener("pointermove", mouseMove, false);
  document.removeEventListener("pointerup", mouseUp);
  document.body.style.cursor =
    lastCursor.value === "ew-resize" ? "default" : lastCursor.value;
}

function mouseMove(e: MouseEvent) {
  const yDelta = e.movementY || -lastPointerPosition.value.y + e.clientY;

  const newValue = -yDelta + internalValue.value;
  const clampedNewIndex = Math.floor(
    Math.max(0, Math.min(props.values.length - 1, newValue)),
  );

  setAndEmitValue(clampedNewIndex);

  lastPointerPosition.value.x = e.clientX;
  lastPointerPosition.value.y = e.clientY;
}

function setAndEmitValue(value: number) {
  const clampedNewMIDIValue = Math.floor(
    (value / (props.values.length - 1)) * 127,
  );

  if (internalValue.value !== value && !props.disabledItems[value]) {
    internalValue.value = value;
    lastTimeVibrate.value = Date.now();
    // Assuming you have some vibration logic to implement
    $electron.vibrate();

    const emitValue = props.emitArrayValue
      ? props.values[value]
      : clampedNewMIDIValue;
    emit("update:modelValue", emitValue);
  }
}
</script>

<style scoped>
.draggable-select {
  height: 100%;
  overflow: hidden;
}

.draggable-select.active:not(.disabled) {
  background: var(--foreground-color);
  color: var(--background-color);
  font-weight: bold;
}

.draggable-select.disabled select {
  cursor: not-allowed;
  text-decoration: line-through;
  color: light-dark(rgb(128, 128, 128), rgb(170, 170, 170));
}
</style>
