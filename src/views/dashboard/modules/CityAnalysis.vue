<template>
  <div class="city-analysis-container">
    <div class="stat-cards">
      <stat-card
        v-for="(card, index) in statCards"
        :key="index"
        :icon="card.icon"
        :icon-type="card.iconType"
        :value="card.value"
        :suffix="card.suffix"
        :label="card.label"
      />
    </div>

    <div class="page2-merged-grid">
      <!-- 左侧栏：数据概况+区域分布 -->
      <div class="page2-left-sidebar">
        <div class="card overview-card">
          <div class="card-title">
            <span class="icon"><lucide-icon name="navigation" :size="14" /></span>
            打卡数据概况
          </div>
          <div class="overview-content">
            <div v-for="(item, index) in overviewData" :key="index" class="overview-item">
              <span class="label">{{ item.label }}</span>
              <span class="value" :class="item.colorClass">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <div class="card area-card">
          <div class="card-title" style="font-size: 13px; margin-bottom: 10px">
            <span class="icon"><lucide-icon name="globe" :size="12" /></span>
            各区域打卡人数分布
          </div>
          <div class="field-list">
            <div v-for="(field, index) in fieldData" :key="index" class="field-row">
              <span class="field-name">{{ field.name }}</span>
              <div class="field-bar">
                <div class="field-bar-fill" :style="{ width: field.percentage + '%' }"></div>
              </div>
              <span class="field-count">{{ field.count }}人</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧主区域 -->
      <div class="page2-right-area">
        <chart-card
          title="各城市打卡率排行"
          icon="award"
          chart-id="chart-dept-rank-bar"
          :options="deptRankOptions"
          style="flex: 1.2"
        />

        <chart-card
          title="打卡方式统计 (总74866条)"
          icon="clipboard-list"
          chart-id="chart-trip-stats"
          :options="methodStatsOptions"
          style="flex: 1"
        />
      </div>
    </div>
  </div>
</template>

<script>
import StatCard from './StatCard.vue'
import ChartCard from './ChartCard.vue'
import LucideIcon from './LucideIcon.vue'
import * as echarts from 'echarts'

const COLORS = {
  blue: '#2d78ff',
  blueLight: '#4a9eff',
  cyan: '#00a0d4',
  green: '#10b981',
  warning: '#f59e0b',
  orange: '#f97316',
  danger: '#ef4444',
}

