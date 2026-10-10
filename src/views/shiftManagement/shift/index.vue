<template>
  <div class="shift-page">
    <div class="shift-header">
      <div>
        <div class="shift-title">班次规则配置</div>
        <div class="shift-subtitle">管理白班、中班、夜班等班次信息，支持多时段配置和自动加班。</div>
      </div>
      <div class="shift-header-actions">
        <a-button class="header-icon-button" icon="bell" @click="handleNotice" />
        <a-button type="primary" class="primary-gradient-btn" @click="handleSaveConfig">保存配置</a-button>
      </div>
    </div>

    <div class="shift-top-grid">
      <div class="panel-card shift-config-card">
        <div class="panel-title">
          <a-icon type="setting" />
          <span>排班模式配置</span>
        </div>
        <a-form-model
          :model="configForm"
          layout="vertical"
          class="shift-config-form">
          <a-row :gutter="16">
            <a-col :xl="12" :lg="12" :md="24">
              <a-form-model-item label="排班周期">
                <a-select v-model="configForm.scheduleCycle">
                  <a-select-option
                    v-for="item in scheduleCycleOptions"
                    :key="item.value"
                    :value="item.value">
                    {{ item.label }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :xl="12" :lg="12" :md="24">
              <a-form-model-item label="排班负责人">
                <a-select v-model="configForm.scheduleOwner">
                  <a-select-option
                    v-for="item in scheduleOwnerOptions"
                    :key="item.value"
                    :value="item.value">
                    {{ item.label }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
          </a-row>
          <div class="config-switch-grid">
            <div
              v-for="item in configSwitchList"
              :key="item.key"
              class="config-switch-item">
              <div>
                <div class="config-switch-title">{{ item.label }}</div>
                <div class="config-switch-desc">{{ item.desc }}</div>
              </div>
              <a-switch v-model="configForm[item.key]" />
            </div>
          </div>
        </a-form-model>
      </div>

      <div class="panel-card shift-tips-card">
        <div class="panel-title">
          <a-icon type="info-circle" />
          <span>排班规则说明</span>
        </div>
        <div class="rule-list">
          <div
            v-for="item in ruleTips"
            :key="item.text"
            class="rule-item">
            <a-icon :type="item.icon" :class="item.theme" />
            <span>{{ item.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-card shift-table-card">
      <div class="shift-table-header">
        <div>
          <div class="panel-title">
            <a-icon type="calendar" />
            <span>班次管理</span>
          </div>
          <div class="table-subtitle">支持新增、编辑、复制和删除班次，时段信息会在班次弹窗中统一维护。</div>
        </div>
        <a-button type="primary" class="primary-gradient-btn add-shift-btn" icon="plus" @click="handleAdd">新增班次</a-button>
      </div>

      <a-table
        ref="table"
        size="middle"
        rowKey="id"
        class="shift-table"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange">
        <template slot="shiftName" slot-scope="text, record">
          <div class="shift-name-cell">
            <span :class="['shift-avatar', record.theme]">{{ getShiftAvatar(record.name) }}</span>
            <span class="shift-name-text">{{ record.name }}</span>
          </div>
        </template>
        <template slot="shiftType" slot-scope="text, record">
          <span class="table-tag type-tag">{{ getShiftTypeLabel(record.shiftType) }}</span>
        </template>
        <template slot="timeRange" slot-scope="text, record">
          <div class="time-cell">
            <div class="time-main">{{ getPeriodText(record.periods) }}</div>
            <div class="time-sub">{{ getBreakText(record.periods) }}</div>
          </div>
        </template>
        <template slot="standardHours" slot-scope="text, record">
          <span class="hours-text">{{ formatHours(record.standardHours) }}</span>
        </template>
        <template slot="overtimeHours" slot-scope="text, record">
          <span class="hours-text">{{ formatOptionalHours(record.overtimeHours) }}</span>
        </template>
        <template slot="termType" slot-scope="text, record">
          <span class="table-tag term-tag">{{ getTermTypeLabel(record.termType) }}</span>
        </template>
        <template slot="status" slot-scope="text, record">
          <span :class="['table-tag', 'status-tag', record.enabled ? 'enabled' : 'disabled']">
            {{ record.enabled ? '启用' : '停用' }}
          </span>
        </template>
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleCopy(record)">复制</a>
          <a-divider type="vertical" />
          <a-popconfirm title="确认删除该班次吗？" @confirm="handleDelete(record)">
            <a class="danger-link">删除</a>
          </a-popconfirm>
        </span>
      </a-table>

      <div class="shift-table-footer">
        <div class="footer-count">共 {{ mockShiftRecords.length }} 个班次</div>
        <div class="footer-actions">
          <a-button class="ghost-action-button" @click="handleExport">导出班次</a-button>
          <a-button class="ghost-action-button" @click="handleImport">批量导入</a-button>
        </div>
      </div>
    </div>

    <shift-modal ref="modalForm" @ok="modalFormOk" />
  </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import ShiftModal from './modules/ShiftModal.vue'

const scheduleCycleOptions = [
  { value: 'weekly', label: '每周排班' },
  { value: 'monthly', label: '每月排班' },
  { value: 'custom', label: '自定义周期' }
]

const scheduleOwnerOptions = [
  { value: 'manager', label: '部门主管' },
  { value: 'hr', label: 'HR 考勤专员' },
  { value: 'system', label: '系统自动排班' }
]

const shiftTypeOptions = [
  { value: 'fixed', label: '固定班次' },
  { value: 'flexible', label: '弹性班次' },
  { value: 'rotation', label: '轮换班次' }
]

const termTypeOptions = [
  { value: 'fixed', label: '固定期限' },
  { value: 'unlimited', label: '无固定期限' }
]

const ruleTips = [
  { icon: 'check-circle', theme: 'success-icon', text: '自动排班开启后，系统将根据班次规则自动生成排班计划。' },
  { icon: 'check-circle', theme: 'success-icon', text: '主管调班适用于班次生效后的临时调整，建议保留审批确认。' },
  { icon: 'exclamation-circle', theme: 'warning-icon', text: '员工换班申请需要双方确认，换班后原排班会自动互换。' },
  { icon: 'info-circle', theme: 'info-icon', text: '切换排班周期后，未生效的排班计划会重新生成。' }
]

const configSwitchList = [
  { key: 'autoSchedule', label: '自动排班', desc: '根据排班规则自动生成计划。' },
  { key: 'allowManualAdjust', label: '允许主管手动调班', desc: '支持主管在计划生效后做临时微调。' },
  { key: 'allowSwapRequest', label: '允许员工换班申请', desc: '员工可提交换班申请并等待审批。' }
]

function createPeriods (values) {
  return values.map(item => ({
    startTime: item.startTime,
    endTime: item.endTime,
    breakStart: item.breakStart,
    breakEnd: item.breakEnd
  }))
}

function createShiftRecords () {
  return [
    {
      id: '1',
      name: '白班',
      shiftType: 'fixed',
      termType: 'fixed',
      standardHours: 8,
      overtimeHours: 0,
      enabled: true,
      theme: 'day-theme',
      periods: createPeriods([
        { startTime: '09:00', endTime: '12:00', breakStart: '', breakEnd: '' },
        { startTime: '13:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' }
      ])
    },
    {
      id: '2',
      name: '中班',
      shiftType: 'fixed',
      termType: 'unlimited',
      standardHours: 7.5,
      overtimeHours: 0.5,
      enabled: true,
      theme: 'middle-theme',
      periods: createPeriods([
        { startTime: '13:00', endTime: '17:00', breakStart: '', breakEnd: '' },
        { startTime: '17:30', endTime: '21:00', breakStart: '17:00', breakEnd: '17:30' }
      ])
    },
    {
      id: '3',
      name: '夜班',
      shiftType: 'fixed',
      termType: 'fixed',
      standardHours: 8,
      overtimeHours: 2,
      enabled: true,
      theme: 'night-theme',
      periods: createPeriods([
        { startTime: '21:00', endTime: '23:00', breakStart: '', breakEnd: '' },
        { startTime: '23:30', endTime: '06:00', breakStart: '23:00', breakEnd: '23:30' }
      ])
    }
  ]
}

function cloneRecord (record) {
  return {
    id: record.id,
    name: record.name,
    shiftType: record.shiftType,
    termType: record.termType,
    standardHours: record.standardHours,
    overtimeHours: record.overtimeHours,
    enabled: record.enabled,
    theme: record.theme,
    periods: createPeriods(record.periods || [])
  }
}

function buildThemeByShiftType (shiftType) {
  if (shiftType === 'rotation') {
    return 'night-theme'
  }
  if (shiftType === 'flexible') {
    return 'middle-theme'
  }
  return 'day-theme'
}

export default {
  name: 'ShiftRuleConfig',
  components: {
    ShiftModal
  },
  mixins: [JeecgListMixin, mixinDevice],
  data () {
    return {
      disableMixinCreated: true,
      description: '班次规则配置页面',
      configForm: {
        scheduleCycle: 'weekly',
        scheduleOwner: 'manager',
        autoSchedule: true,
        allowManualAdjust: true,
        allowSwapRequest: false
      },
      scheduleCycleOptions,
      scheduleOwnerOptions,
      configSwitchList,
      ruleTips,
      shiftTypeOptions,
      termTypeOptions,
      mockShiftRecords: createShiftRecords(),
      columns: [
        {
          title: '班次名称',
          align: 'center',
          dataIndex: 'name',
          width: 160,
          scopedSlots: { customRender: 'shiftName' }
        },
        {
          title: '班次类型',
          align: 'center',
          dataIndex: 'shiftType',
          width: 130,
          scopedSlots: { customRender: 'shiftType' }
        },
        {
          title: '上下班时间',
          align: 'center',
          dataIndex: 'timeRange',
          width: 280,
          scopedSlots: { customRender: 'timeRange' }
        },
        {
          title: '标准工时',
          align: 'center',
          dataIndex: 'standardHours',
          width: 120,
          scopedSlots: { customRender: 'standardHours' }
        },
        {
          title: '自动加班时长',
          align: 'center',
          dataIndex: 'overtimeHours',
          width: 140,
          scopedSlots: { customRender: 'overtimeHours' }
        },
        {
          title: '期限类型',
          align: 'center',
          dataIndex: 'termType',
          width: 140,
          scopedSlots: { customRender: 'termType' }
        },
        {
          title: '状态',
          align: 'center',
          dataIndex: 'enabled',
          width: 100,
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 180,
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: '/shiftManagement/shift/list',
        delete: '/shiftManagement/shift/delete',
        deleteBatch: '/shiftManagement/shift/deleteBatch',
        exportXlsUrl: '/shiftManagement/shift/exportXls',
        importExcelUrl: '/shiftManagement/shift/importExcel'
      },
      dictOptions: {},
      superFieldList: []
    }
  },
  created () {
    this.ipagination.pageSize = 5
    this.ipagination.pageSizeOptions = ['5', '10', '20']
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
      const fieldList = []
      fieldList.push({ type: 'string', value: 'name', text: '班次名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'shiftType', text: '班次类型', dictCode: '' })
      fieldList.push({ type: 'string', value: 'termType', text: '期限类型', dictCode: '' })
      this.superFieldList = fieldList
    },
    loadData (arg) {
      if (arg === 1) {
        this.ipagination.current = 1
      }
      this.loading = true
      const pageSize = this.ipagination.pageSize || 5
      const totalPage = Math.ceil(this.mockShiftRecords.length / pageSize) || 1
      if (this.ipagination.current > totalPage) {
        this.ipagination.current = totalPage
      }
      const start = (this.ipagination.current - 1) * pageSize
      this.dataSource = this.mockShiftRecords.slice(start, start + pageSize)
      this.ipagination.total = this.mockShiftRecords.length
      this.loading = false
    },
    getShiftAvatar (name) {
      return name ? name.slice(0, 1) : '-'
    },
    getShiftTypeLabel (value) {
      const matched = this.shiftTypeOptions.find(item => item.value === value)
      return matched ? matched.label : '-'
    },
    getTermTypeLabel (value) {
      const matched = this.termTypeOptions.find(item => item.value === value)
      return matched ? matched.label : '-'
    },
    getPeriodText (periods) {
      if (!Array.isArray(periods) || !periods.length) {
        return '-'
      }
      return periods.map(item => item.startTime + '-' + item.endTime).join('，')
    },
    getBreakText (periods) {
      if (!Array.isArray(periods) || !periods.length) {
        return '休息：无'
      }
      const breakList = periods.filter(item => item.breakStart && item.breakEnd)
      if (!breakList.length) {
        return '休息：无'
      }
      return '休息：' + breakList.map(item => item.breakStart + '-' + item.breakEnd).join('，')
    },
    formatHours (value) {
      return Number(value || 0) + ' 小时'
    },
    formatOptionalHours (value) {
      const hours = Number(value || 0)
      return hours > 0 ? hours + ' 小时' : '—'
    },
    handleSaveConfig () {
      this.$message.success('排班配置已保存')
    },
    handleNotice () {
      this.$message.info('当前有 3 条班次配置变更待确认')
    },
    handleAdd () {
      this.$refs.modalForm.add()
    },
    handleEdit (record) {
      this.$refs.modalForm.edit(record)
    },
    handleCopy (record) {
      const nextId = String(new Date().getTime())
      const copyRecord = cloneRecord(record)
      copyRecord.id = nextId
      copyRecord.name = record.name + '-副本'
      this.mockShiftRecords.unshift(copyRecord)
      this.loadData(1)
      this.$message.success('班次复制成功')
    },
    handleDelete (record) {
      this.mockShiftRecords = this.mockShiftRecords.filter(item => item.id !== record.id)
      this.loadData()
      this.$message.warning('班次已删除')
    },
    handleExport () {
      this.$message.success('班次导出任务已创建')
    },
    handleImport () {
      this.$message.success('批量导入模板已生成')
    },
    modalFormOk (value) {
      const payload = Object.assign({}, value, {
        theme: buildThemeByShiftType(value.shiftType)
      })
      if (payload.id) {
        const targetIndex = this.mockShiftRecords.findIndex(item => item.id === payload.id)
        if (targetIndex > -1) {
          this.$set(this.mockShiftRecords, targetIndex, payload)
        }
        this.$message.success('班次已更新')
      } else {
        payload.id = String(new Date().getTime())
        this.mockShiftRecords.unshift(payload)
        this.$message.success('班次已新增')
      }
      this.loadData(1)
    }
  }
}
</script>

<style scoped lang="less">
@import '~@assets/less/common.less';

.shift-page {
  height: calc(100vh - 120px - 24px);
  padding: 24px;
  background: linear-gradient(180deg, #f4f8fd 0%, #eef4fb 100%);
  overflow: auto;
}

.shift-header,
.shift-table-header,
.shift-header-actions,
.panel-title,
.shift-name-cell,
.shift-table-footer,
.footer-actions,
.rule-item {
  display: flex;
  align-items: center;
}

.shift-header,
.panel-card {
  background: #fff;
  border: 1px solid #dce6f1;
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(31, 41, 55, 0.05);
}

.shift-header {
  justify-content: space-between;
  gap: 16px;
  min-height: 88px;
  padding: 22px 26px;
  position: relative;
  overflow: hidden;
}

.shift-header::after {
  content: '';
  position: absolute;
  right: -42px;
  top: -42px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79, 116, 255, 0.12) 0%, rgba(79, 116, 255, 0) 68%);
}

.shift-title {
  color: #1a2940;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.shift-subtitle,
.table-subtitle,
.config-switch-desc,
.footer-count {
  color: #7e91aa;
  font-size: 13px;
}

.shift-subtitle {
  margin-top: 8px;
  max-width: 640px;
  line-height: 1.75;
}

.shift-header-actions {
  gap: 12px;
  position: relative;
  z-index: 1;
}

.header-icon-button {
  width: 36px;
  height: 36px;
  color: #5d7190;
  border-color: #d8e2ef;
  background: #fff;
  border-radius: 10px;
}

.primary-gradient-btn {
  height: 38px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 10px 22px rgba(79, 116, 255, 0.22);
  background: linear-gradient(135deg, #4f74ff 0%, #315efb 100%);
}

.primary-gradient-btn:hover,
.primary-gradient-btn:focus {
  background: linear-gradient(135deg, #3f67fb 0%, #264ff0 100%);
}

.add-shift-btn {
  min-width: 108px;
}

.shift-top-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.panel-card {
  padding: 22px 24px;
}

.panel-title {
  gap: 8px;
  color: #1b2840;
  font-size: 16px;
  font-weight: 700;
}

.shift-config-form {
  margin-top: 18px;
}

.config-switch-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.config-switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 82px;
  padding: 14px 16px;
  background: #f7faff;
  border: 1px solid #e0eaf5;
  border-radius: 12px;
}

.config-switch-title {
  color: #27384f;
  font-size: 14px;
  font-weight: 700;
}

.config-switch-desc {
  margin-top: 6px;
  line-height: 20px;
}

.rule-list {
  margin-top: 18px;
}

.rule-item {
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
  color: #51657f;
  line-height: 22px;
  font-size: 13px;
}

.success-icon {
  color: #16b364;
}

.warning-icon {
  color: #f79009;
}

.info-icon {
  color: #4f74ff;
}

.shift-table-card {
  margin-top: 16px;
  padding-bottom: 0;
}

.shift-table-header {
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.shift-name-cell {
  justify-content: center;
  gap: 10px;
}

.shift-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  font-weight: 700;
}

.day-theme {
  color: #c27d0d;
  background: #fff3d8;
}

.middle-theme {
  color: #8b5cf6;
  background: #f2eaff;
}

.night-theme {
  color: #3b82f6;
  background: #e6f0ff;
}

.shift-name-text {
  color: #172338;
  font-weight: 700;
}

.table-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  padding: 2px 10px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
}

.type-tag {
  color: #355ad8;
  background: #eef3ff;
}

.term-tag {
  color: #5f738f;
  background: #eef2f7;
}

.status-tag.enabled {
  color: #17a65a;
  background: #dcf8e7;
}

.status-tag.disabled {
  color: #f04438;
  background: #ffe8e8;
}

.time-cell {
  text-align: center;
}

.time-main {
  color: #24354c;
  font-weight: 600;
  line-height: 1.5;
}

.time-sub {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
}

.hours-text {
  color: #24354c;
  font-weight: 600;
}

.danger-link {
  color: #f04438;
}

.shift-table-footer {
  justify-content: space-between;
  padding: 14px 0 18px;
}

.footer-actions {
  gap: 10px;
}

.ghost-action-button {
  border-radius: 10px;
  border-color: #d9e3ef;
  color: #4c607c;
  background: #fff;
}

.ghost-action-button:hover,
.ghost-action-button:focus {
  border-color: #9eb6d6;
  color: #315efb;
}

/deep/ .shift-config-form .ant-form-item {
  margin-bottom: 18px;
}

/deep/ .shift-config-form .ant-input,
/deep/ .shift-config-form .ant-select-selection,
/deep/ .shift-config-form .ant-input-number,
/deep/ .shift-config-form .ant-input-number-input {
  border-radius: 10px;
  border-color: #d8e3ef;
  background: #fbfdff;
}

/deep/ .shift-config-form .ant-select-selection--single {
  height: 38px;
}

/deep/ .shift-config-form .ant-select-selection__rendered {
  line-height: 36px;
}

/deep/ .shift-table .ant-table-thead > tr > th {
  color: #617592;
  font-weight: 700;
  background: #f7faff;
  border-bottom: 1px solid #dfe8f3;
  padding-top: 16px;
  padding-bottom: 16px;
}

/deep/ .shift-table .ant-table-tbody > tr > td {
  color: #26374d;
  border-bottom: 1px solid #edf2f7;
  padding-top: 16px;
  padding-bottom: 16px;
}

/deep/ .shift-table .ant-table-pagination.ant-pagination {
  margin: 14px 0 0;
}

/deep/ .shift-table .ant-table {
  border-radius: 14px;
  overflow: hidden;
}

@media (max-width: 1280px) {
  .shift-top-grid {
    grid-template-columns: 1fr;
  }

  .config-switch-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .shift-page {
    padding: 16px;
  }

  .shift-header,
  .shift-header-actions,
  .shift-table-header,
  .shift-table-footer,
  .footer-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .shift-header,
  .shift-table-header,
  .shift-table-footer {
    gap: 14px;
  }
}
</style>
