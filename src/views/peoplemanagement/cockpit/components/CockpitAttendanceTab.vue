<template>
  <section class="page-container active-page">
    <div class="current-scope-info">
      <span>当前视图：</span>
      <strong>{{ scopeName }}</strong>
    </div>

    <cockpit-section-header title="考勤核心指标监控" />
    <div class="stat-pills cols-5 section-gap">
      <div v-for="item in summaryPills" :key="item.label" class="stat-pill">
        <span class="pill-dot" :class="item.dotClass"></span>
        <div class="pill-info">
          <div class="pill-value" :class="{ danger: item.danger }">{{ item.value }}</div>
          <div class="pill-label">{{ item.label }}</div>
        </div>
        <span v-if="item.trendText" class="pill-trend" :class="item.trendType">{{ item.trendText }}</span>
      </div>
    </div>

    <cockpit-section-header
      title="大小周专项监控(强瑞核心规则)"
      tag="含节假日/补班调整"
      tagClass="info"
    />
    <div class="grid-3col flex-grid">
      <div v-for="panel in attendanceData.specialPanels" :key="panel.title" class="mini-card">
        <div class="mc-title">
          <span class="mc-icon"><a-icon :type="panel.icon" /></span>
          {{ panel.title }}
        </div>
        <cockpit-alert-list :items="panel.items" />
      </div>
    </div>

    <cockpit-section-header title="加班与调休成本分析" />
    <div class="grid-2col flex-grid">
      <div class="card">
        <div class="card-title">
          <span class="icon"><a-icon type="pie-chart" /></span>
          加班类型分布(1.5倍/2倍/3倍)
        </div>
        <cockpit-chart :option="chartOptions.overtimeType" height="240px" />
      </div>
      <div class="card">
        <div class="card-title">
          <span class="icon"><a-icon type="bar-chart" /></span>
          各部门人均加班时长排名
        </div>
        <cockpit-chart :option="chartOptions.deptOvertime" height="240px" />
      </div>
    </div>

    <div class="grid-3col flex-grid">
      <div v-for="panel in attendanceData.overtimePanels" :key="panel.title" class="mini-card">
        <div class="mc-title">
          <span class="mc-icon"><a-icon :type="panel.icon" /></span>
          {{ panel.title }}
        </div>
        <cockpit-alert-list :items="panel.items" />
      </div>
    </div>
  </section>
</template>

<script>
import { createAttendanceChartOptions } from '../chartOptions'
import CockpitAlertList from './CockpitAlertList.vue'
import CockpitChart from './CockpitChart.vue'
import CockpitSectionHeader from './CockpitSectionHeader.vue'

export default {
  name: 'CockpitAttendanceTab',
  components: {
    CockpitAlertList,
    CockpitChart,
    CockpitSectionHeader
  },
  props: {
    scopeName: {
      type: String,
      default: ''
    },
    stats: {
      type: Object,
      default: () => ({})
    },
    attendanceData: {
      type: Object,
      default: () => ({})
    },
    chartSource: {
      type: Object,
      default: () => ({})
    },
    colors: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    summaryPills() {
      return [
        { label: '综合出勤率', value: `${this.stats.fullPunchRate.toFixed(1)}%`, dotClass: 'blue', trendText: '环比+0.5%', trendType: 'up' },
        { label: '全勤率', value: `${(this.stats.fullPunchRate - 26.2).toFixed(1)}%`, dotClass: 'green', trendText: '全勤奖¥12.8万', trendType: 'up' },
        { label: '大小周执行率', value: `${Math.max(75, this.stats.fullPunchRate - 1).toFixed(1)}%`, dotClass: 'warn', trendText: '目标90%', trendType: 'down' },
        { label: '总加班时长', value: `${Math.round((this.stats.totalEmployees / 720) * 3840).toLocaleString()}h`, dotClass: 'orange', trendText: '超预算12%', trendType: 'down' },
        { label: '异常考勤率', value: `${this.stats.abnormalRate.toFixed(1)}%`, dotClass: 'red', trendText: `${this.stats.abnormalCount}人次`, trendType: 'warn', danger: true }
      ]
    },
    chartOptions() {
      return createAttendanceChartOptions(this.chartSource, this.colors)
    }
  }
}
</script>

<style lang="less" scoped>
@import '../cockpitTab.less';
</style>
