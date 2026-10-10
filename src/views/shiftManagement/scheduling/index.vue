<template>
  <div class="scheduling-page">
    <div class="schedule-header">
      <div class="schedule-title">班次与排班管理</div>
      <div class="schedule-header-actions">
        <a-input
          v-model="queryParam.employeeName"
          class="employee-search"
          placeholder="搜索员工..."
          allowClear
          @pressEnter="searchQuery">
          <a-icon slot="prefix" type="search" />
        </a-input>
        <a-button class="icon-button" icon="bell" @click="handleNotice" />
        <a-button class="icon-button" icon="reload" @click="refreshPageData" />
      </div>
    </div>

    <div class="schedule-stat-grid">
      <div
        v-for="item in scheduleStats"
        :key="item.key"
        class="schedule-stat-card">
        <div>
          <div class="schedule-stat-label">{{ item.label }}</div>
          <div class="schedule-stat-value">{{ item.value }}</div>
          <div :class="['schedule-stat-trend', item.theme]">
            <a-icon :type="item.trendIcon" />
            {{ item.trend }}
          </div>
        </div>
        <div :class="['schedule-stat-icon', item.theme]">
          <a-icon :type="item.icon" />
        </div>
      </div>
    </div>

    <div class="schedule-filter-panel">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <div class="schedule-filter-inner">
          <div class="schedule-filter-left">
            <a-icon class="filter-prefix-icon" type="bank" />
            <a-select
              v-model="queryParam.departId"
              class="department-select"
              placeholder="全部部门"
              allowClear
              @change="searchQuery">
              <a-select-option
                v-for="item in mockDepartOptions"
                :key="item.value"
                :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </div>
          <div class="schedule-filter-right">
            <span class="filter-label">排班类型</span>
            <a-select
              v-model="queryParam.shiftType"
              class="shift-type-select"
              placeholder="全部"
              allowClear
              @change="searchQuery">
              <a-select-option value="morning">早班</a-select-option>
              <a-select-option value="middle">中班</a-select-option>
              <a-select-option value="night">晚班</a-select-option>
              <a-select-option value="rest">休息</a-select-option>
            </a-select>
            <a-button type="primary" icon="database" @click="handleBatchSchedule">批量排班</a-button>
            <span class="filter-divider"></span>
            <span class="notice-toggle">
              <a-icon type="message" />
              企微通知
              <a-switch v-model="noticeEnabled" size="small" />
            </span>
          </div>
        </div>
      </a-form>
    </div>

    <div class="schedule-calendar-panel">
      <div class="schedule-month-toolbar">
        <div class="month-control">
          <a-button class="month-arrow" icon="left" @click="changeWeek(-1)" />
          <div class="month-title">{{ currentMonthLabel }}</div>
          <a-button class="month-arrow" icon="right" @click="changeWeek(1)" />
          <a-button class="back-current-button" type="primary" size="small" @click="backToCurrentMonth">回到本月</a-button>
        </div>
        <div class="shift-legend">
          <span
            v-for="item in legendItems"
            :key="item.type"
            class="legend-item">
            <i :class="['legend-dot', item.type]"></i>
            {{ item.label }}
          </span>
        </div>
      </div>

      <a-table
        ref="table"
        size="middle"
        rowKey="id"
        :columns="scheduleColumns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        class="schedule-table j-table-force-nowrap"
        @change="handleTableChange">
        <template slot="employeeName" slot-scope="text, record">
          <span class="employee-name">{{ record.name }}</span>
        </template>
        <template slot="day0" slot-scope="text, record">
          <button type="button" :class="['shift-cell', getShiftType(record, weekDays[0].dateKey)]" @click="openShiftEditor(record, weekDays[0])">{{ getShiftText(record, weekDays[0].dateKey) }}</button>
        </template>
        <template slot="day1" slot-scope="text, record">
          <button type="button" :class="['shift-cell', getShiftType(record, weekDays[1].dateKey)]" @click="openShiftEditor(record, weekDays[1])">{{ getShiftText(record, weekDays[1].dateKey) }}</button>
        </template>
        <template slot="day2" slot-scope="text, record">
          <button type="button" :class="['shift-cell', getShiftType(record, weekDays[2].dateKey)]" @click="openShiftEditor(record, weekDays[2])">{{ getShiftText(record, weekDays[2].dateKey) }}</button>
        </template>
        <template slot="day3" slot-scope="text, record">
          <button type="button" :class="['shift-cell', getShiftType(record, weekDays[3].dateKey)]" @click="openShiftEditor(record, weekDays[3])">{{ getShiftText(record, weekDays[3].dateKey) }}</button>
        </template>
        <template slot="day4" slot-scope="text, record">
          <button type="button" :class="['shift-cell', getShiftType(record, weekDays[4].dateKey)]" @click="openShiftEditor(record, weekDays[4])">{{ getShiftText(record, weekDays[4].dateKey) }}</button>
        </template>
        <template slot="day5" slot-scope="text, record">
          <button type="button" :class="['shift-cell', getShiftType(record, weekDays[5].dateKey)]" @click="openShiftEditor(record, weekDays[5])">{{ getShiftText(record, weekDays[5].dateKey) }}</button>
        </template>
        <template slot="day6" slot-scope="text, record">
          <button type="button" :class="['shift-cell', getShiftType(record, weekDays[6].dateKey)]" @click="openShiftEditor(record, weekDays[6])">{{ getShiftText(record, weekDays[6].dateKey) }}</button>
        </template>
      </a-table>
    </div>

    <a-modal
      title="编辑员工班次"
      :visible="shiftEditVisible"
      :confirmLoading="shiftEditSaving"
      okText="保存"
      cancelText="取消"
      @ok="saveShiftEdit"
      @cancel="closeShiftEdit">
      <a-descriptions :column="1" bordered size="small">
        <a-descriptions-item label="员工">{{ shiftEditForm.employeeName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="工号">{{ shiftEditForm.employeeNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="部门">{{ shiftEditForm.departmentName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="日期">{{ shiftEditForm.dateLabel || '-' }}</a-descriptions-item>
      </a-descriptions>
      <a-form class="shift-edit-form" layout="vertical">
        <a-form-item label="班次">
          <a-select v-model="shiftEditForm.shiftType" placeholder="请选择班次">
            <a-select-option
              v-for="item in shiftOptions"
              :key="item.value"
              :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

const shiftMeta = {
  morning: { text: '早班', label: '早班 (08:00-16:00)' },
  middle: { text: '中班', label: '中班 (16:00-00:00)' },
  night: { text: '晚班', label: '晚班 (00:00-08:00)' },
  rest: { text: '休', label: '休息' }
}

const baseWeekPattern = [
  ['morning', 'morning', 'rest', 'middle', 'middle', 'night', 'rest'],
  ['middle', 'middle', 'morning', 'rest', 'rest', 'morning', 'morning'],
  ['rest', 'night', 'night', 'night', 'morning', 'middle', 'rest'],
  ['morning', 'morning', 'morning', 'middle', 'rest', 'rest', 'night'],
  ['middle', 'rest', 'middle', 'morning', 'morning', 'night', 'rest'],
  ['night', 'night', 'rest', 'rest', 'middle', 'middle', 'morning']
]

const baseEmployees = [
  { name: '张三', employeeNo: 'EMP001', departId: 'production', departmentName: '生产部' },
  { name: '李四', employeeNo: 'EMP002', departId: 'quality', departmentName: '质检部' },
  { name: '王五', employeeNo: 'EMP003', departId: 'warehouse', departmentName: '仓储部' },
  { name: '赵六', employeeNo: 'EMP004', departId: 'equipment', departmentName: '设备部' },
  { name: '钱七', employeeNo: 'EMP005', departId: 'production', departmentName: '生产部' },
  { name: '孙八', employeeNo: 'EMP006', departId: 'quality', departmentName: '质检部' },
  { name: '周九', employeeNo: 'EMP007', departId: 'warehouse', departmentName: '仓储部' },
  { name: '吴十', employeeNo: 'EMP008', departId: 'equipment', departmentName: '设备部' }
]

const weekStartDate = new Date(2026, 4, 19)

function padDate (value) {
  return value < 10 ? '0' + value : String(value)
}

function formatDateKey (date) {
  return date.getFullYear() + '-' + padDate(date.getMonth() + 1) + '-' + padDate(date.getDate())
}

function addDays (date, amount) {
  const next = new Date(date.getTime())
  next.setDate(next.getDate() + amount)
  return next
}

function addMonths (date, amount) {
  const next = new Date(date.getTime())
  next.setMonth(next.getMonth() + amount)
  return next
}

function buildScheduleByPattern (pattern, offset) {
  const schedule = {}
  for (let weekIndex = -10; weekIndex <= 10; weekIndex++) {
    const start = addDays(weekStartDate, weekIndex * 7)
    pattern.forEach((shiftType, dayIndex) => {
      const dateKey = formatDateKey(addDays(start, dayIndex))
      const shiftedIndex = (dayIndex + offset + Math.abs(weekIndex)) % pattern.length
      schedule[dateKey] = pattern[shiftedIndex]
    })
  }
  return schedule
}

function buildMockScheduleRecords () {
  const list = []
  for (let index = 0; index < 48; index++) {
    const employee = baseEmployees[index % baseEmployees.length]
    const group = Math.floor(index / baseEmployees.length)
    const pattern = baseWeekPattern[index % baseWeekPattern.length]
    list.push(Object.assign({}, employee, {
      id: String(index + 1),
      name: group === 0 ? employee.name : employee.name + (group + 1),
      employeeNo: index < baseEmployees.length ? employee.employeeNo : 'EMP' + ('000' + (index + 1)).slice(-3),
      schedule: buildScheduleByPattern(pattern, group)
    }))
  }
  return list
}

export default {
  name: 'ShiftScheduling',
  mixins: [JeecgListMixin, mixinDevice],
  data () {
    return {
      disableMixinCreated: true,
      description: '班次与排班管理页面',
      currentWeekStart: new Date(weekStartDate.getTime()),
      noticeEnabled: true,
      shiftEditVisible: false,
      shiftEditSaving: false,
      shiftEditForm: {
        employeeId: '',
        employeeName: '',
        employeeNo: '',
        departmentName: '',
        dateKey: '',
        dateLabel: '',
        shiftType: ''
      },
      mockScheduleRecords: buildMockScheduleRecords(),
      mockDepartOptions: [
        { value: 'production', label: '生产部' },
        { value: 'quality', label: '质检部' },
        { value: 'warehouse', label: '仓储部' },
        { value: 'equipment', label: '设备部' }
      ],
      scheduleStats: [
        { key: 'total', label: '当月排班总人次', value: 452, trend: '较上月 +12.3%', trendIcon: 'rise', icon: 'team', theme: 'blue' },
        { key: 'temporary', label: '临时排班人次', value: 86, trend: '占比 19.0%', trendIcon: 'line-chart', icon: 'clock-circle', theme: 'orange' },
        { key: 'permanent', label: '永久班次人次', value: 366, trend: '占比 81.0%', trendIcon: 'line-chart', icon: 'deployment-unit', theme: 'green' },
        { key: 'pending', label: '待通知确认', value: 12, trend: '待发送企微通知', trendIcon: 'exclamation-circle', icon: 'message', theme: 'red' }
      ],
      legendItems: [
        { type: 'morning', label: shiftMeta.morning.label },
        { type: 'middle', label: shiftMeta.middle.label },
        { type: 'night', label: shiftMeta.night.label },
        { type: 'rest', label: shiftMeta.rest.label }
      ],
      shiftOptions: [
        { value: 'morning', label: shiftMeta.morning.label },
        { value: 'middle', label: shiftMeta.middle.label },
        { value: 'night', label: shiftMeta.night.label },
        { value: 'rest', label: shiftMeta.rest.label }
      ],
      url: {
        list: '/shiftManagement/scheduling/list',
        exportXlsUrl: '/shiftManagement/scheduling/exportXls'
      },
      dictOptions: {},
      superFieldList: []
    }
  },
  computed: {
    currentMonthLabel () {
      return this.currentWeekStart.getFullYear() + '年 ' + (this.currentWeekStart.getMonth() + 1) + '月'
    },
    weekDays () {
      const weekText = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      return weekText.map((label, index) => {
        const date = addDays(this.currentWeekStart, index)
        return {
          label: label + ' (' + date.getDate() + ')',
          dateKey: formatDateKey(date)
        }
      })
    },
    scheduleColumns () {
      const dayColumns = this.weekDays.map((item, index) => ({
        title: item.label,
        align: 'center',
        dataIndex: 'day' + index,
        width: 168,
        scopedSlots: { customRender: 'day' + index }
      }))
      return [
        {
          title: '员工姓名',
          align: 'center',
          dataIndex: 'name',
          width: 130,
          scopedSlots: { customRender: 'employeeName' }
        },
        ...dayColumns
      ]
    }
  },
  created () {
    this.ipagination.pageSize = 6
    this.ipagination.pageSizeOptions = ['6', '12', '24', '48']
    this.ipagination.showQuickJumper = true
    this.ipagination.showSizeChanger = true
    this.ipagination.showTotal = function (total, range) {
      return '共 ' + total + ' 条记录，当前显示 ' + range[0] + '-' + range[1] + ' 条'
    }
    this.getSuperFieldList()
    this.loadData(1)
    this.initDictConfig()
  },
  methods: {
    initDictConfig () {
    },
    getSuperFieldList () {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'employeeName', text: '员工姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'employeeNo', text: '工号', dictCode: '' })
      fieldList.push({ type: 'sel_depart', value: 'departId', text: '部门' })
      fieldList.push({ type: 'string', value: 'shiftType', text: '排班类型', dictCode: '' })
      this.superFieldList = fieldList
    },
    loadData (arg) {
      if (arg === 1) {
        this.ipagination.current = 1
      }
      this.loading = true
      const pageSize = this.ipagination.pageSize || 6
      const filteredList = this.getMockFilteredList()
      const totalPage = Math.ceil(filteredList.length / pageSize) || 1
      if (this.ipagination.current > totalPage) {
        this.ipagination.current = totalPage
      }
      const start = (this.ipagination.current - 1) * pageSize
      this.dataSource = filteredList.slice(start, start + pageSize)
      this.ipagination.total = filteredList.length
      this.loading = false
    },
    getMockFilteredList () {
      const params = this.queryParam || {}
      const keyword = (params.employeeName || '').trim().toLowerCase()
      return this.mockScheduleRecords.filter(item => {
        const keywordMatched = !keyword ||
          item.name.toLowerCase().indexOf(keyword) > -1 ||
          item.employeeNo.toLowerCase().indexOf(keyword) > -1
        const departMatched = !params.departId || item.departId === params.departId
        const shiftMatched = !params.shiftType || this.weekDays.some(day => item.schedule[day.dateKey] === params.shiftType)
        return keywordMatched && departMatched && shiftMatched
      })
    },
    refreshPageData () {
      this.onClearSelected()
      this.loadData(1)
    },
    handleNotice () {
      this.$message.info('当前有 12 条排班待通知确认')
    },
    handleBatchSchedule () {
      this.$message.success('已生成本周批量排班预案')
    },
    changeWeek (step) {
      this.currentWeekStart = addDays(this.currentWeekStart, step * 7)
      this.loadData(1)
    },
    backToCurrentMonth () {
      this.currentWeekStart = new Date(weekStartDate.getTime())
      this.loadData(1)
    },
    changeMonth (step) {
      this.currentWeekStart = addMonths(this.currentWeekStart, step)
      this.loadData(1)
    },
    getShiftType (record, dateKey) {
      return (record.schedule && record.schedule[dateKey]) || 'rest'
    },
    getShiftText (record, dateKey) {
      const type = this.getShiftType(record, dateKey)
      return (shiftMeta[type] && shiftMeta[type].text) || '-'
    },
    openShiftEditor (record, day) {
      this.shiftEditForm = {
        employeeId: record.id,
        employeeName: record.name,
        employeeNo: record.employeeNo,
        departmentName: record.departmentName,
        dateKey: day.dateKey,
        dateLabel: day.label + ' ' + day.dateKey,
        shiftType: this.getShiftType(record, day.dateKey)
      }
      this.shiftEditVisible = true
    },
    closeShiftEdit () {
      this.shiftEditVisible = false
      this.shiftEditSaving = false
    },
    saveShiftEdit () {
      if (!this.shiftEditForm.employeeId || !this.shiftEditForm.dateKey || !this.shiftEditForm.shiftType) {
        this.$message.warning('请选择要保存的班次')
        return
      }
      const record = this.mockScheduleRecords.find(item => item.id === this.shiftEditForm.employeeId)
      if (!record) {
        this.$message.warning('未找到员工排班数据')
        return
      }
      this.shiftEditSaving = true
      this.$set(record.schedule, this.shiftEditForm.dateKey, this.shiftEditForm.shiftType)
      this.loadData()
      this.shiftEditSaving = false
      this.shiftEditVisible = false
      this.$message.success('员工班次已更新')
    }
  }
}
</script>

<style scoped lang="less">
@import '~@assets/less/common.less';

.scheduling-page {
  height: calc(100vh - 120px - 24px);
  padding: 24px;
  // padding-top: 0;
  background: #f3f7fc;
overflow: auto;
}

.schedule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  padding: 0 32px;
  background: #fff;
  border: 1px solid #e6edf6;
}

.schedule-title {
  color: #172338;
  font-size: 18px;
  font-weight: 700;
}

.schedule-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-search {
  width: 220px;
}

.icon-button {
  width: 34px;
  height: 34px;
  color: #5d7190;
  border-color: #d8e2ef;
}

.schedule-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.schedule-stat-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 112px;
  padding: 16px 22px 12px;
  background: #fff;
  border: 1px solid #dce6f1;
  border-radius: 8px;
}

.schedule-stat-label {
  color: #8ba0bc;
  font-size: 13px;
  font-weight: 700;
  line-height: 20px;
}

.schedule-stat-value {
  margin-top: 12px;
  color: #1b2840;
  font-size: 24px;
  font-weight: 700;
  line-height: 30px;
}

.schedule-stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 12px;
  line-height: 18px;
}

.schedule-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  font-size: 18px;
}

.blue {
  color: #4f5cf7;
}

.green {
  color: #16b364;
}

.orange {
  color: #f79009;
}

.red {
  color: #f43f5e;
}

.schedule-stat-icon.blue {
  background: #eef0ff;
}

.schedule-stat-icon.green {
  background: #dcf8e7;
}

.schedule-stat-icon.orange {
  background: #fff2bf;
}

.schedule-stat-icon.red {
  background: #ffe1e9;
}

.schedule-filter-panel,
.schedule-calendar-panel {
  margin-top: 12px;
  background: #fff;
  border: 1px solid #dce6f1;
  border-radius: 8px;
}

.schedule-filter-panel {
  padding: 10px 18px;
}

.schedule-filter-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.schedule-filter-left,
.schedule-filter-right,
.notice-toggle,
.month-control,
.shift-legend,
.legend-item {
  display: flex;
  align-items: center;
}

.schedule-filter-left {
  gap: 12px;
}

.schedule-filter-right {
  gap: 12px;
}

.filter-prefix-icon {
  color: #7d91ad;
  font-size: 16px;
}

.department-select {
  width: 112px;
}

.shift-type-select {
  width: 112px;
}

.filter-label {
  color: #8294ad;
  font-size: 13px;
}

.filter-divider {
  width: 1px;
  height: 20px;
  background: #e3ebf5;
}

.notice-toggle {
  gap: 8px;
  color: #5f738f;
  font-size: 13px;
  white-space: nowrap;
}

.notice-toggle .anticon {
  color: #13c27a;
}

.schedule-month-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  padding: 8px 16px;
  border-bottom: 1px solid #e2eaf4;
}

.month-control {
  gap: 16px;
}

.month-arrow {
  width: 34px;
  height: 34px;
  color: #172338;
  border-color: #d8e2ef;
}

.month-title {
  min-width: 100px;
  color: #172338;
  font-size: 19px;
  font-weight: 700;
}

.back-current-button {
  height: 28px;
  padding: 0 10px;
  font-weight: 700;
  background: #4f74ff;
  border-color: #4f74ff;
}

.shift-legend {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 18px;
}

.legend-item {
  gap: 6px;
  color: #536880;
  font-size: 13px;
  white-space: nowrap;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-dot.morning {
  background: #d8eaff;
  border: 1px solid #a9cdfd;
}

.legend-dot.middle {
  background: #eadcff;
  border: 1px solid #d6bdf7;
}

.legend-dot.night {
  background: #ffe8c9;
  border: 1px solid #ffc37d;
}

.legend-dot.rest {
  background: #edf2f7;
  border: 1px solid #d9e1ec;
}

.employee-name {
  color: #172338;
  font-weight: 700;
}

.shift-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 140px;
  height: 28px;
  padding: 0 8px;
  border-radius: 7px;
  outline: none;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.shift-cell:hover,
.shift-cell:focus {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.16);
  transform: translateY(-1px);
}

.shift-cell.morning {
  color: #2666c9;
  background: #d8eaff;
  border: 1px solid #a9cdfd;
}

.shift-cell.middle {
  color: #6b2fc7;
  background: #eadcff;
  border: 1px solid #d6bdf7;
}

.shift-cell.night {
  color: #a24a08;
  background: #ffe8c9;
  border: 1px solid #ffc37d;
}

.shift-cell.rest {
  color: #5f738f;
  background: #edf2f7;
  border: 1px solid #d9e1ec;
}

/deep/ .schedule-table .ant-table {
  border-radius: 0 0 8px 8px;
}

/deep/ .schedule-table .ant-table-thead > tr > th {
  height: 42px;
  padding: 10px 8px;
  color: #617592;
  font-weight: 700;
  background: #f7faff;
  border-right: 1px solid #e2eaf4;
  border-bottom: 1px solid #e2eaf4;
}

/deep/ .schedule-table .ant-table-tbody > tr > td {
  height: 44px;
  padding: 8px;
  color: #26374d;
  border-right: 1px solid #e2eaf4;
  border-bottom: 1px solid #edf2f7;
}

/deep/ .schedule-table .ant-table-tbody > tr:hover > td {
  background: #fbfdff;
}

/deep/ .schedule-table .ant-table-pagination.ant-pagination {
  margin: 10px 24px;
}

/deep/ .schedule-filter-panel .ant-form-item {
  margin-bottom: 0;
}

.shift-edit-form {
  margin-top: 18px;
}

@media (max-width: 1300px) {
  .schedule-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .schedule-filter-inner,
  .schedule-month-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .schedule-filter-right {
    flex-wrap: wrap;
  }

  .shift-legend {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .schedule-header,
  .schedule-header-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .schedule-header {
    gap: 14px;
    padding: 16px;
  }

  .employee-search,
  .department-select,
  .shift-type-select {
    width: 100%;
  }

  .schedule-stat-grid {
    grid-template-columns: 1fr;
  }

  .schedule-filter-left,
  .schedule-filter-right,
  .month-control {
    align-items: stretch;
    flex-direction: column;
    width: 100%;
  }

  .month-title {
    min-width: 0;
  }
}
</style>
