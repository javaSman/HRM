<template>
  <div class="wb-sidebar">
    <div class="sidebar-child-wrap">
      <div
        v-for="item in menuList"
        :key="item.key"
        class="sidebar-item"
        :class="{ active: activeKey === item.key }"
        @click="handleClick(item)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WbSidebar',
  props: {
    // 当前激活的菜单 key
    value: {
      type: String,
      default: 'apply',
    },
    // 菜单项列表
    menuList: {
      type: Array,
      default: () => [
        { key: 'apply', label: '申请中心' },
        { key: 'audit', label: '我的审批' },
      ],
    },
  },
  computed: {
    activeKey() {
      return this.value
    },
  },
  methods: {
    handleClick(item) {
      if (this.activeKey === item.key) return
      this.$emit('input', item.key)
      this.$emit('change', item)
    },
  },
}
</script>

<style lang="less" scoped>
.wb-sidebar {
  width: 110px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8ebf0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  padding-top: 36px;
  gap: 24px;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #2563eb, #38bdf8);
  }
}

.sidebar-child-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.sidebar-item {
  font-size: 15px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.25s ease;
  padding: 10px 20px;
  border-radius: 8px;
  user-select: none;

  &:hover {
    color: #1890ff;
    background: #e6f4ff;
  }

  &.active {
    color: #fff;
    background: linear-gradient(135deg, #3b82f6, #22d3ee);
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.25);
  }
}
</style>
