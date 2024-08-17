<template>
  <div class="mdm-control">
    <template v-if="type !== 'bool'">
      <DraggableSelect
        v-if="enumValues && dataValues"
        v-model.number="value"
        :values="dataValues"
        :emit-array-value="true"
        :default="defaultValue"
        :labels="enumValues"
      />
      <DraggableSelect
        v-else-if="enumValues"
        v-model.number="value"
        :values="rangeValues"
        :default="defaultValue"
        :labels="enumValues"
      />
      <DraggableSelect
        v-else-if="range > 0"
        v-model.number="value"
        :values="rangeValues"
        :default="defaultValue"
      />
    </template>

    <LabelledCheckbox v-else v-model.number="value" :labels="enumValues" />
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, onMounted } from "vue";
import { useStore } from "@renderer/store";
import DraggableSelect from "./DraggableSelect.vue";
import LabelledCheckbox from "./LabelledCheckbox.vue";

const props = defineProps<{
  channel: number;
  cc: number;
}>();

const store = useStore();

const value = computed({
  get: () => store.state[`channel${props.channel}`][props.cc],
  set: (value: number) => {
    const values: Record<number, number> = {};

    if (type.value === "bool") {
      values[props.cc] = value ? 127 : 0;
    } else {
      values[props.cc] = value;
    }

    store.dispatch("setCCValues", {
      values,
      channel: props.channel,
    });
  },
});

const mapping = computed(() => store.getters.mapping[props.cc]);
const type = computed(() => mapping.value.type || "int");
const range = computed(() => mapping.value.range || 0);
const enumValues = computed(() => mapping.value.enum);
const dataValues = computed(() => mapping.value.values);
const defaultValue = computed(() => mapping.value.default);

const rangeValues = computed(() => {
  let values: number[] = [];

  if (dataValues.value) {
    values = dataValues.value;
  } else {
    for (let i = 0; i < range.value; ++i) {
      values.push(i);
    }
  }

  return values;
});

onMounted(() => {
  if (!mapping.value) {
    throw new Error(`CC mapping doesn't exist for ${props.cc}`);
  }
});
</script>

<style scoped>
.mdm-control {
  width: 100%;
  height: 100%;
}
</style>
