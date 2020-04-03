<template>
  <div id="app">
    <grid columns="12">
      <c span="10">
        <grid columns="10">
          <c span="2">
            <h2>Channel settings</h2>

            <MDMControlGroup :cc-values="[
              14,
              15,
              77,
              76,
              75
            ]">
              <template v-slot:header>
                <c span="6" class="control-group__label">Channel</c>
                <c span="2" class="control-group__control">
                  <select name="channel" v-model.number="channel">
                    <option v-for="x in 6" :key="x" :value="x">{{x}}</option>
                  </select>
                </c>
              </template>
            </MDMControlGroup>
          </c>
          <c span="6">
            <MDMAlgorithmDisplay />
          </c>
          <c span="2">
            <TFIFileUpload/>
            <GENMFileUpload/>
          </c>
          <c span="10">
            <grid columns="2">
              <c v-for="x in 4" :key="x">
                <h2>OP {{x}}</h2>
                <MDMADSR :operator="x"/>
              </c>
            </grid>
          </c>
        </grid>
      </c>
      <c span="2">
        <div class="editor-title">
          <h2>GenMDM Editor</h2>
          <h2>By 2xAA</h2>
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
                  >{{input.name}} ({{input.manufacturer}})</option>
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
                  >{{output.name}} ({{output.manufacturer}})</option>
                </select>
              </c>

              <c span="6" class="control-group__label">Polyphony Enable</c>
              <c span="2" class="control-group__control">
                <input type="checkbox" v-model="polyphonic" id="polyphonic">
              </c>

              <c span="6" class="control-group__label">Max Poly. Channels</c>
              <c span="2" class="control-group__control">
                <select
                  name="maxPolyphonicChannels"
                  v-model.number="maxPolyphonicChannels"
                >
                  <option v-for="x in 6" :key="x" :value="x">{{x}}</option>
                </select>
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

import MDMControlGroup from "./components/MDMControlGroup";
import MDMADSR from "./components/MDMADSR";
import TFIFileUpload from "./components/TFIFileUpload";
import GENMFileUpload from "./components/GENMFileUpload";
import DACSettings from "./components/DACSettings";
import GlobalSettings from "./components/GlobalSettings";
import MDMAlgorithmDisplay from "./components/MDMAlgorithmDisplay.vue";

export default {
  name: "App",

  components: {
    MDMControlGroup,
    MDMADSR,
    TFIFileUpload,
    GENMFileUpload,
    DACSettings,
    GlobalSettings,
    MDMAlgorithmDisplay
  },

  data() {
    return {
      inputs: [],
      outputs: [],

      inputId: null,
      outputId: null,

      notesOn: {},
      polyphonyChannel: 1
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
        console.log("WebMidi enabled!");

        WebMidi.addListener("connected", this.populateInputAndOutputPorts);
        WebMidi.addListener("disconnected", this.populateInputAndOutputPorts);
      }
    });

    this.$store.subscribe((mutation) => {
      if (mutation.type === "SET_CC_VALUE") {
        this.sendCC(mutation.payload);
      }
    });
  },

  methods: {
    populateInputAndOutputPorts() {
      this.outputs = WebMidi.outputs;
      this.inputs = WebMidi.inputs;
    },

    sendCC({ cc, value, channel }) {
      if (!this.outputPort) {
        return;
      }

      this.outputPort.sendControlChange(parseInt(cc, 10), value, channel);
    },

    handleNoteOn(e) {
      if (!this.outputPort) {
        return;
      }

      const {
        note: { number, name, octave }
      } = e;
      const note = `${name}${octave}`;

      let channel = this.channel;

      if (this.polyphonic) {
        channel = this.nextPolyphonyChannel(number);
      }

      this.notesOn[number] = channel;

      this.outputPort.playNote(note, channel, {
        velocity: 1
      });
    },

    handleNoteOff(e) {
      if (!this.outputPort) {
        return;
      }

      const { name, octave, number } = e.note;
      const note = `${name}${octave}`;

      this.outputPort.stopNote(note, this.notesOn[number]);

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

    nextPolyphonyChannel(newNoteNumber) {
      const notesOn = Object.keys(this.notesOn);
      const lowestNote = Math.min(...notesOn);
      let lowestNoteChannel = this.polyphonyChannel;

      if (newNoteNumber > lowestNote) {
        lowestNoteChannel = this.notesOn[lowestNote];
      }

      if (lowestNoteChannel + 1 > this.maxPolyphonicChannels) {
        this.polyphonyChannel = 1;
      } else {
        this.polyphonyChannel = lowestNoteChannel + 1;
      }

      return this.polyphonyChannel;
    }
  },

  watch: {
    inputId(newId, oldId) {
      if (oldId) {
        const oldInput = this.inputs.find(input => input.id === oldId);
        oldInput.removeListener();
      }

      const input = this.inputs.find(input => input.id === newId);

      // Listen for a 'note on' message on all channels
      input.addListener("noteon", "all", this.handleNoteOn);

      // Listen for a 'note off' message on all channels
      input.addListener("noteoff", "all", this.handleNoteOff);

      // Listen to pitch bend message on channel 3
      input.addListener("pitchbend", "all", this.handlePitchBend);
    }
  }
};
</script>

<style>
@import url("/fonts/kokoro/index.css");

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  max-width: 1120px;
  margin: 0 auto;

  font-family: "Kokoro";
  letter-spacing: -1px;
}

label span {
  background-color: transparent;
  color: #000;
}

select {
  width: 100%;
}

h2 {
  font-size: 18px;
  font-weight: normal;
  text-transform: uppercase;
}
</style>
