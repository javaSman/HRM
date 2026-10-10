<template>
  <!-- 图表容器，ref 获取DOM节点，样式可外部覆盖 -->
  <div ref="echartsContainer" class="echarts-container" ></div>
</template>

<script>
// 引入ECharts核心，保持你的原有引入方式
import * as echarts from 'echarts'

export default {
  name: "EchartsOptions",
  props: {
    // 父组件传递的图表配置字符串，必传非空
    OptionValue: {
      type: String,
      required: true,
      validator: (val) => val.trim() !== ''
    }
  },
  data() {
    return {
      myChart: null, // 存储ECharts实例
      resizeTimer: null // 手动实现防抖的定时器，替代lodash的debounce
    }
  },
  watch: {
    // 监听配置字符串变化，重新渲染图表
    OptionValue: {
      handler(newVal) {
        this.renderChart(newVal)
      },
      immediate: true // 初始化立即执行
    }
  },
  mounted() {
    // 初始化图表
    this.initChart()
    // 监听窗口缩放，手动防抖实现自适应
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    // 组件销毁清理资源，防止内存泄漏
    if (this.myChart) {
      this.myChart.dispose()
      this.myChart = null
    }
    window.removeEventListener('resize', this.handleResize)
    clearTimeout(this.resizeTimer) // 清除防抖定时器
  },
  methods: {
    // 初始化ECharts实例
    initChart() {
      // 先判断DOM节点是否存在，避免初始化失败
      if (this.$refs.echartsContainer) {
        this.myChart = echarts.init(this.$refs.echartsContainer)
        this.renderChart(this.OptionValue)
      }
    },
    // 核心：渲染/更新图表，移除可选链，用if判断替代
    renderChart(optionStr) {
      // 先判断实例是否存在，避免报错
      if (!this.myChart) return
      try {
        // 解析配置字符串，去除首尾空格
        const option = JSON.parse(optionStr.trim())
        // 设置配置，全量替换（第二个参数true）
        this.myChart.setOption(option, true)
      } catch (error) {
        // 捕获解析/渲染错误，控制台打印信息
        console.error('ECharts配置解析/渲染失败：', error)
        console.error('传入的配置字符串：', optionStr)
        // 渲染友好的错误提示
        this.myChart.setOption({
          title: { text: '图表加载失败', left: 'center', top: 'middle' },
          tooltip: {},
          xAxis: {},
          yAxis: {},
          series: []
        })
      }
    },
    // 手动实现窗口缩放防抖，替代lodash，无额外依赖
    handleResize() {
      // 清除上一次的定时器
      clearTimeout(this.resizeTimer)
      // 300ms后执行resize，避免频繁重绘
      this.resizeTimer = setTimeout(() => {
        // 用if判断替代可选链?.，兼容低版本编译环境
        if (this.myChart) {
          this.myChart.resize()
        }
      }, 300)
    }
  }
}
</script>

<style scoped>
/* 图表容器基础样式，宽高可由父组件通过style覆盖 */
.echarts-container {
  width: 100%;
  height: 400px; /* 默认高度，可自定义 */
  min-height: 300px;
}
</style>