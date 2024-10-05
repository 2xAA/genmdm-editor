import { reactive } from "vue";
import { createStore } from "vuex";

import vuejsStorage from "vuejs-storage";
import genmdmMapping from "../genmdm-mapping";
import mdmiMapping from "../mdmi-mapping";

function sleep(milliseconds = 0) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

const GLOBAL_CC = [1, 74, 78, 79, 80, 81, 83, 84, /*85, */ 86, 88, 89];
const NUM_CHANNELS = 6;

/**
 * @typedef {object} GenMDMPatch
 * @prop {string} name
 * @prop {object} [data]
 */

/**
 * @returns {GenMDMPatch[]}
 */
function createBlankPatchesArray() {
  return [...new Array(128).keys()].map(() => ({ name: "" })); // we don't define the data key here until we have data
}

/**
 * @readonly
 * @enum {number}
 */
export const MIDIChannelVoiceMode = {
  MONOPHONIC: 0,
  POLYPHONIC: 1,
  UNISON: 2,
};

/**
 * @typedef MIDIChannelConfiguration
 * @prop {MIDIChannelVoiceMode} mode The voice mode of the channel
 * @prop {number} group Number from -1 to 2. -1 signals the channel is
 *                      ungrouped, only applicable in the case of
 *                      MIDIChannelVoiceMode.MONOPHONIC.
 * @prop {number} transpose Number from 0 to 48. (-24 + transpose) to find
 *                          semitones to transpose by.
 */

/**
 * @typedef MIDIChannelAftertouchMapping
 * @prop {number[]} ccs
 */

/**
 * @typedef {object} GenMDMEditorState
 * @prop {GenMDMPatch[]} patches
 * @prop {number} channel
 * @prop {MIDIChannelConfiguration[]} channelConfiguration
 * @prop {number} instrumentIndex
 * @prop {boolean} mdmiCompatibility
 * @prop {import("../genmdm-mapping").GenMDMMapping} [channel1]
 * @prop {import("../genmdm-mapping").GenMDMMapping} [channel2]
 * @prop {import("../genmdm-mapping").GenMDMMapping} [channel3]
 * @prop {import("../genmdm-mapping").GenMDMMapping} [channel4]
 * @prop {import("../genmdm-mapping").GenMDMMapping} [channel5]
 * @prop {import("../genmdm-mapping").GenMDMMapping} [channel6]
 * @prop {boolean} showAboutDialog
 * @prop {string} midiInputId
 * @prop {string} midiOutputId
 * @prop {string} theme
 * @prop {boolean} backgroundImage
 * @prop {boolean} rotation
 * @prop {boolean} haptics
 * @prop {boolean} tooltips
 * @prop {boolean} musicalTyping
 * @prop {boolean} programChangePassthrough
 * @prop {boolean} programChangeLoadsIntoGroup
 * @prop {string[]} patchImportBehaviour
 * @prop {string} aftertouchType
 * @prop {MIDIChannelAftertouchMapping[]} aftertouchMapping
 */

/**
 * @returns {GenMDMEditorState}
 */
export function createDefaultState() {
  const defaultState = {
    patches: createBlankPatchesArray(),

    channel: 1,
    channelConfiguration: [
      { mode: MIDIChannelVoiceMode.MONOPHONIC, group: -1, transpose: 0 },
      { mode: MIDIChannelVoiceMode.MONOPHONIC, group: -1, transpose: 0 },
      { mode: MIDIChannelVoiceMode.MONOPHONIC, group: -1, transpose: 0 },
      { mode: MIDIChannelVoiceMode.MONOPHONIC, group: -1, transpose: 0 },
      { mode: MIDIChannelVoiceMode.MONOPHONIC, group: -1, transpose: 0 },
      { mode: MIDIChannelVoiceMode.MONOPHONIC, group: -1, transpose: 0 },
    ],
    instrumentIndex: 0,
    mdmiCompatibility: false,
    showAboutDialog: true,
    ...createDefaultChannelState(),

    midiInputId: "none",
    midiOutputId: "none",

    theme: "auto",
    backgroundImage: true,
    rotation: true,
    haptics: true,
    tooltips: true,
    musicalTyping: false,
    programChangePassthrough: false,
    programChangeLoadsIntoGroup: true,
    patchImportBehaviour: ["editor"],
    aftertouchType: "channel", // "key", "both"
    aftertouchMapping: [
      { ccs: [] },
      { ccs: [] },
      { ccs: [] },
      { ccs: [] },
      { ccs: [] },
      { ccs: [] },
    ],
  };

  return defaultState;
}

export function createDefaultChannelState() {
  const mapping = { ...mdmiMapping, ...genmdmMapping };
  const channels = {};
  const mappedCCNumbers = Object.keys(mapping);

  for (let i = 0; i < NUM_CHANNELS; ++i) {
    channels[`channel${i + 1}`] = {};

    mappedCCNumbers.forEach((key) => {
      channels[`channel${i + 1}`][key] = mapping[key].default || 0;
    });
  }

  return channels;
}

