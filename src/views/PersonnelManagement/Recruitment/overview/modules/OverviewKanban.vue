<template>
  <div class="recruitment-dashboard-kanban">
    <a-empty v-if="columns.length === 0" class="recruitment-dashboard-kanban-all-empty" description="暂无招聘动态" />
    <div v-for="column in columns" :key="column.level" class="recruitment-dashboard-kanban-column" :class="'is-' + column.levelColor">
      <div class="recruitment-dashboard-kanban-header">
        <span class="recruitment-dashboard-kanban-dot"></span>
        <span class="recruitment-dashboard-kanban-title">{{ displayValue(column.level) }}</span>
        <span class="recruitment-dashboard-kanban-count">{{ displayValue(column.count) }}</span>
      </div>
      <div class="recruitment-dashboard-kanban-body">
        <a-empty
          v-if="column.list.length === 0"
          class="recruitment-dashboard-kanban-empty"
          description="暂无相关动态"
          :image="simpleImage"
        />
        <template v-else>
          <button
            v-for="(item, itemIndex) in column.list"
            :key="column.level + '-' + itemIndex"
            class="recruitment-dashboard-kanban-card"
            type="button"
            @click="$emit('handle', item)"
          >
            <span class="recruitment-dashboard-kanban-card-title">
              {{ displayValue(item.applyTitle) }}
            </span>
            <span class="recruitment-dashboard-kanban-days" :class="'is-' + column.levelColor">
              {{ displayValue(item.remainingDays) }}
            </span>
            <span class="recruitment-dashboard-kanban-footer">
              <span class="recruitment-dashboard-kanban-time">{{ displayValue(item.createTime) }}</span>
              <span class="recruitment-dashboard-kanban-status">{{ displayValue(item.zt) }}</span>
              <span class="recruitment-dashboard-kanban-action">去处理 <a-icon type="right" /></span>
            </span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { Empty } from 'ant-design-vue'

export default {
  name: 'OverviewKanban',
  props: {
    columns: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      simpleImage: Empty.PRESENTED_IMAGE_SIMPLE
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
.recruitment-dashboard-kanban {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.recruitment-dashboard-kanban-all-empty { grid-column: 1 / -1; padding: 48px 0; }

.recruitment-dashboard-kanban-column {
  overflow: hidden;
  background: #f7f8fa;
  border-radius: 8px;
}

.recruitment-dashboard-kanban-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid #e8ecf0;
  background: #fff5f5;
}

.recruitment-dashboard-kanban-column.is-warning .recruitment-dashboard-kanban-header {
  background: #fff9f0;
}

.recruitment-dashboard-kanban-column.is-info .recruitment-dashboard-kanban-header {
  background: #f6ffed;
}

.recruitment-dashboard-kanban-dot {
  width: 8px; height: 8px;
  background: #f56c6c;
  border-radius: 50%;
}

.is-warning .recruitment-dashboard-kanban-dot {
  background: #e6a23c;
}

.is-info .recruitment-dashboard-kanban-dot {
  background: #52c41a;
}

.recruitment-dashboard-kanban-title {
  color: #333;
  font-size: 13px;
  font-weight: 600;
}

.recruitment-dashboard-kanban-count {
  padding: 1px 7px;
  background: #fff;
  color: #999;
  border-radius: 9px;
  font-size: 11px;
}

.recruitment-dashboard-kanban-body {
  min-height: 260px;
  max-height: 420px;
  padding: 8px;
  overflow-y: auto;
}

.recruitment-dashboard-kanban-card {
  display: block;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid #e8ecf0;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: border-color .2s, box-shadow .2s;

  &:hover,
  &:focus {
    border-color: #c9d1d9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .06);
    outline: none;
  }
}

.recruitment-dashboard-kanban-card-title {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 13px;
  line-height: 1.5;
}

.recruitment-dashboard-kanban-days {
  display: inline-block;
  padding: 1px 6px;
  margin-bottom: 6px;
  background: #f6ffed;
  color: #52c41a;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.recruitment-dashboard-kanban-days.is-warning {
  background: #fff7e6;
  color: #fa8c16;
}

.recruitment-dashboard-kanban-days.is-danger {
  background: #fff1f0;
  color: #ff4d4f;
}

.recruitment-dashboard-kanban-footer {
  display: grid;
  grid-template-columns: minmax(60px, 1fr) auto auto;
  gap: 8px;
  align-items: center;
  font-size: 11px;
}

.recruitment-dashboard-kanban-time {
  overflow: hidden;
  color: #999;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recruitment-dashboard-kanban-status {
  padding: 1px 6px;
  background: #ecf2ff;
  color: #4a7bf7;
  border-radius: 4px;
}

.recruitment-dashboard-kanban-action {
  color: #4a7bf7;
  white-space: nowrap;
}

.recruitment-dashboard-kanban-empty {
  padding-top: 62px;
}

@media (max-width: 1000px) {
  .recruitment-dashboard-kanban {
    grid-template-columns: 1fr;
  }

  .recruitment-dashboard-kanban-body {
    min-height: 120px;
  }
}
</style>
