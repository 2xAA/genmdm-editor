<template>
  <div id="app">
    <grid columns="12">
      <c span="10" class="main-column">
        <grid columns="10">
          <c span="8">
            <grid columns="8">
              <c span="2"><h2>Channel settings</h2></c>
              <c span="6"></c>

              <c span="2">
                <MDMControlGroup :cc-values="[14, 15, 77, 76, 75]">
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

                  <template #footer>
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
                <grid columns="2">
                  <c>
                    <button
                      class="button"
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
                      class="button"
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
                    <button class="button" @click="loadInstrument">
                      Load slot
                    </button>
                  </c>
                  <c
                    ><button class="button" @click="writeToSlot">
                      Write slot
                    </button></c
                  >
                  <c><GENMFileUpload /></c>
                  <c><GENMFileDownload /></c>

                  <c><TFIFileUpload /></c>
                  <c><TFIFileDownload /></c>
                  <c><DMPFileUpload /></c>
                  <c><DMPFileDownload /></c>
                  <c><Y12FileUpload /></c>
                  <c><Y12FileDownload /></c>
                </grid>
              </c>
            </grid>

            <grid columns="2" class="patch-management-buttons">
              <c span="2"><hr /></c>
              <c>
                <button class="button" @click="sendState">Send State</button>
              </c>
              <c>
                <button class="button" @click="openResetStateDialog">
                  Reset State
                </button>
              </c>
              <c>
                <StateUpload />
              </c>
              <c>
                <StateDownload />
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
                  <MDMADSR :operator="x" />
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

          <MDMControlGroup>
            <template #header>
              <c span="6" class="control-group__label">MIDI Input</c>
              <c span="2" class="control-group__control">
                <select v-model="inputId" class="select" name="inputs">
                  <option disabled selected value="none">---</option>
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
                  <option disabled selected value="none">---</option>
                  <option
                    v-for="(output, index) in outputs"
                    :key="index"
                    :value="output.id"
                  >
                    {{ output.name }} ({{ output.manufacturer }})
                  </option>
                </select>
              </c>

              <c span="6" class="control-group__label">Polyphony Enable</c>
              <c span="2" class="control-group__control">
                <LabelledCheckbox
                  v-model="polyphonic"
                  :labels="['Off', 'On']"
                  :emit-boolean="true"
                />
              </c>

              <c span="6" class="control-group__label">Max Poly. Channels</c>
              <c span="2" class="control-group__control">
                <DraggableSelect
                  v-model.number="maxPolyphonicChannels"
                  :values="[2, 3, 4, 5, 6]"
                  :default="6"
                  :emit-array-value="true"
                />
              </c>

              <c span="6" class="control-group__label">MDMI Compatibility</c>
              <c span="2" class="control-group__control">
                <LabelledCheckbox
                  v-model="mdmiCompatibility"
                  :labels="['Off', 'On']"
                  :emit-boolean="true"
                />
              </c>
            </template>
          </MDMControlGroup>
        </div>

        <GlobalSettings />

        <DACSettings />
      </c>
    </grid>

    <Dialog :show="showAboutDialog" @close="closeAboutDialog">
      <grid columns="3" class="about-dialog-text">
        <c span="3">
          <h1>genMDM Editor</h1>
          <span class="subtitle">version {{ version }} by 2xAA</span>
        </c>
        <c>
          This editor's design was inspired by the scan of the Japanese
          technical documentation of the YM2608, which is said to be the closest
          documentation to the Sega Mega Drive's YM2612 as they share the same
          FM package.<br /><br />I created this editor to further the genMDM's
          usability and to understand the Sega MD's capabilities. I hope you
          find this useful.
        </c>
        <c>
          Special thanks to catskull and littlescale for the genMDM itself.<br /><br />
          Greetz to: {{ friends }} and all chippers and genMDM users around the
          world.<br /><br />ALWAYS BACK UP YOUR SAVES.
        </c>
        <c>
          Found a bug or would like to suggest an improvement?
          <FlexibleLink
            :native="isElectronBuild"
            href="https://github.com/2xAA/genmdm-editor/issues/new/choose"
            nofollow
            noreferrer
            target="_blank"
            >Create an issue on GitHub</FlexibleLink
          >.<br /><br />Need some help?<br /><br />Check out
          <FlexibleLink
            :native="isElectronBuild"
            href="https://github.com/2xAA/genmdm-editor/discussions"
            nofollow
            noreferrer
            target="_blank"
            >Discussions</FlexibleLink
          >
          for an answer to your question.<br /><br />Like this software?<br /><br />Consider
          supporting the development of this and other projects by
          <FlexibleLink
            :native="isElectronBuild"
            href="https://github.com/sponsors/2xAA"
            nofollow
            noreferrer
            target="_blank"
            >donating</FlexibleLink
          >
          or
          <FlexibleLink
            :native="isElectronBuild"
            href="https://2xaa.fm/"
            nofollow
            noreferrer
            target="_blank"
            >buying/streaming my music</FlexibleLink
          >.
        </c>
      </grid>
    </Dialog>

    <ResetStateDialog
      :show="showResetStateDialog"
      @close="closeResetStateDialog"
    />
  </div>
