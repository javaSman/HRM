<template>
  <div class="anomaly-monitor-container">
    <div class="stat-cards">
      <stat-card
        v-for="(card, index) in statCards"
        :key="index"
        :icon="card.icon"
        :icon-type="card.iconType"
        :value="card.value"
        :label="card.label"
      />
    </div>

    <div class="anomaly-grid">
      <chart-card
        title="月度异常趋势"
        icon="trending-up"
        chart-id="chart-anomaly-trend"
        :options="anomalyTrendOptions"
      />

      <chart-card
        title="异常类型分布"
        icon="pie-chart"
        chart-id="chart-anomaly-type"
        :options="anomalyTypeOptions"
      />

      <div class="card alert-overview-card">
        <div class="card-title">
          <span class="icon"><lucide-icon name="siren" :size="13" /></span>
          每日异常概览（5月逐日）
        </div>
        <div class="alert-monthly-list" ref="alertListRef">
          <div
            v-for="(monthGroup, index) in monthlyAlertData"
            :key="index"
            class="alert-month-group"
          >
            <div
              class="alert-month-header"
              @click="toggleMonth(index)"
            >
              <span class="month-arrow" :class="{ open: monthGroup.isOpen }">▶</span>
              <span>{{ monthGroup.month }}</span>
              <span class="month-count">{{ monthGroup.count }}条</span>
            </div>
            <transition name="slide-fade">
              <div v-show="monthGroup.isOpen" class="alert-month-items">
                <div
                  v-for="(alert, idx) in monthGroup.items"
                  :key="idx"
                  class="alert-item"
                  :class="`level-${alert.level}`"
                >
                  <span class="alert-time">{{ alert.time }}</span>
                  <span class="alert-name">{{ alert.name }}</span>
                  <span class="alert-type" :class="`badge-${alert.type}`">
                    {{ alert.typeLabel }}
                  </span>
                </div>
              </div>
            </transition>
          </div>
        </div>
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
  purple: '#8b5cf6'
}

