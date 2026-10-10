<template>
  <div class="stat-card" :class="{ 'card-breathe': breathe }">
    <div class="stat-icon" :class="iconType">
      <lucide-icon :name="icon" :size="20" />
    </div>
    <div>
      <div class="stat-value">
        <span class="count-up">{{ displayValue }}</span>
        <span v-if="suffix" class="stat-suffix">{{ suffix }}</span>
      </div>
      <div class="stat-label">{{ label }}</div>
    </div>
    <div v-if="trend" class="stat-trend" :class="trendType">
      {{ trend }}
    </div>
  </div>
</template>

<script>
import LucideIcon from './LucideIcon.vue'

export default {
  name: 'StatCard',
  components: {
    LucideIcon
  },
  props: {
    icon: {
      type: String,
      required: true
    },
    iconType: {
      type: String,
      default: 'blue',
      validator: (value) => ['blue', 'cyan', 'green', 'orange', 'red'].includes(value)
    },
    value: {
      type: [Number, String],
      required: true
    },
    suffix: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      required: true
    },
    trend: {
      type: String,
      default: ''
    },
    trendType: {
      type: String,
      default: 'up',
      validator: (value) => ['up', 'down'].includes(value)
    },
    breathe: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      displayValue: 0,
      animationTimer: null
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.animateValue(newVal)
      },
      immediate: true
    }
  },
  mounted() {
    this.animateValue(this.value)
  },
  methods: {
    animateValue(target) {
      const targetNum = parseFloat(target)
      const isFloat = String(target).includes('.')
      const duration = 1500
      const startTime = performance.now()
      const startValue = parseFloat(this.displayValue) || 0

      if (this.animationTimer) {
        cancelAnimationFrame(this.animationTimer)
      }

      const step = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
        const current = startValue + (targetNum - startValue) * eased

        this.displayValue = isFloat ? current.toFixed(1) : Math.round(current)

        if (progress < 1) {
          this.animationTimer = requestAnimationFrame(step)
        }
      }

      this.animationTimer = requestAnimationFrame(step)
    }
  },
  beforeDestroy() {
    if (this.animationTimer) {
      cancelAnimationFrame(this.animationTimer)
    }
  }
}
</script>

<style scoped>
.stat-card {
  background: #ffffff;
  border: 1px solid rgba(45, 120, 255, 0.12);
  border-radius: 12px;
  padding: 16px 18px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  box-shadow: 0 2px 12px rgba(45, 120, 255, 0.08), 0 1px 3px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
  height: 110px;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(45, 120, 255, 0.06), rgba(0, 160, 212, 0.04), transparent);
  transition: none;
  pointer-events: none;
}

.stat-card:hover::after {
  animation: card-scan-light 0.8s ease forwards;
}

@keyframes card-scan-light {
  0% { left: -60%; }
  100% { left: 120%; }
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(45, 120, 255, 0.35);
  box-shadow: 0 4px 24px rgba(45, 120, 255, 0.18), 0 0 40px rgba(45, 120, 255, 0.06);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 0 8px rgba(45, 120, 255, 0.3);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.4s ease;
  font-size: 22px;
}

.stat-icon.blue { background: rgba(45, 120, 255, 0.1); color: #2d78ff; }
.stat-icon.cyan { background: rgba(0, 160, 212, 0.1); color: #00a0d4; }
.stat-icon.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.stat-icon.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
.stat-icon.red { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.stat-card:hover .stat-icon.blue { box-shadow: 0 0 16px rgba(45, 120, 255, 0.3); }
.stat-card:hover .stat-icon.cyan { box-shadow: 0 0 16px rgba(0, 160, 212, 0.3); }
.stat-card:hover .stat-icon.green { box-shadow: 0 0 16px rgba(16, 185, 129, 0.3); }
.stat-card:hover .stat-icon.orange { box-shadow: 0 0 16px rgba(249, 115, 22, 0.3); }
.stat-card:hover .stat-icon.red { box-shadow: 0 0 16px rgba(239, 68, 68, 0.3); }

.stat-value {
  font-size: 28px;
  font-weight: 900;
  color: #1e2d3d;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.stat-suffix {
  font-size: 20px;
  font-weight: 700;
  margin-left: 2px;
}

.stat-label {
  font-size: 12px;
  color: #6b7c93;
  margin-top: 2px;
  white-space: nowrap;
}

.stat-card > div:not(.stat-icon):not(.stat-trend) {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.stat-trend {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  flex-shrink: 0;
  position: absolute;
  top: 12px;
  right: 14px;
}

.stat-trend.up { color: #10b981; background: rgba(16, 185, 129, 0.08); }
.stat-trend.down { color: #ef4444; background: rgba(239, 68, 68, 0.08); }

.count-up {
  display: inline-block;
}

@keyframes border-breathe {
  0%, 100% { border-color: rgba(45, 120, 255, 0.12); box-shadow: 0 2px 12px rgba(45, 120, 255, 0.08), 0 1px 3px rgba(0,0,0,0.04); }
  50% { border-color: rgba(45, 120, 255, 0.3); box-shadow: 0 2px 12px rgba(45, 120, 255, 0.12), 0 0 30px rgba(45, 120, 255, 0.04); }
}

.card-breathe {
  animation: border-breathe 4s ease-in-out infinite;
}
</style>
