'use strict'

import avatarCropper from './avatarCropper.vue'

const VueAvatarCropper = {
  install (Vue) {
    Vue.component('avatar-cropper', avatarCropper)
  }
}

export default VueAvatarCropper