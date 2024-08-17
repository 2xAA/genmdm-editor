import { InjectionKey, reactive } from "vue";
import { createStore, Store, useStore as baseUseStore } from "vuex";
import vuejsStorage from "vuejs-storage";
import genmdmMapping from "../genmdm-mapping";
import mdmiMapping from "../mdmi-mapping";

function sleep(milliseconds = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

const GLOBAL_CC = [1, 74, 78, 79, 80, 81, 83, 84, /*85, */ 86, 88, 89];
const NUM_CHANNELS = 6;

export interface GenMDMPatch {
  name: string;
  data?: object;
}

function createBlankPatchesArray(): GenMDMPatch[] {
  return Array.from({ length: 128 }, () => ({ name: "" }));
}

export enum MIDIChannelVoiceMode {
  MONOPHONIC = 0,
  POLYPHONIC = 1,
  UNISON = 2,
}

interface MIDIChannelConfiguration {
  mode: MIDIChannelVoiceMode;
  group: number; // -1 to 2
}

interface GenMDMEditorChannelsState {
  channel1: Record<string, number>;
  channel2: Record<string, number>;
  channel3: Record<string, number>;
  channel4: Record<string, number>;
  channel5: Record<string, number>;
  channel6: Record<string, number>;
}

export interface GenMDMEditorState extends GenMDMEditorChannelsState {
  patches: GenMDMPatch[];
  channel: number;
  channelConfiguration: MIDIChannelConfiguration[];
  instrumentIndex: number;
  mdmiCompatibility: boolean;
  midiInputId: string;
  midiOutputId: string;
  showAboutDialog: boolean;
}

function createDefaultState(): GenMDMEditorState {
  const defaultState: GenMDMEditorState = {
    patches: createBlankPatchesArray(),
    channel: 1,
    channelConfiguration: [
      { mode: MIDIChannelVoiceMode.POLYPHONIC, group: 0 },
      { mode: MIDIChannelVoiceMode.POLYPHONIC, group: 0 },
      { mode: MIDIChannelVoiceMode.UNISON, group: 1 },
      { mode: MIDIChannelVoiceMode.UNISON, group: 1 },
      { mode: MIDIChannelVoiceMode.MONOPHONIC, group: -1 },
      { mode: MIDIChannelVoiceMode.MONOPHONIC, group: -1 },
    ],
    instrumentIndex: 0,
    mdmiCompatibility: false,
    showAboutDialog: true,
    ...createDefaultChannelState(),
    midiInputId: "none",
    midiOutputId: "none",
  };

  return defaultState;
}

export function createDefaultChannelState(): GenMDMEditorChannelsState {
  const mapping = { ...mdmiMapping, ...genmdmMapping };
  const channels = {
    channel1: {},
    channel2: {},
    channel3: {},
    channel4: {},
    channel5: {},
    channel6: {},
  };
  const mappedCCNumbers = Object.keys(mapping);

  for (let i = 0; i < NUM_CHANNELS; ++i) {
    mappedCCNumbers.forEach((key) => {
      channels[`channel${i + 1}`][key] = mapping[key].default || 0;
    });
  }

  return channels;
}

const state = createDefaultState();

export const key: InjectionKey<Store<GenMDMEditorState>> = Symbol();

const store = createStore<GenMDMEditorState>({
  state,

  plugins: [
    vuejsStorage({
      keys: Object.keys(state),
      namespace: "genmdm_autosave",
    }),
  ],

  getters: {
    channelsByGroup: (state: GenMDMEditorState) =>
      state.channelConfiguration.reduce(
        (groups: Record<number, any[]>, { group, mode }, channelIndex) => {
          if (group > -1 && !groups[group]) {
            groups[group] = [mode, channelIndex + 1];
          } else if (group > -1 && groups[group]) {
            groups[group].push(channelIndex + 1);
          }

          return groups;
        },
        {} as Record<number, any[]>,
      ),

    groupedChannelsFromChannel:
      (state: GenMDMEditorState) =>
      (channelIndex: number): number[] => {
        if (channelIndex < 0 || channelIndex > 5) {
          return [];
        }

        const { group: channelGroup } =
          state.channelConfiguration[channelIndex];

        if (channelGroup > -1) {
          return state.channelConfiguration
            .map((item, index) => ({ ...item, channel: index + 1 }))
            .filter(({ group }) => group === channelGroup)
            .map(({ channel }) => channel);
        }
        return [channelIndex + 1];
      },

    freeGroups: (state: GenMDMEditorState) =>
      state.channelConfiguration.reduce(
        (groups: number[], config) => {
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

    mapping: (state: GenMDMEditorState) => {
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
      {
        values,
        ignoreSameValues = true,
        channel,
      }: {
        values: Record<number, number>;
        ignoreSameValues?: boolean;
        channel: number;
      },
    ) {
      const keys = Object.keys(values);

      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const cc = parseInt(key, 10);

        const value = values[cc];
        const isGlobal = GLOBAL_CC.indexOf(cc) > -1;

        const affectedChannels: number[] = [];

        if (isGlobal) {
          affectedChannels.push(1, 2, 3, 4, 5, 6);
        } else if (!getters.mapping[cc]?.excludeFromGrouping) {
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

    setChannel({ commit }, channel: number) {
      commit("SET_CHANNEL", channel);
    },

    setPolyphony({ commit }, value: boolean) {
      commit("SET_POLYPHONY", value);
    },

    setMaxPolyphonicChannels({ commit }, value: number) {
      commit("SET_MAX_POLYPHONIC_CHANNELS", value);
    },

    async setPatches({ commit, dispatch }, patches: GenMDMPatch[] = []) {
      commit("CLEAR_PATCHES");

      for (let i = 0; i < patches.length; i += 1) {
        await dispatch("writePatch", { index: i, patch: patches[i] });
      }
    },

    setPatchName({ commit }, { index, name }: { index: number; name: string }) {
      commit("SET_PATCH_NAME", { index, name });
    },

    writePatch(
      { commit },
      { index, patch }: { index: number; patch: GenMDMPatch },
    ) {
      if (index > 127) {
        throw new Error("Slot index is > 127. 128 slots available only.");
      }

      commit("WRITE_TO_SLOT", { index, patch });
    },

    setInstrumentIndex({ commit }, index: number) {
      commit("SET_INSTRUMENT_INDEX", index);
    },

    async sendState({ commit, state }) {
      const originalChannel = state.channel;

      for (let i = 0; i < NUM_CHANNELS; ++i) {
        const channelKey = `channel${i + 1}` as keyof GenMDMEditorState;
        const channel = state[channelKey] as Record<string, number>;
        const channelEntries = Object.entries(channel);

        commit("SET_CHANNEL", i + 1);

        for (let j = 0; j < channelEntries.length; ++j) {
          const [cc, value] = channelEntries[j];
          await sleep(0);
          commit("SET_CC_VALUE", { cc: Number(cc), value, channel: i + 1 });
        }
      }

      commit("SET_CHANNEL", originalChannel);
    },

    resetState(
      { commit, dispatch },
      {
        channel = -1,
        resetEditor = false,
        resetPatches = false,
      }: {
        channel?: number;
        resetEditor?: boolean;
        resetPatches?: boolean;
      } = {},
    ) {
      const defaultState = createDefaultState();
      const newState = reactive({
        midiInputId: state.midiInputId,
        midiOutputId: state.midiOutputId,
      }) as Partial<GenMDMEditorState>;

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

      return this;
    },

    setChannelConfigurationMode(
      { commit, state, getters },
      {
        channelIndex,
        mode,
      }: { channelIndex: number; mode: MIDIChannelVoiceMode },
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
    SET_STATE(state: GenMDMEditorState, newState: Partial<GenMDMEditorState>) {
      const newStateCopy = {
        ...newState,
        midiInputId: state.midiInputId,
        midiOutputId: state.midiOutputId,
      };

      Object.assign(state, newStateCopy);
    },

    SET_CC_VALUE(
      state: GenMDMEditorState,
      { cc, value, channel }: { cc: number; value: number; channel: number },
    ) {
      state[`channel${channel}`][cc] = value;
    },

    SET_CHANNEL(state: GenMDMEditorState, channel: number) {
      state.channel = channel;
    },

    CLEAR_PATCHES(state: GenMDMEditorState) {
      state.patches = createBlankPatchesArray();
    },

    SET_PATCH_NAME(
      state: GenMDMEditorState,
      { index, name }: { index: number; name: string },
    ) {
      state.patches[index].name = name;
    },

    WRITE_TO_SLOT(
      state: GenMDMEditorState,
      { index, patch }: { index: number; patch: GenMDMPatch },
    ) {
      state.patches[index].name = patch.name;
      state.patches[index].data = patch.data;
    },

    SET_INSTRUMENT_INDEX(state: GenMDMEditorState, index: number) {
      state.instrumentIndex = index;
    },

    SET_MDMICOMPATIBILITY(state: GenMDMEditorState, value: boolean) {
      state.mdmiCompatibility = value;
    },

    SET_MIDI_INPUT_ID(state: GenMDMEditorState, value: string) {
      state.midiInputId = value;
    },

    SET_MIDI_OUTPUT_ID(state: GenMDMEditorState, value: string) {
      state.midiOutputId = value;
    },

    SET_CHANNELCONFIGURATION_MODE(
      state: GenMDMEditorState,
      {
        channelIndex,
        mode,
      }: { channelIndex: number; mode: MIDIChannelVoiceMode },
    ) {
      state.channelConfiguration[channelIndex].mode = mode;
    },

    SET_CHANNELCONFIGURATION_GROUP(
      state: GenMDMEditorState,
      { channelIndex, group }: { channelIndex: number; group: number },
    ) {
      state.channelConfiguration[channelIndex].group = group;
    },

    SET_SHOWABOUTDIALOG(state: GenMDMEditorState, value: boolean) {
      state.showAboutDialog = value;
    },
  },
});

// define your own `useStore` composition function
export function useStore() {
  return baseUseStore(key);
}

export default store;
