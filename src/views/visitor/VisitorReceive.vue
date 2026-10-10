<template>
  <div class="visitor-receive-page">
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
      <visitor-list :key="activeKey" :type="activeKey" state="receive" />
    </div>
  </div>
</template>

<script>
import VisitorList from './modules/VisitorList.vue'

export default {
  name: 'VisitorReceive',
  components: {
    VisitorList,
  },
  data() {
    return {
      activeKey: 'employee',
      tabs: [
        { key: 'employee', label: '员工访客接待' },
        { key: 'selfRegister', label: '访客自主登记接待' },
        { key: 'invite', label: '邀约访客接待' },
        { key: 'temp', label: '劳动派遣接待' }
      ]
    }
  },
  methods: {
    handleTabChange(key) {
      this.activeKey = key
    }
  }
}
</script>

<style lang="less" scoped>
@import './visitor-theme.less';

.visitor-receive-page {
  background: @v-background;
  display: flex;
  flex-direction: column;
  animation: v-fade-in .3s ease-out both;
}

.v-tab-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
