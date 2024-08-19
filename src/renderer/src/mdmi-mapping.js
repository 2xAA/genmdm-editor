export default {
  5: {
    label: "Portamento Time",
    range: 127,
    default: 0,
    excludeFromGrouping: true,
  },

  65: {
    label: "Portamento",
    range: 2,
    default: 0,
    enum: ["Off", "On"],
    type: "bool",
    excludeFromGrouping: true,
  },

  85: {
    label: "Fine Tune",
    range: 127,
    default: 63,
    excludeFromGrouping: true,
  },
};
