# avatar-cropper

> 使用Vue实现的头像裁剪工具插件

[demo link](https://zmj97.github.io/avatar-cropper/demo/index.html)

**ok事件返回选择的头像数据(dataurl)**

**ok event return selected avatar's data(dataurl)**

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

## How to Use

```bash
# install this plugin
npm i avatar-cropper --save
```

```vue
// main.js
import avatarCropper from 'avatar-cropper'
Vue.use(avatarCropper)

// xxx.vue
<div id="app">
  <button @click="show = true">更换头像</button>
  <avatar-cropper v-model="show" @ok="data = $event"></avatar-cropper>
  <img :src="data" style="display: block">
</div>
```

For detailed explanation on how things work, consult the [docs for vue-loader](http://vuejs.github.io/vue-loader).
