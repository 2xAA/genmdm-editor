<template>
  <div>
    <grid columns="12">
      <c span="10" class="main-column">
        <grid columns="10">
          <c span="8">
            <grid columns="8">
              <c span="3"><h2>Channel settings</h2></c>
              <c span="5">
                <h2>
                  <span v-if="mode === 0">Monophonic</span>
                  <span v-else-if="mode === 1">Polyphonic</span>
                  <span v-else>Unison</span>
                  <span v-if="mode > 0"> (Group {{ group + 1 }})</span>
                </h2>
              </c>

              <c span="2">
                <MDMControlGroup
                  :cc-values="[14, 15, 77, 76, 75]"
                  :channel="channel"
                >
                  <template #header>
                    <c span="6" class="control-group__label">Channel</c>
                    <c span="2" class="control-group__control">
                      <DraggableSelect
                        v-model.number="channel"
                        :values="[1, 2, 3, 4, 5, 6]"
                        :default="0"
                        :emit-array-value="true"
                      />
                    </c>
                  </template>

                  <template v-if="!mdmiCompatibility" #footer>
                    <c span="6" class="control-group__label">RAM Slot</c>
                    <c span="2" class="control-group__control">
                      <DraggableSelect
                        v-model.number="ramSlot"
                        :values="[
                          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                        ]"
                        :default="0"
                        :emit-array-value="true"
                      />
                    </c>
                  </template>
                </MDMControlGroup>
                <grid v-if="!mdmiCompatibility" columns="2">
                  <c>
                    <button
                      class="button rr rt"
                      @click="
                        sendCC({
                          cc: 9,
                          value: Math.round((ramSlot / 16) * 127),
                          channel,
                        })
                      "
                    >
                      Load from RAM
                    </button>
                  </c>
                  <c>
                    <button
                      class="button rt"
                      @click="
                        sendCC({
                          cc: 6,
                          value: Math.round((ramSlot / 16) * 127),
                          channel,
                        })
                      "
                    >
                      Write to RAM
                    </button>
                  </c>
                </grid>
              </c>
              <c class="arrow-container"><Arrow /></c>
              <c span="5">
                <MDMAlgorithmDisplay />
              </c>
            </grid>
          </c>
          <c span="2">
            <grid columns="1">
              <c>
                <h2>Patch Management</h2>
              </c>
              <c>
                <PatchList />
                <grid columns="2" class="patch-management-buttons">
                  <c>
                    <button class="button rt rr" @click="loadInstrument">
                      Load slot
                    </button>
                  </c>
                  <c
                    ><button class="button rt" @click="writeToSlot">
                      Write slot
                    </button></c
                  >
                  <c><GENMFileUpload class="rr rt" /></c>
                  <c><GENMFileDownload class="rt" /></c>

                  <c><TFIFileUpload class="rr rt" /></c>
                  <c><TFIFileDownload class="rt" /></c>
                  <c><DMPFileUpload class="rr rt" /></c>
                  <c><DMPFileDownload class="rt" /></c>
                  <c><Y12FileUpload class="rr rt" /></c>
                  <c><Y12FileDownload class="rt" /></c>
                </grid>
              </c>
            </grid>

            <grid columns="2" class="patch-management-buttons">
              <c span="2"><hr /></c>
              <c>
                <button class="button rr" @click="sendState">Send State</button>
              </c>
              <c>
                <button class="button" @click="openResetStateDialog">
                  Reset State
                </button>
              </c>
              <c>
                <StateUpload class="rr rt" />
              </c>
              <c>
                <StateDownload class="rt" />
              </c>
            </grid>
          </c>
          <c span="10">
            <grid columns="2">
              <c v-for="x in 4" :key="x">
                <div class="operator-controls">
                  <grid columns="6">
                    <c span="1">
                      <h2>OP {{ x }}</h2>
                    </c>
                    <c span="5" class="sseg-container">
                      <MDMSSGEGDisplay :operator="x" />
                    </c>
                  </grid>
                  <MDMADSR :operator="x" :channel="channel" />
                </div>
              </c>
            </grid>
          </c>
        </grid>
      </c>
      <c span="2">
        <div class="editor-title">
          <h1 @click="openAboutDialog">genMDM Editor</h1>
          <span class="subtitle">version {{ version }}</span>
        </div>

        <div class="editor-settings">
          <h2>Editor Settings</h2>

          <MDMControlGroup :channel="channel">
            <template #header>
              <c span="6" class="control-group__label">MIDI Input</c>
              <c span="2" class="control-group__control">
                <select
                  :value="localInputId"
                  class="select"
                  name="inputs"
                  @change="midiInputSelected"
                >
                  <option selected value="none">---</option>
                  <option
                    v-for="(input, index) in inputs"
                    :key="index"
                    :value="input.id"
                  >
                    {{ input.name }} ({{ input.manufacturer }})
                  </option>
                </select>
              </c>

              <c span="6" class="control-group__label">MIDI Output</c>
              <c span="2" class="control-group__control">
                <select v-model="outputId" class="select" name="outputs">
                  <option selected value="none">---</option>
                  <option
                    v-for="(output, index) in outputs"
                    :key="index"
                    :value="output.id"
                  >
                    {{ output.name }} ({{ output.manufacturer }})
                  </option>
                </select>
              </c>

              <c
                v-tippy="{ followCursor: true }"
                span="6"
                class="control-group__label"
                content="Turn on to use genMDM Editor with Mega Drive MIDI Interface."
                >MDMI Mode</c
              >
              <c span="2" class="control-group__control">
                <LabelledCheckbox
                  v-model="mdmiCompatibility"
                  :labels="['Off', 'On']"
                  :emit-boolean="true"
                />
              </c>
            </template>
          </MDMControlGroup>

          <button class="button rt" @click="openVoiceConfigDialog">
            Voice Configuration
          </button>
        </div>

        <GlobalSettings />

        <DACSettings />
      </c>
    </grid>

    <VDialog
      v-if="showAboutDialog"
      :show="showAboutDialog"
      @close="closeAboutDialog"
    >
      <grid columns="3" class="about-dialog-text">
        <c span="3">
          <h1>genMDM Editor</h1>
          <span class="subtitle">version {{ version }} by 2xAA</span>
        </c>
        <c>
          <b
            >Like this software?<br /><br />Consider supporting the development
            of this and other projects by
            <a
              href="https://github.com/sponsors/2xAA"
              nofollow
              noreferrer
              target="_blank"
              >donating</a
            >
            or
            <a href="https://2xaa.net/" nofollow noreferrer target="_blank"
              >buying/streaming my music</a
            >.</b
          ><br /><br />

          Need some help?<br /><br />Check out
          <a
            href="https://github.com/2xAA/genmdm-editor/discussions"
            nofollow
            noreferrer
            target="_blank"
            >Discussions</a
          >
          for an answer to your question.<br /><br />
          Found a bug or would like to suggest an improvement?<br />
          <a
            href="https://github.com/2xAA/genmdm-editor/issues/new/choose"
            nofollow
            noreferrer
            target="_blank"
            >Create an issue on GitHub</a
          >.</c
        >
        <c>
          I created this editor to further the genMDM and MDMI's usability and
          to understand the Sega MD's capabilities. I hope you find this
          useful.<br /><br />

          This editor's design was inspired by the scan of the Japanese
          technical documentation of the YM2608, which is said to be the closest
          documentation to the Sega Mega Drive's YM2612 as they share the same
          FM package.
        </c>
        <c>
          Special thanks to catskull, Robert Hargreaves, and littlescale for the
          genMDM itself.<br /><br />
          Greetz to: {{ friends }} and all chippers and genMDM users around the
          world.<br /><br />ALWAYS BACK UP YOUR SAVES.
        </c>
      </grid>
    </VDialog>

    <ResetStateDialog
      v-if="showResetStateDialog"
      :show="showResetStateDialog"
      @close="closeResetStateDialog"
    />

    <VoiceConfigDialog
      v-if="showVoiceConfigDialog"
      :show="showVoiceConfigDialog"
      @close="closeVoiceConfigDialog"
    />
  </div>
