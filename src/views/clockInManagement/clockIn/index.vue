<template>
  <div class="clock-page">
    <div class="clock-header">
      <div class="clock-title">
        <span>打卡管理</span>
        <a-tag color="blue">实时</a-tag>
      </div>
      <div class="clock-header-actions">
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

    <div class="device-stat-grid">
      <div
        v-for="item in deviceStats"
        :key="item.key"
        class="device-stat-card">
        <div :class="['stat-icon', item.theme]">
          <a-icon :type="item.icon" />
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ item.label }}</div>
          <div>
            <span :class="['stat-number', item.theme]">{{ item.value }}</span>
            <span class="stat-unit">{{ item.unit }}</span>
            <span v-if="item.extra" class="stat-extra">{{ item.extra }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="attendance-stat-grid">
      <div
        v-for="item in attendanceStats"
        :key="item.key"
        class="attendance-stat-card">
        <div>
          <div class="attendance-label">{{ item.label }}</div>
          <div class="attendance-value-row">
            <span :class="['attendance-number', item.theme]">{{ item.value }}</span>
            <span class="attendance-unit">{{ item.unit }}</span>
          </div>
          <div :class="['attendance-trend', item.theme]">{{ item.trend }}</div>
        </div>
        <div :class="['attendance-icon', item.theme]">
          <a-icon :type="item.icon" />
        </div>
      </div>
    </div>

    <div class="clock-list-panel">
      <div class="table-page-search-wrapper clock-search-wrapper">
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="16" type="flex" align="middle">
            <a-col :xl="4" :lg="6" :md="8" :sm="24">
              <a-form-item label="日期">
                <j-date
                  v-model="queryParam.clockDate"
                  placeholder="请选择日期"
                  dateFormat="YYYY-MM-DD"
                  style="width: 100%" />
              </a-form-item>
            </a-col>
            <a-col :xl="4" :lg="6" :md="8" :sm="24">
              <a-form-item label="部门">
                <a-select
                  v-model="queryParam.departId"
                  placeholder="全部部门"
                  allowClear>
                  <a-select-option
                    v-for="item in mockDepartOptions"
                    :key="item.value"
                    :value="item.value">
                    {{ item.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xl="4" :lg="6" :md="8" :sm="24">
              <a-form-item label="状态">
                <a-select v-model="queryParam.status" placeholder="全部" allowClear>
                  <a-select-option value="normal">正常</a-select-option>
                  <a-select-option value="late">迟到</a-select-option>
                  <a-select-option value="miss">缺卡</a-select-option>
                  <a-select-option value="abnormal">异常</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xl="12" :lg="6" :md="24" :sm="24">
              <div class="search-actions">
                <a-button type="primary" icon="sync" @click="searchQuery">刷新数据</a-button>
                <a-button icon="download" @click="handleExportXls('打卡管理')">导出</a-button>
              </div>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <a-table
        ref="table"
        size="middle"
        rowKey="id"
        :scroll="{ x: true }"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        class="clock-table j-table-force-nowrap"
        @change="handleTableChange">
        <template slot="status" slot-scope="text, record">
          <span :class="['clock-tag', getStatusTheme(record)]">{{ getStatusText(record) }}</span>
        </template>
        <template slot="clockSource" slot-scope="text, record">
          <span class="source-cell">
            <a-icon :type="getSourceIcon(record)" />
            {{ getSourceText(record) }}
          </span>
        </template>
        <template slot="locationVerify" slot-scope="text, record">
          <span :class="['clock-tag', getVerifyTheme(record)]">{{ getVerifyText(record) }}</span>
        </template>
        <template slot="riskLevel" slot-scope="text, record">
          <span :class="['clock-tag', getRiskTheme(record)]">{{ getRiskText(record) }}</span>
        </template>
        <span slot="action" slot-scope="text, record">
          <a @click="showDetail(record)">详情</a>
        </span>
      </a-table>
    </div>

    <a-drawer
      title="打卡详情"
      width="420"
      :visible="detailVisible"
      @close="detailVisible = false">
      <a-descriptions v-if="currentRecord" :column="1" bordered size="small">
        <a-descriptions-item label="姓名">{{ currentRecord.name || '-' }}</a-descriptions-item>
        <a-descriptions-item label="工号">{{ currentRecord.employeeNo || '-' }}</a-descriptions-item>
        <a-descriptions-item label="部门">{{ currentRecord.departmentName || currentRecord.departName || '-' }}</a-descriptions-item>
        <a-descriptions-item label="上班打卡">{{ currentRecord.clockInTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="下班打卡">{{ currentRecord.clockOutTime || '-' }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{ getStatusText(currentRecord) }}</a-descriptions-item>
        <a-descriptions-item label="打卡来源">{{ getSourceText(currentRecord) }}</a-descriptions-item>
        <a-descriptions-item label="位置验证">{{ getVerifyText(currentRecord) }}</a-descriptions-item>
        <a-descriptions-item label="代打卡风险">{{ getRiskText(currentRecord) }}</a-descriptions-item>
      </a-descriptions>
    </a-drawer>
  </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'

const valueMap = {
  status: {
    '0': { text: '正常', theme: 'success' },
    '1': { text: '迟到', theme: 'warning' },
    '2': { text: '缺卡', theme: 'danger' },
    '3': { text: '异常', theme: 'danger' },
    normal: { text: '正常', theme: 'success' },
    '正常': { text: '正常', theme: 'success' },
    late: { text: '迟到', theme: 'warning' },
    '迟到': { text: '迟到', theme: 'warning' },
    miss: { text: '缺卡', theme: 'danger' },
    '缺卡': { text: '缺卡', theme: 'danger' },
    abnormal: { text: '异常', theme: 'danger' },
    '异常': { text: '异常', theme: 'danger' }
  },
  verify: {
    '0': { text: '已验证', theme: 'success' },
    '1': { text: '未验证', theme: 'warning' },
    '2': { text: '未通过', theme: 'danger' },
    verified: { text: '已验证', theme: 'success' },
    '已验证': { text: '已验证', theme: 'success' },
    unverified: { text: '未验证', theme: 'warning' },
    '未验证': { text: '未验证', theme: 'warning' },
    failed: { text: '未通过', theme: 'danger' },
    '未通过': { text: '未通过', theme: 'danger' }
  },
  risk: {
    '0': { text: '低风险', theme: 'success' },
    '1': { text: '中风险', theme: 'warning' },
    '2': { text: '高风险', theme: 'danger' },
    low: { text: '低风险', theme: 'success' },
    '低风险': { text: '低风险', theme: 'success' },
    medium: { text: '中风险', theme: 'warning' },
    '中风险': { text: '中风险', theme: 'warning' },
    high: { text: '高风险', theme: 'danger' },
    '高风险': { text: '高风险', theme: 'danger' }
  },
  source: {
    '0': { text: '考勤机', icon: 'desktop' },
    '1': { text: '手机', icon: 'mobile' },
    '2': { text: '人脸', icon: 'scan' },
    '3': { text: 'GPS', icon: 'environment' },
    machine: { text: '考勤机', icon: 'desktop' },
    '考勤机': { text: '考勤机', icon: 'desktop' },
    mobile: { text: '手机', icon: 'mobile' },
    '手机': { text: '手机', icon: 'mobile' },
    face: { text: '人脸', icon: 'scan' },
    '人脸': { text: '人脸', icon: 'scan' },
    gps: { text: 'GPS', icon: 'environment' },
    GPS: { text: 'GPS', icon: 'environment' }
  }
}

const baseMockClockInRecords = [
  { name: '张三', employeeNo: 'EMP001', departId: 'tech', departmentName: '技术部', clockInTime: '08:52', clockOutTime: '18:05', status: 'normal', clockSource: 'machine', locationVerify: 'verified', riskLevel: 'low' },
  { name: '李四', employeeNo: 'EMP002', departId: 'product', departmentName: '产品部', clockInTime: '08:05', clockOutTime: '17:55', status: 'normal', clockSource: 'mobile', locationVerify: 'verified', riskLevel: 'low' },
  { name: '王五', employeeNo: 'EMP003', departId: 'market', departmentName: '市场部', clockInTime: '08:35', clockOutTime: '18:10', status: 'late', clockSource: 'machine', locationVerify: 'verified', riskLevel: 'medium' },
  { name: '赵六', employeeNo: 'EMP004', departId: 'admin', departmentName: '行政部', clockInTime: '09:15', clockOutTime: '-', status: 'miss', clockSource: 'machine', locationVerify: 'unverified', riskLevel: 'medium' },
  { name: '钱七', employeeNo: 'EMP008', departId: 'tech', departmentName: '技术部', clockInTime: '08:00', clockOutTime: '17:30', status: 'normal', clockSource: 'face', locationVerify: 'verified', riskLevel: 'low' },
  { name: '孙八', employeeNo: 'EMP009', departId: 'finance', departmentName: '财务部', clockInTime: '08:24', clockOutTime: '18:02', status: 'normal', clockSource: 'gps', locationVerify: 'verified', riskLevel: 'low' },
  { name: '周九', employeeNo: 'EMP010', departId: 'product', departmentName: '产品部', clockInTime: '08:58', clockOutTime: '18:21', status: 'late', clockSource: 'mobile', locationVerify: 'verified', riskLevel: 'medium' },
  { name: '吴十', employeeNo: 'EMP011', departId: 'market', departmentName: '市场部', clockInTime: '-', clockOutTime: '-', status: 'abnormal', clockSource: 'face', locationVerify: 'failed', riskLevel: 'high' }
]

const mockClockDates = ['2026-05-21', '2026-05-20', '2026-05-19', '2026-05-18']

function formatEmployeeNo (index) {
  return 'EMP' + ('000' + index).slice(-3)
}

function buildMockClockInRecords () {
  const list = []
  for (let index = 0; index < 156; index++) {
    const source = baseMockClockInRecords[index % baseMockClockInRecords.length]
    const group = Math.floor(index / baseMockClockInRecords.length)
    list.push(Object.assign({}, source, {
      id: String(index + 1),
      clockDate: mockClockDates[index % mockClockDates.length],
      name: group === 0 ? source.name : source.name + (group + 1),
      employeeNo: index < baseMockClockInRecords.length ? source.employeeNo : formatEmployeeNo(index + 1)
    }))
  }
  return list
}

export default {
  name: 'ClockInManagement',
  mixins: [JeecgListMixin, mixinDevice],
  data () {
    return {
      disableMixinCreated: true,
      description: '打卡管理页面',
      detailVisible: false,
      currentRecord: null,
      mockClockInRecords: buildMockClockInRecords(),
      mockDepartOptions: [
        { value: 'tech', label: '技术部' },
        { value: 'product', label: '产品部' },
        { value: 'market', label: '市场部' },
        { value: 'admin', label: '行政部' },
        { value: 'finance', label: '财务部' }
      ],
      deviceStats: [
        { key: 'online', label: '在线考勤', value: 3, unit: '台', extra: '/5台', icon: 'desktop', theme: 'green' },
        { key: 'offline', label: '离线考勤', value: 2, unit: '台', icon: 'disconnect', theme: 'red' },
        { key: 'gps', label: 'GPS定位', value: 45, unit: '次', icon: 'environment', theme: 'blue' },
        { key: 'face', label: '人脸识别', value: 89, unit: '次', icon: 'scan', theme: 'orange' }
      ],
      attendanceStats: [
        { key: 'should', label: '今日应出勤', value: 156, unit: '人', trend: '较昨日 +3', icon: 'team', theme: 'blue' },
        { key: 'done', label: '已打卡', value: 142, unit: '', trend: '打卡率 91%', icon: 'check-circle', theme: 'green' },
        { key: 'miss', label: '未打卡', value: 14, unit: '', trend: '待提醒 8 人', icon: 'clock-circle', theme: 'orange' },
        { key: 'alert', label: '实时异常告警', value: 6, unit: '', trend: '代打卡 2 | 迟到 4', icon: 'warning', theme: 'red' }
      ],
      columns: [
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'name',
          width: 120
        },
        {
          title: '工号',
          align: 'left',
          dataIndex: 'employeeNo',
          width: 130
        },
        {
          title: '部门',
          align: 'left',
          dataIndex: 'departmentName',
          width: 140
        },
        {
          title: '上班打卡',
          align: 'left',
          dataIndex: 'clockInTime',
          width: 150
        },
        {
          title: '下班打卡',
          align: 'left',
          dataIndex: 'clockOutTime',
          width: 150
        },
        {
          title: '状态',
          align: 'left',
          dataIndex: 'status',
          width: 120,
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '打卡来源',
          align: 'left',
          dataIndex: 'clockSource',
          width: 150,
          scopedSlots: { customRender: 'clockSource' }
        },
        {
          title: '位置验证',
          align: 'left',
          dataIndex: 'locationVerify',
          width: 150,
          scopedSlots: { customRender: 'locationVerify' }
        },
        {
          title: '代打卡风险',
          align: 'left',
          dataIndex: 'riskLevel',
          width: 150,
          scopedSlots: { customRender: 'riskLevel' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'left',
          fixed: 'right',
          width: 100,
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: '/clockInManagement/clockIn/list',
        delete: '/clockInManagement/clockIn/delete',
        deleteBatch: '/clockInManagement/clockIn/deleteBatch',
        exportXlsUrl: '/clockInManagement/clockIn/exportXls',
        importExcelUrl: 'clockInManagement/clockIn/importExcel'
      },
      dictOptions: {},
      superFieldList: []
    }
  },
  created () {
    this.ipagination.pageSize = 5
    this.ipagination.pageSizeOptions = ['5', '10', '20', '30']
    // this.ipagination.showQuickJumper = false
    // this.ipagination.showSizeChanger = false
    // this.ipagination.showTotal = function (total, range) {
    //   return '共 ' + total + ' 条记录，当前显示 ' + range[0] + '-' + range[1] + ' 条'
    // }
    this.getSuperFieldList()
    this.loadData(1)
    this.initDictConfig()
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    }
  },
  methods: {
    initDictConfig () {
    },
    getSuperFieldList () {
      let fieldList = []
      fieldList.push({ type: 'date', value: 'clockDate', text: '日期' })
      fieldList.push({ type: 'sel_depart', value: 'departId', text: '部门' })
      fieldList.push({ type: 'string', value: 'employeeName', text: '员工姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'employeeNo', text: '工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'status', text: '状态', dictCode: '' })
      fieldList.push({ type: 'string', value: 'clockSource', text: '打卡来源', dictCode: '' })
      fieldList.push({ type: 'string', value: 'locationVerify', text: '位置验证', dictCode: '' })
      fieldList.push({ type: 'string', value: 'riskLevel', text: '代打卡风险', dictCode: '' })
      this.superFieldList = fieldList
    },
    loadData (arg) {
      if (arg === 1) {
        this.ipagination.current = 1
      }
      this.loading = true
      const pageSize = this.ipagination.pageSize || 5
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
      return this.mockClockInRecords.filter(item => {
        const keywordMatched = !keyword ||
          item.name.toLowerCase().indexOf(keyword) > -1 ||
          item.employeeNo.toLowerCase().indexOf(keyword) > -1
        const dateMatched = !params.clockDate || item.clockDate === params.clockDate
        const departMatched = !params.departId || item.departId === params.departId
        const statusMatched = !params.status || item.status === params.status
        return keywordMatched && dateMatched && departMatched && statusMatched
      })
    },
    refreshPageData () {
      this.onClearSelected()
      this.loadData(1)
    },
    handleNotice () {
      this.$message.info('暂无新的异常告警')
    },
    showDetail (record) {
      this.currentRecord = record
      this.detailVisible = true
    },
    getMappedValue (type, record, field, dictField, fallback) {
      const map = valueMap[type] || {}
      const fieldValue = record[field]
      const dictValue = record[dictField]
      const mapped = map[fieldValue] || map[dictValue]
      if (mapped) {
        return Object.assign({}, mapped, { text: dictValue || mapped.text })
      }
      return { text: dictValue || fieldValue || fallback, theme: 'default', icon: 'desktop' }
    },
    getStatusInfo (record) {
      return this.getMappedValue('status', record, 'status', 'status_dictText', '-')
    },
    getStatusText (record) {
      return this.getStatusInfo(record).text
    },
    getStatusTheme (record) {
      return this.getStatusInfo(record).theme
    },
    getVerifyInfo (record) {
      return this.getMappedValue('verify', record, 'locationVerify', 'locationVerify_dictText', '-')
    },
    getVerifyText (record) {
      return this.getVerifyInfo(record).text
    },
    getVerifyTheme (record) {
      return this.getVerifyInfo(record).theme
    },
    getRiskInfo (record) {
      return this.getMappedValue('risk', record, 'riskLevel', 'riskLevel_dictText', '-')
    },
    getRiskText (record) {
      return this.getRiskInfo(record).text
    },
    getRiskTheme (record) {
      return this.getRiskInfo(record).theme
    },
    getSourceInfo (record) {
      return this.getMappedValue('source', record, 'clockSource', 'clockSource_dictText', '-')
    },
    getSourceText (record) {
      return this.getSourceInfo(record).text
    },
    getSourceIcon (record) {
      return this.getSourceInfo(record).icon
    }
  }
}
</script>

<style scoped lang="less">
@import '~@assets/less/common.less';

.clock-page {
  height: calc(100vh - 120px - 24px);
  padding: 24px;
  // padding-top: 0;
  background: #f3f7fc;
  overflow: auto;
}

.clock-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  padding: 0 24px;
  background: #fff;
  border: 1px solid #e6edf6;
}

.clock-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1f2d3d;
  font-size: 18px;
  font-weight: 700;
}

.clock-header-actions {
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

.device-stat-grid,
.attendance-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.device-stat-card,
.attendance-stat-card {
  display: flex;
  align-items: center;
  min-height: 78px;
  padding: 18px 20px;
  background: #fff;
  border: 1px solid #dce6f1;
  border-radius: 8px;
}

.device-stat-card {
  gap: 14px;
}

.stat-icon,
.attendance-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  font-size: 22px;
}

.stat-label,
.attendance-label {
  color: #7285a2;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  line-height: 30px;
}

.stat-unit,
.stat-extra {
  margin-left: 4px;
  color: #647895;
  font-size: 14px;
}

.attendance-stat-card {
  justify-content: space-between;
  min-height: 112px;
}

.attendance-value-row {
  margin-top: 6px;
}

.attendance-number {
  color: #1f2d3d;
  font-size: 24px;
  font-weight: 700;
  line-height: 30px;
}

.attendance-unit {
  margin-left: 6px;
  color: #657894;
  font-size: 14px;
}

.attendance-trend {
  margin-top: 6px;
  font-size: 13px;
}

.attendance-icon {
  width: 48px;
  height: 48px;
  font-size: 22px;
}

.green {
  color: #16b364;
}

.red {
  color: #f04438;
}

.blue {
  color: #2f6df6;
}

.orange {
  color: #f79009;
}

.stat-icon.green,
.attendance-icon.green {
  background: #eafaf1;
}

.stat-icon.red,
.attendance-icon.red {
  background: #fff1f2;
}

.stat-icon.blue,
.attendance-icon.blue {
  background: #eef5ff;
}

.stat-icon.orange,
.attendance-icon.orange {
  background: #fff7e6;
}

.clock-list-panel {
  margin-top: 18px;
  background: #fff;
  border: 1px solid #dce6f1;
  border-radius: 8px;
}

.clock-search-wrapper {
  padding: 18px 20px;
  border-bottom: 1px solid #edf2f7;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}

.source-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #27384f;
}

.clock-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 22px;
}

.clock-tag.success {
  color: #17a65a;
  background: #dcf8e7;
}

.clock-tag.warning {
  color: #d48806;
  background: #fff0c2;
}

.clock-tag.danger {
  color: #f04438;
  background: #ffe3e3;
}

.clock-tag.default {
  color: #647895;
  background: #eef2f7;
}

/deep/ .clock-table .ant-table-thead > tr > th {
  color: #627592;
  font-weight: 700;
  background: #f7faff;
  border-bottom: 1px solid #dfe8f3;
}

/deep/ .clock-table .ant-table-tbody > tr > td {
  color: #26374d;
  border-bottom: 1px solid #edf2f7;
}

/deep/ .clock-table .ant-table-pagination.ant-pagination {
  margin: 14px 24px;
}

/deep/ .clock-search-wrapper .ant-form-item {
  margin-bottom: 0;
}

@media (max-width: 1200px) {
  .device-stat-grid,
  .attendance-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .search-actions {
    justify-content: flex-start;
    margin-top: 8px;
  }
}

@media (max-width: 768px) {
  .clock-header,
  .clock-header-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .clock-header {
    gap: 14px;
    padding: 16px;
  }

  .employee-search {
    width: 100%;
  }

  .device-stat-grid,
  .attendance-stat-grid {
    grid-template-columns: 1fr;
  }

  .search-actions {
    margin-top: 12px;
  }
}
</style>
