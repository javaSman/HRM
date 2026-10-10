<template>
  <section class="page-container active-page">
    <div class="current-scope-info">
      <span>当前视图：</span>
      <strong>{{ scopeName }}</strong>
      <span class="risk-total-text">⚠ 共 <span class="risk-total-num">{{ riskData.total }}</span> 条风险预警</span>
    </div>

    <cockpit-section-header
      title="人力风险预警"
      tag="部门离职率>15% / 核心空缺>30天 / 合同未续签"
      tagClass="risk"
      :dot-style="{ background: 'var(--danger)', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }"
    />
    <div class="card risk-center-card">
      <cockpit-risk-list :items="riskData.hrRisks" />
    </div>

    <cockpit-section-header
      title="考勤风险预警"
      tag="大小周<80% / 加班>40h / 调休过期"
      tagClass="info"
      :dot-style="{ background: 'var(--warning)', boxShadow: '0 0 8px rgba(245,158,11,0.5)' }"
    />
    <div class="card risk-center-card">
      <cockpit-risk-list :items="riskData.attendRisks" />
    </div>

    <cockpit-section-header
      title="合规风险预警"
      tag="未签合同 / 试用期超期 / 年假过期"
      tagClass="risk"
      :dot-style="{ background: 'var(--danger)', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }"
    />
    <div class="card risk-center-card comply-card">
      <cockpit-risk-list :items="riskData.complyRisks" />
    </div>

    <div class="stat-pills cols-4">
      <div v-for="item in riskData.summaryPills" :key="item.label" class="stat-pill">
        <span class="pill-dot" :class="item.dotClass"></span>
        <div class="pill-info">
          <div class="pill-value" :class="{ danger: item.danger }">{{ item.value }}</div>
          <div class="pill-label">{{ item.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import CockpitRiskList from './CockpitRiskList.vue'
import CockpitSectionHeader from './CockpitSectionHeader.vue'

export default {
  name: 'CockpitRiskTab',
  components: {
    CockpitRiskList,
    CockpitSectionHeader
  },
  props: {
    scopeName: {
      type: String,
      default: ''
    },
    riskData: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style lang="less" scoped>
@import '../cockpitTab.less';
</style>
