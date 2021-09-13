module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/genmdm-editor/" : "/",

  configureWebpack: {
    devtool: "source-map"
  },

  pluginOptions: {
    svgLoader: {
      svgo: {
        plugins: []
      }
    },

    electronBuilder: {
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        appId: "fm.2xaa.genmdmeditor",

        linux: {
          category: "Midi"
        }
      }
    }
  }
};
