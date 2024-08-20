<template>
  <label class="button">
    <input id="input" type="file" accept=".ged" @change="fileAdded" />
  </label>
</template>

<script>
import { decompress } from "compress-json";
import { createDefaultState, MIDIChannelVoiceMode } from "../store";

export default {
  methods: {
    fileAdded(e) {
      const {
        files: { 0: file },
      } = e.target;

      const reader = new FileReader();
      reader.onload = () => {
        const newState = decompress(JSON.parse(reader.result));
        const defaultState = createDefaultState();

        // To account for old state saves.
        // Handle old polyphony settings.
        if (newState.polyphonic) {
          newState.channelConfiguration = [
            ...defaultState.channelConfiguration,
          ];

          newState.channelConfiguration.splice(
            0,
            newState.maxPolyphonicChannels,
          );

          for (let i = 0; i < newState.maxPolyphonicChannels || 0; i++) {
            newState.channelConfiguration.unshift({
              mode: MIDIChannelVoiceMode.POLYPHONIC,
              group: 0,
            });
          }

          delete newState.polyphonic;
          delete newState.maxPolyphonicChannels;
        }

        // Also to account for old state saves.
        // Not a problem with GenMDM, but new MDMI features somtimes require
        // new CC values.
        for (let i = 0; i < 6; i += 1) {
          newState[`channel${i + 1}`] = {
            ...defaultState[`channel${i + 1}`],
            ...newState[`channel${i + 1}`],
          };
        }

        this.$store.commit("SET_STATE", newState);
        e.target.value = "";
      };

      try {
        reader.readAsText(file);
      } catch (e) {
        console.log("Can't read file", e);
      }
    },
  },
};
</script>

<style scoped>
input {
  display: none;
}

label::before {
  content: "Load State";
}
</style>
