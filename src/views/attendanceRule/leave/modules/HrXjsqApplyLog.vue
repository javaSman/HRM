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
    wrapClassName="attendance-rule-drawer"
    @close="out"
  >
    <!-- 时间轴区域内部滚动：抽屉标题与底部关闭按钮固定不动 -->
    <div class="drawer-timeline-scroll">
      <!-- 使用时间轴组件：visible 保证抽屉每次打开都重新加载，避免同一条单重复打开时显示旧日志 -->
      <approval-timeline :applyId="LCid" :LCdata="LCdata" :visible="LCshow" />
    </div>

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
        LCdata: { type: Object, default: () => ({}) },

  },
  data() {
    return {}
  },
  methods: {
    out() {
      this.$emit('out', false)
    }
  }
}
</script>

<style scoped lang="less">
/* ===== 时间轴内部滚动区 ===== */
.drawer-timeline-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.drawer-timeline-scroll::-webkit-scrollbar {
  width: 6px;
}

.drawer-timeline-scroll::-webkit-scrollbar-thumb {
  background: #c7d0e4;
  border-radius: 3px;
}

.drawer-timeline-scroll::-webkit-scrollbar-track {
  background: transparent;
}

/* ===== 抽屉底部按钮（固定在底部，不随时间轴滚动） ===== */
.drawer-footer {
  flex-shrink: 0;
  /* 抵消 body 的 24px 左右内边距与 20px 下内边距，让底栏贴边铺满 */
  margin: 0 -24px -20px;
  border-top: 1px solid #e8e8e8;
  padding: 10px 24px;
  text-align: right;
  background: #fff;
}
</style>

<style>
/* ===== 抽屉全局样式（非 scoped） ===== */
/* 默认 .ant-drawer-content / .ant-drawer-wrapper-body 自带 overflow:auto，
   改为内部滚动后统一收口到 .drawer-timeline-scroll，避免出现双层滚动条 */
.attendance-rule-drawer .ant-drawer-content,
.attendance-rule-drawer .ant-drawer-wrapper-body {
  overflow: hidden;
}

.attendance-rule-drawer .ant-drawer-wrapper-body {
  display: flex;
  flex-direction: column;
}

.attendance-rule-drawer .ant-drawer-header {
  flex-shrink: 0;
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
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
  background: #f8fafc;
}

.attendance-rule-drawer .ant-drawer-footer {
  border-top: 1px solid #e2e8f0;
  background: #fff;
}
</style>