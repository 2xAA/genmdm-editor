/**
 * @typedef {Object} Control
 * @property {string} label - The label of the control.
 * @property {number} range - The range of values for the control.
 * @property {boolean} [type] - The type of the control, if specified.
 * @property {number} default - The default value of the control.
 * @property {string[]} [enum] - The enum values for the control, if specified.
 * @property {string} [description] - The description of the control, if specified.
 * @property {number[]} [values] - The specific values corresponding to the enum, if specified.
 */

/**
 * @typedef {Object.<number, Control>} GenMDMMapping
 */

/**
 * @type {GenMDMMapping}
 */
export default {
  // YM2612 Global Control

  74: {
    label: "LFO Enable",
    range: 2,
    type: "bool",
    default: 0,
    enum: ["Off", "On"],
    description: `2 values over the range of 0 to 127. A CC value of less than 64 disables the LFO on a global scale.
A value of more than 63 enables the LFO on a global scale. In addition to this parameter, each
 individual channel requires an LFO enable for either amplitude or frequency LFO modulation.`,
  },

  1: {
    label: "LFO Speed",
    range: 8,
    default: 4,
    description: `8 values over the range of 0 to 127. This CC sets the speed of the LFO. 0 is the slowest speed. 127
 is the fastest speed.`,
  },

  85: {
    label: "Pitch Transposition",
    range: 128,
    default: 64,
    description: `128 values of the range of 0 to 127. Set a global pitch offset of – 64 to + 63 semitones. Default is +
 or – 0 semitones which is equivalent to a CC value of 64.`,
  },

  84: {
    label: "Octave Division",
    range: 128,
    default: 11,
    description: `128 values of the range of 0 to 127. Sets the global equal-tempered division of the octave. The
      tuning of the interface is equal to (CC + 1) TET. The default is an equal division of the octave into
      twelve parts (the Western music scale), which is equivalent to a CC value of 11.`,
  },

  83: {
    label: "Region Tuning",
    range: 2,
    enum: ["PAL", "NTSC"],
    type: "bool",
    default: 0,
    description: `2 values over the range of 0 to 127. A CC value of less than 64 sets the interface to the PAL tuning.
A value of more than 63 sets the interface to the NTSC tuning. The default setting is PAL.`,
  },

  80: {
    label: "Voice 3 Special Mode",
    range: 2,
    type: "bool",
    enum: ["Off", "On"],
    default: false,
    description: `When Voice 3 is in Special Mode, each operator of Voice 3 has its own frequency.
In this case, the frequency for each is controlled using MIDI ch 3, 11, 12 and 13.
In this case, the TL / volume of each operator is controlled via velocity.`,
  },

  // YM2612 DAC Control
  78: {
    label: "Enable",
    range: 2,
    type: "bool",
    enum: ["Off", "On"],
    default: false,
    description: `2 values over the range of 0 to 127. A CC value of less than 64 disables the DAC on channel 6. A
 value of more than 63 enables the DAC on channel 6. Note that with the DAC enabled, MIDI notes
 as played back on channel 6 will trigger samples or noise or custom waveforms instead of FM
 synthesis sounds.

The mapping of samples to MIDI notes wraps around every two octaves in the range of MIDI note
 60 to MIDI note 127. A note-on on MIDI channel 6 will trigger sample playback. A note-off on
 MIDI channel 6 will stop sample playback.

01. C-1 - kick 1
02. C#1 - snare 1
03. D-1 - hat closed 1
04. D#1 - hat open 1
05. E-1 - tom low 1
06. F-1 - tom hi 1
07. F#1 - cow bell
08. G-1 - kick 2
09. G#1 - snare 2
10. A-1 - hat closed 2
11. A#1 - hat open 1
12. B-1 - tom low 1
13. C-2 - tom hi 1
14. C#2 - ride 1
15. D-2 - crash
16. D#2 - kick 3
17. E-2 - snare 3
18. F-2 - ride 2

From MIDI note 0 to MIDI note 59, the DAC is used to play either a noise waveform or a
 customisable periodic waveform. By changing CC89, the choice between noise waveform or the
 customisable periodic waveform can be made. By changing CC100 to CC113, the individual bytes
 that make up the customisable waveform can be changed, thereby manipulating the timbre of the
 sound. Throughout this range of MIDI notes (0 to 59), the higher the note, the higher the pitch of
 the DAC waveform.`,
  },

  79: {
    label: "Data",
    range: 128,
    default: 0,
    description: `128 values over the range of 0 to 127. This parameter will set the output voltage of the DAC to a
 value of CCVALUE * 2. The default value is 0. This parameter will only have an effect on the audio
 output when the DAC is enabled.`,
  },

  86: {
    label: "Sample Rate",
    range: 128,
    default: 0,
    description: `128 values over the range of 0 to 127. This parameter sets the playback rate for the samples on
 channel 6. 0 is the fastest speed and 127 is the slowest speed. The default value is 0. This parameter
 will only have an effect on the audio output when the DAC is enabled.`,
  },

  88: {
    label: "Oversample",
    range: 16,
    default: 0,
    description: `128 values over the range of 0 to 127. This parameter sets the playback over sampling rate for the
 samples on channel 6. In other words, it changes the playback rate (ie. Pitch and speed) by a factor
 of 1 x, 2 x, 3 x or 4 x. The default value is 1 x, which is equivalent to a CC value of 0 to 31. This
 parameter will only have an effect on the audio output when the DAC is enabled. `,
  },

  89: {
    label: "Noise / Wave Toggle",
    range: 2,
    type: "bool",
    enum: ["Off", "On"],
    default: 0,
  },

  100: {
    label: "Custom Wave Byte 1 of 14",
    range: 128,
  },

  101: {
    label: "Custom Wave Byte 2 of 14",
    range: 128,
  },

  102: {
    label: "Custom Wave Byte 3 of 14",
    range: 128,
  },

  103: {
    label: "Custom Wave Byte 4 of 14",
    range: 128,
  },

  104: {
    label: "Custom Wave Byte 5 of 14",
    range: 128,
  },

  105: {
    label: "Custom Wave Byte 6 of 14",
    range: 128,
  },

  106: {
    label: "Custom Wave Byte 7 of 14",
    range: 128,
  },

  107: {
    label: "Custom Wave Byte 8 of 14",
    range: 128,
  },

  108: {
    label: "Custom Wave Byte 9 of 14",
    range: 128,
  },

  109: {
    label: "Custom Wave Byte 10 of 14",
    range: 128,
  },

  110: {
    label: "Custom Wave Byte 11 of 14",
    range: 128,
  },

  112: {
    label: "Custom Wave Byte 13 of 14",
    range: 128,
  },

  113: {
    label: "Custom Wave Byte 14 of 14",
    range: 128,
  },

  // YM2612 Channel / Voice Control
  9: {
    label: "Preset Instrument Setting",
    range: 16,
    description: `16 values over a range of 0 to 127. This parameter activates one of 16 preset instrument settings.
These instrument settings are stored in the memory of the interface itself, and cannot be altered by
 the user.
The preset instruments are as follow:
  1. Lead Synth
  2. Bass
  3. Church Organ
  4. Xylophone
  5. String Pizzicato
  6. Brass
  7. -
  8. -
  9. -
  10. -
  11. -
  12. -
  13. -
  14. -
  15. -
  16. -

Note that the following parameters are affected by recalling one of the above presets:
  – FM Algorithm
  – FM Feedback
  – Total Level of Operators 1, 2, 3 and 4
  – Multiple of Operators 1, 2, 3 and 4
  – Detune of Operators 1, 2, 3 and 4
  – Attack Rate of Operators 1, 2, 3 and 4
  – First Decay Rate of Operators 1, 2, 3 and 4
  – Secondary Decay Rate of Operators 1, 2, 3 and 4
  – Secondary Amplitude Level of Operators 1, 2, 3 and 4
  – Release Rate of Operators 1, 2, 3 and 4`,
  },

  81: {
    label: "Pitch Bend Range",
    range: 10,
    default: 3,
    description: `10 values of the range of 0 to 127. This parameter sets the bend amount in semitones, from 0
 semitones to 10 semitones.`,
  },

  14: {
    label: "FM Algorithm",
    range: 8,
    default: 0,
    description: `8 values over a range of 0 to 127. This parameter sets the algorithm of the selected channel. The
 algorithm determines the relationship between the four operators, and can change the timbre and
 complexity of the sound. There are 8 algorithms available, as follows. In the diagram below, a grey
 box indicates that a given operator is acting as a carrier (and is directly audible). A white box
 indicates that a given operator is acting as a modulator (and is modulating the frequency of another
 operator).`,
  },

  15: {
    label: "FM Feedback",
    range: 8,
    default: 0,
    description: `8 values over a range of 0 to 127. This parameter sets the amount that operator 1 feeds back onto
 itself. The higher the value, the more distorted the sound.`,
  },

  77: {
    label: "Stereo Configuration",
    range: 4,
    type: "enum",
    default: 127,
    enum: ["Mute", "Right", "Left", "Center"],
    description: `4 values over a range of 0 to 127. This parameter sets the stereo output (panning) of the specified
 channel. Note that the stereo placement of a channel will have no effect if a mono cable is used
 (generally from the AV output socket from the Genesis / Mega Drive Console). For the best
 separation of the left and right audio signals, a modification is recommended, or the use of the
 headphone output port from a Nomad or a Genesis / Mega Drive model 1 console.

A CC value of 0 to 31 indicates that the channel is OFF (muted). A CC value of 32 – 63 indicates
 that the channel is panned LEFT. A CC value of 64 – 95 indicates that the channel is panned
 RIGHT. A CC value of 96 – 127 indicated that the channel is panned CENTER. The default setting
 is CENTER. `,
  },

  76: {
    label: "AM LFO Level",
    range: 8,
    default: 0,
    description: `8 values over a range of 0 to 127. This parameter sets the depth of amplitude modulation by the
 LFO for the specified channel. The default CC value is 0 (no modulation).`,
  },

  75: {
    label: "FM LFO Level",
    range: 8,
    default: 0,
    description: `8 values over a range of 0 to 127. This parameter sets the depth of frequency modulation by the
 LFO for the specified channel. The default CC value is 0 (no modulation).`,
  },

  // YM2612 Operator Control
  16: {
    label: "Total Level",
    range: 128,
    default: 127,
  },

  17: {
    label: "Total Level",
    range: 128,
    default: 127,
  },

  18: {
    label: "Total Level",
    range: 128,
    default: 127,
  },

  19: {
    label: "Total Level",
    range: 128,
    default: 127,
  },

  20: {
    label: "Multiple",
    range: 16,
    default: 0,
  },

  21: {
    label: "Multiple",
    range: 16,
    default: 0,
  },

  22: {
    label: "Multiple",
    range: 16,
    default: 0,
  },

  23: {
    label: "Multiple",
    range: 16,
    default: 0,
  },

  24: {
    label: "Detune",
    default: 73,
    enum: ["-3", "-2", "-1", "0", "0", "+1", "+2", "+3"],
    values: [127, 109, 90, 0, 73, 16, 36, 55],
  },

  25: {
    label: "Detune",
    default: 73,
    enum: ["-3", "-2", "-1", "0", "0", "+1", "+2", "+3"],
    values: [127, 109, 90, 0, 73, 16, 36, 55],
  },

  26: {
    label: "Detune",
    default: 73,
    enum: ["-3", "-2", "-1", "0", "0", "+1", "+2", "+3"],
    values: [127, 109, 90, 0, 73, 16, 36, 55],
  },

  27: {
    label: "Detune",
    default: 73,
    enum: ["-3", "-2", "-1", "0", "0", "+1", "+2", "+3"],
    values: [127, 109, 90, 0, 73, 16, 36, 55],
  },

  39: {
    label: "Rate Scale",
    range: 4,
    default: 0,
  },

  40: {
    label: "Rate Scale",
    range: 4,
    default: 0,
  },

  41: {
    label: "Rate Scale",
    range: 4,
    default: 0,
  },

  42: {
    label: "Rate Scale",
    range: 4,
    default: 0,
  },

  43: {
    label: "Attack Rate",
    range: 32,
    default: 0,
  },

  44: {
    label: "Attack Rate",
    range: 32,
    default: 0,
  },

  45: {
    label: "Attack Rate",
    range: 32,
    default: 0,
  },

  46: {
    label: "Attack Rate",
    range: 32,
    default: 0,
  },

  47: {
    label: "First Decay Rate",
    range: 32,
  },

  48: {
    label: "First Decay Rate",
    range: 32,
  },

  49: {
    label: "First Decay Rate",
    range: 32,
  },

  50: {
    label: "First Decay Rate",
    range: 32,
  },

  51: {
    label: "Secondary Decay Rate",
    range: 32,
  },

  52: {
    label: "Secondary Decay Rate",
    range: 32,
  },

  53: {
    label: "Secondary Decay Rate",
    range: 32,
  },

  54: {
    label: "Secondary Decay Rate",
    range: 32,
  },

  55: {
    label: "Secondary Amplitude Level",
    range: 16,
  },

  56: {
    label: "Secondary Amplitude Level",
    range: 16,
  },

  57: {
    label: "Secondary Amplitude Level",
    range: 16,
  },

  58: {
    label: "Secondary Amplitude Level",
    range: 16,
  },

  59: {
    label: "Release Rate",
    range: 16,
  },

  60: {
    label: "Release Rate",
    range: 16,
  },

  61: {
    label: "Release Rate",
    range: 16,
  },

  62: {
    label: "Release Rate",
    range: 16,
  },

  70: {
    label: "AM",
    range: 2,
    type: "bool",
    enum: ["Off", "On"],
    default: 0,
  },

  71: {
    label: "AM",
    range: 2,
    type: "bool",
    enum: ["Off", "On"],
    default: 0,
  },

  72: {
    label: "AM",
    range: 2,
    type: "bool",
    enum: ["Off", "On"],
    default: 0,
  },

  73: {
    label: "AM",
    range: 2,
    type: "bool",
    enum: ["Off", "On"],
    default: 0,
  },

  90: {
    label: "SSG-EG",
    enum: ["Off", "0", "1", "2", "3", "4", "5", "6", "7"],
    values: [0, 32, 36, 40, 44, 48, 52, 56, 60],
    range: 9,
    default: 0,
  },

  91: {
    label: "SSG-EG",
    enum: ["Off", "0", "1", "2", "3", "4", "5", "6", "7"],
    values: [0, 32, 36, 40, 44, 48, 52, 56, 60],
    range: 9,
    default: 0,
  },

  92: {
    label: "SSG-EG",
    enum: ["Off", "0", "1", "2", "3", "4", "5", "6", "7"],
    values: [0, 32, 36, 40, 44, 48, 52, 56, 60],
    range: 9,
    default: 0,
  },

  93: {
    label: "SSG-EG",
    enum: ["Off", "0", "1", "2", "3", "4", "5", "6", "7"],
    values: [0, 32, 36, 40, 44, 48, 52, 56, 60],
    range: 9,
    default: 0,
  },
};