export default {
  name: 'CityAnalysis',
  components: {
    StatCard,
    ChartCard,
    LucideIcon,
  },
  data() {
    return {
      statCards: [
        {
          icon: 'building-2',
          iconType: 'blue',
          value: 8,
          label: '打卡城市数',
        },
        {
          icon: 'trophy',
          iconType: 'green',
          value: 96.2,
          suffix: '%',
          label: '最高打卡率',
        },
        {
          icon: 'trending-down',
          iconType: 'orange',
          value: 78.6,
          suffix: '%',
          label: '最低打卡率',
        },
        {
          icon: 'bar-chart-2',
          iconType: 'cyan',
          value: 88.5,
          suffix: '%',
          label: '平均完整打卡率',
        },
        {
          icon: 'flame',
          iconType: 'red',
          value: 374,
          label: '异常打卡总人次',
        },
      ],
      overviewData: [
        { label: '打卡城市数', value: '8', colorClass: 'cyan' },
        { label: '有GPS定位人次', value: '5084', colorClass: 'blue' },
        { label: '企业微信打卡率', value: '6.8%', colorClass: 'green' },
      ],
      fieldData: [
        { name: '龙华区', count: 46, percentage: 100 },
        { name: '大朗镇', count: 21, percentage: 45 },
        { name: '坪山区', count: 19, percentage: 41 },
        { name: '龙岗区', count: 18, percentage: 39 },
        { name: '昆山', count: 12, percentage: 26 },
        { name: '凤岗镇', count: 12, percentage: 26 },
        { name: '望城区', count: 7, percentage: 15 },
        { name: '厚街镇', count: 5, percentage: 11 },
        { name: '黄埔区', count: 4, percentage: 9 },
      ],
    }
  },
  computed: {
    deptRankOptions() {
      const depts = [
        '深圳(67人)',
        '东莞(57人)',
        '其他城市(36人)',
        '长沙(15人)',
        '惠州(14人)',
        '广州(12人)',
        '盐城(2人)',
        '湘潭(2人)',
      ]
      const rates = [96.2, 95.8, 94.5, 93.1, 92.3, 90.5, 88.0, 85.0]

      return {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderColor: 'rgba(45, 120, 255, 0.15)',
          textStyle: { color: '#1e2d3d' },
          extraCssText: 'box-shadow: 0 4px 16px rgba(45,120,255,0.12);',
        },
        grid: { left: 100, right: 50, top: 0, bottom: 20 },
        xAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
          axisLabel: { color: '#6b7c93', fontSize: 12 },
          splitLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.06)' } },
        },
        yAxis: {
          type: 'category',
          data: depts.reverse(),
          axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
          axisLabel: { color: '#6b7c93', fontSize: 12 },
        },
        series: [
          {
            type: 'bar',
            data: rates.reverse(),
            barWidth: 14,
            itemStyle: {
              borderRadius: [0, 4, 4, 0],
              color: function (params) {
                const idx = params.dataIndex
                if (idx >= 8)
                  return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: 'rgba(45,120,255,0.2)' },
                    { offset: 1, color: COLORS.green },
                  ])
                if (idx >= 6)
                  return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: 'rgba(45,120,255,0.2)' },
                    { offset: 1, color: COLORS.cyan },
                  ])
                return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  { offset: 0, color: 'rgba(45,120,255,0.2)' },
                  { offset: 1, color: COLORS.blue },
                ])
              },
            },
            label: {
              show: true,
              position: 'right',
              color: '#1e2d3d',
              fontSize: 12,
              fontWeight: 500,
              formatter: '{c}%',
            },
            animationDuration: 1500,
            animationDelay: function (idx) {
              return idx * 80
            },
          },
        ],
      }
    },
    methodStatsOptions() {
      const punchMethods = ['考勤机', '手动打卡', '企业微信']
      const punchMethodCounts = [63829, 5953, 5084]
      const totalRecords = 74866

      return {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderColor: 'rgba(45, 120, 255, 0.15)',
          textStyle: { color: '#1e2d3d' },
          extraCssText: 'box-shadow: 0 4px 16px rgba(45,120,255,0.12);',
        },
        legend: {
          data: ['打卡方式', '占比'],
          textStyle: { color: '#6b7c93', fontSize: 12 },
          top: 0,
        },
        grid: { left: 50, right: 50, top: 40, bottom: 20 },
        xAxis: {
          type: 'category',
          data: punchMethods,
          axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
          axisLabel: { color: '#6b7c93', fontSize: 12 },
        },
        yAxis: [
          {
            type: 'value',
            name: '记录数',
            axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
            axisLabel: { color: '#6b7c93', fontSize: 12 },
            splitLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.06)' } },
            nameTextStyle: { color: '#6b7c93', fontSize: 12 },
          },
          {
            type: 'value',
            name: '占比%',
            max: 100,
            axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
            axisLabel: { color: '#6b7c93', fontSize: 12 },
            splitLine: { show: false },
            nameTextStyle: { color: '#6b7c93', fontSize: 12 },
          },
        ],
        series: [
          {
            name: '打卡方式',
            type: 'bar',
            barWidth: 40,
            itemStyle: {
              borderRadius: [6, 6, 0, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: COLORS.blue },
                { offset: 1, color: 'rgba(45,120,255,0.15)' },
              ]),
            },
            data: punchMethodCounts,
            label: {
              show: true,
              position: 'top',
              fontSize: 11,
              formatter: '{c}',
            },
            animationDuration: 1500,
          },
          {
            name: '占比',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            data: [
              ((63829 / totalRecords) * 100).toFixed(1),
              ((5953 / totalRecords) * 100).toFixed(1),
              ((5084 / totalRecords) * 100).toFixed(1),
            ],
            lineStyle: { color: COLORS.orange, width: 2.5 },
            itemStyle: { color: COLORS.orange },
            symbolSize: 8,
            animationDuration: 2000,
            label: {
              show: true,
              fontSize: 11,
              formatter: '{c}%',
              position: 'right',
            },
          },
        ],
      }
    },
  },
}
</script>

<style lang="less" scoped>
.city-analysis-container {
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
  .stat-card {
    height: 88px;
  }
}

.page2-merged-grid {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.page2-left-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.page2-right-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.card {
  background: #ffffff;
  border: 1px solid rgba(45, 120, 255, 0.12);
  border-radius: 12px;
  padding: 18px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  box-shadow: 0 2px 12px rgba(45, 120, 255, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  opacity: 0.5;
  box-shadow: 0 0 6px rgba(45, 120, 255, 0.2);
}

.overview-card {
  flex-shrink: 0;
}

.area-card {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.area-card::-webkit-scrollbar {
  width: 4px;
}
.area-card::-webkit-scrollbar-thumb {
  background: rgba(45, 120, 255, 0.2);
  border-radius: 2px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e2d3d;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.card-title .icon {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(45, 120, 255, 0.25);
  font-size: 13px;
}

.overview-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.overview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(45, 120, 255, 0.04);
  border-radius: 6px;
}

.overview-item .label {
  font-size: 13px;
  color: #6b7c93;
}

.overview-item .value {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.overview-item .value.cyan {
  color: #00a0d4;
}
.overview-item .value.blue {
  color: #2d78ff;
}
.overview-item .value.green {
  color: #10b981;
}

.field-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.field-name {
  font-size: 12px;
  color: #1e2d3d;
  min-width: 56px;
  flex-shrink: 0;
}

.field-bar {
  flex: 1;
  height: 8px;
  background: rgba(45, 120, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.field-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #2d78ff 0%, #00b4d8 100%);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.field-count {
  font-size: 12px;
  color: #6b7c93;
  min-width: 36px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>

