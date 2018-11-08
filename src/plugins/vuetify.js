import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'
import { Resize } from 'vuetify/lib/directives'

Vue.use(Vuetify, {
  directives: {
    Resize
  },
  theme: {
    primary: '#303F9F',
    secondary: '#1976D2',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107'
  },
  iconfont: 'md',
})
