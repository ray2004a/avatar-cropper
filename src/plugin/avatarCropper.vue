<template>
  <!-- container ==> 半透明背景 -->
  <!-- 鼠标在整个container中松开或离开container时停止拖动 -->
  <div v-show="value" id="container" @mouseup="mouseup" @mouseleave="mouseup" @touchend="mouseup">
    <!-- panel ==> 弹出的面板 -->
    <div class="panel">
      <!-- 相关按钮 -->
      <div class="buttons">
        <button class="button" @click="close">取消</button>
        <button v-if="showRechoose" class="button" @click="selectImg">重新选择</button>
        <button class="button ok" @click="ok">确定</button>
      </div>

      <!-- 选择、显示、编辑面板 -->
      <div class="select-panel">
        <div class="hint">只支持JPG、PNG、GIF、SVG，大小不超过5M</div>
        <button id="select" class="button" @click="selectImg">选择图片</button>
        <input id="inputFile" type="file" @change="changeImg" style="display: none" accept="image/gif,image/jpeg,image/jpg,image/png,image/svg">

        <!-- 编辑面板、背景接近黑色 -->
        <div id="edit">
          <!-- canvas用来显示用户选择的图片 -->
          <canvas id="pic" :width="canvasWidth" :height="canvasHeight"></canvas>
          <!-- 浅白色蒙版 -->
          <div id="mask"
           style="position: absolute; overflow: hidden"
           @mousemove="resizeCropper"
           @touchmove="resizeCropper"
          >
            <!-- cropper ==> 选择框，圆形透明镂空 -->
            <div id="cropper"
             @mousedown="mousedownCropper"
             @mousemove="moveCropper"
             @touchstart="mousedownCropper"
             @touchmove="moveCropper"
            >
              <!-- dot ==> 用于改变大小 -->
              <div id="dot"
               @mousedown="mousedownDot"
               @touchstart="mousedownDot"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {

  name: 'avatarCropper',

  props: {
    value: {
      default: true
    }
  },

  data () {
    return {
      // 是否显示重新选择
      showRechoose: false,
      // 存储用户选择的图片
      img: new Image(),

      // 图片画布的宽高
      canvasWidth: 450,
      canvasHeight: 450,

      // 缩放比例， 显示/实际
      scale: 1.0,

      // 缩放后起点坐标和宽高
      x: 0,
      y: 0,
      xLen: 0,
      yLen: 0,

      // 鼠标按下时的坐标
      mouseDownX: 0,
      mouseDownY: 0,

      // 鼠标是否正在按下
      // cropper内
      mouseIsDownCropper: false,
      // dot处
      mouseIsDownDot: false
    }
  },

  watch: {
    value () {
      if (this.value && document.body.clientWidth < 768) {
        // 移动端开启此插件时禁止拖动和滚轮事件
        document.addEventListener('touchmove', this.avoidMove, {passive: false})
        document.addEventListener('mousewheel', this.avoidMove, false)
      } else {
        // 此插件关闭时enable拖动和滚轮事件
        document.removeEventListener('touchmove', this.avoidMove, {passive: false})
        document.removeEventListener('mousewheel', this.avoidMove, false)
      }
    }
  },

  methods: {
    // 用于移动端适配，禁止拖动
    avoidMove (e) {
      e.preventDefault && e.preventDefault()
      e.stopPropagation && e.stopPropagation()
    },

    // 用于移动端适配， 设备宽度变化时调节画布宽高
    resizeCanvas () {
      if (document.body.clientWidth < 768) {
        this.canvasWidth = this.canvasHeight = document.documentElement.clientWidth * 0.9

        // 显示选择按钮，隐藏编辑面板
        document.getElementById('select').style.display = 'inline-block'
        document.getElementById('edit').style.display = 'none'
      }
    },

    // 弹出选择文件窗口
    selectImg () {
      document.getElementById('inputFile').click()
    },

    // 当用户选择文件后调整显示的图片和蒙版
    changeImg (e) {
      const img = e.target.files[0]
      // 限制图片不超过5M
      if (img && img.size <= 5 * 1024 * 1024) {
        // 隐藏选择按钮，显示编辑面板
        document.getElementById('select').style.display = 'none'
        document.getElementById('edit').style.display = 'block'
        this.showRechoose = true

        // 获取用户选择的图片数据
        const reader = new FileReader()
        reader.readAsDataURL(img)
        reader.onload = () => {
          // 修改显示的图片数据
          this.img.src = reader.result
          // 显示图片
          this.showImg()
        }
      } else {
        // 超过5M提醒
        alert('图片不可以超过5M！')
      }
    },

    // 显示图片
    showImg () {
      this.img.onload = () => {
        // 缩放比以较长的那个边为准
        const widthIsLarger = this.img.width >= this.img.height
        this.scale = widthIsLarger ? this.canvasWidth / this.img.width : this.canvasHeight / this.img.height

        // 计算显示图片的左上角坐标和缩放后宽高
        this.xLen = this.img.width * this.scale
        this.yLen = this.img.height * this.scale
        this.x = (this.canvasWidth - this.xLen) / 2
        this.y = (this.canvasHeight - this.yLen) / 2

        // 显示缩放后的图片
        const ctx = document.getElementById('pic').getContext('2d')
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
        ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, this.x, this.y, this.xLen, this.yLen)

        // 显示蒙版
        this.showMask()
      }
    },

    // 显示蒙版
    showMask () {
      // 调整蒙版位置
      const mask = document.getElementById('mask')
      mask.style.left = this.x + 'px'
      mask.style.top = this.y + 'px'
      mask.style.width = this.xLen + 'px'
      mask.style.height = this.yLen + 'px'
    },

    // 更新鼠标坐标
    updateMouseDownPos (e) {
      this.mouseDownX = e.clientX
      this.mouseDownY = e.clientY
    },

    // 按下鼠标时记录鼠标坐标并更新mouseIsDown
    mousedownCropper (e) {
      if (this.mouseIsDownCropper) return
      this.updateMouseDownPos(e)
      this.mouseIsDownCropper = true
    },
    mousedownDot (e) {
      if (this.mouseIsDownDot) return
      this.updateMouseDownPos(e)
      this.mouseIsDownDot = true
    },

    // 松开鼠标时更新mouseIsDown为false,结束拖动
    mouseup () {
      this.mouseIsDownCropper = this.mouseIsDownDot = false
    },

    // 移动cropper
    moveCropper (e) {
      if (this.mouseIsDownCropper) {
        const cropper = document.getElementById('cropper')
        const cropperLen = Number(window.getComputedStyle(cropper).getPropertyValue('width').slice(0, -2))
        const cropperTop = Number(window.getComputedStyle(cropper).getPropertyValue('top').slice(0, -2))
        const cropperLeft = Number(window.getComputedStyle(cropper).getPropertyValue('left').slice(0, -2))
        // 移动端适配
        if (!e.clientX) e = e.touches[0]
        const offsetX = e.clientX - this.mouseDownX
        const offsetY = e.clientY - this.mouseDownY
        this.updateMouseDownPos(e)
        /* 当
         * 0 <= top + len + offsetY <= yLen
         * 0 <= left + len + offsetX <= xLen
         * 时，移动cropper
         */
        const newTop = cropperTop + offsetY
        const newLeft = cropperLeft + offsetX
        if (newTop >= 0 && newTop + cropperLen <= this.yLen
         && newLeft >= 0 && newLeft + cropperLen <= this.xLen) {
          cropper.style.top = newTop + 'px'
          cropper.style.left = newLeft + 'px'
        }
      }
    },

    // 修改cropper大小
    resizeCropper (e) {
      if (this.mouseIsDownDot) {
        /*
         * resize优先，因此在mouseIsDownDot为true时
         * 设mouseIsDownCropper为false
         */
        this.mouseIsDownCropper = false
        const cropper = document.getElementById('cropper')
        const cropperLen = Number(window.getComputedStyle(cropper).getPropertyValue('width').slice(0, -2))
        const cropperTop = Number(window.getComputedStyle(cropper).getPropertyValue('top').slice(0, -2))
        const cropperLeft = Number(window.getComputedStyle(cropper).getPropertyValue('left').slice(0, -2))
        if (!e.clientX) e = e.touches[0]
        const offsetX = e.clientX - this.mouseDownX
        // const offsetY = e.clientY - this.mouseDownY
        this.updateMouseDownPos(e)
        /* 当
         * len + offsetX >= 30
         * top + len + offsetX <= yLen
         * left + len + offsetX <= xLen
         * 时，resize cropper
         */
        if (cropperLen + offsetX >= 30
         && cropperTop + cropperLen + offsetX <= this.yLen
         && cropperLeft + cropperLen + offsetX <= this.xLen) {
          // 宽高均为len + offsetX
          cropper.style.width = cropper.style.height = cropperLen + offsetX + 'px'
          // border-radius为宽高的一半
          cropper.style.borderRadius = (cropperLen + offsetX) / 2 + 'px'
        }
      }
    },

    // 用户选定后，传出选定的dataUrl
    ok () {
      if (!this.img.src) {
        // 如果未选择图片
        alert('请先选择图片！')
        return
      }
      this.close()
      const x = Number(window.getComputedStyle(cropper).getPropertyValue('left').slice(0, -2)) / this.scale
      const y = Number(window.getComputedStyle(cropper).getPropertyValue('top').slice(0, -2)) / this.scale
      const length = Number(window.getComputedStyle(cropper).getPropertyValue('width').slice(0, -2)) / this.scale
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = length
      const ctx = canvas.getContext('2d')
      ctx.drawImage(this.img, x, y, length, length, 0, 0, length, length)
      this.$emit('ok', canvas.toDataURL())
    },

    // 关闭本插件
    close () {
      this.$emit('input', false)
    }
  },

  mounted () {
    this.resizeCanvas()
    window.addEventListener('resize', this.resizeCanvas, false)
  },

  destroyed () {
    window.removeEventListener('resize', this.resizeCanvas, false)
  }
}
</script>

