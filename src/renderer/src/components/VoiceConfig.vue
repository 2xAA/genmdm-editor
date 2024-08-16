<template>
  <div>
    <h2>{{ channel }}</h2>

    <grid columns="8" class="control-group">
      <c span="4" class="control-group__label">Mode</c>
      <c span="4" class="control-group__control">
        <DraggableSelect
          v-model="mode"
          :values="[
            voiceModeValues.MONOPHONIC,
            voiceModeValues.POLYPHONIC,
            voiceModeValues.UNISON,
          ]"
          :emit-array-value="true"
          :default="0"
          :labels="['MONO', 'POLY', 'UNI']"
          :what-is="'mode'"
        />
      </c>

      <c span="4" class="control-group__label">Group</c>
      <c span="4" class="control-group__control">
        <DraggableSelect
          v-model="group"
          :values="[-1, 0, 1, 2]"
          :disabled-items="groupItemsDisabled"
          :emit-array-value="true"
          :labels="['Off', '1', '2', '3']"
        />
      </c>
    </grid>

    <div v-if="mdmiCompatibility">
      <h2>Detune</h2>

      <MDMDial :cc="85" :range="127" :channel="channel" />

      <br />
      <MDMControlGroup
        :cc-values="[65]"
        :channel="channel"
        :disabled="glideDisabled"
      ></MDMControlGroup>

      <!-- <grid
        columns="8"
        class="control-group"
        :class="{ disabled: glideDisabled }"
      >
        <c span="4" class="control-group__label">Glide</c>
        <c span="4" class="control-group__control">
          <LabelledCheckbox
            v-model="glide"
            :labels="['Off', 'On']"
            :disabled="glideDisabled"
            :title="
              mode === voiceModeValues.POLYPHONIC
                ? `MDMI does not support glide between polyphony channels`
                : ''
            "
          />
        </c>
      </grid> -->

      <h2 :class="{ disabled: glideDisabled }">Porta. Time</h2>

      <MDMDial
        :cc="5"
        :range="127"
        :channel="channel"
        :disabled="glideDisabled"
      />
    </div>
  </div>
</template>

<script>
import { MIDIChannelVoiceMode } from "../store";
import DraggableSelect from "./DraggableSelect.vue";
import LabelledCheckbox from "./LabelledCheckbox.vue";
import MDMControlGroup from "./MDMControlGroup.vue";
import MDMDial from "./MDMDial.vue";

export default {
  components: {
    DraggableSelect,
    LabelledCheckbox,
    MDMControlGroup,
    MDMDial,
  },

  props: {
    channel: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      voiceModeValues: { ...MIDIChannelVoiceMode },
      glideInternal: 0,
    };
  },

  computed: {
    mdmiCompatibility() {
      return this.$store.state.mdmiCompatibility;
    },

    glideDisabled() {
      return this.mode === MIDIChannelVoiceMode.POLYPHONIC;
    },

    channelConfiguration() {
      return this.$store.state.channelConfiguration;
    },

    channelsByGroup() {
      return this.$store.getters.channelsByGroup;
    },

    group: {
      get() {
        return this.channelConfiguration[this.channel - 1].group;
      },

      set(group) {
        this.$store.commit("SET_CHANNELCONFIGURATION_GROUP", {
          channelIndex: this.channel - 1,
          group,
        });
      },
    },

    groupItemsDisabled() {
      const items = [false, true, true, true];

      if (this.mode < 1) {
        // Return if in MONO mode
        return items;
      }

      return items.map((_, index) => {
        const i = index - 1;

        if (index === 0) {
          // Never enable the "Off" item for poly or uni voices
          return true;
        }

        if (
          this.channelsByGroup[i] &&
          this.mode === this.channelsByGroup[i][0]
        ) {
          // If there's a group, check if this channel's mode is the same
          return false;
        } else if (!this.channelsByGroup[i]) {
          // If there's a group which hasn't been used yet, it's up for grabs
          return false;
        }

        // Return true for any other case
        return true;
      });
    },

    mode: {
      get() {
        return this.$store.state.channelConfiguration[this.channel - 1].mode;
      },

      set(mode) {
        this.$store.dispatch("setChannelConfigurationMode", {
          channelIndex: this.channel - 1,
          mode,
        });
      },
    },

    glide: {
      get() {
        return this.glideInternal;
      },

      set(value) {
        this.glideInternal = value;
      },
    },
  },

  watch: {
    mode(mode) {
      if (mode === MIDIChannelVoiceMode.POLYPHONIC) {
        this.glide = 0;
      }
    },
  },
};
</script>
