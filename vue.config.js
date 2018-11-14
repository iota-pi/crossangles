module.exports = {
  productionSourceMap: false,

  pwa: {
    name: 'CrossAngles',
    themeColor: '#303F9F',
    msTileColor: '#2d89ef',
    appleMobileWebAppCapable: 'yes',
    workboxOptions: {
      exclude: [/\.map$/, /^manifest.*\.js(?:on)?$/, /tt\.json$/]
    }
  },

  lintOnSave: undefined
}
