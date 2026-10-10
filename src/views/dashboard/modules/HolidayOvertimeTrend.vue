<template>
  <div class="holiday-overtime-trend-container">
    <div class="holiday-overtime-trend-grid">
      <div class="holiday-overtime-trend-top stat-cards">
        <stat-card
          v-for="(card, index) in statCards"
          :key="index"
          :icon="card.icon"
          :icon-type="card.iconType"
          :value="card.value"
          :label="card.label"
        />
      </div>

      <chart-card
        title="每日打卡人数与记录数趋势 (5月)"
        icon="trending-up"
        chart-id="chart-monthly-trend"
        :options="monthlyTrendOptions"
        style="grid-column: 1 / -1"
      />

      <chart-card title="打卡状态类型分布" icon="pie-chart" chart-id="chart-leave-type" :options="leaveTypeOptions" />

      <chart-card
        title="上班打卡时段分布"
        icon="bar-chart-2"
        chart-id="chart-holiday-overtime"
        :options="timeDistributionOptions"
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
  cyan: '#00a0d4',
  green: '#10b981',
  warning: '#f59e0b',
  orange: '#f97316',
  danger: '#ef4444',
}

export default {
  name: 'HolidayOvertimeTrend',
  components: {
    StatCard,
    ChartCard,
  },
  data() {
    return {
      statCards: [
        {
          icon: 'palmtree',
          iconType: 'cyan',
          value: 74866,
          label: '总打卡记录数',
        },
        {
          icon: 'timer',
          iconType: 'orange',
          value: 5084,
          label: '有效打卡记录(上下班)',
        },
        {
          icon: 'calendar-days',
          iconType: 'blue',
          value: 26,
          label: '统计天数(5/1-5/26)',
        },
        {
          icon: 'banknote',
          iconType: 'green',
          value: 228,
          label: '补卡次数',
        },
        {
          icon: 'flame',
          iconType: 'red',
          value: 720,
          label: '打卡员工总数',
        },
      ],
    }
  },
  computed: {
    monthlyTrendOptions() {
      const days = Array.from({ length: 26 }, (_, i) => `5/${i + 1}`)
      const employeeCount = [
        52, 42, 121, 447, 586, 686, 696, 695, 656, 305, 698, 702, 617, 694, 690, 631, 318, 687, 698, 688, 693, 689, 587,
        240, 681, 677,
      ]
      const recordCount = [
        104, 84, 242, 894, 1172, 1372, 1392, 1390, 1312, 610, 1396, 1404, 1234, 1388, 1380, 1262, 636, 1374, 1396, 1376,
        1386, 1378, 1174, 480, 1362, 1354,
      ]
      const holidayMark = [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0]

      return {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderColor: 'rgba(45, 120, 255, 0.15)',
          textStyle: { color: '#1e2d3d' },
          extraCssText: 'box-shadow: 0 4px 16px rgba(45,120,255,0.12);',
        },
        legend: {
          data: ['打卡员工数', '打卡总记录'],
          textStyle: { color: '#6b7c93', fontSize: 12 },
          top: 0,
          right: 'center',
        },
        grid: { left: 60, right: 60, top: 40, bottom: 40 },
        xAxis: {
          type: 'category',
          data: days,
          axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
          axisLabel: { color: '#6b7c93', fontSize: 9, rotate: 30 },
        },
        yAxis: [
          {
            type: 'value',
            name: '员工数',
            axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
            axisLabel: { color: '#6b7c93', fontSize: 12 },
            splitLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.06)' } },
            nameTextStyle: { color: '#6b7c93', fontSize: 12 },
          },
          {
            type: 'value',
            name: '记录数',
            axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
            axisLabel: { color: '#6b7c93', fontSize: 12 },
            splitLine: { show: false },
            nameTextStyle: { color: '#6b7c93', fontSize: 12 },
          },
        ],
        series: [
          {
            name: '打卡员工数',
            type: 'bar',
            yAxisIndex: 0,
            barWidth: 18,
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: function (params) {
                return holidayMark[params.dataIndex]
                  ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: COLORS.orange },
                      { offset: 1, color: 'rgba(249,115,22,0.2)' },
                    ])
                  : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: COLORS.blue },
                      { offset: 1, color: 'rgba(45,120,255,0.2)' },
                    ])
              },
            },
            data: employeeCount,
            animationDuration: 1500,
          },
          {
            name: '打卡总记录',
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            data: recordCount,
            lineStyle: { color: COLORS.cyan, width: 3 },
            itemStyle: { color: COLORS.cyan },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(239,68,68,0.1)' },
                { offset: 1, color: 'rgba(239,68,68,0)' },
              ]),
            },
            symbolSize: 6,
            animationDuration: 2000,
          },
        ],
      }
    },
    leaveTypeOptions() {
      return {
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderColor: 'rgba(45, 120, 255, 0.15)',
          textStyle: { color: '#1e2d3d' },
          extraCssText: 'box-shadow: 0 4px 16px rgba(45,120,255,0.12);',
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { color: '#6b7c93', fontSize: 12 },
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 6, borderColor: '#ffffff', borderWidth: 3 },
            label: { show: false },
            emphasis: {
              label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#1e2d3d' },
            },
            data: [
              { value: 2249, name: '完整打卡', itemStyle: { color: COLORS.blue } },
              { value: 306, name: '仅上班', itemStyle: { color: COLORS.warning } },
              { value: 92, name: '仅下班', itemStyle: { color: COLORS.orange } },
              { value: 211, name: '迟到', itemStyle: { color: COLORS.danger } },
              { value: 163, name: '早退', itemStyle: { color: '#8b5cf6' } },
              { value: 228, name: '补卡', itemStyle: { color: COLORS.green } },
            ],
            animationType: 'scale',
            animationDuration: 1500,
          },
        ],
      }
    },
    timeDistributionOptions() {
      const hours24 = [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        '23',
      ]
      const punchInByHour = [2, 2, 0, 0, 0, 4, 32, 988, 1330, 90, 41, 19, 5, 17, 6, 1, 6, 7, 3, 4, 4, 1, 3, 4]
      const punchOutByHour = [
        52, 16, 6, 6, 0, 0, 0, 2, 11, 0, 0, 17, 28, 1, 4, 6, 14, 132, 358, 260, 366, 478, 241, 517,
      ]

      return {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderColor: 'rgba(45, 120, 255, 0.15)',
          textStyle: { color: '#1e2d3d' },
          extraCssText: 'box-shadow: 0 4px 16px rgba(45,120,255,0.12);',
        },
        legend: {
          data: ['上班打卡', '下班打卡'],
          textStyle: { color: '#6b7c93', fontSize: 12 },
          top: 0,
        },
        grid: { left: 50, right: 20, top: 40, bottom: 30 },
        xAxis: {
          type: 'category',
          data: hours24,
          axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
          axisLabel: { color: '#6b7c93', fontSize: 12 },
          name: '小时',
          nameTextStyle: { color: '#6b7c93', fontSize: 12 },
        },
        yAxis: {
          type: 'value',
          name: '打卡人次',
          axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
          axisLabel: { color: '#6b7c93', fontSize: 12 },
          splitLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.06)' } },
          nameTextStyle: { color: '#6b7c93', fontSize: 12 },
        },
        series: [
          {
            name: '上班打卡',
            type: 'bar',
            barWidth: 12,
            barGap: '20%',
            data: punchInByHour,
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: COLORS.blue },
                { offset: 1, color: 'rgba(45,120,255,0.15)' },
              ]),
            },
            animationDuration: 1500,
          },
          {
            name: '下班打卡',
            type: 'bar',
            barWidth: 12,
            data: punchOutByHour,
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: COLORS.cyan },
                { offset: 1, color: 'rgba(0,160,212,0.15)' },
              ]),
            },
            animationDuration: 1800,
          },
        ],
      }
    },
  },
}
</script>

<style scoped>
.holiday-overtime-trend-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.holiday-overtime-trend-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.holiday-overtime-trend-top {
  grid-column: 1 / -1;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}
</style>

