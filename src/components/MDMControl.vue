<template>
  <div>
    <span :content="description" v-tippy="{followCursor : true}">
      <label v-if="type !== 'bool'">
        <select v-model.number="value" v-if="type !== 'bool'">
          <template v-if="enumValues && dataValues">
            <option
              v-for="(label, x) in enumValues"
              :key="label"
              :value="dataValues[x]"
              :selected="dataValues[x] === defaultValue"
            >{{label}}</option>
          </template>

          <template v-else-if="enumValues">
            <option
              v-for="(label, x) in enumValues"
              :key="label"
              :value="Math.ceil((x / enumValues.length) * 127)"
              :selected="Math.ceil((x / enumValues.length) * 127) === defaultValue"
            >{{label}}</option>
          </template>

          <template v-else-if="range > 0">
            <option
              v-for="x in range"
              :key="x"
              :value="Math.ceil(((x-1) / range) * 127)"
              :selected="Math.ceil(((x-1) / range) * 127) === defaultValue"
            >{{ x - 1 }}</option>
          </template>
        </select>

        <!-- <span>{{ label }}</span> -->
      </label>
      <div v-else class="checkbox">
        <input type="checkbox" v-if="type === 'bool'" v-model="value" :id="cc">
        <!-- <label :for="cc">
          <span>{{ label }}</span>
        </label> -->
      </div>
    </span>
  </div>
</template>

<script>
import defaultMapping from "../default-mapping.js";

export default {
  props: {
    cc: {
      type: Number,
      required: true
    }
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

    description() {
      return this.mapping.description;
    }
  }
};
</script>
