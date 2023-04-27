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

## Using genMDM Editor
genMDM Editor is a desktop executable and a webpage.

The webpage works in Chromuim based browsers.
Those browsers include Google Chrome, Opera, Brave and Microsoft Edge.

Using genMDM on iOS/iPadOS is possible using Web MIDI Browser, found here: [apps.apple.com/app/web-midi-browser](https://apps.apple.com/app/web-midi-browser/id953846217)

genMDM Editor is compatible with both the genMDM, by little-scale, and the MDMI (Mega Drive MIDI Interface), by Robert Hargreaves.
This Readme will refer to both interfaces as **"your Sega"**, for convinience.

Check out the overview video on how to use the editor: [youtu.be/btzQHaF8cU4](https://youtu.be/btzQHaF8cU4)

### Getting genMDM Editor

1. Download the latest release at [genmdm-editor/releases/latest](https://github.com/2xAA/genmdm-editor/releases/latest) or navigate to [2xaa.github.io/genmdm-editor](https://2xaa.github.io/genmdm-editor).
2. Select the MIDI device connected to your Sega in the MIDI Output dropdown.

### MDMI Compatibility
If using MDMI, ensure the **"MDMI Compatibility"** option is turned on *after* connecting the MDMI.  
The option sends a SysEx message to MDMI to invert the operator's Total Levels, as GenMDM does.

With the **"MDMI Compatibility"** option turned on, changing channels in the editor informs MDMI to show the channel's settings on the video output.  
More information: [mega-drive-midi-interface/wiki/UI-Features](https://github.com/rhargreaves/mega-drive-midi-interface/wiki/UI-Features#displaying-current-fm-channel-parameters)

### File Formats

#### `.genm` Format

The genMDM Editor was build around the `.genm` file format, which can hold 128 genMDM instruments.  
Each instrument in the `.genm` file can store every parameter of the genMDM instrument.

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

|Format|Information|Pitfalls|
|---|---|---|
|`.dmp`|`.dmp` is Deflemask's instrument format. It's a multi-system format, so not all patches can be imported into genMDM Editor - only those which were saved from the Sega Genesis system in Deflemask.|Doesn't hold the stereo configuration option.|
|`.tfi`|`.tfi` is TFM Music Maker's instrument format.|Doesn't hold AM or FM LFO parameters or stereo configuation.|
|`.y12`|`.y12` is a format for storing YM2612 FM preset data, similar to `.tfi`|Doesn't hold AM or FM LFO parameters or stereo configuation.|

### State

Neither genMDM or MDMI save their session state when powered off, but genMDM Editor does.

#### Autosave

genMDM Editor saves your editor state automatically, so if your Sega loses power, crashes, etc., your state can be restored by plugging in your Sega, selecting it in the MIDI Output dropdown and pressing the **"Send State"** button.

#### Load/Save

genMDM Editor's state can be saved to a file at any time by pressing the **"Save State"** button. The editor's file format is `.ged` and saves in a compressed JSON format.  

The `.ged` files can be loaded back into the editor with the **"Load State"** button. If you want to sync this state to your Sega, press the **"Send State"** button.

### Polyphony

genMDM does not support polyphony, though MDMI does the editor currently does not use this.

If **"Polyphony Enable"** is turned on, the **"MIDI Input"** device selected in the editor will have its notes spread over the output MIDI channels, starting from channel 1 up to the limit set by **"Max Poly. Channels"** (minimum 2, maximum 6).

When **"Polyphony Enable"** is turned on, changes to the instrument are copied automatically over the polyphony channels.

## Support
If you have any questions that aren't covered in the linked video, please start a discussion at [genmdm-editor/discussions](https://github.com/2xAA/genmdm-editor/discussions).

## Project development setup

```
yarn
```

### Compiles and hot-reloads for development in the browser

```
yarn serve
```

### Builds for browser release

```
yarn build
```

### Compiles and hot-reloads for development with [Electron](https://www.electronjs.org)

```
yarn electron:serve
```

### Builds for electron release

```
yarn electron:build
```


## Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/2xAA/genmdm-editor/issues).



## Show your support

Give a ⭐️  if this project helped you!

Consider sponsoring me on GitHub: [https://github.com/sponsors/2xAA](https://github.com/sponsors/2xAA).



## License

Copyright © 2021 [2xAA](https://github.com/2xAA).

This project is [MIT](https://github.com/2xAA/genmdm-editor/blob/main/LICENSE) licensed.
