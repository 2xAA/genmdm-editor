<template>
  <dialog
    ref="dialog"
    :style="{
      width,
      height
    }"
  >
    <header>
      <button
        @click="close"
        class="close"
        aria-label="Close Dialog"
        :disabled="closeDisabled"
      >
        <CloseIcon class="close-icon" width="14" height="15" />
      </button>
    </header>

    <div class="body">
      <slot></slot>
    </div>
  </dialog>
</template>

<script>
import CloseIcon from "@/assets/graphics/close.svg";

export default {
  props: {
    title: {
      type: String,
      default: "modV"
    },

    show: {
      type: Boolean,
      default: false
    },

    closeDisabled: {
      type: Boolean,
      default: false
    },

    size: {
      type: Array,
      default: () => [640, 480]
    }
  },

  computed: {
    width() {
      return `${this.size[0]}px`;
    },
    height() {
      return `${this.size[1]}px`;
    }
  },

  components: {
    CloseIcon
  },

  mounted() {
    if (this.show) {
      this.open();
    }
  },

  methods: {
    open() {
      this.$refs.dialog.showModal();
    },

    close() {
      this.$emit("close");
      this.$refs.dialog.close();
    }
  },

  watch: {
    show(value) {
      if (value) {
        this.open();
      }
    }
  }
};
</script>

<style scoped>
dialog {
  /* Dialog Box */
  background: var(--background-color);
  border: 1px solid var(--foreground-color);
  box-sizing: border-box;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.16);
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.3);
}

header {
  width: 100%;
}

button.close {
  position: absolute;
  right: 15px;
  top: 11px;
  width: 14px;
  height: 15px;

  background-color: transparent;
  border: none;
  font-size: 0;
}

button.close:disabled {
  cursor: not-allowed;
}

div.body {
  min-height: 72px;
  padding: 8px;
}

.close-icon path {
  fill: var(--foreground-color);
}
</style>
