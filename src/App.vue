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
                  <template v-slot:header>
                    <c span="6" class="control-group__label">Channel</c>
                    <c span="2" class="control-group__control">
                      <DraggableSelect
                        :values="[1, 2, 3, 4, 5, 6]"
                        :default="0"
                        :emitArrayValue="true"
                        v-model.number="channel"
                      />
                    </c>
                  </template>

                  <template v-slot:footer>
                    <c span="6" class="control-group__label">RAM Slot</c>
                    <c span="2" class="control-group__control">
                      <DraggableSelect
                        :values="[
                          1,
                          2,
                          3,
                          4,
                          5,
                          6,
                          7,
                          8,
                          9,
                          10,
                          11,
                          12,
                          13,
                          14,
                          15,
                          16
                        ]"
                        :default="0"
                        :emitArrayValue="true"
                        v-model.number="ramSlot"
                      />
                    </c>
                  </template>
                </MDMControlGroup>
                <grid columns="2">
                  <c>
                    <button
                      @click="
                        sendCC({
                          cc: 9,
                          value: Math.round((ramSlot / 16) * 127),
                          channel
                        })
                      "
                    >
                      Load from RAM
                    </button>
                  </c>
                  <c>
                    <button
                      @click="
                        sendCC({
                          cc: 6,
                          value: Math.round((ramSlot / 16) * 127),
                          channel
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
                <PatchList @input="val => (patchSlotIndex = val)" />
                <grid columns="2">
                  <c><button @click="writeToSlot">Write slot</button></c>
                  <c><TFIFileUpload /></c>
                  <c><GENMFileUpload /></c>
                  <c><GENMFileDownload /></c>
                  <c><DMPFileUpload /></c>
                  <c><DMPFileDownload /></c>
                </grid>
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
          <h1>genMDM Editor</h1>
          <span class="subtitle">version {{ version }}</span>
        </div>

        <div class="editor-settings">
          <h2>Editor Settings</h2>

          <MDMControlGroup>
            <template v-slot:header>
              <c span="6" class="control-group__label">MIDI Input</c>
              <c span="2" class="control-group__control">
                <select name="inputs" v-model="inputId">
                  <option disabled selected>Select an input</option>
                  <option
                    v-for="(input, index) in inputs"
                    :key="index"
                    :value="input.id"
                    >{{ input.name }} ({{ input.manufacturer }})</option
                  >
                </select>
              </c>

              <c span="6" class="control-group__label">MIDI Output</c>
              <c span="2" class="control-group__control">
                <select name="outputs" v-model="outputId">
                  <option disabled selected>Select an output</option>
                  <option
                    v-for="(output, index) in outputs"
                    :key="index"
                    :value="output.id"
                    >{{ output.name }} ({{ output.manufacturer }})</option
                  >
                </select>
              </c>

              <c span="6" class="control-group__label">Polyphony Enable</c>
              <c span="2" class="control-group__control">
                <LabelledCheckbox
                  :labels="['Off', 'On']"
                  :emit-boolean="true"
                  v-model="polyphonic"
                />
              </c>

              <c span="6" class="control-group__label">Max Poly. Channels</c>
              <c span="2" class="control-group__control">
                <DraggableSelect
                  :values="[2, 3, 4, 5, 6]"
                  :default="6"
                  :emitArrayValue="true"
                  v-model.number="maxPolyphonicChannels"
                />
              </c>
            </template>
          </MDMControlGroup>
        </div>

        <GlobalSettings />

        <DACSettings />
      </c>
    </grid>
  </div>
</template>

<script>
import WebMidi from "webmidi";

import pkg from "../package.json";
import MDMControlGroup from "./components/MDMControlGroup";
import DraggableSelect from "./components/DraggableSelect";
import LabelledCheckbox from "./components/LabelledCheckbox";
import MDMADSR from "./components/MDMADSR";
import TFIFileUpload from "./components/TFIFileUpload";
import GENMFileUpload from "./components/GENMFileUpload";
import DACSettings from "./components/DACSettings";
import GlobalSettings from "./components/GlobalSettings";
import MDMAlgorithmDisplay from "./components/MDMAlgorithmDisplay";
import MDMSSGEGDisplay from "./components/MDMSSGEGDisplay";
import Arrow from "./components/Arrow";
import PatchList from "./components/PatchList";
import GENMFileDownload from "./components/GENMFileDownload";
import DMPFileUpload from "./components/DMPFileUpload";
import DMPFileDownload from "./components/DMPFileDownload";

export default {
  name: "App",

  components: {
    MDMControlGroup,
    MDMADSR,
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
    DMPFileDownload
  },

  data() {
    return {
      version: pkg.version,
      inputs: [],
      outputs: [],

      inputId: null,
      outputId: null,

      notesOn: {},
      polyphonyChannel: 1,
      storeUnsubscribe: null,

      ramSlot: 1,

      patchSlotValues: [...new Array(128).keys()].map((x, i) => i + 1),
      patchSlotIndex: 0
    };
  },

  computed: {
    outputPort() {
      return this.outputs.find(output => output.id === this.outputId);
    },

    channel: {
      get() {
        return this.$store.state.channel;
      },

      set(value) {
        this.$store.dispatch("setChannel", value);
      }
    },

    polyphonic: {
      get() {
        return this.$store.state.polyphonic;
      },

      set(value) {
        this.$store.dispatch("setPolyphony", value);
      }
    },

    maxPolyphonicChannels: {
      get() {
        return this.$store.state.maxPolyphonicChannels;
      },

      set(value) {
        this.$store.dispatch("setMaxPolyphonicChannels", value);
      }
    }
  },

  mounted() {
    WebMidi.enable(err => {
      if (err) {
        console.log("WebMidi could not be enabled.", err);
      } else {
        WebMidi.addListener("connected", this.populateInputAndOutputPorts);
        WebMidi.addListener("disconnected", this.populateInputAndOutputPorts);
      }
    });

    this.storeUnsubscribe = this.$store.subscribe(mutation => {
      if (mutation.type === "SET_CC_VALUE") {
        this.sendCC(mutation.payload);
      }
    });
  },

  beforeDestroy() {
    this.storeUnsubscribe();

    const input = this.inputs.find(input => input.id === this.inputId);
    if (input) {
      input.removeListener();
    }
  },

  methods: {
    populateInputAndOutputPorts() {
      this.outputs = WebMidi.outputs;
      this.inputs = WebMidi.inputs;
    },

    writeToSlot() {
      this.$store.dispatch("writePatch", {
        index: this.patchSlotIndex,
        patch: {
          data: { ...this.$store.state[`channel${this.channel}`] },
          name: "instrument " + this.patchSlotIndex
        }
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

    handleNoteOn(e) {
      if (!this.outputPort) {
        return;
      }

      const {
        note: { number, name, octave },
        velocity
      } = e;
      const note = `${name}${octave}`;

    //add ability to play several channel simultaneously
    //let channel = this.channel;
    let channel = e.channel;

      if (this.polyphonic) {
        channel = this.nextPolyphonyChannel(number);
      }

      this.notesOn[number] = channel;

      this.outputPort.playNote(note, channel, {
        velocity
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
      //add ability to play several channel simultaneously
      //this.outputPort.stopNote(note, this.notesOn[number]);
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
      // console.log("Received 'controlchange' message.", e);
      // this.$store.dispatch("setCCValues", {
      //   [e.controller.number]: this.inverse
      //     ? 127 - e.value
      //     : e.value
      // });

      this.$store.dispatch("setCCValuesOnChannel", {
        [e.controller.number]: this.inverse
          ? 127 - e.value
          : e.value,
        channel: e.channel
      });

      if (!this.outputPort) {
        return;
      }
    },

    freeChannels() {
      const channels = [false, true, true, true, true, true];

      Object.values(this.notesOn).forEach(channel => {
        channels[channel] = false;
      });

      return channels.findIndex(channel => channel);
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
    }
  },

  watch: {
    inputId(newId, oldId) {
      if (oldId) {
        const oldInput = this.inputs.find(input => input.id === oldId);
        if (oldInput) {
          oldInput.removeListener();
        }
      }

      const input = this.inputs.find(input => input.id === newId);

      // Listen for a 'note on' message on all channels
      input.addListener("noteon", "all", this.handleNoteOn);

      // Listen for a 'note off' message on all channels
      input.addListener("noteoff", "all", this.handleNoteOff);

      // Listen to pitch bend message on channel 3
      input.addListener("pitchbend", "all", this.handlePitchBend);

      input.addListener("controlchange", "all", this.handleCC);
    }
  }
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

body {
  background-color: var(--background-color);
  background-image: var(--background-image);
  background-attachment: fixed;
  background-position: calc(50% - 100px) center;
  background-repeat: no-repeat;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  margin: 0;
}

#app,
button,
input {
  font-family: "Kokoro";
  letter-spacing: -1px;

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
}

.main-column {
  padding-right: 2em;
}
</style>
