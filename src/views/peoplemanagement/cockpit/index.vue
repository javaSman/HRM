<template>
  <div class="cockpit-page">
    <div class="bg-base"></div>
    <div class="bg-grid"></div>
    <div class="bg-particles">
      <span v-for="item in particles" :key="item.id" class="particle" :style="item.style"></span>
    </div>

    <header class="dashboard-header">
      <div class="header-left">
        <div class="header-logo">
          <a-icon type="dashboard" />
        </div>
        <div class="header-title-wrap">
          <h1 class="header-title">{{ headerTitle }}</h1>
          <div class="header-subtitle">HR & ATTENDANCE COMPREHENSIVE DASHBOARD</div>
        </div>
      </div>
      <div class="header-right">
        <span><span class="status-dot"></span>系统运行中</span>
        <div>
          <div class="header-time">{{ currentTime }}</div>
          <div class="header-date">{{ currentDate }}</div>
        </div>
      </div>
    </header>

    <div class="scope-bar">
      <div class="breadcrumb">
        <button type="button" class="breadcrumb-item" :class="{ current: activeScope === 'group' }" @click="changeScope('group')">
          强瑞集团
        </button>
        <template v-if="activeScope !== 'group'">
          <span class="breadcrumb-separator">/</span>
          <button type="button" class="breadcrumb-item current" @click="changeScope(activeScope)">
            {{ scopeInfo.name }}
          </button>
        </template>
      </div>
      <div class="scope-selector">
        <label class="scope-label">视图层级：</label>
        <select v-model="activeScope" class="scope-select" @change="handleScopeSelect">
          <option v-for="item in scopeOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
        <span class="scope-badge" :class="{ subsidiary: activeScope !== 'group' }">{{ scopeInfo.name }}</span>
      </div>
    </div>

    <div class="tab-bar">
      <div class="tab-step">
        <template v-for="(item, index) in tabList">
          <button
            :key="item.key"
            type="button"
            class="nav-tab"
            :class="{ active: activeTab === item.key }"
            @click="activeTab = item.key"
          >
            {{ item.label }}
            <span v-if="item.key === 'risk'" class="risk-tag high nav-risk-tag">{{ riskData.badge }}</span>
          </button>
          <span v-if="index < tabList.length - 1" :key="item.key + '-arrow'" class="tab-arrow">→</span>
        </template>
      </div>
    </div>

    <main class="dashboard-main">
      <cockpit-overview-tab
        v-if="activeTab === 'overview'"
        :scope-name="scopeInfo.fullName"
        :stats="scopeInfo.stats"
        :overview-data="overviewData"
        :chart-source="chartSource"
        :colors="colors"
      />
      <cockpit-human-core-tab
        v-if="activeTab === 'humanCore'"
        :scope-name="scopeInfo.fullName"
        :stats="scopeInfo.stats"
        :human-core-data="humanCoreData"
        :chart-source="chartSource"
        :colors="colors"
      />
      <cockpit-attendance-tab
        v-if="activeTab === 'attendance'"
        :scope-name="scopeInfo.fullName"
        :stats="scopeInfo.stats"
        :attendance-data="attendanceData"
        :chart-source="chartSource"
        :colors="colors"
      />
      <cockpit-risk-tab
        v-if="activeTab === 'risk'"
        :scope-name="scopeInfo.fullName"
        :risk-data="riskData"
      />
    </main>
  </div>
</template>

<script>
import {
  ATTENDANCE_DATA,
  CHART_SOURCE,
  COLORS,
  HUMAN_CORE_DATA,
  ORG_DATA,
  OVERVIEW_DATA,
  RISK_DATA,
  SCOPE_OPTIONS,
  TAB_LIST
} from './mockData'
import CockpitAttendanceTab from './components/CockpitAttendanceTab.vue'
import CockpitHumanCoreTab from './components/CockpitHumanCoreTab.vue'
import CockpitOverviewTab from './components/CockpitOverviewTab.vue'
import CockpitRiskTab from './components/CockpitRiskTab.vue'

