import Vue from "vue";
import Vuex from "vuex";
import defaultMapping from "../default-mapping";

const GLOBAL_CC = [1, 74, 78, 79, 80, 81, 83, 84, 85, 86, 88, 89];

const state = {
  polyphonic: false,
  maxPolyphonicChannels: 6,
  channel: 1
};

const mappedCCNumbers = Object.keys(defaultMapping);

function setKeyToDefault(channel, key) {
  state[`channel${channel + 1}`][key] = defaultMapping[key].default || 0;
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
      Object.keys(values).forEach(cc => {
        const value = values[cc];
        const isGlobal = GLOBAL_CC.indexOf(parseInt(cc, 10)) > -1;

        if (state.polyphonic || isGlobal) {
          for (let i = 1; i < 7; ++i) {
            if (state[`channel${i}`][cc] === value) {
              return;
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
    }
  }
});

export default store;
