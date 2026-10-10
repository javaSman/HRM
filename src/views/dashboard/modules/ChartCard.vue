<template>
  <div class="card" :class="{ 'card-breathe': breathe }">
    <div class="card-title">
      <span class="icon">
        <lucide-icon :name="icon" :size="13" />
      </span>
      {{ title }}
    </div>
    <div class="chart-container">
      <slot name="chart">
        <div ref="chartDom" :id="chartId" class="chart-dom"></div>
      </slot>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import LucideIcon from './LucideIcon.vue'

export default {
  name: 'ChartCard',
  components: {
    LucideIcon
  },
  props: {
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    chartId: {
      type: String,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    },
    breathe: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chartInstance: null
    }
  },
  watch: {
    options: {
      handler(newOptions) {
        if (this.chartInstance && newOptions) {
          this.$nextTick(() => {
            this.chartInstance.setOption(newOptions, true)
          })
        }
      },
      deep: true
    }
  },
  mounted() {
    this.initChartWithDelay()
  },
  activated() {
    if (this.chartInstance) {
      this.$nextTick(() => {
        this.chartInstance.resize()
      })
    } else {
      this.initChartWithDelay()
    }
  },
  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose()
    }
  },
  methods: {
    initChartWithDelay() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.initChart()
        }, 50)
      })
    },
    initChart() {
      const dom = this.$refs.chartDom
      if (!dom) return

      if (this.chartInstance) {
        this.chartInstance.dispose()
      }

      this.chartInstance = echarts.init(dom, null, { renderer: 'canvas' })

      if (this.options && Object.keys(this.options).length > 0) {
        this.chartInstance.setOption(this.options)
      }

      window.addEventListener('resize', this.handleResize)
    },
    handleResize() {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    },
    getChart() {
      return this.chartInstance
    }
  }
}
</script>

<style scoped>
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
  min-height: 0;
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

.card::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(45, 120, 255, 0.04), rgba(0, 160, 212, 0.02), transparent);
  pointer-events: none;
  animation: card-auto-scan 6s ease-in-out infinite;
}

@keyframes card-auto-scan {
  0%, 100% { left: -50%; opacity: 0; }
  10% { opacity: 1; }
  50% { left: 120%; opacity: 1; }
  60% { opacity: 0; }
  100% { left: -50%; opacity: 0; }
}

.card:hover {
  border-color: rgba(45, 120, 255, 0.35);
  box-shadow: 0 4px 24px rgba(45, 120, 255, 0.15), 0 0 50px rgba(45, 120, 255, 0.04);
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
  animation: icon-soft-pulse 3s ease-in-out infinite;
  font-size: 13px;
}

@keyframes icon-soft-pulse {
  0%, 100% { box-shadow: 0 0 6px rgba(45, 120, 255, 0.2); }
  50% { box-shadow: 0 0 14px rgba(45, 120, 255, 0.4); }
}

.chart-container {
  width: 100%;
  flex: 1;
  min-height: 0;
}

.chart-dom {
  width: 100%;
  height: 100%;
}

@keyframes border-breathe {
  0%, 100% { border-color: rgba(45, 120, 255, 0.12); box-shadow: 0 2px 12px rgba(45, 120, 255, 0.08), 0 1px 3px rgba(0,0,0,0.04); }
  50% { border-color: rgba(45, 120, 255, 0.3); box-shadow: 0 2px 12px rgba(45, 120, 255, 0.12), 0 0 30px rgba(45, 120, 255, 0.04); }
}

.card-breathe {
  animation: border-breathe 4s ease-in-out infinite;
}
</style>
