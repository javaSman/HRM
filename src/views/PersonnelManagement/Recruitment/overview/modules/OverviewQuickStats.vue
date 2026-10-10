<template>
  <div class="recruitment-dashboard-quick-stats">
    <a-empty v-if="items.length === 0" description="暂无今日概览" />
    <template v-else>
      <div
        v-for="item in items"
        :key="item.key"
        class="recruitment-dashboard-quick-stat"
        :class="'is-' + (item.level || 'normal')"
      >
        <span class="recruitment-dashboard-quick-label">
          <a-icon :type="item.icon || 'info-circle'" />
          {{ displayValue(item.label) }}
        </span>
        <span class="recruitment-dashboard-quick-value">{{ displayValue(item.value) }}</span>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'OverviewQuickStats',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    displayValue(value) {
      return value === 0 || value ? value : '-'
    }
  }
}
</script>

<style lang="less" scoped>
.recruitment-dashboard-quick-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recruitment-dashboard-quick-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 10px 14px;
  background: #f8f9fb;
  border-radius: 8px;
}

.recruitment-dashboard-quick-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 13px;
}

.recruitment-dashboard-quick-value {
  color: #4a7bf7;
  font-size: 16px;
  font-weight: 600;
}

.recruitment-dashboard-quick-stat.is-urgent .recruitment-dashboard-quick-value {
  color: #f56c6c;
}

.recruitment-dashboard-quick-stat.is-warning .recruitment-dashboard-quick-value {
  color: #e6a23c;
}
</style>
