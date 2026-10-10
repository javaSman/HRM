<template>
  <div ref="chart" class="cockpit-chart" :style="{ height }"></div>
</template>

<script>
const echarts = require('echarts')

export default {
  name: 'CockpitChart',
  props: {
    option: {
      type: Object,
      default: () => ({})
    },
    height: {
      type: String,
      default: '220px'
    }
  },
  data() {
    return {
      chartInstance: null
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chartInstance) {
      this.chartInstance.dispose()
    }
  },
  watch: {
    option: {
      deep: true,
      handler() {
        this.renderChart()
      }
    }
  },
  methods: {
    initChart() {
      this.chartInstance = echarts.init(this.$refs.chart, null, { renderer: 'canvas' })
      this.renderChart()
    },
    renderChart() {
      if (!this.chartInstance) {
        return
      }
      this.chartInstance.clear()
      this.chartInstance.setOption(this.option, true)
    },
    handleResize() {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cockpit-chart {
  width: 100%;
  min-height: 120px;
}
</style>
