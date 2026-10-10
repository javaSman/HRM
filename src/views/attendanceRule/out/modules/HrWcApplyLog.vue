<template>
  <!--
    HrWcApplyLog.vue
    审批日志时间轴抽屉组件
    使用 ApprovalTimeline 组件展示审批流程
  -->
  <a-drawer
    title="审批流程"
    placement="right"
    :closable="false"
    :visible="LCshow"
    width="480"
    :bodyStyle="drawerBodyStyle"
    wrapClassName="attendance-rule-drawer"
    @close="out"
  >
    <!-- 使用时间轴组件 -->
    <approval-timeline :applyId="LCid" :LCdata="LCdata" />

    <!-- 底部关闭按钮 -->
    <div class="drawer-footer">
      <a-button @click="out" style="margin-bottom: 0;">关闭</a-button>
    </div>
  </a-drawer>
</template>

<script>
/**
 * 审批日志时间轴抽屉组件
 * 使用 ApprovalTimeline 组件展示审批流程
 */
import { mixinDevice } from '@/utils/mixin'
import ApprovalTimeline from './ApprovalTimeline'

export default {
  name: 'HrWcApplyLog',
  mixins: [mixinDevice],
  components: { 
    ApprovalTimeline 
  },
  props: {
    LCshow: { type: Boolean, default: false },
    LCid: { type: String, default: null },
        LCdata: { type: Object, default: ()=>{} },

  },
  data() {
    return {
      // 抽屉内容样式
      drawerBodyStyle: {
        paddingBottom: '68px',
        overflowY: 'auto'
      }
    }
  },
  methods: {
    out() {
      this.$emit('out', false)
    }
  }
}
</script>

<style scoped lang="less">
/* ===== 抽屉底部按钮 ===== */
.drawer-footer {
  position: absolute;
  bottom: -8px;
  width: 100%;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  left: 0;
  background: #fff;
  border-radius: 0 0 2px 2px;
}
</style>

<style>
/* ===== 抽屉全局样式（非 scoped） ===== */
.attendance-rule-drawer .ant-drawer-header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  border-bottom: 0;
}

.attendance-rule-drawer .ant-drawer-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.attendance-rule-drawer .ant-drawer-close {
  color: #fff;
}

.attendance-rule-drawer .ant-drawer-body {
  padding: 20px 24px;
  background: #f8fafc;
}

.attendance-rule-drawer .ant-drawer-footer {
  border-top: 1px solid #e2e8f0;
  background: #fff;
}
</style>