</template>

<script>
import WebMidi from "webmidi";
import FlexibleLink from "vue-flexible-link/src/FlexibleLink.vue";

import pkg from "../../../package.json";
import shuffle from "./utils/shuffle";
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
import Dialog from "./components/Dialog.vue";
import Y12FileUpload from "./components/Y12FileUpload.vue";
import Y12FileDownload from "./components/Y12FileDownload.vue";
import ResetStateDialog from "./components/ResetStateDialog.vue";
import StateUpload from "./components/StateUpload.vue";
import StateDownload from "./components/StateDownload.vue";

export default {
  name: "App",

  components: {
    FlexibleLink,
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
    Dialog,
    Y12FileUpload,
    Y12FileDownload,
    ResetStateDialog,
    StateUpload,
    StateDownload,
  },

  data() {
    return {
      version: pkg.version,
      isElectronBuild: !!process.env.ELECTRON_BUILD,

      inputs: [],
      outputs: [],

      inputId: "none",
      outputId: "none",

      notesOn: {},
      polyphonyChannel: 1,
      storeUnsubscribe: null,

      ramSlot: 1,

      showAboutDialog: false,
      showResetStateDialog: false,
      friendsNames: [
        "Mum",
        "James",
        "Emmoi",
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
        "Robert Hargreaves",
      ],
    };
  },

  computed: {
    outputPort() {
      return this.outputs.find((output) => output.id === this.outputId);
    },

    channel: {
      get() {
        return this.$store.state.channel;
      },

      set(value) {
        this.$store.dispatch("setChannel", value);
      },
    },

    polyphonic: {
      get() {
        return this.$store.state.polyphonic;
      },

      set(value) {
        this.$store.dispatch("setPolyphony", value);
      },
    },

    maxPolyphonicChannels: {
      get() {
        return this.$store.state.maxPolyphonicChannels;
      },

      set(value) {
        this.$store.dispatch("setMaxPolyphonicChannels", value);
      },
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
  },

  watch: {
    inputId(newId, oldId) {
      if (oldId) {
        const oldInput = this.inputs.find((input) => input.id === oldId);
        if (oldInput) {
          oldInput.removeListener();
        }
      }

      const input = this.inputs.find((input) => input.id === newId);

      // Listen for a 'note on' message on all channels
      input.addListener("noteon", "all", this.handleNoteOn);

      // Listen for a 'note off' message on all channels
      input.addListener("noteoff", "all", this.handleNoteOff);

      // Listen for a pitch bend message on all channels
      input.addListener("pitchbend", "all", this.handlePitchBend);

      input.addListener("controlchange", "all", this.handleCC);

      // Listen for a program change message on all channels
      input.addListener("programchange", "all", this.handleProgramChange);
    },

    channel(value, oldValue) {
      if (this.mdmiCompatibility && oldValue !== value) {
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
  },

  mounted() {
    WebMidi.enable((err) => {
      if (err) {
        console.log("WebMidi could not be enabled.", err);
      } else {
        WebMidi.addListener("connected", this.populateInputAndOutputPorts);
        WebMidi.addListener("disconnected", this.populateInputAndOutputPorts);
      }
      this.populateInputAndOutputPorts();
    }, true);

    this.storeUnsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === "SET_CC_VALUE") {
        this.sendCC(mutation.payload);
      }
    });
  },

  beforeUnmount() {
    this.storeUnsubscribe();

    const input = this.inputs.find((input) => input.id === this.inputId);
    if (input) {
      input.removeListener();
    }

    WebMidi.disable();
  },

  methods: {
    loadInstrument() {
      const { data } = this.patches[this.instrumentIndex];
      if (!data) {
        return;
      }

      this.$store.dispatch("setCCValues", {
        values: data,
        ignoreSameValues: false,
      });
    },

    populateInputAndOutputPorts() {
      this.outputs = WebMidi.outputs;
      this.inputs = WebMidi.inputs;
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

      // Send TL inversion SysEx for SEGA Mega Drive MIDI Interface
      // https://github.com/rhargreaves/mega-drive-midi-interface/wiki/Configuration-&-Advanced-Operations#:~:text=custom%20PSG%20envelope-,Invert%20Total%20Level,-00%2022%2077
      if (this.mdmiCompatibility && cc > 15 && cc < 20) {
        try {
          this.outputPort.sendSysex([0x00, 0x22, 0x77, 0x07, 0x01], []);
        } catch (e) {
          console.error(e);
        }
      }

      try {
        this.outputPort.sendControlChange(cc, value, channel);
      } catch (e) {
        console.error(e);
        console.warn(cc, value, channel);
      }
    },

    sendState() {
      this.$store.dispatch("sendState");
    },

    handleNoteOn(e) {
      if (!this.outputPort) {
        return;
      }

      const {
        note: { number, name, octave },
        velocity,
      } = e;
      const note = `${name}${octave}`;

      let channel = e.channel;

      if (this.polyphonic && channel < this.maxPolyphonicChannels) {
        channel = this.nextPolyphonyChannel(number);
      }

      this.notesOn[number] = channel;

      this.outputPort.playNote(note, channel, {
        velocity,
      });
    },

    handleNoteOff(e) {
      if (!this.outputPort) {
        return;
      }

      const { name, octave, number } = e.note;
      const note = `${name}${octave}`;
      let channel;
      if (this.polyphonic) {
        channel = this.notesOn[number];
      } else {
        channel = e.channel;
      }

      this.outputPort.stopNote(note, channel);

      delete this.notesOn[number];
    },

    handlePitchBend(e) {
      if (!this.outputPort) {
        return;
      }

      if (this.polyphonic) {
        for (let i = 1; i < this.maxPolyphonicChannels + 1; ++i) {
          this.outputPort.sendPitchBend(e.value, i);
        }
      } else {
        this.outputPort.sendPitchBend(e.value, this.channel);
      }
    },

    handleCC(e) {
      this.$store.dispatch("setCCValuesOnChannel", {
        [e.controller.number]: this.inverse ? 127 - e.value : e.value,
        channel: e.channel,
      });

      if (!this.outputPort) {
        return;
      }
    },

    async handleProgramChange(e) {
      if (!this.outputPort) {
        return;
      }

      const { value } = e;
      await this.$store.dispatch("setInstrumentIndex", value);
      this.loadInstrument();
    },

    freeChannels() {
      const channels = [false, true, true, true, true, true];

      Object.values(this.notesOn).forEach((channel) => {
        channels[channel] = false;
      });

      return channels.findIndex((channel) => channel);
    },

    nextPolyphonyChannel(newNoteNumber) {
      const notesOn = Object.keys(this.notesOn);
      const lowestNote = Math.min(...notesOn);
      let lowestNoteChannel = this.polyphonyChannel;

      if (newNoteNumber > lowestNote) {
        lowestNoteChannel = this.notesOn[lowestNote];
      }

      let nextChannel = this.polyphonyChannel + 1;

      const freeChannel = this.freeChannels();
      if (freeChannel > 0) {
        nextChannel = freeChannel;
      }

      if (nextChannel === lowestNoteChannel) {
        nextChannel = lowestNoteChannel + 1;
      }

      if (nextChannel > this.maxPolyphonicChannels) {
        nextChannel = 1;
      }

      this.polyphonyChannel = nextChannel;
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
@media only screen and (min-width: 1160px) {
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
  color: var(--foreground-color);
  grid-gap: 25px;
}

.about-dialog-text a {
  color: var(--foreground-color);
  cursor: pointer;
  text-decoration: underline;
}

.patch-management-buttons {
  grid-template-columns: repeat(2, 50%);
}
</style>
