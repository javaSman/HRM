<template>
  <div class="jc-component__range">
    <div class="jc-range"   style="color: #fff;" :class="rangeStatus?'success':''">
<!--      <i @mousedown="rangeMove"></i>-->
      <a-icon     @mousedown="rangeMove" @touchstart="rangeMove" :type="rangeStatus?successIcon:''" />
      {{rangeStatus?successText:startText}}
    </div>
  </div>
</template>

<script>
export default {
  name: "VerifySlider",
  props: {
    // 成功之后的函数
    successFun: {
      type: Function
    },
    //成功图标
    successIcon: {
      type: String,
      default: "check-circle"
    },
    //成功文字
    successText: {
      type: String,
      default: "验证成功"
    },
    //开始的图标
    startIcon: {
      type: String,
      default: "double-right"
    },
    //开始的文字
    startText: {
      type: String,
      default: "拖动滑块到最右边"
    },
    //失败之后的函数
    errorFun: {
      type: Function
    },
    //或者用值来进行监听
    status: {
      type: String
    }
  },
  data() {
    return {
      rangeStatus:'',

    };
  },
  mounted() {
    window.addEventListener('touchmove',()=>{})
    window.addEventListener('touchend',()=>{})
  },
  destroyed() {
    window.removeEventListener('touchmove',()=>{})
    window.removeEventListener('touchend',()=>{})
  },
  methods: {
    rangeMove(e){
      let that;
      // e.touches 代表移动端 携带
      if (e.touches){
        that=e.touches[0];
      }else {
        that=e;
      }
      let ele = that.target;
      let startX = that.clientX;
      let eleWidth = ele.offsetWidth;
      let parentWidth =  ele.parentElement.offsetWidth;
      let MaxX = parentWidth - eleWidth;
      if(this.rangeStatus){//不运行
        return false;
      }

      // pc
      document.onmousemove = (e) => {
        let endX = e.clientX;
        this.disX = endX - startX;
        if(this.disX<=0){
          this.disX = 0;
        }
        if(this.disX>=MaxX-eleWidth){//减去滑块的宽度,体验效果更好
          this.disX = MaxX;
        }
        ele.style.transition = '.1s all';
        ele.style.transform = 'translateX('+this.disX+'px)';
        e.preventDefault();
      }

      // 移动端
      document.ontouchmove=(e)=>{
        e=e.touches[0];
        let endX = e.clientX;
        this.disX = endX - startX;
        if(this.disX<=0){
          this.disX = 0;
        }
        if(this.disX>=MaxX-eleWidth){//减去滑块的宽度,体验效果更好
          this.disX = MaxX;
        }
        ele.style.transition = '.1s all';
        ele.style.transform = 'translateX('+this.disX+'px)';
        e.preventDefault();
      }

      // pc端
      document.onmouseup = ()=> {
        if(this.disX !== MaxX){
          ele.style.transition = '.5s all';
          ele.style.transform = 'translateX(0)';
          //执行成功的函数
          this.errorFun && this.errorFun();
        }else{
          this.rangeStatus = true;
          if(this.status){
            this.$parent[this.status] = true;
          }
          //执行成功的函数
          this.successFun && this.successFun();
        }
        document.onmousemove = null;
        document.onmouseup = null;
      }

      // 兼容移动端
      document.ontouchend = ()=> {
        if(this.disX !== MaxX){
          ele.style.transition = '.5s all';
          ele.style.transform = 'translateX(0)';
          //执行成功的函数
          this.errorFun && this.errorFun();
        }else{
          this.rangeStatus = true;
          if(this.status){
            this.$parent[this.status] = true;
          }
          //执行成功的函数
          this.successFun && this.successFun();
        }
        document.ontouchmove = null;
        document.ontouchend = null;
      }

    }

  }
}
</script>

<style scoped>
.jc-range{
  background-color: #B3B1B1A6;
  position: relative;
  transition: 1s all;
  user-select: none;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 45px; /*no*/
}
.jc-range i{
  position: absolute;
  left: 0;
  width: 60px;/*no*/
  height: 100%;
  color: #919191;
  background-color: #fff;
  border: 1px solid #bbb;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
.jc-range.success{
  background-color: #7AC23C;
  color: #fff;
}
.jc-range.success i{
  color: #7AC23C;
}
</style>