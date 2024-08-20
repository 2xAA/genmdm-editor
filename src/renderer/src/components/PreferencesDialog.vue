<template>
  <VDialog :size="[840, 420]" :show="show" @close="$emit('close')">
    <grid columns="6">
      <c span="6"><h2>Preferences</h2></c>
    </grid>

    <grid columns="6" class="control-group">
      <c span="2" class="control-group__label">Theme</c>
      <c span="4" class="control-group__control">
        <label>
          <input v-model="theme" type="radio" name="theme" value="auto" />
          Auto</label
        ><br />
        <label>
          <input v-model="theme" type="radio" name="theme" value="light" />
          Light</label
        ><br />
        <label>
          <input v-model="theme" type="radio" name="theme" value="dark" />
          Dark
        </label>
      </c>

      <c span="2" class="control-group__label">Visual Effects</c>
      <c span="4" class="control-group__control">
        <label>
          <input v-model="backgroundImage" type="checkbox" />Background
          Image</label
        ><br />
        <label><input v-model="rotation" type="checkbox" />Rotation</label>
      </c>

      <c span="2" class="control-group__label">Haptics (macOS only)</c>
      <c span="4" class="control-group__control">
        <label><input v-model="haptics" type="checkbox" />Enabled</label>
      </c>

      <c span="2" class="control-group__label">Musical Typing</c>
      <c span="4" class="control-group__control">
        <label><input v-model="musicalTyping" type="checkbox" />Enabled</label>
      </c>

      <c span="2" class="control-group__label">MIDI</c>
      <c span="4" class="control-group__control">
        <label>
          <input v-model="programChangeLoadsIntoGroup" type="checkbox" />
          Program Change loads patch into all channels in group
        </label>
      </c>

      <c span="2" class="control-group__label">Patch Import Behaviour</c>
      <c span="4" class="control-group__control">
        <label>
          <input
            v-model="patchImportBehaviour"
            type="radio"
            name="patch-import"
            value="editor"
          />
          Import into Editor (overwrites current sound and sends to
          console)</label
        ><br />
        <label>
          <input
            v-model="patchImportBehaviour"
            type="radio"
            name="patch-import"
            value="patchlist"
          />
          Import into Patch List (writes to selected slot)</label
        ><br />
        <label>
          <input
            v-model="patchImportBehaviour"
            type="radio"
            name="patch-import"
            value="patchlist-editor"
          />
          Import into Patch List and Editor
        </label>
      </c>
    </grid>
  </VDialog>
</template>

<script>
import VDialog from "./Dialog.vue";

export default {
  components: {
    VDialog,
  },

  props: ["show"],

  emits: ["close"],

  computed: {
    theme: {
      get() {
        return this.$store.state.theme;
      },
      set(value) {
        this.$store.commit("SET_THEME", value);
      },
    },

    backgroundImage: {
      get() {
        return this.$store.state.backgroundImage;
      },
      set(value) {
        this.$store.commit("SET_BACKGROUNDIMAGE", value);
      },
    },

    rotation: {
      get() {
        return this.$store.state.rotation;
      },
      set(value) {
        this.$store.commit("SET_ROTATION", value);
      },
    },

    haptics: {
      get() {
        return this.$store.state.haptics;
      },
      set(value) {
        this.$store.commit("SET_HAPTICS", value);
      },
    },

    musicalTyping: {
      get() {
        return this.$store.state.musicalTyping;
      },

      set(value) {
        this.$store.commit("SET_MUSICALTYPING", value);
      },
    },

    programChangeLoadsIntoGroup: {
      get() {
        return this.$store.state.programChangeLoadsIntoGroup;
      },

      set(value) {
        this.$store.commit("SET_PROGRAMCHANGELOADSINTOGROUP", value);
      },
    },

    patchImportBehaviour: {
      get() {
        return this.$store.state.patchImportBehaviour.join("-");
      },

      set(value) {
        this.$store.commit("SET_PATCHIMPORTBEHAVIOUR", value);
      },
    },
  },
};
</script>

<style scoped>
.control-group c {
  padding: 0.5em;
}

c {
  height: -webkit-fill-available;
}

.reset-state-dialog-text {
  color: var(--foreground-color);
  grid-gap: 25px;
}
</style>
