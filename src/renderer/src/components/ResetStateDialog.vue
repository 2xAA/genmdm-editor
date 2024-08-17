<template>
  <VDialog
    :size="[380, 320]"
    :show="show"
    :close-disabled="resetDisabled"
    @close="$emit('close')"
  >
    <grid columns="3" class="reset-state-dialog-text">
      <c span="3"><h2>Reset State</h2></c>
      <c span="3">
        <grid columns="8" class="control-group">
          <c span="6" class="control-group__label">Channel</c>
          <c span="2" class="control-group__control">
            <DraggableSelect
              v-model="channel"
              :values="[0, 1, 2, 3, 4, 5, 6, 7]"
              :emit-array-value="true"
              :default="0"
              :labels="['None', '1', '2', '3', '4', '5', '6', 'All']"
            />
          </c>
          <c span="6" class="control-group__label">Reset Editor Settings</c>
          <c span="2" class="control-group__control">
            <DraggableSelect
              v-model="resetEditor"
              :values="[0, 1]"
              :emit-array-value="true"
              :default="0"
              :labels="['No', 'Yes']"
            />
          </c>
          <c span="6" class="control-group__label">Reset Patches</c>
          <c span="2" class="control-group__control">
            <DraggableSelect
              v-model="resetPatches"
              :values="[0, 1]"
              :emit-array-value="true"
              :default="0"
              :labels="['No', 'Yes']"
            />
          </c>
        </grid>
      </c>
      <c span="2+1">
        <button class="button" :disabled="resetDisabled" @click="resetState">
          RESET
        </button>
      </c>
    </grid>
  </VDialog>
</template>

<script lang="ts" setup>
import { ref, defineProps } from "vue";
import { useStore } from "@renderer/store";
import VDialog from "./Dialog.vue";
import DraggableSelect from "./DraggableSelect.vue";

const store = useStore();

const show = defineProps<{ show: boolean }>().show;
const resetDisabled = ref(false);
const channel = ref(0);
const resetEditor = ref(0);
const resetPatches = ref(0);

const resetState = async () => {
  resetDisabled.value = true;

  await store.dispatch("resetState", {
    channel: channel.value,
    resetEditor: resetEditor.value,
    resetPatches: resetPatches.value,
  });

  resetDisabled.value = false;
};
</script>

<style scoped>
.reset-state-dialog-text {
  color: var(--foreground-color);
  grid-gap: 25px;
}
</style>
