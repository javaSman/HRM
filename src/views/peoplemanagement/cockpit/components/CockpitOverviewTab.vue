<template>
  <section class="page-container active-page">
    <div class="current-scope-info">
      <span>当前视图：</span>
      <strong>{{ scopeName }}</strong>
      <span class="scope-update-text">{{ overviewData.updateTimeText }}</span>
    </div>

    <cockpit-section-header
      title="一、人力总览"
      subtitle="(在编/在岗/核心人才/编制缺口)"
    />
    <div class="stat-pills cols-8">
      <div v-for="item in humanPills" :key="item.label" class="stat-pill">
        <span class="pill-dot" :class="item.dotClass"></span>
        <div class="pill-info">
          <div class="pill-value" :class="{ highlight: item.highlight, danger: item.danger }">{{ item.value }}</div>
          <div class="pill-label">{{ item.label }}</div>
        </div>
        <span v-if="item.trendText" class="pill-trend" :class="item.trendType">{{ item.trendText }}</span>
        <span v-else-if="item.subText" class="pill-sub">{{ item.subText }}</span>
      </div>
    </div>

    <cockpit-section-header
      title="二、考勤总览"
      subtitle="(出勤率/全勤率/加班/补卡)"
    />
    <div class="stat-pills cols-7">
      <div v-for="item in attendancePills" :key="item.label" class="stat-pill">
        <span class="pill-dot" :class="item.dotClass"></span>
        <div class="pill-info">
          <div class="pill-value" :class="{ danger: item.danger }">{{ item.value }}</div>
          <div class="pill-label">{{ item.label }}</div>
        </div>
        <span v-if="item.trendText" class="pill-trend" :class="item.trendType">{{ item.trendText }}</span>
        <span v-else-if="item.subText" class="pill-sub">{{ item.subText }}</span>
      </div>
    </div>

    <cockpit-section-header
      title="三、组织分布与人员结构"
      subtitle="(园区/学历/司龄)"
    />
    <div class="grid-3col flex-grid">
      <div class="mini-card">
        <div class="mc-title">
          <span class="mc-icon"><a-icon type="bank" /></span>
          园区人员分布
        </div>
        <cockpit-chart :option="chartOptions.parkDistribution" height="140px" />
      </div>
      <div class="mini-card">
        <div class="mc-title">
          <span class="mc-icon"><a-icon type="read" /></span>
          学历结构
        </div>
        <div class="personnel-grid">
          <div v-for="item in overviewData.humanStructure.education" :key="item.label" class="personnel-item">
            <span class="pi-label">{{ item.label }}</span>
            <div class="pi-bar">
              <div class="pi-bar-fill" :style="{ width: item.width, background: item.color }"></div>
            </div>
            <span class="pi-val">{{ item.value }}</span>
          </div>
          <div class="personnel-note">{{ overviewData.humanStructure.educationNote }}</div>
        </div>
      </div>
      <div class="mini-card">
        <div class="mc-title">
          <span class="mc-icon"><a-icon type="clock-circle" /></span>
          司龄结构
        </div>
        <div class="personnel-grid">
          <div v-for="item in overviewData.humanStructure.seniority" :key="item.label" class="personnel-item">
            <span class="pi-label">{{ item.label }}</span>
            <div class="pi-bar">
              <div class="pi-bar-fill" :style="{ width: item.width, background: item.color }"></div>
            </div>
            <span class="pi-val">{{ item.value }}</span>
          </div>
          <div class="personnel-note danger">
            {{ overviewData.humanStructure.seniorityNote }}
            <span class="risk-tag high">{{ overviewData.humanStructure.seniorityNoteTag }}</span>
          </div>
        </div>
      </div>
    </div>

    <cockpit-section-header
      title="四、考勤核心指标与补卡概览"
      subtitle="(出勤率/补卡统计/子公司排名)"
    />
    <div class="grid-3col flex-grid">
      <div class="mini-card">
        <div class="mc-title">
          <span class="mc-icon"><a-icon type="dashboard" /></span>
          综合出勤率仪表盘
        </div>
        <cockpit-chart :option="chartOptions.attendanceGauge" height="140px" />
      </div>
      <div class="mini-card">
        <div class="mc-title">
          <span class="mc-icon"><a-icon type="sync" /></span>
          补卡申请总览
        </div>
        <cockpit-chart :option="chartOptions.replenishOverview" height="140px" />
      </div>
      <div class="mini-card">
        <div class="mc-title">
          <span class="mc-icon"><a-icon type="bar-chart" /></span>
          子公司出勤率排名
        </div>
        <div class="mc-list">
          <div v-for="item in overviewData.subsidiaryRanking.list" :key="item.rank" class="compact-item">
            <span class="ci-rank" :class="getRankClass(item.rank)">{{ item.rank }}</span>
            <span class="ci-name">{{ item.name }}</span>
            <span class="ci-value" :class="item.className">{{ item.value }}</span>
          </div>
          <div v-for="note in overviewData.subsidiaryRanking.footnotes" :key="note" class="mc-footnote">{{ note }}</div>
        </div>
      </div>
    </div>

    <cockpit-section-header
      title="五、补卡专项监控"
      subtitle="(补卡趋势/部门分布/审批状态/原因分析)"
      tag="本月累计228次"
      tagClass="info"
    />
    <div class="grid-3col flex-grid">
      <div class="card min-card">
        <div class="card-title">
          <span class="icon"><a-icon type="line-chart" /></span>
          实时在岗率趋势(5月)
        </div>
        <cockpit-chart :option="chartOptions.ondutyTrend" height="220px" />
      </div>
      <div class="card min-card">
        <div class="card-title">
          <span class="icon"><a-icon type="bar-chart" /></span>
          各子公司补卡次数统计
        </div>
        <cockpit-chart :option="chartOptions.replenishDept" height="220px" />
      </div>
      <div class="card min-card">
        <div class="card-title">
          <span class="icon"><a-icon type="pie-chart" /></span>
          补卡原因分布与审批状态
        </div>
        <cockpit-chart :option="chartOptions.replenishReason" height="220px" />
      </div>
    </div>
    <div class="grid-3col flex-grid">
      <div v-for="panel in overviewData.replenishPanels" :key="panel.title" class="mini-card limited-card">
        <div class="mc-title">
          <span class="mc-icon"><a-icon :type="panel.icon" /></span>
          {{ panel.title }}
        </div>
        <cockpit-alert-list :items="panel.items" />
      </div>
    </div>

    <cockpit-section-header
      title="六、异常与风险速览"
      tag="董事长重点关注"
      tagClass="risk"
      :dot-style="{ background: 'var(--danger)', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }"
    />
    <div class="grid-3col flex-grid">
      <div v-for="panel in overviewData.riskPanels" :key="panel.title" class="mini-card risk-card">
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
import { createOverviewChartOptions } from '../chartOptions'
import CockpitAlertList from './CockpitAlertList.vue'
import CockpitChart from './CockpitChart.vue'
import CockpitSectionHeader from './CockpitSectionHeader.vue'

