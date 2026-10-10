<template>
  <a-card style="border: none;">
    <div class="all">
      <div class="left">
        <slot name="left"></slot>
      </div>
      <div class="leftResize resize" title="收缩侧边栏">
        ⋮
      </div>
      <div class="middle">
        <slot name="right"></slot>
      </div>
    </div>
  </a-card>

</template>

<script>
export default {
  name: 'bothSidesSolt',
  mounted() {
    this.dragControllerDiv();
  },
  methods: {
    dragControllerDiv() {
      var leftResize = document.getElementsByClassName('leftResize');
      // var middleResize = document.getElementsByClassName('middleResize');
      var left = document.getElementsByClassName('left');
      var middle = document.getElementsByClassName('middle');
      // var right = document.getElementsByClassName('right');
      var box = document.getElementsByClassName('all');
      this.move(leftResize, left, middle, box);
      // this.move(middleResize,middle,right,box);
    },
    move(resize, left, mid, box) {
      for (let i = 0; i < resize.length; i++) {
        // 鼠标按下事件
        resize[i].onmousedown = function (e) {
          //颜色改变提醒
          resize[i].style.background = '#55aaff';
          var startX = e.clientX;
          resize[i].left = resize[i].offsetLeft;
          // 鼠标拖动事件
          document.onmousemove = function (e) {
            var endX = e.clientX;
            var moveLen = resize[i].left + (endX - startX); // （endx-startx）=移动的距离。resize[i].left+移动的距离=左边区域最后的宽度
            var maxT = box[i].clientWidth - resize[i].offsetWidth; // 容器宽度 - 左边区域的宽度 = 右边区域的宽度
            if (moveLen < 10) moveLen = 32; // 左边区域的最小宽度为32px
            if (moveLen > maxT - 150) moveLen = maxT - 150; //右边区域最小宽度为150px
            resize[i].style.left = moveLen; // 设置左侧区域的宽度
            for (let j = 0; j < left.length; j++) {
              if (moveLen > 1200) {
                moveLen = 1200
              }
              if (moveLen < 120) {
                moveLen = 120
              }
              left[j].style.width = moveLen + 'px';
              mid[j].style.width = (box[i].clientWidth - moveLen - 10) + 'px';
            }
          };
          // 鼠标松开事件
          document.onmouseup = function (evt) {
            //颜色恢复
            resize[i].style.background = '#d6d6d6';
            document.onmousemove = null;
            document.onmouseup = null;
            resize[i].releaseCapture && resize[i]
              .releaseCapture(); //当你不在需要继续获得鼠标消息就要应该调用ReleaseCapture()释放掉
          };
          resize[i].setCapture && resize[i].setCapture(); //该函数在属于当前线程的指定窗口里设置鼠标捕获
          return false;
        };
      }
    },
  }
}
</script>

<style scoped>
.all {
  width: 100%;
  height: 100%;
  display: flex;
}

.all>div {
  height: 100%;
}

.left {
  width: 15%;
  min-width: 220px;
  padding: 10px 0px 10px 10px;
  border-right: 2px solid #ececec;
}

.resize {
  cursor: col-resize;
  float: left;
  position: relative;
  background-color: #d6d6d6;
  border-radius: 5px;
  width: 10px;
  height: 50px;
  background-size: cover;
  background-position: center;
  /*z-index: 99999;*/
  font-size: 32px;
  color: white;
}

.middle {
  width: 85%;
  margin-left: 20px;
}
h2 {
  font-weight: bold;
  margin: 0 !important;
  line-height: 40px !important;
  position: relative;
  z-index: 1;
}
</style>