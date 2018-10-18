// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import {
  Vuetify,
  VApp,
  VAutocomplete,
  VBtn,
  VCheckbox,
  VFooter,
  VGrid,
  VIcon,
  VList,
  VNavigationDrawer,
  VSwitch,
  VToolbar,
  transitions
} from 'vuetify'
import '../node_modules/vuetify/src/stylus/app.styl'
import App from './App'
import _store from './store'

Vue.use(Vuetify, {
  components: {
    VApp,
    VAutocomplete,
    VBtn,
    VCheckbox,
    VFooter,
    VGrid,
    VIcon,
    VList,
    VNavigationDrawer,
    VSwitch,
    VToolbar,
    transitions
  },
  theme: {
    primary: '#303f9f',
    secondary: '#1976d2',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107'
  }
})
Vue.use(Vuex)

let store = new Vuex.Store(_store)

// Disable production tip
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  components: { App },
  template: '<App/>'
})
