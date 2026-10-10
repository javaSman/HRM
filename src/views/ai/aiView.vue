<template>
  <div class="wrap">
    <div class="content">
      <AiChat></AiChat>
    </div>
  </div>
</template>

<script>
import AiChat from '@/components/jeecg/AiChat/index.vue';


export default {
  components: {
    AiChat

  }
};


</script>

<style lang="less" scoped>
.wrap {
  height: calc(100vh - 100px);  // 修改高度为视口高度减去100px
  width: 100%;
  .content {
    background: #fff;
    width: 100%;
    height: 100%;
    overflow-y: auto;  // 添加垂直方向溢出滚动
  }
}
</style>
