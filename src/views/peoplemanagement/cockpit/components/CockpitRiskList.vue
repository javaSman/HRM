<template>
  <div class="risk-center-list">
    <div
      v-for="(item, index) in items"
      :key="item.name + index"
      class="risk-center-item"
      :class="item.levelClass"
    >
      <span class="rc-category" :class="item.categoryClass">{{ item.category }}</span>
      <span class="rc-name">{{ item.name }}</span>
      <span class="rc-detail">{{ item.detail }}</span>
      <button type="button" class="rc-action">{{ item.action }}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CockpitRiskList',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="less" scoped>
.risk-center-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.risk-center-list::-webkit-scrollbar {
  width: 4px;
}

.risk-center-list::-webkit-scrollbar-thumb {
  background: rgba(37, 99, 235, 0.15);
  border-radius: 2px;
}

.risk-center-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 10px;
  border-left: 3px solid var(--blue-light);
  background: rgba(37, 99, 235, 0.025);
}

.risk-center-item.level-high {
  border-left-color: var(--danger);
  background: rgba(220, 38, 38, 0.03);
}

.risk-center-item.level-medium {
  border-left-color: var(--warning);
  background: rgba(217, 119, 6, 0.025);
}

.rc-category {
  min-width: 50px;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  flex-shrink: 0;
}

.rc-category.hr {
  background: rgba(37, 99, 235, 0.08);
  color: var(--blue-primary);
}

.rc-category.attend {
  background: rgba(217, 119, 6, 0.08);
  color: var(--warning);
}

.rc-category.comply {
  background: rgba(220, 38, 38, 0.08);
  color: var(--danger);
}

.rc-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--text-primary);
}

.rc-detail {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--text-muted);
}

.rc-action {
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  background: rgba(37, 99, 235, 0.05);
  color: var(--blue-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
}
</style>
