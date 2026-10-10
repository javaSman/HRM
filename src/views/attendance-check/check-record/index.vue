<template>
  <div class="page-container check-record-page">
    <a-spin :spinning="loading" tip="正在加载数据...">
      <div class="hero-card">
        <h1>打卡记录统计面板</h1>
        <p>数据范围：2026-05-01 至 2026-05-26 · 共 719 名员工 · 展示打卡趋势、方式分布和明细统计。</p>
      </div>

      <div class="stats-grid">
        <div v-for="item in summaryCards" :key="item.key" class="stats-card">
          <div class="stats-label">{{ item.label }}</div>
          <div :class="['stats-value', item.theme]">{{ item.value }}</div>
          <div class="stats-desc">{{ item.desc }}</div>
        </div>
      </div>

      <div class="chart-grid">
        <div class="panel-card">
          <div class="panel-title">每日打卡趋势</div>
          <div ref="dailyChart" class="chart-box"></div>
        </div>
        <div class="panel-card">
          <div class="panel-title">打卡方式分布</div>
          <div ref="methodChart" class="chart-box compact"></div>
          <div class="method-list">
            <div v-for="item in methodBreakdown" :key="item.name" class="method-item">
              <span class="method-dot" :style="{ background: item.color }"></span>
              <span class="method-label">{{ item.name }}</span>
              <strong>{{ item.count.toLocaleString() }}</strong>
              <span class="method-percent">({{ item.percent }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-card">
        <a-tabs :activeKey="activeTab" @change="handleTabChange">
          <a-tab-pane key="records" tab="打卡记录明细">
            <a-form-model layout="inline" :model="filterForm" class="filter-bar">
              <a-form-model-item>
                <a-select v-model="filterForm.type" allowClear placeholder="全部类型" style="width: 120px">
                  <a-select-option value="上班">上班</a-select-option>
                  <a-select-option value="下班">下班</a-select-option>
                  <a-select-option value="无效">无效</a-select-option>
                </a-select>
              </a-form-model-item>
              <a-form-model-item>
                <a-select v-model="filterForm.method" allowClear placeholder="全部方式" style="width: 140px">
                  <a-select-option value="企业微信">企业微信</a-select-option>
                  <a-select-option value="考勤机">考勤机</a-select-option>
                  <a-select-option value="手动打卡">手动打卡</a-select-option>
                </a-select>
              </a-form-model-item>
              <a-form-model-item>
                <a-select v-model="filterForm.date" allowClear placeholder="全部日期" style="width: 160px">
                  <a-select-option v-for="item in dateOptions" :key="item" :value="item">
                    {{ item }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
              <a-form-model-item class="filter-item-grow">
                <a-input v-model="filterForm.keyword" allowClear placeholder="搜索员工姓名..." />
              </a-form-model-item>
              <a-form-model-item>
                <a-select :value="String(pageSize)" style="width: 100px" @change="handlePageSizeChange">
                  <a-select-option value="20">20 条/页</a-select-option>
                  <a-select-option value="50">50 条/页</a-select-option>
                  <a-select-option value="100">100 条/页</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-form-model>

            <a-table rowKey="rowKey" :columns="recordColumns" :dataSource="pagedRecords" :pagination="false" :scroll="{ x: 960 }">
              <template slot="method" slot-scope="text, record">
                <a-tag :color="getMethodTagColor(record.method)">{{ record.method }}</a-tag>
              </template>
              <template slot="type" slot-scope="text, record">
                <a-tag :color="getTypeTagColor(record.type)">{{ record.type }}</a-tag>
              </template>
              <template slot="location" slot-scope="text, record">
                <span class="location-text" :title="record.location || '-'">{{ formatLocation(record.location) }}</span>
              </template>
            </a-table>

            <div class="table-footer">
              <span>共 {{ filteredRecords.length.toLocaleString() }} 条 / 第 {{ currentPage }}/{{ totalPages }} 页</span>
              <a-pagination
                size="small"
                :current="currentPage"
                :pageSize="pageSize"
                :total="filteredRecords.length"
                @change="handlePageChange"
              />
            </div>
          </a-tab-pane>

          <a-tab-pane key="ranking" tab="打卡次数排行">
            <ul class="rank-list">
              <li v-for="(item, index) in attendanceStats.top_employees" :key="item.name" class="rank-item">
                <span class="rank-num">{{ index + 1 }}</span>
                <span class="rank-name">{{ item.name }}</span>
                <span class="rank-bar-wrap">
                  <span class="rank-bar">
                    <span class="rank-bar-fill" :style="{ width: getRankPercent(item.count, attendanceStats.top_employees[0].count) + '%' }"></span>
                  </span>
                </span>
                <span class="rank-count">{{ item.count }}次</span>
              </li>
            </ul>
          </a-tab-pane>

          <a-tab-pane key="employee" tab="员工出勤概览">
            <div class="filter-bar employee-filter">
              <a-input v-model="employeeKeyword" allowClear placeholder="搜索员工姓名..." class="filter-item-grow" />
            </div>
            <a-table rowKey="name" :columns="employeeColumns" :dataSource="filteredEmployees" :pagination="false" />
          </a-tab-pane>

          <a-tab-pane key="locations" tab="打卡地点 TOP">
            <ul class="rank-list">
              <li v-for="(item, index) in attendanceStats.locations" :key="item.name" class="rank-item">
                <span class="rank-num">{{ index + 1 }}</span>
                <span class="rank-name small">{{ item.name }}</span>
                <span class="rank-bar-wrap">
                  <span class="rank-bar">
                    <span class="rank-bar-fill" :style="{ width: getRankPercent(item.count, attendanceStats.locations[0].count) + '%' }"></span>
                  </span>
                </span>
                <span class="rank-count">{{ item.count }}次</span>
              </li>
            </ul>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { attendanceRecords, attendanceStats, employeeSummary } from './mockData'

const echarts = require('echarts')

export default {
  name: 'CheckRecord',
  data() {
    return {
      loading: true,
      activeTab: 'records',
      attendanceStats,
      filterForm: {
        type: undefined,
        method: undefined,
        date: undefined,
        keyword: ''
      },
      employeeKeyword: '',
      currentPage: 1,
      pageSize: 20,
      dailyChartInstance: null,
      methodChartInstance: null,
      recordColumns: [
        { title: '员工编号', dataIndex: 'emp_id', key: 'emp_id' },
        { title: '姓名', dataIndex: 'name', key: 'name' },
        { title: '日期', dataIndex: 'date', key: 'date' },
        { title: '时间', dataIndex: 'time', key: 'time' },
        { title: '打卡方式', dataIndex: 'method', key: 'method', scopedSlots: { customRender: 'method' } },
        { title: '类型', dataIndex: 'type', key: 'type', scopedSlots: { customRender: 'type' } },
        { title: '地点', dataIndex: 'location', key: 'location', scopedSlots: { customRender: 'location' } }
      ],
      employeeColumns: [
        { title: '员工姓名', dataIndex: 'name', key: 'name' },
        { title: '近7天打卡天数', dataIndex: 'days_count', key: 'days_count', customRender: text => `${text} 天` },
        { title: '平均上班时间', dataIndex: 'avg_in_str', key: 'avg_in_str' },
        { title: '平均下班时间', dataIndex: 'avg_out_str', key: 'avg_out_str' }
      ]
    }
  },
  computed: {
    summaryCards() {
      return [
        { key: 'total', label: '总记录数', value: this.attendanceStats.total_records.toLocaleString(), desc: `${this.attendanceStats.total_days}天打卡数据`, theme: 'blue' },
        { key: 'employee', label: '员工总数', value: this.attendanceStats.total_employees.toLocaleString(), desc: '参与打卡的员工', theme: 'blue' },
        { key: 'valid', label: '有效打卡', value: this.attendanceStats.valid_count.toLocaleString(), desc: `上班 ${this.attendanceStats.work_in_count} / 下班 ${this.attendanceStats.work_out_count}`, theme: 'green' },
        { key: 'invalid', label: '无效记录', value: this.attendanceStats.invalid_count.toLocaleString(), desc: '考勤机未识别打卡', theme: 'gold' },
        { key: 'machine', label: '考勤机记录', value: this.attendanceStats.methods[0].count.toLocaleString(), desc: '占比 85.3%', theme: 'slate' },
        { key: 'avg', label: '日均有效', value: Math.round(this.attendanceStats.valid_count / this.attendanceStats.total_days).toString(), desc: '约196次/天', theme: 'slate' }
      ]
    },
    dateOptions() {
      return this.attendanceStats.daily_summary.map(item => item.date)
    },
    filteredRecords() {
      return attendanceRecords.filter(item => {
        if (this.filterForm.type && item.type !== this.filterForm.type) {
          return false
        }
        if (this.filterForm.method && item.method !== this.filterForm.method) {
          return false
        }
        if (this.filterForm.date && item.date !== this.filterForm.date) {
          return false
        }
        if (this.filterForm.keyword && item.name.indexOf(this.filterForm.keyword.trim()) === -1) {
          return false
        }
        return true
      })
    },
    pagedRecords() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredRecords.slice(start, start + this.pageSize).map((item, index) => ({
        ...item,
        rowKey: `${item.emp_id}-${item.date}-${item.time}-${index}`
      }))
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredRecords.length / this.pageSize))
    },
    filteredEmployees() {
      if (!this.employeeKeyword.trim()) {
        return employeeSummary
      }
      return employeeSummary.filter(item => item.name.indexOf(this.employeeKeyword.trim()) !== -1)
    },
    methodBreakdown() {
      const colors = ['#2d78ff', '#f59e0b', '#10b981']
      const total = this.attendanceStats.methods.reduce((sum, item) => sum + item.count, 0)
      return this.attendanceStats.methods.map((item, index) => ({
        ...item,
        color: colors[index],
        percent: ((item.count / total) * 100).toFixed(1)
      }))
    }
  },
  watch: {
    filteredRecords() {
      this.currentPage = 1
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts()
      window.addEventListener('resize', this.handleResize)
      this.loading = false
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.dailyChartInstance) {
      this.dailyChartInstance.dispose()
    }
    if (this.methodChartInstance) {
      this.methodChartInstance.dispose()
    }
  },
  methods: {
    initCharts() {
      this.dailyChartInstance = echarts.init(this.$refs.dailyChart)
      this.methodChartInstance = echarts.init(this.$refs.methodChart)
      this.renderDailyChart()
      this.renderMethodChart()
    },
    renderDailyChart() {
      const summary = this.attendanceStats.daily_summary
      const xLabelInterval = Math.max(0, Math.ceil(summary.length / 26) - 1)
      const blueGradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(45, 120, 255, 0.92)' },
        { offset: 1, color: 'rgba(45, 120, 255, 0.36)' }
      ])
      const cyanGradient = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(0, 160, 212, 0.88)' },
        { offset: 1, color: 'rgba(0, 160, 212, 0.34)' }
      ])
      this.dailyChartInstance.clear()
      this.dailyChartInstance.setOption({
        animationDuration: 600,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: 'rgba(45, 120, 255, 0.06)'
            }
          },
          formatter(params) {
            return params.map(item => `${item.seriesName}: ${Number(item.value).toLocaleString()}`).join('<br/>')
          }
        },
        legend: {
          top: 0,
          left: 'center',
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 14,
          icon: 'circle',
          textStyle: {
            color: '#64748b',
            fontSize: 11
          },
          data: ['上班', '下班', '无效']
        },
        grid: { left: 34, right: 14, top: 36, bottom: 24, containLabel: true },
        xAxis: {
          type: 'category',
          data: summary.map(item => item.date.slice(5)),
          axisLine: {
            lineStyle: {
              color: '#dbe5f1'
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            fontSize: 9,
            color: '#64748b',
            rotate: 45,
            interval: xLabelInterval
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          max: 200,
          min: 0,
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            fontSize: 10,
            color: '#64748b'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(45, 120, 255, 0.08)'
            }
          },
          minInterval: 20
        },
        series: [
          {
            name: '上班',
            type: 'bar',
            barMaxWidth: 14,
            barGap: '30%',
            emphasis: { focus: 'series' },
            itemStyle: {
              color: blueGradient,
              borderColor: '#2d78ff',
              borderWidth: 1,
              borderRadius: [4, 4, 0, 0]
            },
            z: 3,
            data: summary.map(item => item.in_count)
          },
          {
            name: '下班',
            type: 'bar',
            barMaxWidth: 14,
            barGap: '30%',
            emphasis: { focus: 'series' },
            itemStyle: {
              color: cyanGradient,
              borderColor: '#00a0d4',
              borderWidth: 1,
              borderRadius: [4, 4, 0, 0]
            },
            z: 3,
            data: summary.map(item => item.out_count)
          },
          {
            name: '无效',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 5,
            showSymbol: true,
            lineStyle: {
              width: 2,
              color: 'rgba(156, 163, 175, 0.75)'
            },
            itemStyle: {
              color: 'rgba(156, 163, 175, 0.85)'
            },
            areaStyle: {
              color: 'rgba(209, 213, 219, 0.10)'
            },
            z: 1,
            data: summary.map(item => item.invalid)
          }
        ]
      })
    },
    renderMethodChart() {
      const allDates = this.dateOptions
      const colors = ['#2d78ff', '#f59e0b', '#10b981']
      const datasets = this.attendanceStats.methods.map((item, index) => ({
        name: item.name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2, color: colors[index] },
        itemStyle: { color: colors[index] },
        data: allDates.map(date => attendanceRecords.filter(record => record.date === date && record.method === item.name).length)
      }))
      this.methodChartInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: 'rgba(45, 120, 255, 0.18)'
            }
          }
        },
        legend: {
          bottom: 0,
          left: 'center',
          itemWidth: 10,
          itemHeight: 10,
          icon: 'circle',
          textStyle: {
            color: '#64748b',
            fontSize: 10
          },
          data: this.attendanceStats.methods.map(item => item.name)
        },
        grid: { left: 40, right: 18, top: 18, bottom: 38 },
        xAxis: {
          type: 'category',
          data: allDates,
          axisLine: {
            lineStyle: {
              color: '#dbe5f1'
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            fontSize: 8,
            color: '#64748b',
            rotate: 42
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            fontSize: 9,
            color: '#64748b'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(45, 120, 255, 0.08)'
            }
          }
        },
        series: datasets
      })
    },
    handleResize() {
      if (this.dailyChartInstance) {
        this.dailyChartInstance.resize()
      }
      if (this.methodChartInstance) {
        this.methodChartInstance.resize()
      }
    },
    handleTabChange(key) {
      this.activeTab = key
      this.$nextTick(this.handleResize)
    },
    handlePageChange(page) {
      this.currentPage = page
    },
    handlePageSizeChange(value) {
      this.pageSize = Number(value)
      this.currentPage = 1
    },
    getMethodTagColor(method) {
      return {
        企业微信: 'green',
        手动打卡: 'orange',
        考勤机: 'default'
      }[method] || 'default'
    },
    getTypeTagColor(type) {
      return {
        上班: 'blue',
        下班: 'cyan',
        无效: 'red'
      }[type] || 'default'
    },
    formatLocation(location) {
      if (!location) {
        return '-'
      }
      return location.length > 18 ? `${location.slice(0, 18)}...` : location
    },
    getRankPercent(value, max) {
      if (!max) {
        return 0
      }
      return Math.round((value / max) * 100)
    }
  }
}
</script>

