<h1 align="center">genMDM Editor</h1>
<p align="center"><img alt="genmdm-editor logo" src="https://github.com/2xAA/genmdm-editor/raw/main/build/icon.png" width="256" /></p>

<p align="center">
  <a href="https://github.com/2xAA/genmdm-editor/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/2xAA/genmdm-editor/blob/main/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/2xAA/genmdm-editor" />
  </a>
</p>
<p align="center">
genMDM editor is a GUI for <a href="https://catskullelectronics.com/products/genmdm" target="_blank">genMDM</a>, a MIDI controller for the Sega Mega Drive and Genesis.<br>
Also fully compatible with <a href="https://github.com/rhargreaves/mega-drive-midi-interface" target="_blank">Mega Drive MIDI Interface</a>.
</p>

<div align="center">
  <video src="https://user-images.githubusercontent.com/554219/232328348-34175e38-a6a9-43a4-8781-14f210814465.mp4"></video>
</div>

## About genMDM Editor

genMDM Editor is a desktop executable and a webpage.

The webpage works in Firefox (starting at Firefox version 99) and Chromuim based browsers.
Chromium based browsers include Google Chrome, Opera, Brave and Microsoft Edge.

Using genMDM Editor on iOS/iPadOS is possible using Web MIDI Browser, found here: [apps.apple.com/app/web-midi-browser](https://apps.apple.com/app/web-midi-browser/id953846217)

genMDM Editor is compatible with both the GenMDM, by little-scale, and the MDMI (Mega Drive MIDI Interface), by Robert Hargreaves.
This Readme will refer to both interfaces as **"your Sega"**, for convinience.

## Getting Started

Read this README!

If you have any questions that aren't covered in the linked YouTube video below or this README, please start a discussion at [genmdm-editor/discussions](https://github.com/2xAA/genmdm-editor/discussions).

## Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/2xAA/genmdm-editor/issues).

## Support this project

Give a ⭐️ if this project helped you!

Consider sponsoring me on GitHub or PayPal: [github.com/sponsors/2xAA](https://github.com/sponsors/2xAA) / [paypal.me/2xAA](https://paypal.me/2xAA).

## Using genMDM Editor

### Quickstart

Check out the overview video on how to use the editor: [youtu.be/btzQHaF8cU4](https://youtu.be/btzQHaF8cU4)

### Getting genMDM Editor

#### Desktop

Download the latest desktop release at [genmdm-editor/releases/latest](https://github.com/2xAA/genmdm-editor/releases/latest).

#### Web

Navigate to [2xaa.github.io/genmdm-editor](https://2xaa.github.io/genmdm-editor).

### Mega Drive MIDI Interface Compatibility

If using MDMI (Mega Drive MIDI Interface), ensure the **"MDMI Compatibility"** option is turned on _after_ connecting the MDMI.
The option sends a SysEx message to MDMI to invert the operator's Total Levels, as GenMDM does.

With the **"MDMI Compatibility"** option turned on, changing channels in the editor informs MDMI to show the channel's settings on the video output.
More information: [mega-drive-midi-interface/wiki/UI-Features](https://github.com/rhargreaves/mega-drive-midi-interface/wiki/UI-Features#displaying-current-fm-channel-parameters)

### File Formats

#### `.genm` Format

The genMDM Editor was build around the `.genm` file format, which can hold 128 GenMDM instruments.
Each instrument in the `.genm` file can store every parameter of the GenMDM instrument.

The `.genm` format does not include any of the editor settings, the global settings or the DAC Control settings.

More information: [little-scale.blogspot.com/genm-file-format](http://little-scale.blogspot.com/2013/02/genm-file-format-genmdm-instrument.html)

##### `.genm` load/save

Pressing the **"LOAD GENM"** button will open a file browser to choose a `.genm` file to load.
Loading a `.genm` file will overwrite the current patches in the editor. It will not load anything to the current channel.

Pressing the **"SAVE GENM"** button will open a file browser to choose where to save a `.genm` file containing all the patches in the editor's patch list.

#### Instrument Files

genMDM Editor can import and export `.tfi`, `.dmp` and `.y12` formats using their corresponding **"IMPORT"** and **"EXPORT"** buttons.

The **"IMPORT"** buttons will open a file browser to load an instrument to the current channel - it does not write to the patch slot.

The **"EXPORT"** buttons will open a file browser to save the current channel's parameters to the selected instrument file format - it does not read from the patch slot.

| Format | Information                                                                                                                                                                                         | Pitfalls                                                     |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `.dmp` | `.dmp` is Deflemask's instrument format. It's a multi-system format, so not all patches can be imported into genMDM Editor - only those which were saved from the Sega Genesis system in Deflemask. | Doesn't hold the stereo configuration option.                |
| `.tfi` | `.tfi` is TFM Music Maker's instrument format.                                                                                                                                                      | Doesn't hold AM or FM LFO parameters or stereo configuation. |
| `.y12` | `.y12` is a format for storing YM2612 FM preset data, similar to `.tfi`                                                                                                                             | Doesn't hold AM or FM LFO parameters or stereo configuation. |

#### `.ged` format

This is a format for the genMDM Editor's internal state. It uses [`compress-json`](https://github.com/beenotung/compress-json) to serialise the internal state to a file.
It contains the entire application state, including patches and editor settings.

### State

Neither GenMDM or MDMI save their session state when powered off, but genMDM Editor does.

#### Autosave

genMDM Editor saves your editor state automatically, so if your Sega loses power, crashes, etc., your state can be restored by plugging in your Sega, selecting it in the MIDI Output dropdown and pressing the **"Send State"** button.

#### Load/Save

genMDM Editor's state can be saved to a file at any time by pressing the **"Save State"** button.

The `.ged` files can be loaded back into the editor with the **"Load State"** button. Loading a `.ged` file will overwrite the editor's autosaved state immediately.
If you want to sync this state to your Sega, press the **"Send State"** button.

### MIDI

#### MIDI CC

The genMDM Editor UI reacts to incoming MIDI CC messages. It is recommended to route all MIDI messages to the Sega through genMDM Editor to keep the UI in sync.

Find GenMDM's MIDI CC parameters here:
[little-scale.com/GENMDM/GENMDM_102/GENMDM_102.txt](https://web.archive.org/web/20210205134907/http://little-scale.com/GENMDM/GENMDM_102/GENMDM_102.txt) (102 version linked, which is the version catskull used in their production runs)

Find MDMI's MIDI CC parameters here:

- [mega-drive-midi-interface/wiki/Common-MIDI-CCs-&-Events](https://github.com/rhargreaves/mega-drive-midi-interface/wiki/Common-MIDI-CCs-&-Events)
- [mega-drive-midi-interface/wiki/FM-Parameter-CCs](https://github.com/rhargreaves/mega-drive-midi-interface/wiki/FM-Parameter-CCs)

#### Voice Configuration

The voice configuration dialog can be accessed by the **"VOICE CONFIGURATION"** button in the **"EDITOR SETTINGS"** section.

This dialog's features adapt to whether GenMDM is being used or MDMI.
Please read below which features are available for which platforms.

##### Voice Groups

genMDM Editor can group the 6 FM channels in up to 3 groups. Groups are only available for **"POLY"** and **"UNI"** (unison) modes.

Groups can only contain channels set to the same mode. You cannot mix **"MONO"**, **"POLY"** and **"UNI"** in the same voice group.

If a channel is in a group, notes and CC values are also sent to that channel will also be sent to the channels in its group. If you change any channel parameters in the editor, those changes are made across all the channels in the group.

##### Mono

If a channel is set to **"MONO"** it may not be in a group.

##### Polyphony

GenMDM does not support polyphony, though MDMI has its own polyphony the editor currently does not use this.

Example setup: Channels 1, 2 and 6 are in group 1 and are all set to **"POLY"** mode. I play a 3 note chord and the notes are spread across channels 1, 2 and 6, leaving channels 3, 4 and 5 free to do something else.

##### Unison

Example setup: Channels 4 and 5 are in group 2 and are all set to **"UNI**" mode. I load a patch into channel 4 and the same is loaded into channel 5. I play a single note and both channels play the same sound at the same time.

##### Detune

This feature is only available for MDMI. See CC 85 in MDMI's docs here: [mega-drive-midi-interface/wiki/MIDI-CCs-&-Events](https://github.com/rhargreaves/mega-drive-midi-interface/wiki/MIDI-CCs-&-Events).

Detune is especially useful for unison voice modes, to create chorus effects.

Example setup: Channels 4 and 5 are in group 2 and are all set to **"UNI**" mode. I load a patch into channel 4 and the same is loaded into channel 5.  
Detune on channel 4 is set to 41 and channel 5 is set to 79. I play a single note and both channels play the same note, however since they are playing the same sound but slightly detuned a phasing/chorus effect is produced.

##### Portamento

This feature is only available for MDMI. See CC 65 in MDMI's docs here: [mega-drive-midi-interface/wiki/MIDI-CCs-&-Events](https://github.com/rhargreaves/mega-drive-midi-interface/wiki/MIDI-CCs-&-Events).

Portamento can be toggled On or Off for each channel. Once it is on for a channel, the **"PORTA. TIME"** dial below controls the length of the note glide.

This feature works best for **"UNI"** or **"MONO"** channels.

## Project development setup

```
yarn
```

### Compiles and hot-reloads for development in the browser

```
yarn dev:browser
```

### Builds for browser release

```
yarn build:browser
```

### Compiles and hot-reloads for development with [Electron](https://www.electronjs.org)

```
yarn dev
```

### Builds for electron release

```
yarn build
```

## License

Copyright © 2024 [2xAA](https://github.com/2xAA).

This project is [MIT](https://github.com/2xAA/genmdm-editor/blob/main/LICENSE) licensed.
