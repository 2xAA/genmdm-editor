import { reactive } from "vue";
import { createStore } from "vuex";

import vuejsStorage from "vuejs-storage";
import genmdmMapping from "../genmdm-mapping";

function sleep(milliseconds = 0) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

const GLOBAL_CC = [1, 74, 78, 79, 80, 81, 83, 84, 85, 86, 88, 89];
const NUM_CHANNELS = 6;

function createBlankPatchesArray() {
  return [...new Array(128).keys()].map(() => ({ name: "" })); // we don't define the data key here until we have data
}

function createDefaultState() {
  const defaultState = {
    patches: createBlankPatchesArray(),

    polyphonic: false,
    maxPolyphonicChannels: 6,
    channel: 1,
    instrumentIndex: 0,
    mdmiCompatibility: false,

    midiInputId: "none",
    midiOutputId: "none",
  };

  const mappedCCNumbers = Object.keys(genmdmMapping);

  for (let i = 0; i < NUM_CHANNELS; ++i) {
    defaultState[`channel${i + 1}`] = {};

    mappedCCNumbers.forEach((key) => {
      defaultState[`channel${i + 1}`][key] = genmdmMapping[key].default || 0;
    });
  }

  return defaultState;
}

const state = createDefaultState();

const store = createStore({
  state,

  plugins: [
    vuejsStorage({
      keys: Object.keys(state),
      //keep state.count in localStorage
      namespace: "genmdm_autosave",
    }),
  ],

  actions: {
    setCCValues({ commit, state }, { values, ignoreSameValues = true }) {
      const keys = Object.keys(values);

      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const cc = parseInt(key, 10);

        const value = values[cc];
        const isGlobal = GLOBAL_CC.indexOf(cc) > -1;

        if (
          (state.polyphonic && state.channel <= state.maxPolyphonicChannels) ||
          isGlobal
        ) {
          const affectedChannels = isGlobal ? 6 : state.maxPolyphonicChannels;

          for (let j = 1; j <= affectedChannels; ++j) {
            if (state[`channel${j}`][cc] === value) {
              continue;
            }

            commit("SET_CC_VALUE", { cc, value, channel: j });
          }
        } else {
          if (
            ignoreSameValues &&
            state[`channel${state.channel}`][cc] === value
          ) {
            continue;
          }

          commit("SET_CC_VALUE", { cc, value, channel: state.channel });
        }
      }
    },

    setCCValuesOnChannel({ commit, state }, values = {}) {
      const keys = Object.keys(values);

      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];

        if (isNaN(parseInt(key, 10))) {
          continue;
        }
        const cc = parseInt(key, 10);

        const value = values[cc];
        const isGlobal = GLOBAL_CC.indexOf(cc) > -1;

        if (
          (state.polyphonic && values.channel <= state.maxPolyphonicChannels) ||
          isGlobal
        ) {
          const affectedChannels = isGlobal ? 6 : state.maxPolyphonicChannels;

          for (let j = 1; j <= affectedChannels; ++j) {
            if (state[`channel${j}`][cc] === value) {
              continue;
            }

            commit("SET_CC_VALUE", { cc, value, channel: j });
          }
        } else {
          if (state[`channel${values.channel}`][cc] === value) {
            continue;
          }

          commit("SET_CC_VALUE", {
            cc,
            value,
            channel: values.channel,
            ignoreSameValues: values.ignoreSameValues,
          });
        }
      }
    },

    setChannel({ commit }, channel) {
      commit("SET_CHANNEL", channel);
    },

    setPolyphony({ commit }, value) {
      commit("SET_POLYPHONY", value);
    },

    setMaxPolyphonicChannels({ commit }, value) {
      commit("SET_MAX_POLYPHONIC_CHANNELS", value);
    },

    async setPatches({ commit, dispatch }, patches = []) {
      commit("CLEAR_PATCHES");

      for (let i = 0; i < patches.length; i += 1) {
        await dispatch("writePatch", { index: i, patch: patches[i] });
      }
    },

    setPatchName({ commit }, { index, name }) {
      commit("SET_PATCH_NAME", { index, name });
    },

    writePatch({ commit }, { index, patch }) {
      if (index > 127) {
        throw new Error("Slot index is > 127. 128 slots available only.");
      }

      commit("WRITE_TO_SLOT", { index, patch });
    },

    setInstrumentIndex({ commit }, index) {
      commit("SET_INSTRUMENT_INDEX", index);
    },

    async sendState({ commit, state }) {
      const originalChannel = state.channel;

      for (let i = 0; i < NUM_CHANNELS; ++i) {
        const channelKey = `channel${i + 1}`;
        const channel = state[channelKey];
        const channelEntries = Object.entries(channel);

        commit("SET_CHANNEL", i + 1);

        for (let j = 0; j < channelEntries.length; ++j) {
          const [cc, value] = channelEntries[j];
          // throttle to avoid webmidi spamming the port
          await sleep(0);
          commit("SET_CC_VALUE", { cc: Number(cc), value, channel: i + 1 });
        }
      }

      commit("SET_CHANNEL", originalChannel);
    },

    // channel = 0         - don't reset channel data
    // channel = 1-6       - reset defined channel
    // channel = 7         - reset all channels
    resetState(
      { commit, dispatch },
      { channel = undefined, resetEditor = false, resetPatches = false } = {},
    ) {
      const defaultState = createDefaultState();
      const newState = reactive({
        midiInputId: state.midiInputId,
        midiOutputId: state.midiOutputId,
      });

      let syncWithDevice = false;

      if (channel === 7) {
        syncWithDevice = true;

        newState.channel1 = defaultState.channel1;
        newState.channel2 = defaultState.channel2;
        newState.channel3 = defaultState.channel3;
        newState.channel4 = defaultState.channel4;
        newState.channel5 = defaultState.channel5;
        newState.channel6 = defaultState.channel6;
      }

      if (channel > 0 && channel < 7) {
        syncWithDevice = true;

        newState[`channel${channel}`] = defaultState[`channel${channel}`];
      }

      if (resetEditor) {
        newState.polyphonic = defaultState.polyphonic;
        newState.maxPolyphonicChannels = defaultState.maxPolyphonicChannels;
        newState.channel = defaultState.channel;
        newState.instrumentIndex = defaultState.instrumentIndex;
        newState.mdmiCompatibility = defaultState.mdmiCompatibility;
      }

      if (resetPatches) {
        newState.patches = defaultState.patches;
      }

      commit("SET_STATE", newState);

      if (syncWithDevice) {
        return dispatch("sendState");
      }
    },
  },

  mutations: {
    SET_STATE(state, newState) {
      const newStateCopy = {
        ...newState,
        midiInputId: state.midiInputId,
        midiOutputId: state.midiOutputId,
      };

      Object.assign(state, newStateCopy);
    },

    SET_CC_VALUE(state, { cc, value, channel }) {
      state[`channel${channel}`][cc] = value;
    },

    SET_CHANNEL(state, channel) {
      state.channel = channel;
    },

    SET_POLYPHONY(state, value) {
      state.polyphonic = value;
    },

    SET_MAX_POLYPHONIC_CHANNELS(state, value) {
      state.maxPolyphonicChannels = value;
    },

    CLEAR_PATCHES(state) {
      state.patches = createBlankPatchesArray();
    },

    SET_PATCH_NAME(state, { index, name }) {
      state.patches[index].name = name;
    },

    WRITE_TO_SLOT(state, { index, patch }) {
      state.patches[index].name = patch.name;
      state.patches[index].data = patch.data;
    },

    SET_INSTRUMENT_INDEX(state, index) {
      state.instrumentIndex = index;
    },

    SET_MDMICOMPATIBILITY(state, value) {
      state.mdmiCompatibility = value;
    },

    SET_MIDI_INPUT_ID(state, value) {
      state.midiInputId = value;
    },

    SET_MIDI_OUTPUT_ID(state, value) {
      state.midiOutputId = value;
    },
  },
});

export default store;