<style scoped lang="less">
.check-record-page {
  height: calc(100vh - 120px - 24px);
  padding: 24px;
  background: #f3f7fc;
  overflow: auto;
  color: #1f2937;
}

.hero-card,
.stats-card,
.panel-card {
  background: #ffffff;
  border: 1px solid #dbe6f3;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.hero-card {
  padding: 24px 28px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  color: #ffffff;
  h1{
  color: #ffffff;
  }
}

.hero-card h1 {
  margin: 0;
  font-size: 28px;
}

.hero-card p {
  margin: 8px 0 0;
  opacity: 0.88;
}

.stats-grid,
.chart-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

.stats-grid {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.stats-card {
  padding: 18px;
}

.stats-label {
  font-size: 12px;
  color: #64748b;
}

.stats-value {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 700;
}

.stats-value.blue { color: #2d78ff; }
.stats-value.green { color: #10b981; }
.stats-value.gold { color: #d97706; }
.stats-value.slate { color: #111827; }

.stats-desc {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.chart-grid {
  grid-template-columns: 1fr 1fr;
}

.panel-card {
  padding: 20px 24px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
}

.chart-box {
  height: 260px;
}

.chart-box.compact {
  height: 220px;
}

.chart-grid > .panel-card {
  padding: 0;
  overflow: hidden;
}

.chart-grid > .panel-card .panel-title {
  margin: 0;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  font-weight: 600;
}

.chart-grid > .panel-card .chart-box {
  height: 220px;
  margin: 12px 18px 4px;
}

.chart-grid > .panel-card .chart-box.compact {
  height: 180px;
  margin: 10px 14px 0;
}

.chart-grid > .panel-card .method-list {
  padding: 0 14px 12px;
  margin-top: 4px;
}

.method-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.method-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f8fafc;
  font-size: 12px;
}

.method-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.method-label,
.method-percent,
.table-footer {
  color: #64748b;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.filter-item-grow {
  flex: 1;
  min-width: 220px;
}

.table-footer {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.location-text {
  display: inline-block;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #eef2f7;
}

.rank-item:last-child {
  border-bottom: 0;
}

.rank-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.rank-name {
  flex: 1;
  font-weight: 600;
}

.rank-name.small {
  font-size: 13px;
  font-weight: 500;
}

.rank-bar-wrap {
  flex: 1;
  max-width: 180px;
}

.rank-bar {
  display: block;
  height: 6px;
  border-radius: 999px;
  background: rgba(45, 120, 255, 0.12);
  overflow: hidden;
}

.rank-bar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #2d78ff 0%, #7c3aed 100%);
}

.rank-count {
  color: #2d78ff;
  font-weight: 700;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