export default {
  name: 'PeopleManagementCockpit',
  components: {
    CockpitAttendanceTab,
    CockpitHumanCoreTab,
    CockpitOverviewTab,
    CockpitRiskTab
  },
  data() {
    return {
      activeTab: 'overview',
      activeScope: 'group',
      currentTime: '--:--:--',
      currentDate: '----年--月--日',
      timer: null,
      particles: this.createParticles(),
      tabList: TAB_LIST,
      scopeOptions: SCOPE_OPTIONS,
      colors: COLORS,
      overviewData: OVERVIEW_DATA,
      humanCoreData: HUMAN_CORE_DATA,
      attendanceData: ATTENDANCE_DATA,
      riskData: RISK_DATA,
      chartSource: CHART_SOURCE
    }
  },
  computed: {
    scopeInfo() {
      if (this.activeScope === 'group') {
        return ORG_DATA.group
      }
      return ORG_DATA.subsidiaries[this.activeScope]
    },
    headerTitle() {
      return `${this.scopeInfo.name} · 人事综合驾驶舱`
    }
  },
  mounted() {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    handleScopeSelect(event) {
      this.changeScope(event.target.value)
    },
    changeScope(scope) {
      this.activeScope = scope
    },
    updateTime() {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const weekList = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')

      this.currentTime = `${hours}:${minutes}:${seconds}`
      this.currentDate = `${year}年${month}月${day}日 ${weekList[now.getDay()]}`
    },
    createParticles() {
      return Array.from({ length: 18 }).map((item, index) => {
        const size = (index % 4) + 2
        return {
          id: index,
          style: {
            width: `${size}px`,
            height: `${size}px`,
            left: `${(index * 13) % 100}%`,
            animationDuration: `${12 + (index % 5) * 3}s`,
            animationDelay: `${(index % 6) * 1.2}s`,
            opacity: 0.08 + (index % 4) * 0.04
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.cockpit-page {
  --bg-primary: #eef2f7;
  --bg-card: #ffffff;
  --border-color: rgba(45, 120, 255, 0.1);
  --border-glow: rgba(45, 120, 255, 0.3);
  --blue-primary: #2563eb;
  --blue-light: #3b82f6;
  --blue-soft: #eff6ff;
  --cyan: #0891b2;
  --cyan-light: #22d3ee;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --success: #059669;
  --warning: #d97706;
  --danger: #dc2626;
  --orange: #ea580c;
  --purple: #7c3aed;
  --teal: #0d9488;
  --slate: #475569;
  --gradient-blue: linear-gradient(135deg, #2563eb 0%, #0891b2 100%);
  --radius: 12px;
  --radius-lg: 16px;
  --gap: 12px;
  --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  height: calc(100vh - 84px - 59px);
  // min-height: 860px;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.bg-base,
.bg-grid,
.bg-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-base {
  background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(37, 99, 235, 0.04) 0%, transparent 70%),
    radial-gradient(ellipse 40% 40% at 80% 80%, rgba(8, 145, 178, 0.03) 0%, transparent 70%);
}

.bg-grid {
  background-image: linear-gradient(rgba(37, 99, 235, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, 0.025) 1px, transparent 1px);
  background-size: 48px 48px;
}

.bg-particles {
  z-index: 0;
}

.particle {
  position: absolute;
  bottom: -10vh;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.12);
  animation: float-up linear infinite;
}

@keyframes float-up {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    transform: translateY(-10vh) scale(1);
    opacity: 0;
  }
}

.dashboard-header,
.scope-bar,
.tab-bar,
.dashboard-main {
  position: relative;
  z-index: 1;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 62px;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--gradient-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.25);
}

.header-logo /deep/ .anticon {
  font-size: 22px;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.header-subtitle {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 12px;
  color: var(--text-secondary);
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
}

.header-time {
  font-size: 24px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.5px;
}

.header-date {
  font-size: 11px;
  text-align: right;
  color: var(--text-muted);
}

.scope-bar {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(37, 99, 235, 0.04);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.breadcrumb-item {
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--blue-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.breadcrumb-item:hover {
  background: var(--blue-soft);
}

.breadcrumb-item.current {
  background: rgba(37, 99, 235, 0.05);
  color: var(--text-primary);
  font-weight: 700;
}

.breadcrumb-separator {
  color: var(--text-muted);
}

.scope-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.scope-label {
  color: var(--text-secondary);
}

.scope-select {
  padding: 5px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #fff;
  color: var(--text-primary);
  font-size: 12px;
  outline: none;
}

.scope-badge {
  padding: 4px 14px;
  border-radius: 20px;
  background: rgba(37, 99, 235, 0.07);
  color: var(--blue-primary);
  font-size: 11px;
  font-weight: 600;
}

.scope-badge.subsidiary {
  background: rgba(5, 150, 105, 0.07);
  color: var(--success);
}

.tab-bar {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(37, 99, 235, 0.04);
}

.tab-step {
  display: flex;
  align-items: center;
}

.nav-tab {
  padding: 9px 22px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: var(--transition);
  white-space: nowrap;
}

.nav-tab:hover {
  background: var(--blue-soft);
  color: var(--blue-primary);
}

.nav-tab.active {
  background: var(--gradient-blue);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3), 0 1px 4px rgba(37, 99, 235, 0.15);
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -10px;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-top: 7px solid #0891b2;
}

.tab-arrow {
  margin: 0 3px;
  color: var(--text-muted);
  font-size: 11px;
  opacity: 0.5;
}

.nav-risk-tag {
  margin-left: 6px;
  font-size: 8px;
}

.dashboard-main {
  height: calc(100% - 150px);
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;
}

.dashboard-main::-webkit-scrollbar {
  width: 5px;
}

.dashboard-main::-webkit-scrollbar-thumb {
  background: rgba(37, 99, 235, 0.12);
  border-radius: 3px;
}

.page-container {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  animation: fade-in-up 0.35s ease;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.current-scope-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.current-scope-info strong {
  color: var(--blue-primary);
  font-weight: 600;
}

.scope-update-text,
.risk-total-text {
  margin-left: auto;
  font-size: 10px;
}

.risk-total-text {
  color: var(--danger);
}

.risk-total-num {
  font-weight: 700;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px 6px;
}

.section-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: var(--blue-primary);
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.45);
}

.section-title {
  font-size: 14px;
  font-weight: 700;
}

.section-subtitle {
  margin-left: 2px;
  font-size: 11px;
  color: var(--text-muted);
}

.section-tag {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
}

.section-tag.risk {
  background: rgba(220, 38, 38, 0.08);
  color: var(--danger);
}

.section-tag.info {
  background: rgba(37, 99, 235, 0.06);
  color: var(--blue-primary);
}

.stat-pills,
.stat-cards,
.grid-2col,
.grid-3col {
  display: grid;
  gap: var(--gap);
}

.stat-pills.cols-8 {
  grid-template-columns: repeat(8, 1fr);
}

.stat-pills.cols-7 {
  grid-template-columns: repeat(7, 1fr);
}

.stat-pills.cols-5 {
  grid-template-columns: repeat(5, 1fr);
}

.stat-pills.cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.stat-cards {
  grid-template-columns: repeat(5, 1fr);
}

.grid-2col {
  grid-template-columns: repeat(2, 1fr);
}

.grid-3col {
  grid-template-columns: repeat(3, 1fr);
}

.stat-pill,
.stat-card,
.card,
.mini-card {
  background: linear-gradient(180deg, #ffffff 0%, #f9fbfe 100%);
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: var(--transition);
}

.stat-pill:hover,
.stat-card:hover,
.card:hover,
.mini-card:hover {
  border-color: var(--border-glow);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;
}

.pill-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.pill-dot.blue {
  background: var(--blue-primary);
  box-shadow: 0 0 8px var(--blue-primary);
}

.pill-dot.green {
  background: var(--success);
  box-shadow: 0 0 8px var(--success);
}

.pill-dot.orange {
  background: var(--orange);
  box-shadow: 0 0 8px var(--orange);
}

.pill-dot.red {
  background: var(--danger);
  box-shadow: 0 0 8px var(--danger);
}

.pill-dot.cyan {
  background: var(--cyan);
  box-shadow: 0 0 8px var(--cyan);
}

.pill-dot.warn {
  background: var(--warning);
  box-shadow: 0 0 8px var(--warning);
}

.pill-dot.purple {
  background: var(--purple);
  box-shadow: 0 0 8px var(--purple);
}

.pill-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pill-value,
.stat-value {
  font-size: 26px;
  line-height: 1.15;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.pill-value.highlight {
  color: var(--blue-primary);
}

.pill-value.danger {
  color: var(--danger);
}

.pill-label,
.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
}

.pill-trend,
.pill-sub {
  margin-left: auto;
  font-size: 10px;
  font-weight: 600;
}

.pill-trend {
  padding: 3px 8px;
  border-radius: 6px;
}

.pill-trend.up {
  background: rgba(5, 150, 105, 0.08);
  color: var(--success);
}

.pill-trend.down {
  background: rgba(220, 38, 38, 0.08);
  color: var(--danger);
}

.pill-trend.warn {
  background: rgba(217, 119, 6, 0.08);
  color: var(--warning);
}

.pill-sub {
  color: var(--text-muted);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: var(--radius);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon /deep/ .anticon {
  font-size: 20px;
}

.stat-icon.blue {
  background: linear-gradient(135deg, var(--blue-primary), var(--blue-light));
}

.stat-icon.cyan {
  background: linear-gradient(135deg, var(--cyan), var(--cyan-light));
}

.stat-icon.green {
  background: linear-gradient(135deg, var(--success), #34d399);
}

.stat-icon.orange {
  background: linear-gradient(135deg, var(--orange), #fb923c);
}

.stat-icon.purple {
  background: linear-gradient(135deg, var(--purple), #a78bfa);
}

.card,
.mini-card {
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.card {
  min-height: 280px;
  padding: 16px 18px;
  border-radius: var(--radius-lg);
}

.mini-card {
  min-height: 220px;
  padding: 14px 16px;
  border-radius: var(--radius);
}

.card-title,
.mc-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(37, 99, 235, 0.05);
  font-size: 13px;
  font-weight: 700;
}

.mc-title {
  font-size: 12px;
  margin-bottom: 8px;
}

.icon,
.mc-icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-blue);
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.mc-icon {
  width: 20px;
  height: 20px;
  border-radius: 5px;
}

.icon /deep/ .anticon,
.mc-icon /deep/ .anticon {
  font-size: 12px;
}

.mc-list,
.alert-compact,
.risk-center-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.mc-list::-webkit-scrollbar,
.alert-compact::-webkit-scrollbar,
.risk-center-list::-webkit-scrollbar {
  width: 4px;
}

.mc-list::-webkit-scrollbar-thumb,
.alert-compact::-webkit-scrollbar-thumb,
.risk-center-list::-webkit-scrollbar-thumb {
  background: rgba(37, 99, 235, 0.15);
  border-radius: 2px;
}

.compact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(37, 99, 235, 0.04);
  font-size: 11px;
}

.ci-rank {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
}

.ci-rank.top {
  background: linear-gradient(135deg, var(--blue-primary), var(--blue-light));
}

.ci-rank.mid {
  background: linear-gradient(135deg, var(--cyan), var(--cyan-light));
}

.ci-rank.low {
  background: var(--slate);
}

.ci-name,
.ac-label,
.rc-name {
  flex: 1;
  min-width: 0;
}

.ci-name,
.rc-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ci-value {
  font-size: 12px;
  font-weight: 700;
}

.ci-value.good {
  color: var(--success);
}

.ci-value.warn {
  color: var(--warning);
}

.ci-value.bad {
  color: var(--danger);
}

.mc-footnote,
.personnel-note {
  margin-top: 4px;
  font-size: 9px;
  color: var(--text-secondary);
}

.personnel-note.danger {
  color: var(--danger);
  grid-column: 1 / -1;
}

.personnel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px 10px;
}

.personnel-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.pi-label {
  width: 56px;
  color: var(--text-secondary);
  text-align: right;
  font-weight: 500;
  flex-shrink: 0;
}

.pi-bar,
.ci-bar-wrap {
  flex: 1;
  min-width: 20px;
  height: 7px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(37, 99, 235, 0.05);
}

.pi-bar-fill,
.ci-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--gradient-blue);
}

.pi-val,
.ac-num,
.rc-detail {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.pi-val,
.ac-num {
  font-size: 11px;
  font-weight: 700;
}

.alert-compact {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ac-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  border-left: 2px solid var(--blue-light);
  background: rgba(37, 99, 235, 0.025);
  font-size: 11px;
}

.ac-item.danger {
  border-left-color: var(--danger);
  background: rgba(220, 38, 38, 0.025);
}

.ac-item.warn {
  border-left-color: var(--warning);
  background: rgba(217, 119, 6, 0.025);
}

.ac-sub-header {
  margin-top: 4px;
  margin-bottom: 2px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.ac-sub-header.blue {
  background: rgba(37, 99, 235, 0.05);
  color: var(--blue-primary);
}

.ac-sub-header.red {
  background: rgba(220, 38, 38, 0.05);
  color: var(--danger);
}

.ac-sub-header.cyan {
  background: rgba(8, 145, 178, 0.05);
  color: var(--cyan);
}

.ac-sub-header.green {
  background: rgba(5, 150, 105, 0.05);
  color: var(--success);
}

.risk-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
}

.risk-tag.high {
  background: rgba(220, 38, 38, 0.1);
  color: var(--danger);
  border: 1px solid rgba(220, 38, 38, 0.15);
}

.risk-tag.mid {
  background: rgba(217, 119, 6, 0.1);
  color: var(--warning);
  border: 1px solid rgba(217, 119, 6, 0.15);
}

.risk-tag.good {
  background: rgba(5, 150, 105, 0.08);
  color: var(--success);
  border: 1px solid rgba(5, 150, 105, 0.12);
}

.risk-center-card {
  min-height: 200px;
}

.comply-card {
  min-height: 180px;
}

.risk-center-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 10px;
  border-left: 3px solid var(--blue-light);
  background: rgba(37, 99, 235, 0.025);
}

.risk-center-item.level-high {
  border-left-color: var(--danger);
  background: rgba(220, 38, 38, 0.03);
}

.risk-center-item.level-medium {
  border-left-color: var(--warning);
  background: rgba(217, 119, 6, 0.025);
}

.rc-category {
  min-width: 50px;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  flex-shrink: 0;
}

.rc-category.hr {
  background: rgba(37, 99, 235, 0.08);
  color: var(--blue-primary);
}

.rc-category.attend {
  background: rgba(217, 119, 6, 0.08);
  color: var(--warning);
}

.rc-category.comply {
  background: rgba(220, 38, 38, 0.08);
  color: var(--danger);
}

.rc-detail {
  font-size: 11px;
  color: var(--text-muted);
}

.rc-action {
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  background: rgba(37, 99, 235, 0.05);
  color: var(--blue-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
}

.section-gap {
  margin-bottom: var(--gap);
}

.flex-grid {
  min-height: 0;
}

.min-card {
  min-height: 260px;
}

.limited-card {
  max-height: 280px;
}

.risk-card {
  max-height: 300px;
}

@media (max-width: 1400px) {
  .stat-pills.cols-8,
  .stat-pills.cols-7 {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .stat-pills.cols-8,
  .stat-pills.cols-7,
  .stat-pills.cols-5,
  .stat-pills.cols-4,
  .stat-cards,
  .grid-2col,
  .grid-3col {
    grid-template-columns: 1fr 1fr;
  }

  .cockpit-page {
    height: auto;
    min-height: calc(100vh - 84px);
  }

  .dashboard-main {
    height: auto;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 0 12px;
  }

  .scope-bar {
    height: auto;
    padding: 8px 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .tab-bar {
    padding: 8px 12px;
    height: auto;
  }

  .tab-step {
    flex-wrap: wrap;
  }

  .dashboard-main {
    padding: 10px;
  }

  .stat-pills.cols-8,
  .stat-pills.cols-7,
  .stat-pills.cols-5,
  .stat-pills.cols-4,
  .stat-cards,
  .grid-2col,
  .grid-3col {
    grid-template-columns: 1fr;
  }
}
</style>
