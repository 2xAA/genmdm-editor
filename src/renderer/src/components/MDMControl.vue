<template>
  <div class="mdm-control">
    <template v-if="type !== 'bool'">
      <DraggableSelect
        v-if="enumValues && dataValues"
        v-model.number="value"
        :values="dataValues"
        :emit-array-value="true"
        :default="defaultValue"
        :labels="enumValues"
      />
      <DraggableSelect
        v-else-if="enumValues"
        v-model.number="value"
        :values="rangeValues"
        :default="defaultValue"
        :labels="enumValues"
      />
      <DraggableSelect
        v-else-if="range > 0"
        v-model.number="value"
        :values="rangeValues"
        :default="defaultValue"
      />
    </template>

    <LabelledCheckbox v-else v-model.number="value" :labels="enumValues" />
  </div>
</template>

<script>
import DraggableSelect from "./DraggableSelect.vue";
import LabelledCheckbox from "./LabelledCheckbox.vue";

export default {
  components: {
    DraggableSelect,
    LabelledCheckbox,
  },

  props: {
    channel: {
      type: Number,
      required: true,
    },

    cc: {
      type: Number,
      required: true,
    },
  },

  computed: {
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

        this.$store.dispatch("setCCValues", {
          values,
          channel: this.channel,
        });
      },
    },

    mapping() {
      return this.$store.getters.mapping[this.cc];
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
        for (let i = 0; i < range; ++i) {
          values.push(i);
        }
      }

      return values;
    },
  },

  created() {
    if (!this.mapping) {
      throw new Error(`CC mapping doesn't exist for ${this.cc}`);
    }
  },
};
</script>

<style scoped>
.mdm-control {
  width: 100%;
  height: 100%;
}
</style>
