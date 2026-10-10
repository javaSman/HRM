<template>
  <!--
    HrOvertimeApplyLists.vue
    加班审批列表页面（独立审批页组件）
    功能：审批人视角，Tab = 待审批 / 已审批 / 抄送我的
    复用 HrOvertimeApplyList 组件，传入 boxState=1
  -->
  <hr-overtime-apply-list :boxState="1" />
</template>

<script>
/**
 * 加班审批列表页面（独立组件）
 * 
 */
import HrOvertimeApplyList from './HrOvertimeApplyList'

export default {
  name: 'HrOvertimeApplyLists',
  components: {
    HrOvertimeApplyList
  }
}
</script>

<style scoped>
/* 审批页独立样式（如需额外定制） */
</style>
