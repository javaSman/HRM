<template>
  <div class="onboarding-page">
    <div class="onboarding-status-filter">
      <a-tabs :activeKey="currentStatus" type="card" @change="handleStatusChange">
        <a-tab-pane v-for="item in statusOptions" :key="item.value">
          <span slot="tab" :data-status="item.code">
            {{ item.label }} <span class="status-count">({{ item.count }})</span>
          </span>
        </a-tab-pane>
      </a-tabs>
    </div>

    <div class="table-operator onboarding-toolbar">
      <a-button type="primary" class="pm-btn-primary" icon="plus" @click="handleAdd">入职办理</a-button>
      <a-button type="primary" class="pm-btn-primary" icon="qrcode" @click="$refs.qrModal.open()">
        资料补充二维码
      </a-button>
      <a-button type="primary" class="pm-btn-primary" icon="qrcode" @click="$refs.registerQrModal.open()">
        新员工入职二维码
      </a-button>
      <a-button type="primary" class="pm-btn-primary" icon="download" @click="handleExportXls('入职管理')">
        导出
      </a-button>
      <a-button type="primary" class="pm-btn-primary" icon="setting" @click="toggleColumnConfig"> 字段配置 </a-button>
    </div>

    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="公司">
              <a-select
                v-model="queryParam.gs"
                allowClear
                showSearch
                optionFilterProp="children"
                :loading="orgLoading"
                placeholder="全部"
                @change="handleQueryCompanyChange"
              >
                <a-select-option v-for="item in companyList" :title="item.name" :key="item.id" :value="item.name">{{
                  item.name
                }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="5" :md="6" :sm="12" :xs="24">
            <a-form-item label="所属部门">
              <a-cascader
                v-model="queryDeptPath"
                :options="queryDeptOptions"
                :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                changeOnSelect
                allowClear
                placeholder="全部"
                @change="handleQueryDeptChange"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="岗位名称">
              <a-select
                v-model="queryParam.postId"
                allowClear
                showSearch
                optionFilterProp="children"
                :disabled="!queryParam.dept"
                :loading="queryPostLoading"
                placeholder="全部"
                @change="handleQueryPostChange"
              >
                <a-select-option
                  v-for="item in queryPostOptions"
                  :title="item.label"
                  :key="item.value"
                  :value="item.value"
                  >{{ item.label }}</a-select-option
                >
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="工号"
              ><a-input v-model.trim="queryParam.gh" allowClear placeholder="请输入工号"
            /></a-form-item>
          </a-col>
          <!-- <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="职级名称">
              <a-select
                v-model="queryParam.postRank"
                allowClear
                showSearch
                optionFilterProp="children"
                :disabled="!queryParam.postId"
                placeholder="全部">
                <a-select-option v-for="item in queryPostRankOptions" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col> -->
          <a-col :xl="4" :lg="7" :md="12" :sm="24" :xs="24">
            <a-form-item label="预计入职时间">
              <a-range-picker
                v-model="expectDateRange"
                format="YYYY-MM-DD"
                :placeholder="['开始日期', '结束日期']"
                @change="
                  (value, dates) => handleRangeChange('expectDateRange', 'yjrzsj_begin', 'yjrzsj_end', value, dates)
                "
              />
            </a-form-item>
          </a-col>
          <a-col
            v-if="currentStatus === '全部' || currentStatus === '已入职'"
            :xl="4"
            :lg="7"
            :md="12"
            :sm="24"
            :xs="24"
          >
            <a-form-item label="实际入职时间">
              <a-range-picker
                v-model="actualDateRange"
                format="YYYY-MM-DD"
                :placeholder="['开始日期', '结束日期']"
                @change="
                  (value, dates) => handleRangeChange('actualDateRange', 'sjrzsj_begin', 'sjrzsj_end', value, dates)
                "
              />
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="5" :md="8" :sm="12" :xs="24" class="search-btn-col">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" class="pm-btn-primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button class="pm-btn-reset" icon="reload" @click="searchReset">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <a-table
      v-if="columnConfigReady"
      ref="table"
      size="middle"
      bordered
      rowKey="id"
      :scroll="tableScroll"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      class="j-table-force-nowrap onboarding-table"
      @change="handleTableChange"
    >
      <span slot="rowIndex" slot-scope="text, record, index">{{ getRowIndex(index) }}</span>
      <template slot="rzzt" slot-scope="text"
        ><a-tag :color="getStatusColor(text)">{{ text || '-' }}</a-tag></template
      >
      <template slot="zlzt" slot-scope="text"
        ><a-tag :color="getInfoColor(text)">{{ text || '-' }}</a-tag></template
      >
      <span slot="action" slot-scope="text, record" class="table-action">
        <a @click="handleView(record)">查看</a>
        <template v-if="record.rzzt === '已入职'">
          <a-divider type="vertical" />
          <a @click="handleEdit(record)">编辑</a>
        </template>
        <template v-if="record.rzzt === '待入职'">
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleAdjust(record)">调整入职时间</a>
              </a-menu-item>
              <a-menu-item v-if="record.zlzt === '已完善'">
                <a class="success-link" @click="handleConfirmArrival(record)">确定到岗</a>
              </a-menu-item>
              <a-menu-item>
                <a class="danger-link" @click="handleAbandon(record)">放弃入职</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </template>
        <template v-else-if="record.rzzt === '已入职'">
          <a-divider type="vertical" />
          <span v-if="printingRecordId === record.id">履历表加载中...</span>
          <a v-else @click="handlePrint(record)">打印履历表</a>
        </template>
        <!-- <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
            </a-popconfirm> -->
      </span>
    </a-table>

    <!-- 配置加载中的提示 -->
    <div v-else class="table-loading-placeholder">
      <a-spin tip="正在加载表格配置...">
        <div style="padding: 50px; background: rgba(0, 0, 0, 0.05); border-radius: 4px"></div>
      </a-spin>
    </div>

    <hrm-rzgl-modal ref="modalForm" @ok="modalFormOk" />
    <onboarding-adjust-modal ref="adjustModal" @ok="handleAdjustPreview" />
    <onboarding-cancel-modal ref="cancelModal" @ok="handleAbandonOk" />
    <onboarding-arrival-modal ref="arrivalModal" @ok="modalFormOk" />
    <onboarding-qr-modal ref="qrModal" />
    <onboarding-register-qr-modal ref="registerQrModal" />
    <employee-form-modal
      type="rzgl"
      ref="employeeFormModal"
      :constractBelongOptions="constractBelongOptions"
      @ok="modalFormOk"
    />
    <column-config-sidebar
      :visible="columnConfigVisible"
      :allColumns="columnConfigNew"
      :fieldTitleMap="fieldTitleMap"
      @close="columnConfigVisible = false"
      @confirm="handleColumnConfigConfirm"
    />
  </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { getAction, httpAction, postAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { mixinDevice } from '@/utils/mixin'
import { columnConfigMixin } from '@/mixins/columnConfigMixin'
import { tableAdaptiveMixin } from '@/mixins/tableAdaptiveMixin'
import moment from 'moment'
import EmployeeFormModal from '@/views/peoplemanagement/employeeInfo/modules/EmployeeFormModal.vue'
import HrmRzglModal from './modules/HrmRzglModal.vue'
import OnboardingAdjustModal from './modules/OnboardingAdjustModal.vue'
import OnboardingCancelModal from './modules/OnboardingCancelModal.vue'
import OnboardingArrivalModal from './modules/OnboardingArrivalModal.vue'
import OnboardingQrModal from './modules/OnboardingQrModal.vue'
import OnboardingRegisterQrModal from './modules/OnboardingRegisterQrModal.vue'
import { printOnboardingResume } from './modules/onboardingResumePrint'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'

const STATUS_OPTIONS = [
  { label: '全部', value: '全部', code: 'all' },
  { label: '待入职', value: '待入职', code: 'pending' },
  { label: '已入职', value: '已入职', code: 'onboarded' },
  { label: '放弃入职', value: '放弃入职', code: 'abandoned' },
]
const STATUS_COLORS = { 待入职: 'blue', 已入职: 'green', 放弃入职: 'red' }
const INFO_COLORS = { 已完善: 'green', 待补充: 'orange' }

function defaultQuery() {
  return {
    gh: '',
    gs: undefined,
    companyId: '',
    dept: '',
    postId: '',
    postRank: '',
    yjrzsj_begin: '',
    yjrzsj_end: '',
    sjrzsj_begin: '',
    sjrzsj_end: '',
  }
}

function dateRange(query, beginKey, endKey) {
  const begin = query[beginKey] ? moment(query[beginKey], 'YYYY-MM-DD', true) : null
  const end = query[endKey] ? moment(query[endKey], 'YYYY-MM-DD', true) : null
  return begin && begin.isValid() && end && end.isValid() ? [begin, end] : []
}

function formatValue(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ? '-' : value
}

function withoutLegacyOrgFields(record) {
  const payload = Object.assign({}, record)
  delete payload.ssbm
  delete payload.gwmc
  delete payload.zjmc
  return payload
}

export default {
  name: 'PersonnelOnboardingList',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin, tableAdaptiveMixin],
  components: {
    EmployeeFormModal,
    HrmRzglModal,
    OnboardingAdjustModal,
    OnboardingCancelModal,
    OnboardingArrivalModal,
    OnboardingQrModal,
    OnboardingRegisterQrModal,
    ColumnConfigSidebar,
  },
  data() {
    const queryParam = defaultQuery()
    return {
      disableMixinCreated: true,
      currentStatus: '全部',
      statusOptions: STATUS_OPTIONS.map((item) => Object.assign({ count: 0 }, item)),
      queryParam,
      expectDateRange: dateRange(queryParam, 'yjrzsj_begin', 'yjrzsj_end'),
      actualDateRange: dateRange(queryParam, 'sjrzsj_begin', 'sjrzsj_end'),
      companyList: [],
      queryDeptOptions: [],
      queryDeptPath: [],
      queryPostRows: [],
      queryPostOptions: [],
      queryPostRankOptions: [],
      queryPostLoading: false,
      orgLoading: false,
      printingRecordId: null,
      columnCode: 'HrmRzgl', // 入职管理字段配置标识
      originalColumns: [
        { title: '工号', dataIndex: 'gh', width: 110, align: 'center', customRender: (text) => text || '-' },
        { title: '姓名', dataIndex: 'xm', width: 110, align: 'center' },
        { title: '手机号', dataIndex: 'sjh', width: 100, align: 'center' },
        {
          title: '公司',
          dataIndex: 'companyId_dictText',
          width: 170,
          align: 'center',
          ellipsis: true,
          customRender: (text) => this.renderTooltip(text, 150),
        },
        {
          title: '所属部门',
          dataIndex: 'dept_dictText',
          width: 130,
          align: 'center',
          ellipsis: true,
          customRender: (text) => this.renderTooltip(text, 110),
        },
        {
          title: '岗位名称',
          dataIndex: 'postId_dictText',
          width: 180,
          align: 'center',
          ellipsis: true,
          customRender: (text) => this.renderTooltip(text, 160),
        },
        {
          title: '职级名称',
          dataIndex: 'postRank_dictText',
          width: 110,
          align: 'center',
          ellipsis: true,
          customRender: (text) => this.renderTooltip(text, 90),
        },
        // {
        //   title: '维护人',
        //   dataIndex: 'whr_dictText',
        //   width: 100,
        //   align: 'center',
        //   ellipsis: true,
        //   customRender: (text) => this.renderTooltip(text, 80),
        // },
        {
          title: '资料状态',
          dataIndex: 'zlzt',
          width: 70,
          align: 'center',
          scopedSlots: { customRender: 'zlzt' },
          conditionalDisplay: 'currentStatus !== "放弃入职"', // 条件显示标识
        },
        // {
        //   title: '发送时间',
        //   dataIndex: 'fssj',
        //   width: 130,
        //   align: 'center',
        //   customRender: (text) => (text ? text : '-'),
        // },
        {
          title: '预计入职时间',
          dataIndex: 'yjrzsj',
          width: 130,
          align: 'center',
          customRender: (text) => (text ? text : '-'),
        },
        {
          title: '实际入职时间',
          dataIndex: 'sjrzsj',
          width: 130,
          align: 'center',
          customRender: (text) => (text ? text : '-'),
          conditionalDisplay: 'currentStatus === "全部" || currentStatus === "已入职"', // 条件显示标识
        },
      ],
      url: {
        list: '/ryManage/hrmRzgl/list',
        delete: '/ryManage/hrmRzgl/delete',
        deleteBatch: '/ryManage/hrmRzgl/deleteBatch',
        exportXlsUrl: '/ryManage/hrmRzgl/exportXls',
        importExcelUrl: 'ryManage/hrmRzgl/importExcel',
        queryById: '/ryManage/hrmRzgl/queryById',
        edit: '/ryManage/hrmRzgl/edit',
        getTotal: '/ryManage/hrmRzgl/getTotal',
        adjustAdd: '/ryManage/hrmRzglRzsjtz/add',
        employeeDetailByNo: '/ryManage/hrmRzgl/emplyeddDetlByNo',
        queryDetail: '/ryManage/hrmRzgl/queryDetl',
      },
    }
  },
  computed: {
    fieldTitleMap() {
      const map = {}
      this.originalColumns.forEach((col) => {
        if (col.dataIndex && col.title) {
          map[col.dataIndex] = col.title
        }
      })
      return map
    },
    columnConfigNew() {
      return this.getColumnConfigData()
    },
    columns() {
      const fixedColumns = [
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 250,
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ]

      const dynamicColumns = []

      // 序号列始终显示
      dynamicColumns.push({
        title: '序号',
        width: 70,
        align: 'center',
        scopedSlots: { customRender: 'rowIndex' },
      })

      // 入职状态列始终显示
      dynamicColumns.push({
        title: '入职状态',
        dataIndex: 'rzzt',
        width: 70,
        align: 'center',
        scopedSlots: { customRender: 'rzzt' },
      })

      // 应用字段配置到 originalColumns
      const configuredColumns = this.applyColumnConfig(this.originalColumns, {
        fixedColumns: [],
        excludedFields: [],
      })

      // 根据条件过滤列（资料状态、实际入职时间）
      const filteredColumns = configuredColumns.filter((col) => {
        // 资料状态：只在非"放弃入职"状态下显示
        if (col.dataIndex === 'zlzt' && this.currentStatus === '放弃入职') {
          return false
        }
        // 实际入职时间：只在"全部"或"已入职"状态下显示
        if (col.dataIndex === 'sjrzsj' && this.currentStatus !== '全部' && this.currentStatus !== '已入职') {
          return false
        }
        return true
      })

      // 合并数据列（不包含操作列）
      const dataColumns = [...dynamicColumns, ...filteredColumns]

      // 智能处理：当没有横向滚动条时，移除最后一个非固定列的 width
      const processedColumns = this.adaptiveColumnsWidth(dataColumns, fixedColumns)

      return [...processedColumns, ...fixedColumns]
    },
    constractBelongOptions() {
      return this.companyList
        .filter((item) => item && item.name)
        .map((item) => ({ label: item.name, value: item.name }))
    },
  },
  created() {
    this.ipagination.pageSize = 20
    this.ipagination.pageSizeOptions = ['10', '20', '50']
    this.ipagination.showSizeChanger = true
    this.ipagination.showQuickJumper = true
    this.ipagination.showTotal = (total) => `共 ${total} 条`
    this.loadOrgTree()
    // 先获取字段配置，再加载表格数据
    this.getColumnConfig().then(() => {
      this.loadData(1)
    })
  },
  methods: {
    initDictConfig() {},
    loadData(arg) {
      JeecgListMixin.methods.loadData.call(this, arg)
      this.getStatusTotal()
    },
    getStatusTotal() {
      httpAction(this.url.getTotal, '', 'get')
        .then((res) => {
          if (!res || !res.success || !Array.isArray(res.result)) {
            throw new Error((res && res.message) || '入职状态统计加载失败')
          }
          const totalMap = {}
          res.result.forEach((item) => {
            totalMap[item.statusText] = Number(item.statustotal) || 0
          })
          this.statusOptions.forEach((item) => {
            item.count = totalMap[item.label] || 0
          })
        })
        .catch((error) => {
          this.$message.warning(error.message || '入职状态统计加载失败')
        })
    },
    renderTooltip(text, width) {
      const value = String(formatValue(text))
      return this.$createElement(
        'a-tooltip',
        {
          style: {
            width: `${width}px`,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            display: 'block',
          },
          props: { title: value },
        },
        [this.$createElement('span', value)]
      )
    },
    loadOrgTree() {
      this.orgLoading = true
      getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 })
        .then((res) => {
          const roots = res && res.success && Array.isArray(res.result) ? res.result : []
          this.companyList = roots.length && Array.isArray(roots[0].children) ? roots[0].children : []
        })
        .catch(() => {
          this.companyList = []
          this.$message.error('组织架构加载失败，请稍后重试')
        })
        .finally(() => {
          this.orgLoading = false
        })
    },
    getRowIndex(index) {
      return (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1
    },
    getStatusColor(status) {
      return STATUS_COLORS[status] || ''
    },
    getInfoColor(status) {
      return INFO_COLORS[status] || ''
    },
    handleStatusChange(status) {
      this.currentStatus = status
      if (status === '全部') delete this.queryParam.rzzt
      else this.$set(this.queryParam, 'rzzt', status)
      if (status !== '全部' && status !== '已入职') {
        this.actualDateRange = []
        this.queryParam.sjrzsj_begin = ''
        this.queryParam.sjrzsj_end = ''
      }
      this.onClearSelected()
      this.loadData(1)
    },
    handleQueryCompanyChange(companyName) {
      const company = this.companyList.find((item) => item.name === companyName)
      this.queryDeptOptions = company ? [company] : []
      this.queryDeptPath = []
      this.queryParam.companyId = ''
      this.queryParam.dept = ''
      this.resetQueryPostOptions()
    },
    handleQueryDeptChange(value) {
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      this.queryDeptPath = path
      this.queryParam.companyId = path[0] || ''
      this.queryParam.dept = path[path.length - 1] || ''
      this.resetQueryPostOptions()
      this.loadQueryPostOptions(this.queryParam.dept)
    },
    resetQueryPostOptions() {
      this.queryPostRows = []
      this.queryPostOptions = []
      this.queryPostRankOptions = []
      this.queryParam.postId = ''
      this.queryParam.postRank = ''
    },
    loadQueryPostOptions(deptId) {
      if (!deptId) return Promise.resolve()
      this.queryPostLoading = true
      return getAction('/hrJobSequence/hrJobSequence/getChildSequences', {
        deptId,
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 99999,
      })
        .then((res) => {
          const rows = Array.isArray(res) ? res : (res && res.result) || []
          this.queryPostRows = rows
          this.queryPostOptions = rows.map((item) => ({ label: item.postName, value: item.id }))
        })
        .catch(() => {
          this.resetQueryPostOptions()
          this.$message.error('岗位职级加载失败，请稍后重试')
        })
        .finally(() => {
          this.queryPostLoading = false
        })
    },
    handleQueryPostChange(postId) {
      const post = this.queryPostRows.find((item) => String(item.id) === String(postId))
      this.queryPostRankOptions = ((post && post.hrJobLevels) || []).map((item) => ({
        label: item.levelName,
        value: item.id,
      }))
      this.queryParam.postRank = ''
    },
    handleRangeChange(rangeName, beginKey, endKey, value, dateStrings) {
      this[rangeName] = value || []
      this.queryParam[beginKey] = dateStrings && dateStrings[0] ? dateStrings[0] : ''
      this.queryParam[endKey] = dateStrings && dateStrings[1] ? dateStrings[1] : ''
    },
    searchReset() {
      this.queryParam = defaultQuery()
      this.expectDateRange = []
      this.actualDateRange = []
      this.queryDeptPath = []
      this.queryDeptOptions = []
      this.queryPostRows = []
      this.queryPostOptions = []
      this.queryPostRankOptions = []
      this.queryPostLoading = false
      this.currentStatus = '全部'
      this.onClearSelected()
      this.loadData(1)
    },
    handleAdd() {
      this.$refs.modalForm.add()
      this.$refs.modalForm.title = '入职办理'
      this.$refs.modalForm.disableSubmit = false
    },
    handleEdit(record) {
      if (!record || record.rzzt !== '已入职') {
        this.$refs.modalForm.edit(record)
        this.$refs.modalForm.title = '编辑'
        this.$refs.modalForm.disableSubmit = false
        return
      }
      const employeeNo = String(record.gh || '').trim()
      if (!employeeNo) {
        this.$message.warning('当前入职记录缺少工号，无法加载员工信息')
        return
      }
      this.loading = true
      postAction(`${this.url.employeeDetailByNo}?no=${encodeURIComponent(employeeNo)}`)
        .then((res) => {
          if (!res || !res.success || !res.result) {
            throw new Error((res && res.message) || '员工详情加载失败')
          }
          const detail = res.result
          const basicInfo = detail.jbxx
          if (!basicInfo || typeof basicInfo !== 'object' || Array.isArray(basicInfo) || !basicInfo.id) {
            throw new Error('员工基本信息不完整，无法编辑')
          }
          const relationNo = String(detail.gh || employeeNo).trim()
          this.$refs.employeeFormModal.edit(Object.assign({}, basicInfo, { no: relationNo }))
        })
        .catch((error) => {
          this.$message.error(error.message || '员工详情加载失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },
    modalFormOk() {
      this.loadData(1)
      this.onClearSelected()
    },
    handleView(record) {
      this.handleDetail(record)
    },
    handleAdjust(record) {
      this.$refs.adjustModal.open(record)
    },
    handleAdjustPreview({ record, model }) {
      let adjustSaved = false
      this.loading = true
      return httpAction(this.url.adjustAdd, model, 'post')
        .then((res) => {
          if (!res || !res.success) {
            throw new Error((res && res.message) || '调整记录保存失败')
          }
          console.log(record, model)
          // 访客申请
          postAction('/fkzx/hrmFkzxSq/add', {
            xm: record.xm,
            lxfs: record.sjh,
            cph: '',
            sfzh: record.sfzh,
            ssgshgr: '',
            yjlfsj: (record.yjrzsj || model.xyjrzsj) + ' 09:00',
            jdr: record.whr,
            jdrlxfs: '',
            lfsrxx: '入职',
            scfj: '',
            lflx: '3',
            zt: '0',
            lfqy: '',
            lfsy: '2',
            splc: {},
            lfrs: '1',
          })
          adjustSaved = true
          return this.fetchDetail(record)
        })
        .then((detail) => {
          return httpAction(
            this.url.edit,
            withoutLegacyOrgFields(
              Object.assign({}, detail, {
                yjrzsj: model.xyjrzsj,
              })
            ),
            'put'
          )
        })
        .then((res) => {
          if (!res || !res.success) {
            throw new Error((res && res.message) || '预计入职时间修改失败')
          }
          this.$message.success('入职时间调整成功')
        })
        .catch((error) => {
          if (adjustSaved) {
            this.$message.warning(`调整记录已保存，但预计入职时间修改失败：${error.message || ''}`)
          } else {
            this.$message.error(error.message || '调整记录保存失败')
          }
        })
        .finally(() => {
          this.loading = false

          if (adjustSaved) {
            this.loadData()
          }
        })
    },
    fetchDetail(record) {
      return getAction(this.url.queryById, { id: record.id }).then((res) => {
        if (!res || !res.success || !res.result) throw new Error((res && res.message) || '入职记录加载失败')
        return res.result
      })
    },
    saveOperation(record, changes, successMessage) {
      this.loading = true
      return this.fetchDetail(record)
        .then((detail) => httpAction(this.url.edit, withoutLegacyOrgFields(Object.assign({}, detail, changes)), 'put'))
        .then((res) => {
          if (!res || !res.success) throw new Error((res && res.message) || '保存失败')
          this.$message.success(successMessage)
          this.loadData()
        })
        .catch((error) => {
          this.$message.error(error.message || '操作失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleConfirmArrival(record) {
      this.$refs.arrivalModal.open(record)
    },
    handleAbandon(record) {
      this.$refs.cancelModal.open(record)
    },
    handleAbandonOk({ record, model }) {
      this.saveOperation(
        record,
        { rzzt: '放弃入职', fqyy: model.fqyy, fqsj: moment().format('YYYY-MM-DD HH:mm:ss') },
        '已放弃入职'
      )
    },
    async handlePrint(record) {
      if (this.printingRecordId) {
        this.$message.warning('履历表正在加载，请稍候')
        return
      }
      const phone = String(record.sjh || '').trim()
      if (!phone) {
        this.$message.warning('当前入职记录缺少手机号，无法加载履历表')
        return
      }
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        this.$message.warning('打印窗口打开失败，请允许浏览器弹出窗口后重试')
        return
      }
      printWindow.document.open()
      printWindow.document.write(
        '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>履历表加载中</title></head><body style="font-family: Microsoft YaHei, sans-serif; padding: 32px;">履历表加载中，请稍候...</body></html>'
      )
      printWindow.document.close()
      this.printingRecordId = record.id
      try {
        const res = await postAction(`/ryManage/hrmRzgl/emplyeddDetlByNo?no=${encodeURIComponent(record.gh)}`)
        if (!res || !res.success || !res.result) {
          throw new Error((res && res.message) || '履历表数据加载失败')
        }
        if (!res.result.jbxx || typeof res.result.jbxx !== 'object' || Array.isArray(res.result.jbxx)) {
          throw new Error('履历表数据不完整，缺少基本信息')
        }
        if (!printOnboardingResume(res.result, printWindow)) throw new Error('打印窗口已关闭，请重试')
      } catch (error) {
        if (!printWindow.closed) printWindow.close()
        this.$message.error(error.message || '履历表打印失败，请稍后重试')
      } finally {
        this.printingRecordId = null
      }
    },
  },
}
</script>

<style scoped lang="less">
@import './onboarding.less';

.table-loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 40px 0;
}
/deep/ .table-page-search-wrapper .ant-form-item-control-wrapper {
  min-width: 0;
}
</style>
