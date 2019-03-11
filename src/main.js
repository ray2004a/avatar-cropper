import Vue from 'vue'
import App from './App.vue'

import avatarCropper from './plugin/index.js'
Vue.use(avatarCropper)

new Vue({
  el: '#app',
  render: h => h(App)
})
