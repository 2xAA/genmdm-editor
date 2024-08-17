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

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useStore } from "@renderer/store";
import DraggableSelect from "./DraggableSelect.vue";
import MDMControlGroup from "./MDMControlGroup.vue";
import MDMDial from "./MDMDial.vue";
import { MIDIChannelVoiceMode } from "../store";

const store = useStore();
const voiceModeValues = { ...MIDIChannelVoiceMode };
const glideInternal = ref<number>(0);
const { channel } = defineProps<{
  channel: number;
}>();

const mdmiCompatibility = computed(() => store.state.mdmiCompatibility);

const glideDisabled = computed(
  () => mode.value === MIDIChannelVoiceMode.POLYPHONIC,
);

const channelConfiguration = computed(() => store.state.channelConfiguration);

const channelsByGroup = computed(() => store.getters.channelsByGroup);

const group = computed({
  get() {
    return channelConfiguration.value[channel - 1].group;
  },
  set(value: number) {
    store.commit("SET_CHANNELCONFIGURATION_GROUP", {
      channelIndex: channel - 1,
      group: value,
    });
  },
});

const groupItemsDisabled = computed(() => {
  const items = [false, true, true, true];

  if (mode.value < 1) {
    return items;
  }

  return items.map((_, index) => {
    const i = index - 1;

    if (index === 0) {
      return true;
    }

    if (
      channelsByGroup.value[i] &&
      mode.value === channelsByGroup.value[i][0]
    ) {
      return false;
    } else if (!channelsByGroup.value[i]) {
      return false;
    }

    return true;
  });
});

const mode = computed({
  get() {
    return store.state.channelConfiguration[channel - 1].mode;
  },
  set(value: number) {
    store.dispatch("setChannelConfigurationMode", {
      channelIndex: channel - 1,
      mode: value,
    });
  },
});

const glide = computed({
  get() {
    return glideInternal.value;
  },
  set(value: number) {
    glideInternal.value = value;
  },
});

watch(mode, (newMode) => {
  if (newMode === MIDIChannelVoiceMode.POLYPHONIC) {
    glide.value = 0;
  }
});
</script>