export default {
  name: 'AnomalyMonitor',
  components: {
    StatCard,
    ChartCard,
    LucideIcon
  },
  data() {
    return {
      statCards: [
        {
          icon: 'alert-triangle',
          iconType: 'red',
          value: 374,
          label: '异常打卡总人次'
        },
        {
          icon: 'alarm-clock',
          iconType: 'orange',
          value: 211,
          label: '迟到人次(9点后)'
        },
        {
          icon: 'log-out',
          iconType: 'cyan',
          value: 163,
          label: '早退人次(17点前)'
        },
        {
          icon: 'map-pin',
          iconType: 'blue',
          value: 306,
          label: '仅上班无下班'
        },
        {
          icon: 'shield-off',
          iconType: 'red',
          value: 92,
          label: '仅下班无上班'
        }
      ],
      monthlyAlertData: [
        {
          month: '5/1',
          count: 1,
          isOpen: true,
          items: [
            { time: '劳动节', name: '52人打卡(假期)', level: 'low', type: 'info', typeLabel: '节假日' }
          ]
        },
        {
          month: '5/2',
          count: 1,
          isOpen: true,
          items: [
            { time: '假期', name: '42人打卡', level: 'low', type: 'info', typeLabel: '节假日' }
          ]
        },
        {
          month: '5/3',
          count: 1,
          isOpen: true,
          items: [
            { time: '周末', name: '121人打卡(96.2%完整率)', level: 'low', type: 'info', typeLabel: '周末' }
          ]
        },
        {
          month: '5/4',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '447人打卡 - 9人迟到/9人早退', level: 'medium', type: 'warning', typeLabel: '迟到+早退' }
          ]
        },
        {
          month: '5/5',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '586人打卡 - 11人迟到/5人早退', level: 'medium', type: 'warning', typeLabel: '迟到+早退' }
          ]
        },
        {
          month: '5/6',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '686人打卡 - 10人迟到/6人早退', level: 'medium', type: 'warning', typeLabel: '迟到+早退' }
          ]
        },
        {
          month: '5/7',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '696人打卡 - 5人迟到/8人早退', level: 'medium', type: 'warning', typeLabel: '早退偏多' }
          ]
        },
        {
          month: '5/8',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '695人打卡 - 10人迟到/7人早退', level: 'medium', type: 'warning', typeLabel: '迟到+早退' }
          ]
        },
        {
          month: '5/9',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '656人打卡 - 13人迟到/11人早退', level: 'high', type: 'danger', typeLabel: '异常偏高' }
          ]
        },
        {
          month: '5/10',
          count: 1,
          isOpen: true,
          items: [
            { time: '周末', name: '305人打卡(87.5%完整率)', level: 'low', type: 'info', typeLabel: '周末' }
          ]
        },
        {
          month: '5/11',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '698人打卡 - 7人迟到/5人早退', level: 'low', type: 'info', typeLabel: '正常范围' }
          ]
        },
        {
          month: '5/12',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '702人打卡 - 8人迟到/10人早退', level: 'medium', type: 'warning', typeLabel: '早退偏多' }
          ]
        },
        {
          month: '5/13',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '617人打卡 - 5人迟到/7人早退', level: 'low', type: 'info', typeLabel: '正常范围' }
          ]
        },
        {
          month: '5/14',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '694人打卡 - 6人迟到/9人早退', level: 'medium', type: 'warning', typeLabel: '早退偏多' }
          ]
        },
        {
          month: '5/15',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '690人打卡 - 10人迟到/7人早退', level: 'medium', type: 'warning', typeLabel: '迟到偏多' }
          ]
        },
        {
          month: '5/16',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '631人打卡 - 12人迟到/4人早退', level: 'medium', type: 'warning', typeLabel: '迟到偏多' }
          ]
        },
        {
          month: '5/17',
          count: 1,
          isOpen: true,
          items: [
            { time: '周末', name: '318人打卡(81.8%完整率)', level: 'low', type: 'info', typeLabel: '周末' }
          ]
        },
        {
          month: '5/18',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '687人打卡 - 7人迟到/3人早退', level: 'low', type: 'info', typeLabel: '正常范围' }
          ]
        },
        {
          month: '5/19',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '698人打卡 - 11人迟到/8人早退', level: 'medium', type: 'warning', typeLabel: '迟到+早退' }
          ]
        },
        {
          month: '5/20',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '688人打卡 - 10人迟到/10人早退/18人仅上班', level: 'high', type: 'danger', typeLabel: '严重异常' }
          ]
        },
        {
          month: '5/21',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '693人打卡 - 9人迟到/9人早退', level: 'medium', type: 'warning', typeLabel: '迟到+早退' }
          ]
        },
        {
          month: '5/22',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '689人打卡 - 12人迟到/6人早退', level: 'medium', type: 'warning', typeLabel: '迟到偏多' }
          ]
        },
        {
          month: '5/23',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '587人打卡 - 10人迟到/9人早退', level: 'medium', type: 'warning', typeLabel: '迟到+早退' }
          ]
        },
        {
          month: '5/24',
          count: 1,
          isOpen: true,
          items: [
            { time: '周末', name: '240人打卡(82.5%完整率)', level: 'low', type: 'info', typeLabel: '周末' }
          ]
        },
        {
          month: '5/25',
          count: 1,
          isOpen: true,
          items: [
            { time: '工作日', name: '681人打卡 - 3人迟到/3人早退', level: 'low', type: 'info', typeLabel: '正常范围' }
          ]
        },
        {
          month: '5/26',
          count: 1,
          isOpen: true,
          items: [
            { time: '数据截止', name: '677人打卡 - 10人迟到/11人早退/122人仅上班', level: 'high', type: 'danger', typeLabel: '数据不完整' }
          ]
        }
      ]
    }
  },
  computed: {
    anomalyTrendOptions() {
      const days26 = ['5/1','5/2','5/3','5/4','5/5','5/6','5/7','5/8','5/9','5/10','5/11','5/12','5/13','5/14','5/15','5/16','5/17','5/18','5/19','5/20','5/21','5/22','5/23','5/24','5/25','5/26']
      const lateData = [2,1,4,9,11,10,5,10,13,7,7,8,5,6,10,12,9,7,11,10,9,12,10,10,3,10]
      const earlyData = [3,0,5,9,5,6,8,7,11,2,5,10,7,9,7,4,4,3,8,10,9,6,9,2,3,11]
      const onlyInData = [1,3,1,2,7,7,8,8,6,5,10,6,7,8,6,9,5,12,9,18,7,12,11,4,12,122]
      const onlyOutData = [1,0,0,3,8,4,3,5,3,0,4,8,2,5,4,1,3,5,4,10,6,2,2,3,6,0]
      const totalData = lateData.map((v, i) => v + earlyData[i] + onlyInData[i] + onlyOutData[i])

      return {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderColor: 'rgba(45, 120, 255, 0.15)',
          textStyle: { color: '#1e2d3d' },
          extraCssText: 'box-shadow: 0 4px 16px rgba(45,120,255,0.12);',
          axisPointer: { type: 'shadow' }
        },
        legend: {
          data: ['迟到', '早退', '仅上班', '仅下班', '异常合计'],
          textStyle: { color: '#6b7c93', fontSize: 12 },
          top: 0
        },
        grid: { left: 46, right: 50, top: 40, bottom: 30 },
        xAxis: {
          type: 'category',
          data: days26,
          axisLine: { lineStyle: { color: '#d6e4ff' } },
          axisLabel: { color: '#6b7c93', fontSize: 9, rotate: 30 }
        },
        yAxis: [
          {
            type: 'value',
            name: '人次',
            axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
            axisLabel: { color: '#6b7c93', fontSize: 12 },
            splitLine: { lineStyle: { color: '#f3f7ff' } },
            nameTextStyle: { color: '#6b7c93', fontSize: 12 }
          },
          {
            type: 'value',
            name: '合计',
            axisLine: { lineStyle: { color: 'rgba(45, 120, 255, 0.15)' } },
            axisLabel: { color: '#6b7c93', fontSize: 12 },
            splitLine: { show: false },
            nameTextStyle: { color: '#6b7c93', fontSize: 12 }
          }
        ],
        series: [
          {
            name: '迟到',
            type: 'bar',
            stack: 'anomaly',
            barWidth: 20,
            itemStyle: { color: COLORS.warning, borderRadius: [0, 0, 0, 0] },
            data: lateData
          },
          {
            name: '早退',
            type: 'bar',
            stack: 'anomaly',
            itemStyle: { color: COLORS.blue },
            data: earlyData
          },
          {
            name: '仅上班',
            type: 'bar',
            stack: 'anomaly',
            itemStyle: { color: COLORS.cyan },
            data: onlyInData
          },
          {
            name: '仅下班',
            type: 'bar',
            stack: 'anomaly',
            itemStyle: { color: COLORS.danger, borderRadius: [3, 3, 0, 0] },
            data: onlyOutData
          },
          {
            name: '异常合计',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            symbol: 'circle',
            symbolSize: 7,
            lineStyle: {
              color: COLORS.blue,
              width: 2.5,
              shadowColor: 'rgba(45,120,255,0.3)',
              shadowBlur: 8
            },
            itemStyle: {
              color: COLORS.blue,
              borderWidth: 2,
              borderColor: '#fff'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(45,120,255,0.25)' },
                { offset: 1, color: 'rgba(45,120,255,0.02)' }
              ])
            },
            data: totalData
          }
        ],
        animationEasing: 'elasticOut',
        animationDuration: 1500,
        animationDelayUpdate: (idx) => idx * 60
      }
    },
    anomalyTypeOptions() {
      return {
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderColor: 'rgba(45, 120, 255, 0.15)',
          textStyle: { color: '#1e2d3d' },
          extraCssText: 'box-shadow: 0 4px 16px rgba(45,120,255,0.12);'
        },
        legend: {
          bottom: 0,
          textStyle: { color: '#6b7c93', fontSize: 12 }
        },
        series: [{
          type: 'pie',
          radius: ['35%', '60%'],
          center: ['50%', '45%'],
          roseType: 'area',
          itemStyle: { borderRadius: 6, borderColor: '#ffffff', borderWidth: 3 },
          label: { color: '#6b7c93', fontSize: 12 },
          data: [
            { value: 211, name: '迟到', itemStyle: { color: COLORS.warning } },
            { value: 163, name: '早退', itemStyle: { color: COLORS.blue } },
            { value: 306, name: '仅上班', itemStyle: { color: COLORS.cyan } },
            { value: 92, name: '仅下班', itemStyle: { color: COLORS.danger } }
          ],
          animationType: 'scale',
          animationDuration: 1500
        }]
      }
    }
  },
  methods: {
    toggleMonth(index) {
      this.monthlyAlertData[index].isOpen = !this.monthlyAlertData[index].isOpen
    }
  }
}
</script>

