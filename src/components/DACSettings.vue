<template>
  <div>
    <h2>DAC Control</h2>
    <MDMControlGroup :cc-values="[
      78,
      86,
      88,
      79,
      89
    ]" />
  </div>
</template>

<script>
import MDMControlGroup from "./MDMControlGroup";

export default {
  components: {
    MDMControlGroup
  }
}
</script>
