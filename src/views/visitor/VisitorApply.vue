<template>
  <div class="visitor-apply-page">
    <!-- 顶部Tab - 圆角长方体样式 -->
    <div class="v-top-tabs padded">
      <div v-for="tab in tabs" :key="tab.key" :class="['v-top-tab', activeKey === tab.key ? 'active' : '']"
        @click="handleTabChange(tab.key)">
        {{ tab.label }}
      </div>
    </div>

    <!-- Tab内容 -->
    <div class="v-tab-content">
      <visitor-list :key="activeKey" :type="activeKey" state="apply" />
    </div>
  </div>
</template>

<script>
import VisitorList from './modules/VisitorList.vue'

export default {
  name: 'VisitorApply',
  components: {
    VisitorList,
  },
  data() {
    return {
      activeKey: 'employee',  // 默认选中"员工访客"
      tabs: [
        { key: 'employee', label: '员工访客' },
        { key: 'selfRegister', label: '访客自主登记' },
        { key: 'invite', label: '邀约访客' },
        { key: 'temp', label: '劳动派遣登记' }
      ]
    }
  },
  created() {
    // 从 sessionStorage 读取工作台跳转传入的 tab
    const wbTab = sessionStorage.getItem('wb_target_tab_' + this.$route.path)
    if (wbTab) {
      const validTab = this.tabs.find(t => t.key === String(wbTab))
      if (validTab) {
        this.activeKey = String(wbTab)
      }
      sessionStorage.removeItem('wb_target_tab_' + this.$route.path)
    }
  },
  activated() {
    // 页面被 keep-alive 缓存时，从工作台跳转不会触发 created，这里兜底处理
    const wbTab = sessionStorage.getItem('wb_target_tab_' + this.$route.path)
    if (wbTab) {
      const validTab = this.tabs.find(t => t.key === String(wbTab))
      if (validTab && this.activeKey !== String(wbTab)) {
        this.activeKey = String(wbTab)
      }
      sessionStorage.removeItem('wb_target_tab_' + this.$route.path)
    }
  },
  watch: {
  },
  methods: {
    handleTabChange(key) {
      this.activeKey = key
      sessionStorage.setItem('visitor_apply_tab', key)
    }
  }
}
</script>

<style lang="less" scoped>
@import './visitor-theme.less';

.visitor-apply-page {
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