<style lang="less" scoped>
#container {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  // 用户不可选
  user-select: none;
  z-index: 9999;
}

.panel {
  position: fixed;
  width: 100vw;
  height: 120vw;
  top: calc(50vh - 60vw);
  border-radius: 5px;
  background-color: white;
}

.buttons {
  width: 100%;
  height: 56px;
  margin-bottom: 20px;
  background-color: #f2f2f5;
  text-align: center;
}

.button {
  margin: 11px 5px;
  padding: 0 15px;
  border: 0;
  border-radius: 2px;
  height: 34px;
  line-height: 35px;
  background-color: #fff;
  color: #515a6e;
  font-size: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  text-decoration: none;
  outline: none;
  cursor: pointer;
}

.ok {
  background-color: #2d8cf0;
  color: #fff;
}

.select-panel {
  width: 90vw;
  height: 90vw;
  margin: 5vw;
  background-color: #f2f2f5;
}

.hint {
  position: absolute;
  top: 60px;
  width: 90vw;
  text-align: center;
  color: #515a6e;
  font-size: 12px;
}

#select {
  position: absolute;
  left: calc(50vw - 43px);
  top: calc(60vw - 17px);
}

#edit {
  display: none;
  position: absolute;
  width: 90vw;
  height: 90vw;
  background-color: #333;
}

#cropper {
  display: inline-block;
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100px;
  height: 100px;
  border-radius: 50px;
  box-shadow: 0 0 0 500px rgba(255, 255, 255, 0.6);
  cursor: move;
}

#dot {
  display: inline-block;
  position: absolute;
  top: 50%;
  right: -4px;
  border: 1px solid gray;
  width: 7px;
  height: 7px;
  border-radius: 4px;
  background-color: #fff;
  cursor: w-resize;
}

@media screen and (min-width: 768px) {
  .panel {
    width: 500px;
    height: 556px;
    top: calc(50vh - 270px);
    left: calc(50vw - 270px);
  }

  .select-panel {
    width: 450px;
    height: 450px;
    margin: 25px;
    background-color: #f2f2f5;
  }

  .hint {
    width: 450px;
  }

  #select {
    left: 207px;
    top: 250px;
  }

  #edit {
    width: 450px;
    height: 450px;
  }
}
</style>