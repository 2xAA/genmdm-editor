<template>
  <div class="draggable-select ns-resize-cursor" ref="draggableSelectBody">
    <template v-if="labels.length">
      {{ currentLabel }}
    </template>

    <template v-else>
      {{ currentIndex }}
    </template>
  </div>
</template>

<script>
export default {
  props: {
    values: {
      type: Array,
      required: true
    },

    default: {},

    labels: {
      type: Array,
      default: () => []
    },

    value: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      cacheValue: null,

      mouseMovementRangeInPixels: 128,
      downY: -1,
      internalValue: 0
    }
  },

  created() {
    this.internalValue = this.value;
  },

  mounted() {
    this.$refs.draggableSelectBody.addEventListener("mousedown", this.down);
  },

  beforeDestroy() {
    this.$refs.draggableSelectBody.removeEventListener("mousedown", this.down);
    document.removeEventListener("mouseup", this.up);
    document.removeEventListener("mousemove", this.move);
    document.body.classList.remove("ns-resize-cursor");
  },

  computed: {
    currentIndex() {
      return this.value;
    },

    currentLabel() {
      return this.labels[this.currentIndex];
    },
  },

  methods: {
    down(e) {
      document.addEventListener("mouseup", this.up);

      this.downY = e.pageY;
      document.addEventListener("mousemove", this.move);
      document.body.classList.add("ns-resize-cursor");
    },

    up(e) {
      this.updateValue(e);

      this.downY = -1;
      document.removeEventListener("mouseup", this.up);
      document.removeEventListener("mousemove", this.move);
      document.body.classList.remove("ns-resize-cursor");
    },

    move(e) {
      this.updateValue(e);
    },

    updateValue(e) {
      const { pageY } = e;
      const { values, downY, mouseMovementRangeInPixels, internalValue } = this;
      let differenceInPixels = downY - pageY;

      const valueDifference =
        differenceInPixels / mouseMovementRangeInPixels;

      const newValue = valueDifference + internalValue;
      const clampedNewValue = Math.max(0, Math.min(1, newValue));
      this.internalValue = clampedNewValue;

      this.cacheValue = values[this.currentIndex];

      this.downY = pageY;
    },
  },

  watch: {
    cacheValue(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.$emit("input", newValue);
      }
    },

    value(newValue) {
      if (newValue !== this.cacheValue) {
        this.cacheValue = newValue;
        this.internalValue = newValue;
      }
    }
  }
}
</script>

<style>
.draggable-select {
  width: 100%;
  height: 100%;
  user-select: none;

  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
