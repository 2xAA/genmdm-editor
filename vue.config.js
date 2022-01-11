const webpack = require("webpack");

const publishingOptions = {
  provider: "github",
  releaseType: "prerelease",
  vPrefixedTagName: false
};

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
      nodeIntegration: true,

      chainWebpackRendererProcess: config => {
        config.plugin("define").use(
          new webpack.DefinePlugin({
            "process.env.ELECTRON_BUILD": true
          })
        );

        config.node.set("fs", "empty");
      },

      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        appId: "fm.2xaa.genmdmeditor",

        linux: {
          category: "Midi"
        },

        snap: {
          confinement: "classic",
          publish: publishingOptions
        },

        // See https://www.electron.build/configuration/mac
        mac: {
          // See https://developer.apple.com/documentation/security/hardened_runtime
          hardenedRuntime: true,
          // See https://github.com/vcync/modV/issues/413
          strictVerify: false,
          gatekeeperAssess: false
        },

        dmg: {
          sign: false
        },

        afterSign: "build/notarize.js",

        publish: publishingOptions
      }
    }
  }
};
