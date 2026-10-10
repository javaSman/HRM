<template>
  <div class="alert-compact">
    <template v-for="(item, index) in items">
      <div
        v-if="item.type === 'subHeader'"
        :key="'sub-' + index"
        class="ac-sub-header"
        :class="item.color"
      >
        {{ item.label }}
      </div>
      <div v-else :key="'item-' + index" class="ac-item" :class="item.level">
        <span class="ac-label">{{ item.label }}</span>
        <span v-if="item.barPercent !== undefined" class="ci-bar-wrap">
          <span class="ci-bar-fill" :style="{ width: item.barPercent + '%' }"></span>
        </span>
        <span class="ac-num" :style="item.valueStyle">{{ item.value }}</span>
        <span v-if="item.tag" class="risk-tag" :class="item.tagType">{{ item.tag }}</span>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'CockpitAlertList',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="less" scoped>
.alert-compact {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.alert-compact::-webkit-scrollbar {
  width: 4px;
}

.alert-compact::-webkit-scrollbar-thumb {
  background: rgba(37, 99, 235, 0.15);
  border-radius: 2px;
}

.ac-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  border-left: 2px solid var(--blue-light);
  background: rgba(37, 99, 235, 0.025);
  font-size: 11px;
}

.ac-item.danger {
  border-left-color: var(--danger);
  background: rgba(220, 38, 38, 0.025);
}

.ac-item.warn {
  border-left-color: var(--warning);
  background: rgba(217, 119, 6, 0.025);
}

.ac-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-secondary);
  font-weight: 500;
}

.ac-num {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.ac-sub-header {
  margin-top: 4px;
  margin-bottom: 2px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.ac-sub-header.blue {
  background: rgba(37, 99, 235, 0.05);
  color: var(--blue-primary);
}

.ac-sub-header.red {
  background: rgba(220, 38, 38, 0.05);
  color: var(--danger);
}

.ac-sub-header.cyan {
  background: rgba(8, 145, 178, 0.05);
  color: var(--cyan);
}

.ac-sub-header.green {
  background: rgba(5, 150, 105, 0.05);
  color: var(--success);
}

.ci-bar-wrap {
  flex: 1;
  min-width: 20px;
  height: 7px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(37, 99, 235, 0.05);
}

.ci-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--gradient-blue);
}

.risk-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.risk-tag.high {
  background: rgba(220, 38, 38, 0.1);
  color: var(--danger);
  border: 1px solid rgba(220, 38, 38, 0.15);
}

.risk-tag.mid {
  background: rgba(217, 119, 6, 0.1);
  color: var(--warning);
  border: 1px solid rgba(217, 119, 6, 0.15);
}

.risk-tag.good {
  background: rgba(5, 150, 105, 0.08);
  color: var(--success);
  border: 1px solid rgba(5, 150, 105, 0.12);
}
</style>
