<template>
  <div>
    <h2>Global Settings</h2>
    <MDMControlGroup :cc-values="[84, 83, 74, 1, 85, 81, 80]" />
  </div>
</template>

<script>
import MDMControlGroup from "./MDMControlGroup.vue";

export default {
  components: {
    MDMControlGroup,
  },
};
</script>
