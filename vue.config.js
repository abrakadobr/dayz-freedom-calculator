const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? '/dayz-freedom-calculator/' : '/',
  outputDir: 'docs',
  chainWebpack: (config) => {
    config.module.rules.delete("svg");
    config.module
      .rule("svg")
      .test(/\.(svg)(\?.*)?$/)
      .use("vue-loader")
      .loader("vue-loader")
      .end()
      .use("./vue.svg.loader")
      .loader("./vue.svg.loader")
      .options({
        svgo: true,
        svgoConfig: {
          plugins: [
            {
              name: "preset-default",
              params: {
                overrides: {
                  inlineStyles: {
                    onlyMatchedOnce: false,
                  },
                },
              },
            },
          ],
        },
      });
  },
  pluginOptions: {
    svg: {
      inline: {
        svgo: true,
        extract: true,
      },
    },
  },
})
