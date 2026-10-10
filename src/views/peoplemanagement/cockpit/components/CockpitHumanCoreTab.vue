<template>
  <section class="page-container active-page">
    <div class="current-scope-info">
      <span>当前视图：</span>
      <strong>{{ scopeName }}</strong>
    </div>

    <cockpit-section-header title="组织与人员结构分析" />
    <div class="stat-cards section-gap">
      <div v-for="item in summaryCards" :key="item.label" class="stat-card">
        <div class="stat-icon" :class="item.theme">
          <a-icon :type="item.icon" />
        </div>
        <div>
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <div class="grid-2col flex-grid">
      <div class="card">
        <div class="card-title">
          <span class="icon"><a-icon type="bar-chart" /></span>
          编制执行对比(各部门编制 vs 实际)
        </div>
        <cockpit-chart :option="chartOptions.staffingCompare" height="240px" />
      </div>
      <div class="card">
        <div class="card-title">
          <span class="icon"><a-icon type="pie-chart" /></span>
          岗位类型占比(生产/技术/职能/管理)
        </div>
        <cockpit-chart :option="chartOptions.jobTypeDetail" height="240px" />
      </div>
    </div>

    <cockpit-section-header title="招聘与离职分析" />
    <div class="stat-pills cols-5 section-gap">
      <div v-for="item in humanCoreData.recruitPills" :key="item.label" class="stat-pill">
        <span class="pill-dot" :class="item.dotClass"></span>
        <div class="pill-info">
          <div class="pill-value">{{ item.value }}</div>
          <div class="pill-label">{{ item.label }}</div>
        </div>
        <span v-if="item.trendText" class="pill-trend" :class="item.trendType">{{ item.trendText }}</span>
      </div>
    </div>

    <div class="grid-2col flex-grid">
      <div class="card">
        <div class="card-title">
          <span class="icon"><a-icon type="line-chart" /></span>
          近12月离职率趋势(按园区拆分)
        </div>
        <cockpit-chart :option="chartOptions.turnoverTrend" height="240px" />
      </div>
      <div class="card">
        <div class="card-title">
          <span class="icon"><a-icon type="warning" /></span>
          关键人才流失预警 & 离职原因
        </div>
        <cockpit-chart :option="chartOptions.turnoverReason" height="240px" />
      </div>
    </div>

    <cockpit-section-header title="员工全生命周期管理" />
    <div class="grid-3col flex-grid">
      <div v-for="panel in humanCoreData.lifecyclePanels" :key="panel.title" class="mini-card">
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
import { createHumanCoreChartOptions } from '../chartOptions'
import CockpitAlertList from './CockpitAlertList.vue'
import CockpitChart from './CockpitChart.vue'
import CockpitSectionHeader from './CockpitSectionHeader.vue'

export default {
  name: 'CockpitHumanCoreTab',
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
    humanCoreData: {
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
    summaryCards() {
      return [
        { value: this.stats.departments, label: '部门总数', icon: 'bank', theme: 'blue' },
        { value: this.stats.totalEmployees, label: '在编总人数', icon: 'team', theme: 'cyan' },
        { value: `${((this.stats.avgOnDuty / this.stats.totalEmployees) * 100).toFixed(1)}%`, label: '在岗率', icon: 'solution', theme: 'green' },
        { value: Math.max(1, Math.round((this.stats.totalEmployees / 720) * 5)), label: '编制缺口>20%部门', icon: 'warning', theme: 'orange' },
        { value: Math.max(1, Math.round((this.stats.totalEmployees / 720) * 22)), label: '储备干部', icon: 'star', theme: 'purple' }
      ]
    },
    chartOptions() {
      return createHumanCoreChartOptions(this.chartSource, this.colors, this.stats)
    }
  }
}
</script>

<style lang="less" scoped>
@import '../cockpitTab.less';
</style>
