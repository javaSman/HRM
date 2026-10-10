<template>
  <div class="attendance-cockpit-container">
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
        :breathe="true"
      />
    </div>

    <div class="grid-2x2">
      <chart-card
        title="实时在岗率趋势"
        icon="trending-up"
        chart-id="chart-onduty-trend"
        :options="ondutyTrendOptions"
      />
      <chart-card
        title="考勤状态分布"
        icon="pie-chart"
        chart-id="chart-attendance-pie"
        :options="attendancePieOptions"
      />
      <chart-card
        title="大小周出勤总览"
        icon="calendar-range"
        chart-id="chart-week-compare"
        :options="weekCompareOptions"
      />
      <chart-card
        title="打卡时段分布(24h)"
        icon="bar-chart-2"
        chart-id="chart-leave-overtime"
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
  blueLight: '#4a9eff',
  cyan: '#00a0d4',
  green: '#10b981',
  warning: '#f59e0b',
  orange: '#f97316',
  danger: '#ef4444',
  purple: '#8b5cf6',
}

export default {
  name: 'AttendanceCockpit',
  components: {
    StatCard,
    ChartCard,
  },
  data() {
    return {
      statCards: [
        {
          icon: 'users',
          iconType: 'blue',
          value: 720,
          label: '员工总数',
          trend: '总打卡74866条',
          trendType: 'up',
        },
        {
          icon: 'user-check',
          iconType: 'green',
          value: 614,
          label: '日均在岗',
          trend: '5月数据',
          trendType: 'up',
        },
        {
          icon: 'user-x',
          iconType: 'orange',
          value: 398,
          label: '异常打卡(仅上班/仅下班)',
          trend: '仅上班306 仅下班92',
          trendType: 'down',
        },
        {
          icon: 'activity',
          iconType: 'cyan',
          value: 88.5,
          suffix: '%',
          label: '完整打卡率',
          trend: '2249/2544人天',
          trendType: 'up',
        },
        {
          icon: 'alert-triangle',
          iconType: 'red',
          value: 14.7,
          suffix: '%',
          label: '异常打卡率',
          trend: '含迟到211/早退163',
          trendType: 'down',
        },
      ],
    }
  },
  computed: {
    ondutyTrendOptions() {
      const days = [
        '5/1',
        '5/2',
        '5/3',
        '5/4',
        '5/5',
        '5/6',
        '5/7',
        '5/8',
        '5/9',
        '5/10',
        '5/11',
        '5/12',
        '5/13',
        '5/14',
        '5/15',
        '5/16',
        '5/17',
        '5/18',
        '5/19',
        '5/20',
        '5/21',
        '5/22',
        '5/23',
        '5/24',
        '5/25',
        '5/26',
      ]
      const onDutyRate = [
        85.7, 78.6, 96.2, 92.9, 86.1, 91.5, 91.5, 89.9, 92.7, 87.5, 89.0, 89.1, 92.3, 89.8, 91.9, 91.6, 81.8, 86.8,
        90.2, 78.9, 90.1, 89.1, 88.8, 82.5, 86.6, 7.6,
      ]
      const employeeCount = [
        52, 42, 121, 447, 586, 686, 696, 695, 656, 305, 698, 702, 617, 694, 690, 631, 318, 687, 698, 688, 693, 689, 587,
        240, 681, 677,
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
          data: ['打卡率%', '打卡人数'],
          textStyle: { color: '#6b7c93', fontSize: 12 },
          top: -6,
          right: 80,
        },
        grid: { left: 50, right: 50, top: 30, bottom: 20 },
        xAxis: {
          type: 'category',
          data: days,
          axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
          axisLabel: { color: '#6b7c93', fontSize: 10, rotate: 30 },
        },
        yAxis: [
          {
            type: 'value',
            name: '打卡率%',
            min: 0,
            max: 100,
            axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
            axisLabel: { color: '#6b7c93', fontSize: 12 },
            splitLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.06)' } },
            nameTextStyle: { color: '#6b7c93', fontSize: 12 },
          },
          {
            type: 'value',
            name: '人数',
            axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
            axisLabel: { color: '#6b7c93', fontSize: 12 },
            splitLine: { show: false },
            nameTextStyle: { color: '#6b7c93', fontSize: 12 },
          },
        ],
        series: [
          {
            name: '打卡率%',
            type: 'line',
            smooth: true,
            yAxisIndex: 0,
            data: onDutyRate,
            lineStyle: { color: COLORS.blue, width: 3 },
            itemStyle: { color: COLORS.blue },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(45,120,255,0.15)' },
                { offset: 1, color: 'rgba(45,120,255,0)' },
              ]),
            },
            symbolSize: 6,
            animationDuration: 2000,
            markLine: {
              silent: true,
              data: [
                {
                  yAxis: 88.5,
                  name: '均值',
                  label: { formatter: '均值88.5%' },
                  lineStyle: { color: COLORS.green, type: 'dashed' },
                },
              ],
            },
          },
          {
            name: '打卡人数',
            type: 'bar',
            yAxisIndex: 1,
            data: employeeCount,
            barWidth: 10,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0,160,212,0.4)' },
                { offset: 1, color: 'rgba(0,160,212,0.05)' },
              ]),
            },
            animationDuration: 2000,
          },
        ],
      }
    },
    attendancePieOptions() {
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
              { value: 2249, name: '完整打卡(上下班)', itemStyle: { color: COLORS.blue } },
              { value: 306, name: '仅上班(缺下班)', itemStyle: { color: COLORS.warning } },
              { value: 92, name: '仅下班(缺上班)', itemStyle: { color: COLORS.orange } },
              { value: 211, name: '迟到(9点后)', itemStyle: { color: COLORS.danger } },
              { value: 163, name: '早退(17点前)', itemStyle: { color: COLORS.purple } },
            ],
            animationType: 'scale',
            animationDuration: 1500,
          },
        ],
      }
    },
    weekCompareOptions() {
      const weeks = ['第1周(5/4-10)', '第2周(5/11-17)', '第3周(5/18-24)', '第4周(5/25-31)']

      return {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderColor: 'rgba(45, 120, 255, 0.15)',
          textStyle: { color: '#1e2d3d' },
          extraCssText: 'box-shadow: 0 4px 16px rgba(45,120,255,0.12);',
        },
        legend: {
          data: ['工作日均打卡率', '周末日均打卡率'],
          textStyle: { color: '#6b7c93', fontSize: 12 },
          top: 0,
        },
        grid: { left: 50, right: 20, top: 40, bottom: 30 },
        xAxis: {
          type: 'category',
          data: weeks,
          axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
          axisLabel: { color: '#6b7c93', fontSize: 10 },
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
          axisLabel: { color: '#6b7c93', fontSize: 12 },
          splitLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.06)' } },
        },
        series: [
          {
            name: '工作日均打卡率',
            type: 'bar',
            barGap: '50%',
            barWidth: 20,
            data: [90.2, 90.3, 88.2, 86.6],
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: COLORS.blue },
                { offset: 1, color: 'rgba(45,120,255,0.3)' },
              ]),
            },
            label: {
              show: true,
              position: 'top',
              fontSize: 10,
              color: '#1e2d3d',
              formatter: '{c}%',
            },
            animationDuration: 1500,
          },
          {
            name: '周末日均打卡率',
            type: 'bar',
            barWidth: 20,
            barGap: '50%',
            data: [90.9, 86.5, 85.7, 0],
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: COLORS.cyan },
                { offset: 1, color: 'rgba(0,160,212,0.3)' },
              ]),
            },
            label: {
              show: true,
              position: 'top',
              fontSize: 10,
              color: '#1e2d3d',
              formatter: '{c}%',
            },
            animationDuration: 1800,
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
.attendance-cockpit-container {
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

.grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