</template>

<script>
import WebMidi from "webmidi";

import pkg from "../../../package.json";
import shuffle from "./utils/shuffle";

import { MIDIChannelVoiceMode } from "./store/index.js";

import MDMControlGroup from "./components/MDMControlGroup.vue";
import DraggableSelect from "./components/DraggableSelect.vue";
import LabelledCheckbox from "./components/LabelledCheckbox.vue";
import MDMADSR from "./components/MDMADSR.vue";
import TFIFileDownload from "./components/TFIFileDownload.vue";
import TFIFileUpload from "./components/TFIFileUpload.vue";
import GENMFileUpload from "./components/GENMFileUpload.vue";
import DACSettings from "./components/DACSettings.vue";
import GlobalSettings from "./components/GlobalSettings.vue";
import MDMAlgorithmDisplay from "./components/MDMAlgorithmDisplay.vue";
import MDMSSGEGDisplay from "./components/MDMSSGEGDisplay.vue";
import Arrow from "./components/Arrow.vue";
import PatchList from "./components/PatchList.vue";
import GENMFileDownload from "./components/GENMFileDownload.vue";
import DMPFileUpload from "./components/DMPFileUpload.vue";
import DMPFileDownload from "./components/DMPFileDownload.vue";
import VDialog from "./components/Dialog.vue";
import Y12FileUpload from "./components/Y12FileUpload.vue";
import Y12FileDownload from "./components/Y12FileDownload.vue";
import ResetStateDialog from "./components/ResetStateDialog.vue";
import StateUpload from "./components/StateUpload.vue";
import StateDownload from "./components/StateDownload.vue";
import VoiceConfigDialog from "./components/VoiceConfigDialog.vue";
import { MDMKeyboard } from "./MDMKeyboard";
import { reactive } from "vue";