<style scoped>
.anomaly-monitor-container {
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

.anomaly-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.alert-overview-card {
  grid-column: 1 / -1;
  min-height: 0;
  overflow: hidden;
}

.card {
  background: #ffffff;
  border: 1px solid rgba(45, 120, 255, 0.12);
  border-radius: 12px;
  padding: 18px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  box-shadow: 0 2px 12px rgba(45, 120, 255, 0.08), 0 1px 3px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
}

.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  opacity: 0.5;
  box-shadow: 0 0 6px rgba(45, 120, 255, 0.2);
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

.alert-monthly-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  max-height: 280px;
  padding-right: 4px;
}

.alert-monthly-list::-webkit-scrollbar {
  width: 4px;
}
.alert-monthly-list::-webkit-scrollbar-thumb {
  background: rgba(45, 120, 255, 0.2);
  border-radius: 2px;
}

.alert-month-group {
  margin-bottom: 4px;
}

.alert-month-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(45, 120, 255, 0.06);
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
  font-weight: 600;
  font-size: 13px;
  color: #2d78ff;
}

.alert-month-header:hover {
  background: rgba(45, 120, 255, 0.10);
}

.alert-month-header .month-arrow {
  transition: transform 0.3s;
  font-size: 12px;
  display: inline-block;
  width: 12px;
}

