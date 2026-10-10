<template>
  <div class="visitor-approval-page">
    <!-- 顶部Tab - 圆角长方体样式 -->
    <div class="v-top-tabs padded">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="['v-top-tab', activeKey === tab.key ? 'active' : '']"
        @click="handleTabChange(tab.key)"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- Tab内容 -->
    <div class="v-tab-content">
      <visitor-list v-if="activeKey !== 'pass'" :key="activeKey" :type="activeKey" state="approval" />
      <pass-slip v-if="activeKey === 'pass'" state="approval" />
    </div>
  </div>
</template>

<script>
import VisitorList from './modules/VisitorList.vue'
import PassSlip from './modules/PassSlip.vue'

export default {
  name: 'VisitorApproval',
  components: {
    VisitorList,
    PassSlip,
  },
  data() {
    return {
      activeKey: 'employee',
      tabs: [
        { key: 'employee', label: '员工访客审批' },
        { key: 'selfRegister', label: '访客自主登记审批' },
        { key: 'invite', label: '邀约访客审批' },
        { key: 'temp', label: '劳动派遣登记审批' },
        { key: 'pass', label: '放行条审批' },
      ],
    }
  },
  methods: {
    handleTabChange(key) {
      this.activeKey = key
    },
  },
}
</script>

<style lang="less" scoped>
@import './visitor-theme.less';

.visitor-approval-page {
  background: @v-background;
  display: flex;
  flex-direction: column;
  animation: v-fade-in 0.3s ease-out both;
}

.v-tab-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>