export default {
  name: "App",

  components: {
    MDMControlGroup,
    MDMADSR,
    TFIFileDownload,
    TFIFileUpload,
    GENMFileUpload,
    DACSettings,
    GlobalSettings,
    MDMAlgorithmDisplay,
    MDMSSGEGDisplay,
    Arrow,
    DraggableSelect,
    LabelledCheckbox,
    PatchList,
    GENMFileDownload,
    DMPFileUpload,
    DMPFileDownload,
    VDialog,
    Y12FileUpload,
    Y12FileDownload,
    ResetStateDialog,
    StateUpload,
    StateDownload,
    VoiceConfigDialog,
  },

  data() {
    return {
      version: pkg.version,
      isElectronBuild: process.env.ELECTRON_BUILD,

      input: null,
      localInputId: "none",

      inputs: [],
      outputs: [],

      notesOn: {}, // should key channels and have note as value...
      noteOnChannels: {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
      },
      storeUnsubscribe: null,

      ramSlot: 1,

      showResetStateDialog: false,
      showVoiceConfigDialog: false,

      friendsNames: [
        "Mum",
        "James",
        "Nic",
        "Li",
        "NERDDISCO",
        "Lazer Sausage",
        "cTrix",
        "Infotoxin",
        "Henry Homesweet",
        "Leon",
        "Jamatar",
        "gwEm",
        "Cyanide Dansen",
        "Polyop",
        "jonic",
      ],

      keyboardInstance: null,
    };
  },

  computed: {
    outputPort() {
      return this.outputs.find((output) => output.id === this.outputId);
    },

    inputId: {
      get() {
        return this.$store.state.midiInputId;
      },

      set(value) {
        this.$store.commit("SET_MIDI_INPUT_ID", value);
      },
    },

    outputId: {
      get() {
        return this.$store.state.midiOutputId;
      },

      set(value) {
        this.$store.commit("SET_MIDI_OUTPUT_ID", value);
      },
    },

    channel: {
      get() {
        return this.$store.state.channel;
      },

      set(value) {
        this.$store.dispatch("setChannel", value);
      },
    },

    mode() {
      return this.$store.state.channelConfiguration[this.channel - 1].mode;
    },

    group() {
      return this.$store.state.channelConfiguration[this.channel - 1].group;
    },

    mdmiCompatibility: {
      get() {
        return this.$store.state.mdmiCompatibility;
      },

      set(value) {
        this.$store.commit("SET_MDMICOMPATIBILITY", value);
      },
    },

    friends() {
      // expression using this.showAboutDialog makes Vue run the shuffle
      // function each time this.showAboutDialog updates :)
      return this.showAboutDialog && shuffle(this.friendsNames).join(", ");
    },

    patches() {
      return this.$store.state.patches;
    },

    instrumentIndex() {
      return this.$store.state.instrumentIndex;
    },

    showAboutDialog: {
      get() {
        return this.$store.state.showAboutDialog;
      },

      set(value) {
        this.$store.commit("SET_SHOWABOUTDIALOG", value);
      },
    },
  },

  watch: {
    inputId(newId, oldId) {
      this.createInput(newId, oldId);
    },

    outputId() {
      this.sendTLInversionSysEx(this.mdmiCompatibility);
    },

    channel(value, oldValue) {
      if (this.outputPort && this.mdmiCompatibility && oldValue !== value) {
        // Show FM parameters for the channel when using SEGA Mega Drive MIDI Interface
        // https://github.com/rhargreaves/mega-drive-midi-interface/wiki/UI-Features
        try {
          this.outputPort.sendControlChange(83, 127, value);
        } catch (e) {
          console.error(e);
        }
      }
    },

    mdmiCompatibility(value) {
      if (!this.outputPort) {
        return;
      }

      this.sendTLInversionSysEx(value);
    },
  },

  mounted() {
    WebMidi.enable((err) => {
      if (err) {
        console.log("WebMidi could not be enabled.", err);
      } else {
        WebMidi.addListener("connected", this.populateInputAndOutputPorts);
        WebMidi.addListener("disconnected", this.handleMidiDisconnected);
      }
    }, true);

    this.populateInputAndOutputPorts();

    this.storeUnsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === "SET_CC_VALUE") {
        this.sendCC(mutation.payload);
      }
    });

    this.keyboardInstance = new MDMKeyboard(
      (number, velocity) => {
        this.handleNoteOn({
          note: { number },
          velocity: velocity / 127,
          channel: this.channel,
        });
      },
      (number) => {
        this.handleNoteOff({
          note: { number },
          channel: this.channel,
        });
      },
    );
  },

  beforeUnmount() {
    this.storeUnsubscribe();

    const input = this.inputs.find((input) => input.id === this.inputId);
    if (input) {
      input.removeListener();
    }
  },

  methods: {
    createInput(newId, oldId) {
      this.cleanUpMidiInput(oldId);

      const input = this.inputs.find((input) => input.id === newId);

      if (!input) {
        return;
      }

      this.input = input;
      this.localInputId = newId;

      // Add listeners on all channels
      input.addListener("noteon", "all", this.handleNoteOn);
      input.addListener("noteoff", "all", this.handleNoteOff);
      input.addListener("pitchbend", "all", this.handlePitchBend);
      input.addListener("controlchange", "all", this.handleCC);
      input.addListener("programchange", "all", this.handleProgramChange);
    },

    loadInstrument() {
      const { data } = this.patches[this.instrumentIndex];
      if (!data) {
        return;
      }

      this.$store.dispatch("setCCValues", {
        values: data,
        channel: this.channel,
        ignoreSameValues: false,
      });
    },

    populateInputAndOutputPorts() {
      this.outputs = reactive([...WebMidi.outputs]);
      this.inputs = reactive([...WebMidi.inputs]);

      if (!this.input && this.inputId !== "none") {
        this.createInput(this.inputId);
      }
    },

    handleMidiDisconnected(e) {
      this.cleanUpMidiInput(e.port.id);
      this.populateInputAndOutputPorts();
    },

    cleanUpMidiInput(id) {
      if (id) {
        const oldInput = this.inputs.find((input) => input.id === id);
        if (oldInput) {
          oldInput.removeListener();
          this.input = null;
          this.localInputId = "none";
        }
      }
    },

    sendTLInversionSysEx(value) {
      // Send TL inversion SysEx for SEGA Mega Drive MIDI Interface
      // https://github.com/rhargreaves/mega-drive-midi-interface/wiki/Configuration-&-Advanced-Operations#:~:text=custom%20PSG%20envelope-,Invert%20Total%20Level,-00%2022%2077
      try {
        this.outputPort.sendSysex(
          [0x00, 0x22, 0x77, 0x07, !value ? 0x00 : 0x01],
          [],
        );
      } catch (e) {
        console.error(e);
      }
    },

    midiInputSelected({ target: { value } }) {
      this.midiInputSelected = value;
      this.inputId = value;
    },

    writeToSlot() {
      const { name: existingName } = this.patches[this.instrumentIndex];

      const name = existingName || "instrument " + this.instrumentIndex;

      this.$store.dispatch("writePatch", {
        index: this.instrumentIndex,
        patch: {
          data: { ...this.$store.state[`channel${this.channel}`] },
          name,
        },
      });
    },

    sendCC({ cc, value, channel }) {
      if (!this.outputPort) {
        return;
      }

      try {
        this.outputPort.sendControlChange(cc, value, channel);
      } catch (e) {
        console.error(e);
        console.warn(cc, value, channel);
      }
    },

    sendState() {
      this.sendTLInversionSysEx(this.mdmiCompatibility);
      this.$store.dispatch("sendState");
    },

    handleNoteOn(e) {
      if (!this.outputPort) {
        return;
      }

      const {
        note: { number },
        velocity,
        channel: channelIn,
      } = e;

      let outChannels = [];

      // Pass through other channels
      if (channelIn > 6) {
        this.outputPort.playNote(number, channelIn, {
          velocity,
        });
        return;
      }

      /** @type {MIDIChannelConfiguration} */
      const { group, mode } =
        this.$store.state.channelConfiguration[channelIn - 1];

      if (mode === MIDIChannelVoiceMode.MONOPHONIC) {
        outChannels.push(channelIn);
      } else if (mode === MIDIChannelVoiceMode.UNISON) {
        outChannels.push(
          ...this.$store.getters.channelsByGroup[group].slice(1),
        );
      } else if (mode === MIDIChannelVoiceMode.POLYPHONIC) {
        const groupChannels =
          this.$store.getters.channelsByGroup[group].slice(1);
        outChannels.push(this.nextPolyphonyChannel(number, groupChannels));
      }

      for (let i = 0; i < outChannels.length; i++) {
        const channel = outChannels[i];
        this.noteOnChannels[channel].push(number);

        this.outputPort.playNote(number, channel, {
          velocity,
        });
      }
    },

    handleNoteOff(e) {
      if (!this.outputPort) {
        return;
      }

      const {
        channel: channelIn,
        note: { number },
      } = e;
      let outChannels = [];

      // Pass through other channels
      if (channelIn > 6) {
        this.outputPort.stopNote(number, channelIn);
        return;
      }

      const { group, mode } =
        this.$store.state.channelConfiguration[channelIn - 1];

      if (mode === MIDIChannelVoiceMode.MONOPHONIC) {
        outChannels.push(channelIn);
      } else if (mode === MIDIChannelVoiceMode.UNISON) {
        outChannels.push(
          ...this.$store.getters.channelsByGroup[group].slice(1),
        );
      } else if (mode === MIDIChannelVoiceMode.POLYPHONIC) {
        const noteOnChannels = Object.entries(this.noteOnChannels);
        for (let i = 0; i < noteOnChannels.length; i += 1) {
          const [channel, notes] = noteOnChannels[i];
          if (notes.indexOf(number) > -1) {
            outChannels.push(channel);
            break;
          }
        }
      }

      for (let i = 0; i < outChannels.length; i++) {
        const channel = outChannels[i];
        this.outputPort.stopNote(number, channel);
        const index = this.noteOnChannels[channel].indexOf(number);

        if (index > -1) {
          this.noteOnChannels[channel].splice(index, 1);
        }
      }
    },

    handlePitchBend(e) {
      if (!this.outputPort) {
        return;
      }

      const affectedChannels = this.$store.getters.groupedChannelsFromChannel(
        e.channel - 1,
      );
      for (let i = 0; i < affectedChannels.length; ++i) {
        const channel = affectedChannels[i];

        this.outputPort.sendPitchBend(e.value, channel);
      }
    },

    handleCC(e) {
      if (!this.outputPort) {
        return;
      }

      if (e.controller.number === 85) {
        this.sendCC({ cc: e.controller.number, ...e });
        return;
      }

      this.$store.dispatch("setCCValues", {
        values: { [e.controller.number]: e.value },
        channel: e.channel,
      });
    },

    async handleProgramChange(e) {
      if (!this.outputPort) {
        return;
      }

      const { value, channel } = e;
      const { data } = this.patches[value];

      if (!data) return;

      this.$store.dispatch("setCCValues", {
        values: { ...data },
        channel,
      });
    },

    freeChannel(channels) {
      const entries = Object.entries(this.noteOnChannels);

      const index = entries.findIndex(
        ([channel, notes]) =>
          channel && !notes.length && channels.indexOf(Number(channel)) > -1,
      );

      if (index > -1) {
        return index + 1;
      }

      return index;
    },

    nextPolyphonyChannel(newNoteNumber, channels) {
      const noteOnChannels = Object.entries(this.noteOnChannels);

      const notesOn = noteOnChannels
        .filter(([channel]) => channels.indexOf(channel) > -1)
        .map(([, notes]) => notes)
        .flat();

      const lowestNote = Math.min(...notesOn);

      let lowestNoteChannel = Math.min(...channels);
      for (let i = 0; i < noteOnChannels.length; i += 1) {
        const [channel, notes] = noteOnChannels[i];
        if (notes.indexOf(lowestNote) > -1) {
          lowestNoteChannel = Number(channel);
          break;
        }
      }

      if (newNoteNumber > lowestNote) {
        const lowestNoteChannelArr = noteOnChannels.find(
          ([, note]) => note === lowestNote,
        );

        lowestNoteChannel =
          (lowestNoteChannelArr && lowestNoteChannelArr[0]) ??
          lowestNoteChannel;
      }

      let nextChannel = lowestNoteChannel;

      const freeChannel = this.freeChannel(channels);
      if (freeChannel > 0) {
        nextChannel = freeChannel;
      }

      if (freeChannel < 1) {
        const channelsOrderedByNotesAsc = noteOnChannels
          .filter(([channel]) => channels.indexOf(Number(channel)) > -1)
          .sort(
            ([, notesA], [, notesB]) => Math.min(...notesA) - Math.min(notesB),
          )
          .map(([channel]) => Number(channel));

        nextChannel = channelsOrderedByNotesAsc.pop();
      }

      return nextChannel;
    },

    openAboutDialog() {
      this.showAboutDialog = true;
    },

    closeAboutDialog() {
      this.showAboutDialog = false;
    },

    openResetStateDialog() {
      this.showResetStateDialog = true;
    },

    closeResetStateDialog() {
      this.showResetStateDialog = false;
    },

    openVoiceConfigDialog() {
      this.showVoiceConfigDialog = true;
    },

    closeVoiceConfigDialog() {
      this.showVoiceConfigDialog = false;
    },
  },
};
</script>

