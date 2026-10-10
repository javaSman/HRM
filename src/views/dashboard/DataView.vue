<template>
  <div class="data-dashboard">
    <a href="#main-content" class="skip-nav">跳转到主要内容</a>

    <div class="bg-grid" aria-hidden="true"></div>
    <div class="bg-particles" aria-hidden="true">
      <div
        v-for="(particle, index) in particles"
        :key="index"
        class="particle"
        :style="particle.style"
      ></div>
    </div>
    <div class="light-orbs" aria-hidden="true">
      <div class="light-orb"></div>
      <div class="light-orb"></div>
      <div class="light-orb"></div>
    </div>

    <dashboard-header :active-tab="activeTab" @change="handleTabChange" />

    <main class="dashboard-main" id="main-content">
      <transition name="fade" mode="out-in">
        <component
          :is="currentComponent"
          :key="activeTab"
          v-if="activeTab"
        />
      </transition>
    </main>
  </div>
</template>

<script>
import DashboardHeader from './modules/DashboardHeader.vue'
import AttendanceCockpit from './modules/AttendanceCockpit.vue'
import CityAnalysis from './modules/CityAnalysis.vue'
import AnomalyMonitor from './modules/AnomalyMonitor.vue'
import AttendanceRanking from './modules/AttendanceRanking.vue'
import HolidayOvertimeTrend from './modules/HolidayOvertimeTrend.vue'

export default {
  name: 'Data',
  components: {
    DashboardHeader,
    AttendanceCockpit,
    CityAnalysis,
    AnomalyMonitor,
    AttendanceRanking,
    HolidayOvertimeTrend
  },
  data() {
    return {
      activeTab: 'page1',
      particles: []
    }
  },
  computed: {
    currentComponent() {
      const componentMap = {
        page1: 'AttendanceCockpit',
        page2: 'CityAnalysis',
        page3: 'AnomalyMonitor',
        page4: 'AttendanceRanking',
        page5: 'HolidayOvertimeTrend'
      }
      return componentMap[this.activeTab]
    }
  },
  mounted() {
    this.createParticles()
  },
  methods: {
    handleTabChange(tabKey) {
      this.activeTab = tabKey
    },
    createParticles() {
      const particles = []
      for (let i = 0; i < 20; i++) {
        const size = Math.random() * 4 + 1
        particles.push({
          style: {
            width: size + 'px',
            height: size + 'px',
            left: Math.random() * 100 + '%',
            animationDuration: (Math.random() * 15 + 10) + 's',
            animationDelay: (Math.random() * 10) + 's',
            opacity: Math.random() * 0.3 + 0.05
          }
        })
      }
      this.particles = particles
    }
  }
}
</script>

<style scoped>
.data-dashboard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f0f4f8;
  color: #1e2d3d;
}

.skip-nav {
  position: absolute;
  top: -100%;
  left: 12px;
  z-index: 9999;
  padding: 8px 16px;
  background: #2d78ff;
  color: #fff;
  border-radius: 0 0 8px 8px;
  font-size: 13px;
  text-decoration: none;
  transition: top 0.2s;
}

.skip-nav:focus {
  top: 0;
}

.bg-particles {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(45, 120, 255, 0.15);
  animation: float-particle linear infinite;
}

@keyframes float-particle {
  0% { transform: translateY(100vh) scale(0); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% { transform: translateY(-10vh) scale(1); opacity: 0; }
}

.bg-grid {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(rgba(45, 120, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(45, 120, 255, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;
}

.light-orbs {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.light-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: orb-drift ease-in-out infinite;
}

.light-orb:nth-child(1) {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #2d78ff, transparent 70%);
  top: 10%; left: 5%;
  animation-duration: 12s;
  animation-name: orb-drift-1;
}
.light-orb:nth-child(2) {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #00a0d4, transparent 70%);
  top: 60%; right: 10%;
  animation-duration: 15s;
  animation-name: orb-drift-2;
}
.light-orb:nth-child(3) {
  width: 250px; height: 250px;
  background: radial-gradient(circle, #8b5cf6, transparent 70%);
  bottom: 15%; left: 40%;
  animation-duration: 18s;
  animation-name: orb-drift-3;
}

@keyframes orb-drift-1 {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(60px, 40px); }
  50% { transform: translate(-30px, 80px); }
  75% { transform: translate(40px, -20px); }
}
@keyframes orb-drift-2 {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-50px, -30px); }
  50% { transform: translate(40px, -60px); }
  75% { transform: translate(-20px, 30px); }
}
@keyframes orb-drift-3 {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(30px, -50px); }
  50% { transform: translate(-60px, 20px); }
  75% { transform: translate(50px, 40px); }
}

.dashboard-main {
  position: relative;
  z-index: 5;
  flex: 1;
  padding: 20px 20px 10px;
  overflow: hidden;
  height: calc(100% - 64px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter {
  opacity: 0;
  transform: translateY(15px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>

<style>
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(45, 120, 255, 0.15); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(45, 120, 255, 0.3); }

@media (max-width: 1400px) {
  .page4-grid { grid-template-columns: 240px 1fr !important; }
}

@media (max-width: 1200px) {
  .stat-cards { grid-template-columns: repeat(3, 1fr) !important; }
}

@media (max-width: 768px) {
  .stat-cards { grid-template-columns: repeat(2, 1fr) !important; }
}
</style>
