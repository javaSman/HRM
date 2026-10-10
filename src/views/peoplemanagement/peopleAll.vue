<template>
  <div>
    <a-card style="border: none;">
      <div class="all">
        <div class="left">
          <sys-tag :type="'id'" @myChange="tagChange" :template-id="'dynamicTableCode'" :operable="true" title="组织目录"></sys-tag>
        </div>
        <div class="resize" title="收缩侧边栏">
          ⋮
        </div>
        <div class="right">
          <div v-if="materialsShow">
            <list :tag-id.sync="tagId"></list>
          </div>
          <div v-if="AShow">
            <cj ></cj>
          </div> 
        </div>
      </div>
    </a-card>
  </div>
</template>

<script>
import sysTag from "@comp/common/SysTag";
import list from "@views/peoplemanagement/ldbz";
import cj from "@views/peoplemanagement/YzzwCjbmbList";
export default {
  name: "TagDynamicTable",
  props: {

  },
  components: {
    list,
    sysTag,
    cj,
  },
  created() {

  },
  data() {
    return {
      materialsShow: true,
      AShow: false,
      item: {
        id: "",
      },
      tagId:"",
    }
  },
  mounted() {
    this.dragControllerDiv();//左右侧滑动
  },
  methods: {
    dragControllerDiv() {
      var resize = document.getElementsByClassName('resize');
      var left = document.getElementsByClassName('left');
      var mid = document.getElementsByClassName('right');
      var box = document.getElementsByClassName('all');
      for (let i = 0; i < resize.length; i++) {
        // 鼠标按下事件
        resize[i].onmousedown = function(e) {
          //颜色改变提醒
          resize[i].style.background = '#55aaff';
          var startX = e.clientX;
          resize[i].left = resize[i].offsetLeft;
          // 鼠标拖动事件
          document.onmousemove = function(e) {
            var endX = e.clientX;
            var moveLen = resize[i].left + (endX -
              startX); // （endx-startx）=移动的距离。resize[i].left+移动的距离=左边区域最后的宽度
            var maxT = box[i].clientWidth - resize[i].offsetWidth; // 容器宽度 - 左边区域的宽度 = 右边区域的宽度

            if (moveLen < 32) moveLen = 32; // 左边区域的最小宽度为32px
            if (moveLen > maxT - 150) moveLen = maxT - 150; //右边区域最小宽度为150px

            resize[i].style.left = moveLen; // 设置左侧区域的宽度

            for (let j = 0; j < left.length; j++) {
              if(moveLen>1200){
                moveLen=1200
              }
              if(moveLen<120){
                moveLen=120
              }
              left[j].style.width = moveLen + 'px';
              mid[j].style.width = (box[i].clientWidth - moveLen - 10) + 'px';
            }
          };
          // 鼠标松开事件
          document.onmouseup = function(evt) {
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
    changeItem(item) {
      this.item = item;
    },
    tagChange(data) {
      if(!data){
        return
      }
      if(data=='d88a5f7247294572846b488b4efa64a6' && false){
        this.tagId = data;
        this.materialsShow = false;
        this.AShow = true;
      }else{
        this.tagId = data;
        this.AShow = false;
        this.materialsShow = true;
      }
    },
    goBack() {
      this.$emit("goBack");
    }

  },
}
</script>

<style scoped>
  .all {
    width: 100%;
    height: 80vh;
    display: flex;
  }

  .all>div {
    height: 100%;
  }

  .left {
    width: 15%;
    min-width:80px;
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

  .right {
    min-width:600px;
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