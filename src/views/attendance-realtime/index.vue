<template>
  <a-card :bordered="false" class="attendance-realtime-page">
    <div class="page-title-row">
      <div>
        <h2>考勤实时计算监控</h2>
        <div class="page-subtitle">查看打卡排队、异步计算、失败重试和灰度运行状态</div>
      </div>
      <div>
        <a-button icon="experiment" @click="$router.push('/attendance/rule-match')">规则匹配验证</a-button>
        <a-button icon="reload" @click="refreshAll">刷新</a-button>
        <a-button
          icon="bar-chart"
          style="margin-left: 8px"
          :loading="metricsResetting"
          @click="resetMetrics(false)">重置P95</a-button>
        <a-button
          :type="overview.workerEnabled ? 'default' : 'primary'"
          style="margin-left: 8px"
          :loading="runtimeSaving"
          @click="toggleWorkerEnabled">
          {{ overview.workerEnabled ? '停用Worker' : '启用Worker' }}
        </a-button>
        <a-button
          v-if="queueBlockedMessage"
          type="primary"
          style="margin-left: 8px"
          :loading="runtimeSaving"
          @click="startConsuming">
          开始消费
        </a-button>
        <a-button
          :type="overview.paused ? 'primary' : 'danger'"
          style="margin-left: 8px"
          @click="togglePaused">
          {{ overview.paused ? '恢复计算' : '暂停计算' }}
        </a-button>
      </div>
    </div>

    <a-row :gutter="16" class="stats-row">
      <a-col v-for="item in statCards" :key="item.key" :xl="4" :md="8" :sm="12">
        <a-card size="small" class="stat-card">
          <div class="stat-label">{{ item.label }}</div>
          <div :class="['stat-value', item.theme]">{{ item.value }}</div>
          <div class="stat-desc">{{ item.desc }}</div>
        </a-card>
      </a-col>
    </a-row>

    <div class="runtime-panel">
      <span>Worker：<a-tag :color="workerState.color">{{ workerState.text }}</a-tag></span>
      <span>运行状态：<a-tag :color="runtimeState.color">{{ runtimeState.text }}</a-tag></span>
      <span>线程数：{{ overview.workerCount || 0 }}</span>
      <span>灰度比例：</span>
      <a-slider
        class="gray-slider"
        :min="0"
        :max="100"
        :step="5"
        v-model="grayPercent" />
      <a-button
        size="small"
        type="primary"
        :loading="runtimeSaving"
        @click="saveGrayPercent">保存 {{ grayPercent }}%</a-button>
    </div>

    <a-alert
      v-if="queueBlockedMessage"
      class="queue-alert"
      type="warning"
      showIcon
      :message="queueBlockedMessage"
      :description="queueBlockedDescription" />

    <div v-if="errorStats.length > 0" class="error-stats-panel">
      <span class="error-stats-title">失败原因：</span>
      <a-tag
        v-for="item in errorStats"
        :key="`${item.errorCode}-${item.status}`"
        :color="item.status === 'DEAD' ? 'red' : 'orange'">
        {{ item.errorCode || 'UNKNOWN' }} / {{ statusText[item.status] || item.status }}：{{ item.count }}
      </a-tag>
    </div>

    <div v-if="stageBreakdown.length > 0" class="stage-stats-panel">
      <span class="error-stats-title">单任务阶段 P95：</span>
      <a-tag v-for="item in stageBreakdown" :key="item.stage" color="blue">
        {{ item.stage }} {{ item.value }}ms
      </a-tag>
    </div>

    <div class="table-page-search-wrapper realtime-search-wrapper">
      <a-form class="realtime-search-form" layout="inline" @keyup.enter.native="searchQuery">
        <a-form-item class="employee-search-item" label="工号">
          <a-input v-model="queryParam.employeeNo" allowClear placeholder="请输入工号" />
        </a-form-item>
        <a-form-item label="考勤日期">
          <a-range-picker
            class="query-date-range"
            v-model="queryDateRange"
            valueFormat="YYYY-MM-DD"
            :placeholder="['开始日期', '结束日期']"
          />
        </a-form-item>
        <a-form-item label="任务状态">
          <a-select v-model="queryParam.status" allowClear placeholder="全部状态" style="width: 150px">
            <a-select-option v-for="status in statuses" :key="status" :value="status">{{ statusText[status] }}</a-select-option>
          </a-select>
        </a-form-item>
        <span class="table-page-search-submitButtons realtime-search-buttons">
          <a-button type="primary" icon="search" @click="searchQuery">查询</a-button>
          <a-button icon="reload" style="margin-left: 8px" @click="searchReset">重置</a-button>
        </span>
      </a-form>
    </div>

    <div class="table-operator">
      <span class="test-range-label">补投日期：</span>
      <a-range-picker
        v-model="testDateRange"
        valueFormat="YYYY-MM-DD"
        :allowClear="true"
        style="width: 250px" />
      <a-button
        icon="play-circle"
        :loading="smokeTesting"
        @click="runOnlineTest">补投测试</a-button>
      <a-button
        icon="thunderbolt"
        style="margin-left: 8px"
        :loading="loadTesting"
        @click="runHighConcurrencyTest">高并发测试</a-button>
      <a-button
        type="danger"
        icon="delete"
        style="margin-left: 8px"
        :loading="clearingBacklog"
        @click="clearBacklog">清空积压</a-button>
      <span class="test-tip">耗时为补投入队接口耗时；补投覆盖在职员工与日期组合，无打卡员工也会生成空插槽结果；高并发测试不新增打卡流水；后端保留20000组合保护</span>
      <a-button
        type="primary"
        icon="redo"
        style="margin-left: 8px"
        :disabled="selectedRowKeys.length === 0"
        @click="retrySelected">批量重试</a-button>
    </div>

    <a-table
      ref="table"
      bordered
      size="middle"
      rowKey="id"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      @change="handleTableChange">
      <template slot="status" slot-scope="text">
        <a-tag :color="statusColor[text] || 'default'">{{ statusText[text] || text }}</a-tag>
      </template>
      <template slot="error" slot-scope="text">
        <j-ellipsis :value="text || '-'" :length="40" />
      </template>
      <template slot="wait" slot-scope="text, record">
        {{ waitingText(record) }}
      </template>
      <template slot="action" slot-scope="text, record">
        <a
          v-if="record.status === 'RETRY' || record.status === 'DEAD'"
          @click="retryOne(record)">重试</a>
        <span v-else>-</span>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction, postAction, putAction } from '@/api/manage'
