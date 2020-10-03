module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/genmdm-editor/" : "/",

  pluginOptions: {
    svgLoader: {
      svgo: {
        plugins: []
      }
    }
  }
};