<style>
@import url("./assets/fonts/kokoro/index.css");

:root {
  --foreground-color: black;
  --background-color: white;
  --background-image: url(assets/images/background.jpg);
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-color: white;
    --background-color: black;
    --background-image: url(assets/images/background-inverted.jpg);
  }
}

html,
body {
  height: 100%;
}

* {
  user-select: none;
}

body {
  background-color: var(--background-color);
  background-image: var(--background-image);
  background-attachment: fixed;
  background-position: calc(50% - 100px) center;
  background-repeat: no-repeat;
}

/* big screens */
@media only screen and (min-width: 1280px) {
  body {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin: 0;
  }
}

#app,
button,
input,
label.select select {
  font-family: "Kokoro";
  letter-spacing: -1.4px;

  color: var(--foreground-color);
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  width: 1120px;
  min-width: 1120px;
  margin: 0 auto;

  transform: rotate(-0.2deg);
  margin-top: -0.5px;
}

.ns-resize-cursor {
  cursor: ns-resize;
}

.ns-resize-cursor.disabled {
  cursor: not-allowed;
}

label span {
  background-color: transparent;
  color: var(--foreground-color);
}

select {
  width: 100%;
}

button {
  background: none;
  border: 1px var(--foreground-color) solid;
  text-transform: uppercase;
  width: 100%;
}

h1 {
  font-size: 24px;
  font-weight: normal;
  text-align: right;
  margin: 0.67em 0;
}

h1 + .subtitle {
  display: block;
  font-size: 14px;
  margin-top: -0.67em;
  text-align: right;
}

h2 {
  font-size: 18px;
  font-weight: normal;
  text-transform: uppercase;
  margin: 6px 0;
}

.operator-controls {
  max-width: 400px;
}

.sseg-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.arrow-container {
  display: flex;
  justify-content: center;
}

.editor-title h1 {
  margin-top: 0;
  cursor: pointer;
}

.main-column {
  padding-right: 2em;
}

.about-dialog-text {
  grid-gap: 25px;
}

.about-dialog-text a {
  cursor: pointer;
  text-decoration: underline;
}

.patch-management-buttons {
  grid-template-columns: repeat(2, 50%);
}
</style>