import JEllipsis from '@/components/jeecg/JEllipsis'

export default {
  name: 'AttendanceRealtimeMonitor',
  mixins: [JeecgListMixin],
  components: { JEllipsis },
  data() {
    return {
      overview: {},
      grayPercent: 0,
      runtimeSaving: false,
      smokeTesting: false,
      loadTesting: false,
      clearingBacklog: false,
      metricsResetting: false,
      queryDate: undefined,
      queryDateRange: [],
      testDateRange: [],
      timer: null,
      statuses: ['PENDING', 'PROCESSING', 'RETRY', 'SUCCEEDED', 'DEAD'],
      statusText: {
        PENDING: '等待中', PROCESSING: '处理中', RETRY: '待重试', SUCCEEDED: '已完成', DEAD: '已终止'
      },
      statusColor: {
        PENDING: 'blue', PROCESSING: 'cyan', RETRY: 'orange', SUCCEEDED: 'green', DEAD: 'red'
      },
      columns: [
        { title: '任务ID', dataIndex: 'id', width: 100 },
        { title: '工号', dataIndex: 'employeeNo', width: 120 },
        { title: '考勤日期', dataIndex: 'attendanceDate', width: 120 },
        { title: '状态', dataIndex: 'status', width: 100, scopedSlots: { customRender: 'status' } },
        { title: '输入版本', dataIndex: 'inputVersion', width: 90 },
        { title: '已处理版本', dataIndex: 'processedVersion', width: 100 },
        { title: '重试次数', dataIndex: 'retryCount', width: 90 },
        { title: '等待时长', dataIndex: 'firstPendingAt', width: 100, scopedSlots: { customRender: 'wait' } },
        { title: '可执行时间', dataIndex: 'availableAt', width: 180 },
        { title: '锁定实例', dataIndex: 'lockedBy', width: 160 },
        { title: '错误摘要', dataIndex: 'lastError', width: 260, scopedSlots: { customRender: 'error' } },
        { title: '更新时间', dataIndex: 'updateTime', width: 180 },
        { title: '操作', dataIndex: 'action', width: 80, fixed: 'right', scopedSlots: { customRender: 'action' } }
      ],
      url: {
        list: '/attendance/realtime/task/list',
        overview: '/attendance/realtime/overview',
        retryBatch: '/attendance/realtime/task/retryBatch',
        enqueueRange: '/attendance/realtime/task/enqueueRange',
        clearBacklog: '/attendance/realtime/task/clearBacklog',
        highConcurrency: '/attendance/realtime/test/highConcurrency',
        resetMetrics: '/attendance/realtime/metrics/reset',
        runtime: '/attendance/realtime/runtime'
      }
    }
  },
  computed: {
    workerRunning() {
      return this.overview.workerEnabled && !this.overview.paused && Number(this.overview.grayPercent) > 0
    },
    backlogCount() {
      return Number(this.overview.PENDING || 0) + Number(this.overview.RETRY || 0)
    },
    errorStats() {
      return Array.isArray(this.overview.errorStats) ? this.overview.errorStats : []
    },
    stageBreakdown() {
      const stages = this.overview.calcStageP95Ms || {}
      return Object.keys(stages).map(stage => ({
        stage,
        value: Number(stages[stage] || 0).toFixed(0)
      })).sort((a, b) => Number(b.value) - Number(a.value))
    },
    workerState() {
      if (!this.overview.workerEnabled) return { text: '未启用', color: 'red' }
      if (this.overview.paused) return { text: '已暂停', color: 'orange' }
      if (Number(this.overview.grayPercent || 0) <= 0) return { text: '灰度0%', color: 'orange' }
      return { text: '运行中', color: 'green' }
    },
    runtimeState() {
      if (!this.overview.workerEnabled) return { text: '不会消费', color: 'red' }
      if (this.overview.paused) return { text: '已暂停', color: 'orange' }
      if (Number(this.overview.grayPercent || 0) <= 0) return { text: '等待调灰度', color: 'orange' }
      return { text: '正常消费', color: 'green' }
    },
    queueBlockedMessage() {
      if (this.backlogCount <= 0) return ''
      if (!this.overview.workerEnabled) return '当前 Worker 未启用，排队任务不会被消费'
      if (this.overview.paused) return '当前已暂停计算，排队任务暂时不会被消费'
      if (Number(this.overview.grayPercent || 0) <= 0) return '当前灰度比例为 0%，Worker 不会抢占任何任务'
      return ''
    },
    queueBlockedDescription() {
      if (!this.queueBlockedMessage) return ''
      if (!this.overview.workerEnabled) return '点击“开始消费”会启用 Worker、恢复计算，并在灰度为 0 时自动调整为 100%。'
      if (this.overview.paused) return '点击“开始消费”会恢复计算；任务已经入队，不需要重新补投。'
      if (Number(this.overview.grayPercent || 0) <= 0) return '点击“开始消费”会把灰度调整为 100%；也可以手动拖动灰度比例后点击保存。'
      return ''
    },
    statCards() {
      return [
        { key: 'pending', label: '等待任务', value: this.overview.PENDING || 0, desc: '等待合并或抢占', theme: 'blue' },
        { key: 'processing', label: '处理中', value: this.overview.PROCESSING || 0, desc: 'Worker正在计算', theme: 'cyan' },
        { key: 'retry', label: '待重试', value: this.overview.RETRY || 0, desc: '等待退避重试', theme: 'orange' },
        { key: 'dead', label: '已终止', value: this.overview.DEAD || 0, desc: '需要人工处理', theme: 'red' },
        {
          key: 'p95',
          label: '链路 P95',
          value: `${Number(this.overview.endToEndP95Ms || 0).toFixed(0)}ms`,
          desc: '新任务目标≤3000ms，历史积压会抬高',
          theme: Number(this.overview.endToEndP95Ms || 0) > 3000 ? 'red' : 'green'
        },
        { key: 'oldest', label: '最老等待', value: `${this.overview.oldestWaitingSeconds || 0}s`, desc: '队列最大等待时间', theme: 'purple' }
      ]
    }
  },
  created() {
    this.loadOverview()
    this.timer = window.setInterval(this.refreshAll, 5000)
  },
  beforeDestroy() {
    if (this.timer) window.clearInterval(this.timer)
  },
  methods: {
    getQueryParams() {
      const params = { ...this.queryParam }
      if (Array.isArray(this.queryDateRange) && this.queryDateRange.length === 2
        && this.queryDateRange[0] && this.queryDateRange[1]) {
        params.attendanceDateStart = this.queryDateRange[0]
        params.attendanceDateEnd = this.queryDateRange[1]
      }
      params.pageNo = this.ipagination.current
      params.pageSize = this.ipagination.pageSize
      return params
    },
    refreshAll() {
      this.loadOverview()
      this.loadData()
    },
    loadOverview() {
      getAction(this.url.overview).then(res => {
        if (res.success) {
          this.overview = res.result || {}
          this.grayPercent = Number(this.overview.grayPercent || 0)
        }
      })
    },
    togglePaused() {
      this.updateRuntime({ paused: !this.overview.paused })
    },
    toggleWorkerEnabled() {
      this.updateRuntime({ workerEnabled: !this.overview.workerEnabled })
    },
    startConsuming() {
      const nextGrayPercent = Number(this.grayPercent || this.overview.grayPercent || 0) > 0
        ? Number(this.grayPercent || this.overview.grayPercent)
        : 100
      this.grayPercent = nextGrayPercent
      this.updateRuntime({
        workerEnabled: true,
        paused: false,
        grayPercent: nextGrayPercent
      }, `已开始消费，灰度比例 ${nextGrayPercent}%`)
    },
    saveGrayPercent() {
      this.updateRuntime({ grayPercent: this.grayPercent })
    },
    updateRuntime(payload, successMessage) {
      this.runtimeSaving = true
      putAction(this.url.runtime, payload).then(res => {
        if (res.success) {
          this.$message.success(successMessage || '运行参数已更新')
          this.overview = { ...this.overview, ...(res.result || {}) }
          this.grayPercent = Number(this.overview.grayPercent || 0)
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() => { this.runtimeSaving = false })
    },
    retryOne(record) {
      postAction(`/attendance/realtime/task/${record.id}/retry`, {}).then(res => {
        if (res.success) {
          this.$message.success('任务已重新入队')
          this.refreshAll()
        }
      })
    },
    retrySelected() {
      postAction(this.url.retryBatch, { ids: this.selectedRowKeys }).then(res => {
        if (res.success) {
          this.$message.success(`已重新入队 ${res.result || 0} 条任务`)
          this.onClearSelected()
          this.refreshAll()
        }
      })
    },
    resolveTestDateRange(requireSelected) {
      if (Array.isArray(this.testDateRange) && this.testDateRange.length === 2
        && this.testDateRange[0] && this.testDateRange[1]) {
        const startDate = this.testDateRange[0]
        const endDate = this.testDateRange[1]
        return { startDate, endDate, text: startDate === endDate ? startDate : `${startDate} 至 ${endDate}` }
      }
      if (requireSelected) {
        this.$message.warning('请先选择补投日期，再清空积压')
        return null
      }
      const day = this.queryDate || this.todayText()
      return { startDate: day, endDate: day, text: day }
    },
    runOnlineTest() {
      const dateRange = this.resolveTestDateRange()
      if (!dateRange) return
      const employeeNos = this.parseEmployeeNos(this.queryParam.employeeNo)
      const startedAt = Date.now()
      this.smokeTesting = true
      this.resetMetrics(true).then(() => postAction(this.url.enqueueRange, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        employeeNos
      })).then(res => {
        if (res.success) {
          const count = Number(res.result || 0)
          const scopeText = employeeNos.length > 0 ? `工号 ${employeeNos.join('、')}` : '全部工号'
          const durationMs = Date.now() - startedAt
          if (count > 0) {
            const workerHint = this.workerRunning ? '' : '，当前 Worker 未运行或灰度为 0，只验证到任务入队'
            this.$message.success(`补投测试完成：${dateRange.text} ${scopeText} 已生成/合并 ${count} 个任务，接口耗时 ${durationMs}ms${workerHint}`)
          } else {
            this.$message.warning(`补投测试完成：${dateRange.text} ${scopeText} 没有生成任务，接口耗时 ${durationMs}ms`)
          }
          this.queryDate = dateRange.endDate
          this.queryDateRange = [dateRange.startDate, dateRange.endDate]
          this.refreshAll()
        } else {
          this.$message.warning(res.message || '补投测试失败')
        }
      }).finally(() => { this.smokeTesting = false })
    },
    runHighConcurrencyTest() {
      const dateRange = this.resolveTestDateRange()
      if (!dateRange) return
      const employeeNos = this.parseEmployeeNos(this.queryParam.employeeNo)
      const scopeText = employeeNos.length > 0 ? `工号 ${employeeNos.join('、')}` : '全部工号'
      this.$confirm({
        title: '执行高并发测试？',
        content: `${dateRange.text} ${scopeText}：将并发触发 5000 个重算任务合并事件，并发度 100；不会新增打卡流水。`,
        onOk: () => {
          this.loadTesting = true
          return this.resetMetrics(true).then(() => postAction(this.url.highConcurrency, {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            employeeNos,
            totalEvents: 5000,
            concurrency: 100
          })).then(res => {
            if (res.success) {
              const result = res.result || {}
              this.$message.success(
                `高并发测试完成：成功 ${result.successEvents || 0}/${result.requestedEvents || 0}，` +
                `耗时 ${result.durationMs || 0}ms，入队TPS ${Number(result.enqueueTps || 0).toFixed(1)}`
              )
              this.queryDate = dateRange.endDate
              this.queryDateRange = [dateRange.startDate, dateRange.endDate]
              this.refreshAll()
            } else {
              this.$message.warning(res.message || '高并发测试失败')
            }
          }).finally(() => { this.loadTesting = false })
        }
      })
    },
    resetMetrics(silent) {
      this.metricsResetting = true
      return postAction(this.url.resetMetrics, {}).then(res => {
        if (!silent) {
          if (res.success) {
            this.$message.success('P95统计窗口已重置')
          } else {
            this.$message.warning(res.message || 'P95统计窗口重置失败')
          }
        }
        if (res.success) {
          this.overview = { ...this.overview, ingestP95Ms: 0, endToEndP95Ms: 0, calcStageP95Ms: {} }
        }
        return res
      }).finally(() => { this.metricsResetting = false })
    },
    clearBacklog() {
      const dateRange = this.resolveTestDateRange(true)
      if (!dateRange) return
      const employeeNos = this.parseEmployeeNos(this.queryParam.employeeNo)
      const scopeText = employeeNos.length > 0 ? `工号 ${employeeNos.join('、')}` : '全部工号'
      this.$confirm({
        title: '清空补投日期范围的积压任务？',
        content: `${dateRange.text} ${scopeText}：只删除 PENDING / RETRY / DEAD 任务，不删除打卡流水和考勤结果，不处理正在计算中的任务。`,
        okText: '清空积压',
        okType: 'danger',
        onOk: () => {
          this.clearingBacklog = true
          return postAction(this.url.clearBacklog, {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            employeeNos
          }).then(res => {
            if (res.success) {
              this.$message.success(`已清空积压任务 ${res.result || 0} 条`)
              this.refreshAll()
            } else {
              this.$message.warning(res.message || '清空积压失败')
            }
          }).finally(() => { this.clearingBacklog = false })
        }
      })
    },
    parseEmployeeNos(value) {
      if (!value) return []
      return String(value)
        .split(/[\s,，;；]+/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
    },
    todayText() {
      const date = new Date()
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      const day = `${date.getDate()}`.padStart(2, '0')
      return `${date.getFullYear()}-${month}-${day}`
    },
    waitingText(record) {
      if (!record.firstPendingAt || record.status === 'SUCCEEDED') return '-'
      const seconds = Math.max(0, Math.floor((Date.now() - new Date(record.firstPendingAt).getTime()) / 1000))
      if (seconds < 60) return `${seconds}s`
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
      return `${Math.floor(seconds / 3600)}h`
    },
    searchReset() {
      this.queryParam = {}
      this.queryDate = undefined
      this.queryDateRange = []
      this.loadData(1)
    }
  }
}
</script>

<style lang="less" scoped>
.attendance-realtime-page {
  height: calc(100vh - 120px - 24px);
  overflow: auto;

  .page-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  h2 { margin-bottom: 4px; }
  .page-subtitle, .stat-desc { color: #8c8c8c; }
  .stats-row { margin-bottom: 16px; }
  .stat-card { margin-bottom: 12px; }
  .stat-label { color: #595959; }
  .stat-value { margin: 8px 0; font-size: 26px; font-weight: 600; }
  .stat-value.blue { color: #1890ff; }
  .stat-value.cyan { color: #13c2c2; }
  .stat-value.orange { color: #fa8c16; }
  .stat-value.red { color: #f5222d; }
  .stat-value.green { color: #52c41a; }
  .stat-value.purple { color: #722ed1; }
  .runtime-panel { display: flex; align-items: center; gap: 16px; padding: 14px 16px; margin-bottom: 18px; background: #fafafa; border: 1px solid #f0f0f0; }
  .queue-alert { margin: -4px 0 18px; }
  .error-stats-panel { padding: 10px 12px; margin: -4px 0 18px; background: #fff7e6; border: 1px solid #ffd591; }
  .stage-stats-panel { padding: 10px 12px; margin: -4px 0 18px; background: #f0f5ff; border: 1px solid #adc6ff; }
  .error-stats-title { margin-right: 8px; color: #8c5a00; }
  .gray-slider { width: 220px; margin: 0; }
  .realtime-search-wrapper {
    margin-bottom: 8px;

    /deep/ .realtime-search-form {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
    }

    /deep/ .ant-form-item {
      flex: 0 0 auto;
      margin-right: 16px;
      margin-bottom: 12px;
    }

    /deep/ .ant-form-item-control-wrapper {
      flex: 0 0 auto;
    }

    /deep/ .employee-search-item .ant-input {
      width: 180px;
    }

    /deep/ .ant-calendar-picker {
      width: 160px;
    }

    /deep/ .query-date-range.ant-calendar-picker {
      width: 240px;
    }

    .realtime-search-buttons {
      display: inline-flex;
      align-items: center;
      margin-bottom: 12px;
      white-space: nowrap;
    }
  }
  .test-range-label { margin-left: 8px; color: #595959; }
  .test-tip { margin-left: 10px; color: #8c8c8c; }
}
</style>
