<template>
  <Dialog
    :size="[380, 320]"
    :show="show"
    @close="$emit('close')"
    :closeDisabled="resetDisabled"
  >
    <grid columns="3" class="reset-state-dialog-text">
      <c span="3"><h2>Reset State</h2></c>
      <c span="3">
        <grid columns="2" class="control-group">
          <c class="control-group__label">Channel</c>
          <c class="control-group__control">
            <DraggableSelect
              :values="[0, 1, 2, 3, 4, 5, 6, 7]"
              :emitArrayValue="true"
              :default="0"
              :labels="['None', '1', '2', '3', '4', '5', '6', 'All']"
              v-model="channel"
            />
          </c>
          <c class="control-group__label">Reset Editor Settings</c>
          <c class="control-group__control">
            <DraggableSelect
              :values="[0, 1]"
              :emitArrayValue="true"
              :default="0"
              :labels="['No', 'Yes']"
              v-model="resetEditor"
            />
          </c>
          <c class="control-group__label">Reset Patches</c>
          <c class="control-group__control">
            <DraggableSelect
              :values="[0, 1]"
              :emitArrayValue="true"
              :default="0"
              :labels="['No', 'Yes']"
              v-model="resetPatches"
            />
          </c>
        </grid>
      </c>
      <c span="2+1">
        <button class="button" @click="resetState" :disabled="resetDisabled">
          RESET
        </button>
      </c>
    </grid>
  </Dialog>
</template>

<script>
import Dialog from "./Dialog";
import DraggableSelect from "./DraggableSelect";

export default {
  props: ["show"],

  components: {
    Dialog,
    DraggableSelect
  },

  data() {
    return {
      resetDisabled: false,
      channel: 0,
      resetEditor: 0,
      resetPatches: 0
    };
  },

  methods: {
    async resetState() {
      this.resetDisabled = true;
      const { channel, resetEditor, resetPatches } = this;

      await this.$store.dispatch("resetState", {
        channel,
        resetEditor,
        resetPatches
      });

      this.resetDisabled = false;
    }
  }
};
</script>

<style>
.reset-state-dialog-text {
  color: var(--foreground-color);
  grid-gap: 25px;
}
</style>