export default {
  name: 'CockpitOverviewTab',
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
    overviewData: {
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
    humanPills() {
      return [
        { label: '总在编', value: this.formatNumber(this.stats.totalEmployees), dotClass: 'blue', trendText: '同比+3.2%', trendType: 'up' },
        { label: '日均在岗', value: this.formatNumber(this.stats.avgOnDuty), dotClass: 'green', trendText: `在岗率${this.toPercent(this.onDutyRate)}`, trendType: 'up' },
        { label: '试用期', value: this.scaleNumber(63), dotClass: 'cyan', trendText: '新入职+8', trendType: 'up' },
        { label: '博士工作站', value: this.scaleNumber(12), dotClass: 'purple', highlight: true, subText: '在研项目7个' },
        { label: '高级工程师', value: this.scaleNumber(3), dotClass: 'warn', subText: '核心技术岗' },
        { label: '关键岗位空缺', value: this.scaleNumber(5), dotClass: 'red', danger: true, trendText: '需紧急补充', trendType: 'down' },
        { label: '本月入职', value: this.scaleNumber(12), dotClass: 'orange', trendText: '目标达成', trendType: 'up' },
        { label: '本月离职', value: this.scaleNumber(12), dotClass: 'red', trendText: '离职率1.7%', trendType: 'down' }
      ]
    },
    attendancePills() {
      return [
        { label: '整体出勤率', value: this.toPercent(this.stats.fullPunchRate), dotClass: 'blue', trendText: '达标', trendType: 'up' },
        { label: '全勤率', value: this.toPercent(this.fullAttendanceRate), dotClass: 'green', trendText: '环比+1.5%', trendType: 'up' },
        { label: '总加班工时(h)', value: this.formatNumber(this.scaleNumber(3840)), dotClass: 'warn', trendText: '超预算12%', trendType: 'down' },
        { label: '异常考勤占比', value: this.toPercent(this.stats.abnormalRate), dotClass: 'orange', trendText: `${this.scaleNumber(374)}人次`, trendType: 'warn' },
        { label: '本月补卡次数', value: this.formatNumber(this.stats.replenishCount), dotClass: 'cyan', subText: '环比+15%' },
        { label: '月薪岗考勤达标', value: this.toPercent(this.monthSalaryRate), dotClass: 'purple', trendText: `时薪岗${this.toPercent(this.hourlyRate)}`, trendType: 'up' },
        { label: '旷工人次', value: this.scaleNumber(47), dotClass: 'red', danger: true, trendText: '需关注', trendType: 'down' }
      ]
    },
    chartOptions() {
      return createOverviewChartOptions(this.chartSource, this.colors, this.stats)
    },
    onDutyRate() {
      return (this.stats.avgOnDuty / this.stats.totalEmployees) * 100
    },
    fullAttendanceRate() {
      return Math.max(48, this.stats.fullPunchRate - 26.2)
    },
    monthSalaryRate() {
      return this.stats.fullPunchRate + 2.7
    },
    hourlyRate() {
      return this.monthSalaryRate - 4.4
    }
  },
  methods: {
    formatNumber(value) {
      return Number(value).toLocaleString()
    },
    toPercent(value) {
      return `${Number(value).toFixed(1)}%`
    },
    scaleNumber(base) {
      return Math.max(1, Math.round((this.stats.totalEmployees / 720) * base))
    },
    getRankClass(rank) {
      if (rank === 1) {
        return 'top'
      }
      if (rank === 2) {
        return 'mid'
      }
      return 'low'
    }
  }
}
</script>

<style lang="less" scoped>
@import '../cockpitTab.less';
</style>