const state = createDefaultState();

const store = createStore({
  state,

  plugins: [
    vuejsStorage({
      keys: Object.keys(state),
      namespace: "genmdm_autosave",
    }),
  ],

  getters: {
    channelsByGroup: (state) =>
      state.channelConfiguration.reduce(
        (groups, { group, mode }, channelIndex) => {
          if (group > -1 && !groups[group]) {
            groups[group] = [mode, channelIndex + 1];
          } else if (group > -1 && groups[group]) {
            groups[group].push(channelIndex + 1);
          }

          return groups;
        },
        {},
      ),

    groupedChannelsFromChannel: (state) => (channelIndex) => {
      if (channelIndex < 0 || channelIndex > 5) {
        return [];
      }

      const { group: channelGroup } = state.channelConfiguration[channelIndex];

      if (channelGroup > -1) {
        return state.channelConfiguration
          .map((item, index) => ({ ...item, channel: index + 1 }))
          .filter(({ group }) => group === channelGroup)
          .map(({ channel }) => channel);
      }
      return [channelIndex + 1];
    },

    freeGroups: (state) =>
      state.channelConfiguration.reduce(
        (groups, config) => {
          if (config.group > -1) {
            const index = groups.indexOf(config.group);

            if (index > -1) {
              groups.splice(index, 1);
            }
          }

          return groups;
        },
        [0, 1, 2],
      ),

    mapping: (state) => {
      let mapping = {
        ...genmdmMapping,
      };

      if (state.mdmiCompatibility) {
        mapping = { ...mapping, ...mdmiMapping };
      }

      return mapping;
    },
  },

  actions: {
    setCCValues(
      { getters, commit, state },
      { values, ignoreSameValues = true, channel, ignoreGrouping = false },
    ) {
      const keys = Object.keys(values);

      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const cc = parseInt(key, 10);

        const value = values[cc];
        const isGlobal = GLOBAL_CC.indexOf(cc) > -1;

        const affectedChannels = [];

        if (isGlobal) {
          affectedChannels.push(1, 2, 3, 4, 5, 6);
        } else if (
          !getters.mapping[cc]?.excludeFromGrouping &&
          !ignoreGrouping
        ) {
          affectedChannels.push(
            ...getters.groupedChannelsFromChannel(channel - 1),
          );
        } else {
          affectedChannels.push(channel);
        }

        for (let j = 0; j < affectedChannels.length; ++j) {
          const channel = affectedChannels[j];
          if (ignoreSameValues && state[`channel${channel}`][cc] === value) {
            continue;
          }

          commit("SET_CC_VALUE", { cc, value, channel });
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

    setChannelConfigurationMode(
      { commit, state, getters },
      { channelIndex, mode },
    ) {
      if (mode === MIDIChannelVoiceMode.MONOPHONIC) {
        commit("SET_CHANNELCONFIGURATION_GROUP", { channelIndex, group: -1 });
      } else {
        let group = 0;

        const existingChannelWithMode = state.channelConfiguration.find(
          (config) => config.mode === mode,
        );

        if (existingChannelWithMode) {
          group = existingChannelWithMode.group;
        } else {
          group = getters.freeGroups[0];
        }

        commit("SET_CHANNELCONFIGURATION_GROUP", { channelIndex, group });
      }

      commit("SET_CHANNELCONFIGURATION_MODE", { channelIndex, mode });
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

    SET_CHANNELCONFIGURATION_MODE(state, { channelIndex, mode }) {
      state.channelConfiguration[channelIndex].mode = mode;
    },

    SET_CHANNELCONFIGURATION_GROUP(state, { channelIndex, group }) {
      state.channelConfiguration[channelIndex].group = group;
    },

    SET_CHANNELCONFIGURATION_TRANSPOSE(state, { channelIndex, transpose }) {
      state.channelConfiguration[channelIndex].transpose = transpose;
    },

    SET_SHOWABOUTDIALOG(state, value) {
      state.showAboutDialog = value;
    },

    SET_THEME(state, value) {
      state.theme = value;
    },

    SET_BACKGROUNDIMAGE(state, value) {
      state.backgroundImage = value;
    },

    SET_ROTATION(state, value) {
      state.rotation = value;
    },

    SET_HAPTICS(state, value) {
      state.haptics = value;
    },

    SET_TOOLTIPS(state, value) {
      state.tooltips = value;
    },

    SET_MUSICALTYPING(state, value) {
      state.musicalTyping = value;
    },

    SET_PROGRAMCHANGEPASSTHROUGH(state, value) {
      state.programChangePassthrough = value;
    },

    SET_PROGRAMCHANGELOADSINTOGROUP(state, value) {
      state.programChangeLoadsIntoGroup = value;
    },

    SET_PATCHIMPORTBEHAVIOUR(state, value) {
      if (typeof value !== "string") {
        return;
      }

      state.patchImportBehaviour = value.split("-");
    },
  },
});

export default store;
