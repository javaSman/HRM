<template>
  <header class="dashboard-header">
    <div class="header-left">
      <div class="header-logo">
        <lucide-icon name="layout-dashboard" :size="20" />
      </div>
      <div>
        <h1 class="header-title">考勤驾驶舱大屏</h1>
        <div class="header-subtitle">ATTENDANCE COCKPIT DASHBOARD</div>
      </div>
    </div>

    <nav class="header-nav">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="nav-tab"
        :class="{ active: activeTab === tab.key }"
        @click="$emit('change', tab.key)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div class="header-right">
      <span>
        <span class="status-dot"></span>系统运行中
      </span>
      <div>
        <div class="header-time">{{ currentTime }}</div>
        <div class="header-date">{{ currentDate }}</div>
      </div>
    </div>
  </header>
</template>

<script>
import LucideIcon from './LucideIcon.vue'

export default {
  name: 'DashboardHeader',
  components: {
    LucideIcon
  },
  props: {
    activeTab: {
      type: String,
      default: 'page1'
    }
  },
  data() {
    return {
      currentTime: '',
      currentDate: '',
      timer: null,
      tabs: [
        { key: 'page1', label: '考勤驾驶舱' },
        { key: 'page2', label: '城市考勤分析' },
        { key: 'page3', label: '异常打卡监控' },
        { key: 'page4', label: '考勤排行' },
        { key: 'page5', label: '假期加班趋势' }
      ]
    }
  },
  mounted() {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    updateTime() {
      const now = new Date()
      const h = String(now.getHours()).padStart(2, '0')
      const m = String(now.getMinutes()).padStart(2, '0')
      const s = String(now.getSeconds()).padStart(2, '0')
      this.currentTime = `${h}:${m}:${s}`

      const y = now.getFullYear()
      const mo = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      this.currentDate = `${y}年${mo}月${d}日 ${weekdays[now.getDay()]}`
    }
  }
}
</script>

<style scoped>
.dashboard-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid rgba(45, 120, 255, 0.12);
  box-shadow: 0 1px 8px rgba(45, 120, 255, 0.06);
  flex-shrink: 0;
  overflow: hidden;
}

.dashboard-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -100%;
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #2d78ff, #00a0d4, #2d78ff, transparent);
  animation: header-light-sweep 4s linear infinite;
}

@keyframes header-light-sweep {
  0% { left: -60%; }
  100% { left: 100%; }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.header-logo {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.3);
  animation: logo-glow 3s ease-in-out infinite;
  position: relative;
  font-size: 20px;
}

.header-logo::after {
  content: '';
  position: absolute;
  top: -3px; left: -3px; right: -3px; bottom: -3px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: linear-gradient(135deg, rgba(45, 120, 255, 0.4), transparent, rgba(0, 160, 212, 0.3), transparent) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: logo-ring-rotate 4s linear infinite;
}

@keyframes logo-glow {
  0%, 100% { box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2); }
  50% { box-shadow: 0 2px 20px rgba(45, 120, 255, 0.5), 0 0 40px rgba(45, 120, 255, 0.1); }
}

@keyframes logo-ring-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.header-title {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 3px;
  margin: 0;
}

.header-subtitle {
  font-size: 11px;
  color: #6b7c93;
  letter-spacing: 2px;
  margin-top: 1px;
}

.header-nav {
  display: flex;
  gap: 4px;
  background: #f0f4f8;
  border-radius: 10px;
  padding: 3px;
  border: 1px solid rgba(45, 120, 255, 0.12);
  position: relative;
}

.nav-tab {
  padding: 7px 18px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7c93;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  border: none;
  background: none;
  outline: none;
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
}

.nav-tab:hover {
  color: #2d78ff;
  background: rgba(45, 120, 255, 0.06);
}

.nav-tab.active {
  color: #fff;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 12px rgba(45, 120, 255, 0.3), 0 0 20px rgba(45, 120, 255, 0.1);
}

.nav-tab.active::before {
  content: '';
  position: absolute;
  top: -1px; left: -1px; right: -1px; bottom: -1px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(45, 120, 255, 0.5), transparent, rgba(0, 160, 212, 0.4));
  z-index: -1;
  animation: active-tab-glow 2s ease-in-out infinite alternate;
}

@keyframes active-tab-glow {
  0% { opacity: 0.3; filter: blur(2px); }
  100% { opacity: 0.7; filter: blur(4px); }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 18px;
  color: #6b7c93;
  font-size: 13px;
  flex-shrink: 0;
}

.header-time {
  font-size: 13px;
  color: #2d78ff;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.header-date {
  font-size: 11px;
  color: #6b7c93;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  display: inline-block;
  margin-right: 5px;
  animation: blink-dot 2s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
}

@keyframes blink-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(16, 185, 129, 0.4); }
  50% { opacity: 0.3; box-shadow: 0 0 2px rgba(16, 185, 129, 0.1); }
}
</style>
