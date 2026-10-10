<template>
  <div class="sidebar-card">
    <div class="sidebar-card-header">
      <div class="header-icon">
        <a-icon type="calendar" />
      </div>
      <div class="header-text">
        <div class="header-title">假期情况</div>
        <div class="header-subtitle">2026年度休假统计</div>
      </div>
    </div>
    <div class="sidebar-card-body leave-sidebar-body">
      <template v-for="group in leaveGroups">
        <div :key="group.key + '-title'" class="archive-section-label leave-section-label">{{ group.title }}</div>
        <div :key="group.key + '-charts'" class="leave-chart-grid">
          <div
            v-for="item in group.items"
            :key="item.key"
            class="leave-chart-card"
            :class="'theme-' + item.theme"
          >
            <div class="leave-chart-wrap">
              <div ref="leaveCharts" class="leave-chart"></div>
              <div class="leave-chart-center">{{ item.value }}</div>
            </div>
            <div class="leave-chart-label">{{ item.label }}</div>
            <div class="leave-chart-unit">{{ item.unit }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
const echarts = require('echarts')

const THEME_COLORS = {
  blue: '#2563eb',
  green: '#10b981',
  amber: '#f59e0b'
}

export default {
  name: 'EmployeeLeaveSidebar',
  data() {
    return {
      chartInstances: [],
      renderTimer: null
    }
  },
  props: {
    detailEmployee: {
      type: Object,
      default: null
    }
  },
  computed: {
    leaveGroups() {
      const annualTotal = this.getLeaveValue('annualLeaveEntitlement')
      const annualUsed = this.getLeaveValue('annualLeaveTaken')
      const annualLeft = this.getLeaveValue('annualLeaveBalance')
      const adjustTotal = this.getLeaveValue('totalHours')
      const adjustUsed = this.getLeaveValue('usedHours')
      const adjustLeft = this.getLeaveValue('remainingHours')
      const annualMax = this.getChartMax([annualTotal, annualUsed, annualLeft])
      const adjustMax = this.getChartMax([adjustTotal, adjustUsed, adjustLeft])

      return [
        {
          key: 'annual',
          title: '年假',
          items: [
            { key: 'annual-total', theme: 'blue', value: annualTotal, max: annualMax, unit: annualTotal + '天', label: '本年度应休年假天数' },
            { key: 'annual-used', theme: 'green', value: annualUsed, max: annualMax, unit: annualUsed + '天', label: '本年度已休年假天数' },
            { key: 'annual-left', theme: 'amber', value: annualLeft, max: annualMax, unit: annualLeft + '天', label: '剩余年假天数' }
          ]
        },
        {
          key: 'adjust',
          title: '调休',
          items: [
            { key: 'adjust-total', theme: 'blue', value: adjustTotal, max: adjustMax, unit: adjustTotal + 'h', label: '累计调休时长（小时）' },
            { key: 'adjust-used', theme: 'green', value: adjustUsed, max: adjustMax, unit: adjustUsed + 'h', label: '调休已使用时长（小时）' },
            { key: 'adjust-left', theme: 'amber', value: adjustLeft, max: adjustMax, unit: adjustLeft + 'h', label: '调休剩余时长（小时）' }
          ]
        }
      ]
    },
    leaveItems() {
      return this.leaveGroups.reduce((items, group) => items.concat(group.items), [])
    }
  },
  watch: {
    detailEmployee: {
      deep: true,
      handler() {
        this.refreshCharts()
      }
    }
  },
  mounted() {
    this.initChartsWithDelay()
    window.addEventListener('resize', this.handleResize)
  },
  activated() {
    this.handleResize()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.renderTimer) {
      clearTimeout(this.renderTimer)
      this.renderTimer = null
    }
    this.disposeCharts()
  },
  methods: {
    initChartsWithDelay() {
      this.$nextTick(() => {
        this.renderTimer = setTimeout(() => {
          this.renderTimer = null
          this.initCharts()
        }, 50)
      })
    },
    initCharts() {
      this.disposeCharts()

      const chartDoms = this.getChartDoms()
      chartDoms.forEach((dom, index) => {
        const item = this.leaveItems[index]
        if (!dom || !item) {
          return
        }

        const chart = echarts.init(dom, null, { renderer: 'canvas' })
        chart.setOption(this.createRingOption(item), true)
        this.chartInstances.push(chart)
      })
    },
    getChartDoms() {
      const refs = this.$refs.leaveCharts || []
      return Array.isArray(refs) ? refs : [refs]
    },
    refreshCharts() {
      this.$nextTick(() => {
        if (!this.chartInstances.length) {
          return
        }
        this.chartInstances.forEach((chart, index) => {
          const item = this.leaveItems[index]
          if (chart && !chart.isDisposed() && item) {
            chart.setOption(this.createRingOption(item), true)
          }
        })
      })
    },
    createRingOption(item) {
      const color = THEME_COLORS[item.theme] || THEME_COLORS.blue

      return {
        tooltip: {
          show: false
        },
        series: [
          {
            type: 'gauge',
            radius: '92%',
            center: ['50%', '50%'],
            startAngle: 90,
            endAngle: -270,
            min: 0,
            max: item.max,
            clockwise: true,
            pointer: {
              show: false
            },
            anchor: {
              show: false
            },
            progress: {
              show: true,
              width: 6,
              roundCap: true,
              itemStyle: {
                color: color
              }
            },
            axisLine: {
              roundCap: true,
              lineStyle: {
                width: 6,
                color: [[1, '#edf2f7']]
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            detail: {
              show: false
            },
            data: [
              {
                value: item.value
              }
            ]
          }
        ]
      }
    },
    getLeaveValue(field) {
      const value = (this.detailEmployee || {})[field]
      const numberValue = Number(value)
      return isNaN(numberValue) ? 0 : numberValue
    },
    getChartMax(values) {
      return Math.max.apply(null, values.concat([1]))
    },
    handleResize() {
      this.chartInstances.forEach(chart => {
        if (chart && !chart.isDisposed()) {
          chart.resize()
        }
      })
    },
    disposeCharts() {
      this.chartInstances.forEach(chart => {
        if (chart && !chart.isDisposed()) {
          chart.dispose()
        }
      })
      this.chartInstances = []
    }
  }
}
</script>

<style scoped lang="less">
.leave-sidebar-body {
  padding: 16px 20px;
}

.leave-section-label {
  margin-bottom: 8px;
  color: #8baef7;
  font-size: 11px;
}

.leave-section-label:not(:first-child) {
  margin-top: 16px;
}

.leave-chart-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.leave-chart-card {
  min-width: 0;
  padding: 12px 8px 11px;
  border: 1px solid #dce6f3;
  border-radius: 8px;
  background: #ffffff;
  text-align: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.leave-chart-card:hover {
  border-color: rgba(37, 99, 235, 0.26);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
}

.leave-chart-wrap {
  position: relative;
  width: 64px;
  height: 64px;
  margin: 0 auto 8px;
}

.leave-chart {
  width: 100%;
  height: 100%;
}

.leave-chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #2563eb;
  font-size: 18px;
  font-weight: 700;
  line-height: 28px;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.leave-chart-label {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
}

.leave-chart-unit {
  margin-top: 2px;
  font-size: 22px;
  font-weight: 800;
  line-height: 24px;
}

.theme-blue .leave-chart-unit {
  color: #2563eb;
}

.theme-blue .leave-chart-center {
  color: #2563eb;
}

.theme-green .leave-chart-unit {
  color: #10b981;
}

.theme-green .leave-chart-center {
  color: #10b981;
}

.theme-amber .leave-chart-unit {
  color: #f59e0b;
}

.theme-amber .leave-chart-center {
  color: #f59e0b;
}

@media (max-width: 480px) {
  .leave-chart-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
