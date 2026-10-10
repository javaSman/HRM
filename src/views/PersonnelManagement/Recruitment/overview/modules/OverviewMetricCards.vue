<template>
  <div class="recruitment-dashboard-metrics" id="overviewCards">
    <a-empty v-if="cards.length === 0" class="recruitment-dashboard-metrics-empty" description="暂无核心指标" />
    <template v-else>
      <div v-for="item in cards" :key="item.key" class="recruitment-dashboard-stat-card">
        <div class="recruitment-dashboard-card-main">
          <div class="recruitment-dashboard-icon" :style="{ color: item.iconColor, backgroundColor: item.iconBg }">
            <a-icon :type="item.icon || 'bar-chart'" />
          </div>
          <div class="recruitment-dashboard-card-copy">
            <div class="recruitment-dashboard-card-title">
              <span>{{ displayValue(item.title) }}</span>
            </div>
            <div class="recruitment-dashboard-card-sub">总计 {{ getTotal(item) }} 条</div>
          </div>
          <div class="recruitment-dashboard-card-total" :style="{ color: item.color }">
            {{ getTotal(item) }}
          </div>
        </div>
        <div class="recruitment-dashboard-card-tags">
          <span
            v-for="status in getTags(item)"
            :key="item.key + '-' + status.value"
            class="recruitment-dashboard-status-pill"
            :class="getStatusClass(status)"
          >
            <span class="recruitment-dashboard-pill-dot"></span>
            {{ displayValue(status.label) }} {{ displayValue(status.count, 0) }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'OverviewMetricCards',
  props: {
    cards: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    displayValue(value, fallback = '-') {
      return value === 0 || value ? value : fallback
    },
    getTotal(item) {
      // 总数严格取“全部”的 count，不使用标签求和替代后端统计口径。
      const statusOptions = item.statusOptions || []
      const total = statusOptions.find(status => status.value === 'all')
      return total ? this.displayValue(total.count, 0) : 0
    },
    getTags(item) {
      return (item.statusOptions || []).filter(status => status.value !== 'all')
    },
    getStatusClass(status) {
      return `is-${status.code || 'default'}`
    }
  }
}
</script>

<style lang="less" scoped>
.recruitment-dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.recruitment-dashboard-metrics-empty {
  grid-column: 1 / -1;
  padding: 32px 0;
}

.recruitment-dashboard-stat-card {
  min-height: 150px;
  padding: 24px 28px 22px;
  background: #fff;
  border: 1px solid rgba(226, 232, 240, .78);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, .06);
  transition: all .25s ease;

  &:hover {
    box-shadow: 0 14px 32px rgba(15, 23, 42, .11);
    transform: translateY(-3px);
  }
}

.recruitment-dashboard-card-main {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  gap: 18px;
  align-items: start;
}

.recruitment-dashboard-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, .09);
  font-size: 24px;
}

.recruitment-dashboard-card-title {
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}

.recruitment-dashboard-card-sub {
  margin-top: 8px;
  color: #64748b;
  font-size: 13px;
  line-height: 18px;
}

.recruitment-dashboard-card-total {
  min-width: 52px;
  font-size: 32px;
  font-weight: 700;
  line-height: 38px;
  text-align: right;
}

.recruitment-dashboard-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 14px;
  margin-top: 24px;
}

.recruitment-dashboard-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
  line-height: 18px;
  white-space: nowrap;
}

.recruitment-dashboard-status-pill.is-orange {
  color: #e6a23c;
  background: #fff4e5;
}

.recruitment-dashboard-status-pill.is-blue {
  color: #409eff;
  background: #e0f2ff;
}

.recruitment-dashboard-status-pill.is-green {
  color: #67c23a;
  background: #e8f7e8;
}

.recruitment-dashboard-status-pill.is-cyan {
  color: #13c2c2;
  background: #e6fffb;
}

.recruitment-dashboard-status-pill.is-red {
  color: #f56c6c;
  background: #fdecec;
}

.recruitment-dashboard-status-pill.is-yqx,
.recruitment-dashboard-status-pill.is-yjj,
.recruitment-dashboard-status-pill.is-fq,
.recruitment-dashboard-status-pill.is-default {
  color: #909399;
  background: #f0f0f0;
}

.recruitment-dashboard-pill-dot {
  width: 7px;
  height: 7px;
  background: currentColor;
  border-radius: 50%;
}

@media (max-width: 1200px) {
  .recruitment-dashboard-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .recruitment-dashboard-metrics {
    grid-template-columns: 1fr;
  }

  .recruitment-dashboard-stat-card {
    padding: 20px;
  }
}
</style>
