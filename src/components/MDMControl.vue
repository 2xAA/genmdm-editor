<template>
  <div class="mdm-control">
    <template v-if="type !== 'bool'">
      <DraggableSelect v-if="enumValues && dataValues" :values="dataValues" :emitArrayValue="true" :default="defaultValue" :labels="enumValues" v-model.number="value" />
      <DraggableSelect v-else-if="enumValues" :values="rangeValues" :default="defaultValue" :labels="enumValues" v-model.number="value" />
      <DraggableSelect v-else-if="range > 0" :values="rangeValues" :default="defaultValue" v-model.number="value" />
    </template>

    <LabelledCheckbox v-else :labels="enumValues" v-model.number="value" />
  </div>
</template>

<script>
import defaultMapping from "../default-mapping.js";
import DraggableSelect from "./DraggableSelect";
import LabelledCheckbox from "./LabelledCheckbox";

export default {
  props: {
    cc: {
      type: Number,
      required: true
    }
  },

  components: {
    DraggableSelect,
    LabelledCheckbox
  },

  created() {
    if (!defaultMapping[this.cc]) {
      throw new Error(`CC mapping doesn't exist for ${this.cc}`);
    }

    this.value = this.defaultValue;
  },

  computed: {
    channel() {
      return this.$store.state.channel;
    },

    value: {
      get() {
        return this.$store.state[`channel${this.channel}`][this.cc];
      },

      set(value) {
        const values = {};

        if (this.type === "bool") {
          values[this.cc] = value ? 127 : 0;
        } else {
          values[this.cc] = value;
        }

        this.$store.dispatch("setCCValues", values);
      }
    },

    mapping() {
      return defaultMapping[this.cc];
    },

    type() {
      return this.mapping.type || "int";
    },

    label() {
      return this.mapping.label || undefined;
    },

    range() {
      return this.mapping.range || 0;
    },

    enumValues() {
      return this.mapping.enum;
    },

    dataValues() {
      return this.mapping.values;
    },

    defaultValue() {
      return this.mapping.default;
    },

    rangeValues() {
      const { dataValues, range } = this;
      let values = [];

      if (dataValues) {
        values = dataValues;
      } else {
        for(let i=0; i < range; ++i) {
          values.push(i);
        }
      }

      return values;
    }
  }
};
</script>

<style scoped>
.mdm-control {
  width: 100%;
  height: 100%;
}
</style>
