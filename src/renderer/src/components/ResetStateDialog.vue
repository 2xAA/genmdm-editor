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

<script>
import VDialog from "./Dialog.vue";
import DraggableSelect from "./DraggableSelect.vue";

export default {
  components: {
    VDialog,
    DraggableSelect,
  },
  props: ["show"],

  emits: ["close"],

  data() {
    return {
      resetDisabled: false,
      channel: 0,
      resetEditor: 0,
      resetPatches: 0,
    };
  },

  methods: {
    async resetState() {
      this.resetDisabled = true;
      const { channel, resetEditor, resetPatches } = this;

      await this.$store.dispatch("resetState", {
        channel,
        resetEditor,
        resetPatches,
      });

      this.resetDisabled = false;
    },
  },
};
</script>

<style>
.reset-state-dialog-text {
  color: var(--foreground-color);
  grid-gap: 25px;
}
</style>
