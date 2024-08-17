<template>
  <label :class="{ disabled }" :title="title">
    {{ currentLabel }}
    <input
      type="checkbox"
      :value="checked"
      :disabled="disabled"
      @change="onChange"
    />
  </label>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted } from "vue";
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: [Number, Boolean],
  },
  labels: {
    type: Array,
    default: () => [],
  },
  emitBoolean: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const value = ref(0);

const checked = computed(() => value.value > 63);

const currentLabel = computed(() => props.labels[checked.value ? 1 : 0]);

watch(
  () => props.modelValue,
  (newValue) => {
    if (props.emitBoolean) {
      value.value = !newValue ? 0 : 127;
    } else {
      value.value = newValue;
    }
  },
);

watch(value, (newValue) => {
  emit("update:modelValue", props.emitBoolean ? !!newValue : newValue);
});

onMounted(() => {
  if (props.emitBoolean) {
    value.value = !props.modelValue ? 0 : 127;
  } else {
    value.value = props.modelValue;
  }
});

const onChange = () => {
  value.value = value.value > 63 ? 0 : 127;
};
</script>

<style scoped>
input {
  display: none;
}

label {
  width: 100%;
  height: 100%;
  user-select: none;

  display: flex;
  justify-content: center;
  align-items: center;
}

label:active:not(.disabled) {
  background: var(--foreground-color);
  color: var(--background-color);
  font-weight: bold;
}

label.disabled {
  text-decoration: line-through;
  cursor: not-allowed;
  color: light-dark(rgb(128, 128, 128), rgb(170, 170, 170));
}
</style>
