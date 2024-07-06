<template>
  <div>
    <h2>DAC Control</h2>
    <MDMControlGroup :cc-values="[78, 86, 88, 79, 89]" />
    <MDMWaveform />
  </div>
</template>

<script>
import MDMControlGroup from "./MDMControlGroup";
import MDMWaveform from "./MDMWaveform";

export default {
  components: {
    MDMControlGroup,
    MDMWaveform
  }
};
</script>