.alert-month-header .month-arrow.open {
  transform: rotate(90deg);
}

.alert-month-header .month-count {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  color: #6b7c93;
  background: rgba(45, 120, 255, 0.08);
  padding: 1px 8px;
  border-radius: 10px;
}

.alert-month-items {
  padding-left: 12px;
  overflow: hidden;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
}

.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(45, 120, 255, 0.03);
  border-left: 3px solid #4a9eff;
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.alert-item:hover {
  background: rgba(45, 120, 255, 0.06);
  box-shadow: 0 0 12px rgba(45, 120, 255, 0.08);
}

.alert-item.level-high {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.03);
}

.alert-item.level-high:hover { background: rgba(239, 68, 68, 0.07); }

.alert-item.level-medium {
  border-left-color: #f59e0b;
  background: rgba(245, 158, 11, 0.03);
}

.alert-item.level-medium:hover { background: rgba(245, 158, 11, 0.07); }

.alert-item.level-low { border-left-color: #4a9eff; }

.alert-time {
  font-size: 11px;
  color: #6b7c93;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  min-width: 65px;
}

.alert-name {
  font-size: 13px;
  font-weight: 500;
  color: #1e2d3d;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alert-type {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.badge-success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.badge-warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.badge-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.badge-info { background: rgba(45, 120, 255, 0.1); color: #2d78ff; }
</style>