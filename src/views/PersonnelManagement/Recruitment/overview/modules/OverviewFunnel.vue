<template>
  <div class="recruitment-dashboard-funnel" id="overviewFunnel">
    <a-empty v-if="steps.length === 0" description="暂无漏斗数据" />
    <template v-else>
      <div v-for="(step, index) in steps" :key="step.key" class="recruitment-dashboard-funnel-row">
        <div class="recruitment-dashboard-funnel-label">{{ displayValue(step.label) }}</div>
        <div class="recruitment-dashboard-funnel-track">
          <div
            class="recruitment-dashboard-funnel-bar"
            :style="{ width: getWidth(step), background: step.gradient || '#4A7BF7' }"
          >
            <span>{{ displayValue(step.value) }}</span>
          </div>
        </div>
        <span class="recruitment-dashboard-funnel-rate">{{ getRate(index) }}</span>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'OverviewFunnel',
  props: {
    steps: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    maxValue() {
      const values = this.steps.map(item => Number(item.value) || 0)
      return Math.max.apply(null, values.concat(1))
    }
  },
  methods: {
    displayValue(value) {
      return value === 0 || value ? value : '-'
    },
    getWidth(step) {
      return Math.max(Math.round((Number(step.value) || 0) / this.maxValue * 100), 8) + '%'
    },
    getRate(index) {
      if (index === 0) {
        return ''
      }
      const current = Number(this.steps[index].value) || 0
      const previous = Number(this.steps[index - 1].value) || 0
      return previous > 0 ? '转化率 ' + Math.round(current / previous * 100) + '%' : ''
    }
  }
}
</script>

<style lang="less" scoped>
.recruitment-dashboard-funnel {
  padding: 2px 0 4px;

  .ant-empty {
    padding: 34px 0;
  }
}

.recruitment-dashboard-funnel-row {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr) 96px;
  gap: 16px;
  align-items: center;
  min-height: 46px;
}

.recruitment-dashboard-funnel-label {
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
  text-align: right;
  white-space: nowrap;
}

.recruitment-dashboard-funnel-track {
  height: 34px;
  overflow: hidden;
  background: #eef2f7;
  border-radius: 999px;
}

.recruitment-dashboard-funnel-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 100%;
  border-radius: 999px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, .2);
  transition: width .35s ease;
}

.recruitment-dashboard-funnel-rate {
  color: #94a3b8;
  font-size: 13px;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .recruitment-dashboard-funnel-row {
    grid-template-columns: 70px minmax(0, 1fr);
    gap: 10px 12px;
    padding: 6px 0;
  }

  .recruitment-dashboard-funnel-rate {
    grid-column: 2;
  }
}
</style>
