<template>
  <div class="attendance-ranking-container">
    <div class="stat-cards">
      <stat-card
        v-for="(card, index) in statCards"
        :key="index"
        :icon="card.icon"
        :icon-type="card.iconType"
        :value="card.value"
        :suffix="card.suffix"
        :label="card.label"
        :trend="card.trend"
        :trend-type="card.trendType"
      />
    </div>

    <div class="charts-wrapper">
      <chart-card
        title="部门打卡率排行"
        icon="award"
        chart-id="chart-dept-rank"
        :options="deptRankOptions"
      />

      <chart-card
        title="各部门人数与打卡率关系"
        icon="scatter-chart"
        chart-id="chart-dept-scatter-attendance-ranking"
        :options="deptScatterOptions"
      />
    </div>
  </div>
</template>

<script>
import StatCard from './StatCard.vue'
import ChartCard from './ChartCard.vue'
import * as echarts from 'echarts'

const COLORS = {
  blue: '#2d78ff',
  blueLight: '#4a9eff',
  cyan: '#00a0d4',
  green: '#10b981',
  warning: '#f59e0b',
  orange: '#f97316',
  danger: '#ef4444'
}

export default {
  name: 'AttendanceRanking',
  components: {
    StatCard,
    ChartCard
  },
  data() {
    return {
      statCards: [
        {
          icon: 'building-2',
          iconType: 'blue',
          value: 8,
          label: '打卡部门数'
        },
        {
          icon: 'trophy',
          iconType: 'green',
          value: 96.2,
          suffix: '%',
          label: '最高打卡率'
        },
        {
          icon: 'trending-down',
          iconType: 'orange',
          value: 78.6,
          suffix: '%',
          label: '最低打卡率'
        },
        {
          icon: 'bar-chart-2',
          iconType: 'cyan',
          value: 88.5,
          suffix: '%',
          label: '平均完整打卡率'
        },
        {
          icon: 'flame',
          iconType: 'red',
          value: 374,
          label: '异常打卡总人次'
        }
      ]
    }
  },
  computed: {
    deptRankOptions() {
      const depts = ['深圳(67人)', '东莞(57人)', '其他城市(36人)', '长沙(15人)', '惠州(14人)', '广州(12人)', '盐城(2人)', '湘潭(2人)']
      const rates = [96.2, 95.8, 94.5, 93.1, 92.3, 90.5, 88.0, 85.0]

      return {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderColor: 'rgba(45, 120, 255, 0.15)',
          textStyle: { color: '#1e2d3d' },
          extraCssText: 'box-shadow: 0 4px 16px rgba(45,120,255,0.12);'
        },
        grid: { left: 80, right: 50, top: 10, bottom: 30 },
        xAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
          axisLabel: { color: '#6b7c93', fontSize: 12 },
          splitLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.06)' } }
        },
        yAxis: {
          type: 'category',
          data: depts.reverse(),
          axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
          axisLabel: { color: '#6b7c93', fontSize: 12 }
        },
        series: [{
          type: 'bar',
          data: rates.reverse(),
          barWidth: 14,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: function (params) {
              const idx = params.dataIndex
              if (idx >= 8) return new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: 'rgba(45,120,255,0.2)' }, { offset: 1, color: COLORS.green }])
              if (idx >= 6) return new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: 'rgba(45,120,255,0.2)' }, { offset: 1, color: COLORS.cyan }])
              return new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: 'rgba(45,120,255,0.2)' }, { offset: 1, color: COLORS.blue }])
            }
          },
          label: {
            show: true,
            position: 'right',
            color: '#1e2d3d',
            fontSize: 12,
            fontWeight: 500,
            formatter: '{c}%'
          },
          animationDuration: 1500,
          animationDelay: function (idx) { return idx * 80 }
        }]
      }
    },
    deptScatterOptions() {
      const anomalyData = [
        [67, 96.2, '深圳'],
        [57, 95.8, '东莞'],
        [36, 94.5, '其他城市'],
        [15, 93.1, '长沙'],
        [14, 92.3, '惠州'],
        [12, 90.5, '广州'],
        [2, 88.0, '盐城'],
        [2, 85.0, '湘潭']
      ]

      return {
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderColor: 'rgba(45, 120, 255, 0.15)',
          textStyle: { color: '#1e2d3d' },
          extraCssText: 'box-shadow: 0 4px 16px rgba(45,120,255,0.12);',
          formatter: function (p) {
            return `${p.data[2]}<br/>员工数: ${p.data[0]}<br/>打卡率: ${p.data[1]}%`
          }
        },
        grid: { left: 60, right: 30, top: 30, bottom: 40 },
        xAxis: {
          name: '城市员工数',
          axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
          axisLabel: { color: '#6b7c93', fontSize: 12 },
          splitLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.06)' } },
          nameTextStyle: { color: '#6b7c93', fontSize: 12 }
        },
        yAxis: {
          name: '打卡率%',
          axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
          axisLabel: { color: '#6b7c93', fontSize: 12 },
          splitLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.06)' } },
          nameTextStyle: { color: '#6b7c93', fontSize: 12 }
        },
        series: [{
          type: 'scatter',
          symbolSize: function (data) {
            return Math.sqrt(data[0]) * 3 + 8
          },
          data: anomalyData,
          itemStyle: {
            color: new echarts.graphic.RadialGradient(0.5, 0.5, 0.5, [
              { offset: 0, color: COLORS.blue },
              { offset: 1, color: 'rgba(45,120,255,0.3)' }
            ]),
            shadowBlur: 10,
            shadowColor: 'rgba(45, 120, 255, 0.3)'
          },
          label: {
            show: true,
            formatter: function (p) { return p.data[2] },
            position: 'top',
            fontSize: 11,
            color: '#1e2d3d'
          },
          animationDuration: 1500
        }]
      }
    }
  }
}
</script>

<style scoped>
.attendance-ranking-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  flex-shrink: 0;
}

.charts-wrapper {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.charts-wrapper > * {
  flex: 1;
  min-width: 0;
  min-height: 0;
}
</style>
