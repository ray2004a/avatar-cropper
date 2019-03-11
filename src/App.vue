<template>
  <div id="app">
    <button @click="show = true">更换头像</button>
    <avatar-cropper v-model="show" @ok="data = $event"></avatar-cropper>
    <img :src="data" style="display: block">
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      show: false,

      data: ''
    }
  }
}
</script>

<style>
</style>
