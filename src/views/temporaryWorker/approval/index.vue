<!--
  @description 临时工审批管理页面
  @date 2026-08-19
  @functionality 提供临时工需求的审批功能，复用申请列表组件，以审批模式运行
-->
<template>
  <div class="temporary-worker-approval">
    <!-- 审批列表：复用申请列表组件，mode=audit -->
    <applyList mode="audit"></applyList>
  </div>
</template>

<script>
import applyList from '../apply/index.vue'

/**
 * 临时工审批管理组件
 * 提供临时工需求的审批功能
 * 复用申请列表组件，以审批模式运行
 */
export default {
  name: 'TemporaryWorkerApproval',
  components: {
    applyList,
  },
}
</script>

<style lang="less" scoped>
.temporary-worker-approval {
  height: 100%;
}
</style>

