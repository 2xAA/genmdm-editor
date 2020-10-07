import Vue from "vue";
import Vuex from "vuex";
import genmdmMapping from "../genmdm-mapping";

const GLOBAL_CC = [1, 74, 78, 79, 80, 81, 83, 84, 85, 86, 88, 89];

function createBlankPatchesArray() {
  return [...new Array(128).keys()].map(() => ({ name: "", data: undefined }));
}

const state = {
  patches: createBlankPatchesArray(),

  polyphonic: false,
  maxPolyphonicChannels: 6,
  channel: 1
};

const mappedCCNumbers = Object.keys(genmdmMapping);

function setKeyToDefault(channel, key) {
  state[`channel${channel + 1}`][key] = genmdmMapping[key].default || 0;
}

for (let i = 0; i < 6; ++i) {
  state[`channel${i + 1}`] = {};

  mappedCCNumbers.forEach(key => {
    setKeyToDefault(i, key);
  });
}

Vue.use(Vuex);

const store = new Vuex.Store({
  state,

  actions: {
    setCCValues({ commit, state }, values = {}) {
      Object.keys(values).forEach(key => {
        const cc = parseInt(key, 10);

        const value = values[cc];
        const isGlobal = GLOBAL_CC.indexOf(cc) > -1;

        if (state.polyphonic || isGlobal) {
          for (let i = 1; i < 7; ++i) {
            if (state[`channel${i}`][cc] === value) {
              continue;
            }

            commit("SET_CC_VALUE", { cc, value, channel: i });
          }
        } else {
          if (state[`channel${state.channel}`][cc] === value) {
            return;
          }

          commit("SET_CC_VALUE", { cc, value, channel: state.channel });
        }
      });
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

    writePatch({ commit }, { index, patch }) {
      if (index > 127) {
        throw new Error("Slot index is > 127. 128 slots available only.");
      }

      commit("WRITE_TO_SLOT", { index, patch });
    }
  },

  mutations: {
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

    WRITE_TO_SLOT(state, { index, patch }) {
      state.patches[index].name = patch.name;
      state.patches[index].data = patch.data;
    }
  }
});

export default store;
