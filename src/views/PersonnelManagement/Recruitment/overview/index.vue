<template>
  <div class="module-panel active recruitment-dashboard" id="panelOverview">
    <div class="content-area recruitment-dashboard-content">
      <section class="recruitment-dashboard-section recruitment-dashboard-overview-section">
        <div class="recruitment-dashboard-section-title is-highlighted">
          <span class="recruitment-dashboard-title-icon"><a-icon type="bar-chart" /></span>
          <span>核心数据概览</span>
          <span class="recruitment-dashboard-title-sub">招聘全流程关键指标与待办动态</span>
        </div>
        <a-spin :spinning="overviewLoading">
          <overview-metric-cards :cards="overviewCards" />
        </a-spin>
      </section>

      <section class="recruitment-dashboard-section recruitment-dashboard-kanban-section">
        <div class="recruitment-dashboard-section-title is-highlighted">
          <span class="recruitment-dashboard-title-icon"><a-icon type="project" /></span>
          <span>招聘动态看板</span>
          <span class="recruitment-dashboard-title-sub">按紧急程度分类处理</span>
        </div>
        <a-spin :spinning="kanbanLoading">
          <overview-kanban :columns="kanbanColumns" @handle="handleKanban" />
        </a-spin>
      </section>

      <div class="recruitment-dashboard-middle">
        <section class="recruitment-dashboard-section">
          <div class="recruitment-dashboard-section-title">
            <span class="recruitment-dashboard-title-icon"><a-icon type="filter" /></span>
            招聘漏斗
          </div>
          <overview-funnel :steps="funnelSteps" />
        </section>
        <section class="recruitment-dashboard-section">
          <div class="recruitment-dashboard-section-title">
            <span class="recruitment-dashboard-title-icon"><a-icon type="thunderbolt" /></span>
            今日概览
          </div>
          <overview-quick-stats :items="quickStats" />
        </section>
      </div>

      <section class="recruitment-dashboard-section recruitment-dashboard-table-section">
        <div class="recruitment-dashboard-section-title">
          <span class="recruitment-dashboard-title-icon"><a-icon type="apartment" /></span>
          部门招聘分布
        </div>
        <a-spin :spinning="deptLoading">
          <overview-dept-table :rows="deptRows" />
        </a-spin>
      </section>

      <section class="recruitment-dashboard-section recruitment-dashboard-table-section">
        <div class="recruitment-dashboard-section-title">
          <span class="recruitment-dashboard-title-icon"><a-icon type="user" /></span>
          BP招聘人事统计
          <a-month-picker
            v-model="bpMonth"
            class="recruitment-dashboard-month-picker"
            format="YYYY-MM"
            valueFormat="YYYY-MM"
            :allowClear="false"
            @change="getBpTotal"
          />
        </div>
        <a-spin :spinning="bpLoading">
          <overview-bp-table :rows="bpRows" @detail="handleBpDetail" />
        </a-spin>
      </section>
    </div>
    <overview-bp-detail-modal ref="bpDetailModal" />
  </div>
</template>

<script>
import { getAction } from '@/api/manage'
import moment from 'moment'
import OverviewBpDetailModal from './modules/OverviewBpDetailModal.vue'
import OverviewBpTable from './modules/OverviewBpTable.vue'
import OverviewDeptTable from './modules/OverviewDeptTable.vue'
import OverviewFunnel from './modules/OverviewFunnel.vue'
import OverviewKanban from './modules/OverviewKanban.vue'
import OverviewMetricCards from './modules/OverviewMetricCards.vue'
import OverviewQuickStats from './modules/OverviewQuickStats.vue'
import { createFunnelSteps, createOverviewCards, createQuickStats, fetchOverviewCard } from './overviewMetricData'

export default {
  name: 'RecruitmentOverview',
  components: {
    OverviewBpDetailModal,
    OverviewBpTable,
    OverviewDeptTable,
    OverviewFunnel,
    OverviewKanban,
    OverviewMetricCards,
    OverviewQuickStats
  },
  data() {
    const overviewCards = createOverviewCards()
    return {
      bpRows: [],
      bpLoading: false,
      bpMonth: moment().format('YYYY-MM'),
      deptRows: [],
      deptLoading: false,
      funnelSteps: createFunnelSteps(overviewCards),
      kanbanColumns: [],
      kanbanLoading: false,
      overviewCards,
      overviewLoading: false,
      quickStats: createQuickStats(overviewCards)
    }
  },
  created() {
    this.getOverviewTotals()
    this.getZpTaskBoard()
    this.getDeptView()
    this.getBpTotal()
  },
  methods: {
    getOverviewTotals() {
      this.overviewLoading = true
      // 每张卡片单独兜底，避免一个统计接口失败导致其他卡片无法更新。
      const requests = this.overviewCards.map(card => fetchOverviewCard(card).catch(error => {
        this.$message.error(error.message || `${card.title}统计加载失败`)
        return card
      }))
      Promise.all(requests)
        .then(cards => {
          // 漏斗与今日概览统一基于本轮卡片统计结果重新计算。
          this.overviewCards = cards
          this.funnelSteps = createFunnelSteps(cards)
          this.quickStats = createQuickStats(cards)
        })
        .finally(() => {
          this.overviewLoading = false
        })
    },
    getZpTaskBoard() {
      this.kanbanLoading = true
      getAction('/zpManage/hrmZpOverView/getZpTaskBoard')
        .then(res => {
          if (res && res.success && Array.isArray(res.result)) {
            this.kanbanColumns = res.result
          } else {
            this.kanbanColumns = []
            this.$message.error((res && res.message) || '招聘动态看板加载失败')
          }
        })
        .catch(() => {
          this.kanbanColumns = []
          this.$message.error('招聘动态看板加载失败，请稍后重试')
        })
        .finally(() => {
          this.kanbanLoading = false
        })
    },
    getDeptView() {
      this.deptLoading = true
      getAction('/zpManage/hrmZpOverView/getDeptView')
        .then(res => {
          if (res && res.success && Array.isArray(res.result)) {
            this.deptRows = res.result
          } else {
            this.deptRows = []
            this.$message.error((res && res.message) || '部门招聘分布加载失败')
          }
        })
        .catch(() => {
          this.deptRows = []
          this.$message.error('部门招聘分布加载失败，请稍后重试')
        })
        .finally(() => {
          this.deptLoading = false
        })
    },
    getBpTotal() {
      this.bpLoading = true
      getAction('/zpManage/hrmZpOverView/getBPTotal', { month: this.bpMonth })
        .then(res => {
          if (res && res.success && Array.isArray(res.result)) {
            this.bpRows = res.result
          } else {
            this.bpRows = []
            this.$message.error((res && res.message) || 'BP招聘人事统计加载失败')
          }
        })
        .catch(() => {
          this.bpRows = []
          this.$message.error('BP招聘人事统计加载失败，请稍后重试')
        })
        .finally(() => {
          this.bpLoading = false
        })
    },
    handleKanban(item) {
      this.$message.info('请处理：' + item.applyTitle)
    },
    handleBpDetail(row) {
      this.$refs.bpDetailModal.open(row)
    }
  }
}
</script>

<style lang="less" scoped>
@import './overview.less';
</style>
