<template>
  <div class="yrBox">
    <div class="status-card-group">
      <div class="status-card">
        <div class="status-card-header">
          <span class="header-bar"></span>
          <span class="header-title">数量统计</span>
        </div>
        <div class="status-card-body">
          <div
            v-for="item in applyStatusCards"
            :key="item.value"
            class="mini-card"
            :class="{ active: currentStatus === item.value }"
            :style="{ '--c': item.color, '--soft': item.soft, '--bg': item.bg }"
            @click="handleCardStatusChange(item.value)"
          >
            <span class="mini-dot"></span>
            <span class="mini-label">{{ item.label }}</span>
            <span class="mini-count">{{ getStatusOptionCount(item.value) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="5" :sm="12">
            <a-form-item label="发起时间">
              <a-range-picker
                v-model="createTimeRange"
                format="YYYY-MM-DD"
                :placeholder="['发起开始', '发起结束']"
                style="width: 100%"
                @change="handleCreateTimeRangeChange"
              />
            </a-form-item>
          </a-col>
          <a-col :md="3" :sm="6">
            <a-form-item label="发起人">
              <a-input v-model.trim="queryParam.fqr" placeholder="请输入发起人" />
            </a-form-item>
          </a-col>
          <a-col :md="3" :sm="8">
            <a-form-item label="公司">
              <a-select
                v-model="companyId"
                allowClear
                showSearch
                optionFilterProp="children"
                placeholder="请选择公司"
                :loading="orgLoading"
                @change="handleCompanyChange"
              >
                <a-select-option v-for="item in companyList" :key="item.id" :value="item.id">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="3" :sm="8">
            <a-form-item label="部门">
              <a-cascader
                v-model="deptArr"
                :options="deptList"
                :disabled="!companyId || orgLoading"
                :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                :show-search="{ filter: filterDeptOption }"
                changeOnSelect
                placeholder="请选择部门"
                @change="handleQueryDeptChange"
              />
            </a-form-item>
          </a-col>
          <a-col :md="3" :sm="8">
            <a-form-item label="岗位名称">
              <j-select-recruitment-post
                url="/zpManage/hrmYrsq/getChildSequences"
                v-model="queryParam.postId"
                :dept-id="queryParam.deptId"
                value-field="id"
                placeholder="请选择岗位名称"
              />
            </a-form-item>
          </a-col>
          <a-col :md="7" :sm="8">
            <a-form-item>
              <a-button type="primary" class="pm-btn-primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button class="pm-btn-reset" icon="reload" style="margin-left: 5px" @click="searchReset">重置</a-button>

              <a-button
                v-if="listType == 'sq'"
                type="primary"
                class="pm-btn-primary"
                style="margin-left: 5px"
                icon="plus"
                @click="handleAdd"
                >申请</a-button
              >
              <a-button
                style="margin-left: 5px"
                type="primary"
                class="pm-btn-primary"
                icon="download"
                @click="handleExportXlsByColumns(listType === 'sp' ? '用人审批' : '用人申请')"
                >导出</a-button
              >

              <!-- <a-dropdown style="margin-left: 5px" v-if="selectedRowKeys.length > 0 && listType == 'sq'">
                <a-menu slot="overlay">
                  <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
                </a-menu>
                <a-button style="margin-left: 5px"> 批量操作 <a-icon type="down" /></a-button>
              </a-dropdown> -->
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- table区域-begin -->
    <div>
      <div
        class="ant-alert ant-alert-info"
        style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center"
      >
        <div>
          <i class="anticon anticon-info-circle ant-alert-icon"></i>
          已选择 <a>{{ selectedRowKeys.length }}</a> 项
          <a style="margin-left: 24px" @click="onClearSelected">清空</a>
        </div>
        <div style="display: flex; align-items: center; gap: 10px">
          <a-button
            v-if="currentStatus == '审批中' && listType == 'sq'"
            :disabled="selectedRowKeys.length == 0"
            type="primary"
            class="pm-btn-primary"
            icon="rollback"
            @click="batchAll('ch')"
            > {{selectedRowKeys.length > 1?'批量':''}}撤回
          </a-button>
          <a-button
            v-if="currentStatus == '审批中' && listType == 'sp'"
            :disabled="selectedRowKeys.length != 1"
            type="primary"
            class="pm-btn-primary"
            icon="form"
            @click="batchAll('sp')"
            >审批
          </a-button>
          <a-button
            v-if="currentStatus == '已撤回'"
            :disabled="selectedRowKeys.length == 0"
            type="primary"
            class="pm-btn-primary"
            icon="issues-close"
            @click="batchAll('cs')"
            >{{selectedRowKeys.length > 1?'批量':''}}重申
          </a-button>
          <a-button
            v-if="currentStatus == '已撤回'"
            :disabled="selectedRowKeys.length == 0"
            type="primary"
            class="pm-btn-primary"
            icon="delete"
            @click="batchDel"
            >{{selectedRowKeys.length > 1?'批量':''}}删除
          </a-button>
        </div>
      </div>

      <a-table
        ref="table"
        size="middle"
        :scroll="{ y: 420 }"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        class="j-table-force-nowrap"
        @change="handleTableChange"
      >
        <span slot="rowIndex" slot-scope="text, record, index">{{ getRowIndex(index) }}</span>
        <span slot="status" slot-scope="text">
          <a-tag :color="getStatusColor(text)" style="margin-right: 0">{{ getStatusText(text) }}</a-tag>
        </span>
        <span slot="salary" slot-scope="text, record">{{ formatSalary(record) }}</span>
        <span slot="action" slot-scope="text, record">
          <a style="color: #d94409" @click="handleDetail(record, 'xq')">详情</a>
          <a-divider
            v-if="listType == 'sq' && currentStatus == '已撤回'"
            type="vertical"
          />
          <a
            v-if="listType == 'sq' && currentStatus == '已撤回'"
            @click="handleEdit(record)"
            >编辑</a
          >

          <!-- <a-divider v-if="listType == 'sp' && getRecordStatus(record) === '审批中'" type="vertical" />
          <a
            v-if="listType == 'sp' && getRecordStatus(record) === '审批中'"
            style="color: #faad14"
            @click="handleDetail(record, 'sp')"
            >审批</a
          >

          <a-divider
            v-if="listType == 'sq' && getRecordStatus(record) === '已撤回' "
            type="vertical"
          />
          <a
            v-if="listType == 'sq' && getRecordStatus(record) === '已撤回' "
            style="color: #096dd9"
            @click="handleAgain(record)"
            >再次申请</a
          >

          <a-divider v-if="listType == 'sq' && getRecordStatus(record) === '审批中'" type="vertical" />
          <a-popconfirm
            v-if="listType == 'sq' && getRecordStatus(record) === '审批中'"
            title="确定撤回该用人申请吗?"
            @confirm="() => handleCancelApply(record)"
          >
            <a style="color: #ff4d4f">撤回</a>
          </a-popconfirm> -->
        </span>
      </a-table>
    </div>

    <recruitment-apply-modal ref="modalForm" @ok="modalFormOk"></recruitment-apply-modal>
    <recruitment-apply-detail-modal ref="detailModal" @ok="modalFormOk"></recruitment-apply-detail-modal>
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
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction, httpAction } from '@/api/manage'
import { columnConfigMixin } from '@/mixins/columnConfigMixin'
import RecruitmentApplyModal from './modules/RecruitmentApplyModal.vue'
import RecruitmentApplyDetailModal from './modules/RecruitmentApplyDetailModal.vue'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'
import { recruitmentOrgFilterMixin } from '../common/recruitmentOrgFilterMixin'
import moment from 'moment'
import { postAction } from '../../../../api/manage'

const STATUS_MAP = {
  审批中: { text: '审批中', color: 'orange' },
  已通过: { text: '已通过', color: 'green' },
  招聘中: { text: '招聘中', color: 'blue' },
  已完成: { text: '已完成', color: 'cyan' },
  已撤回: { text: '已撤回', color: '#ff4d4f' },
  不通过: { text: '不通过', color: 'red' },
}

function getDefaultQueryParam() {
  return {
    fqsj_begin: '',
    fqsj_end: '',
    fqr: '',
    deptId: '',
    deptPath: '',
    postId: '',
    postName: '',
    zt: '',
  }
}

function getCreateTimeRange(params) {
  const startTime = params && params.fqsj_begin ? moment(params.fqsj_begin, 'YYYY-MM-DD', true) : null
  const endTime = params && params.fqsj_end ? moment(params.fqsj_end, 'YYYY-MM-DD', true) : null
  return startTime && startTime.isValid() && endTime && endTime.isValid() ? [startTime, endTime] : []
}

function isBlankValue(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
}

function formatValue(value) {
  return isBlankValue(value) ? '-' : value
}

function formatDateValue(value) {
  return isBlankValue(value) ? '-' : String(value).slice(0, 10)
}

function formatCompanyName(value) {
  return isBlankValue(value) ? '-' : String(value).split('/')[0]
}

function formatSalaryText(record) {
  const minSalary = record && record.zdxz
  const maxSalary = record && record.zgxz
  return isBlankValue(minSalary) || isBlankValue(maxSalary) ? '-' : minSalary + '-' + maxSalary + 'K'
}

function normalizeStatus(status) {
  const item = STATUS_MAP[status]
  return item && item.value ? item.value : item ? item.text : status || ''
}

export default {
  name: 'RecruitmentApplyList',
  orgTreeUrl: '/zpManage/hrmYrsq/loadTreeRoot',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin, recruitmentOrgFilterMixin],
  components: {
    RecruitmentApplyModal,
    RecruitmentApplyDetailModal,
    ColumnConfigSidebar,
  },
  props: {
    listType: {
      type: String,
      default: 'sq',
    },
  },
  data() {
    const queryParam = getDefaultQueryParam()
    return {
      disableMixinCreated: true,
      description: '用人申请列表',
      queryParam,
      createTimeRange: getCreateTimeRange(queryParam),
      currentStatus: 'all',

      recruitStatusCards: [
        { label: '招聘中', value: '招聘中', color: '#2f54eb', soft: 'rgba(47,84,235,0.16)', bg: '#f0f5ff' },
        { label: '完成招聘', value: '已完成', color: '#13c2c2', soft: 'rgba(19,194,194,0.16)', bg: '#e6fffb' },
      ],

      originalColumns: [
        { title: '状态', dataIndex: 'zt', align: 'center', width: 100, scopedSlots: { customRender: 'status' } },
        {
          title: '公司',
          dataIndex: 'deptPath',
          align: 'center',
          width: 380,
          customRender: (text) => this.renderTooltip(formatCompanyName(text), 360),
        },
        {
          title: '所属部门',
          dataIndex: 'dept_dictText',
          align: 'center',
          width: 360,
          customRender: (text) => this.renderTooltip(text, 340),
        },
        { title: '发起人', dataIndex: 'fqr', align: 'center', width: 120, customRender: formatValue },
        { title: '岗位名称', dataIndex: 'postId_dictText', align: 'center', width: 180, customRender: formatValue },
        { title: '职级名称', dataIndex: 'levelId_dictText', align: 'center', width: 120, customRender: formatValue },
        { title: '员工类型', dataIndex: 'employeeType', align: 'center', width: 120, customRender: formatValue },
        { title: '招聘人数', dataIndex: 'zprs', align: 'center', width: 120, customRender: formatValue },

        //{ title: '剩余招聘人数', dataIndex: 'syzprs', align: 'center', width: 120, customRender: formatValue },
        // { title: '入职人数', dataIndex: 'rzrs', align: 'center', width: 100, customRender: formatValue },
        // { title: '希望到岗日期', dataIndex: 'xwdgrq', align: 'center', width: 150, customRender: formatDateValue },
        // { title: '发起人工号', dataIndex: 'fqrgh', align: 'center', width: 120, customRender: formatValue },
        // {
        //   title: '薪资标准',
        //   dataIndex: 'salary',
        //   align: 'center',
        //   width: 110,
        //   scopedSlots: { customRender: 'salary' },
        // },
        // { title: '申请原因', dataIndex: 'sqyy', align: 'center', width: 110, customRender: formatValue },
        // { title: '简历数量', dataIndex: 'jlsl', align: 'center', width: 100, customRender: formatValue },
        // { title: '面试人数', dataIndex: 'msrs', align: 'center', width: 100, customRender: formatValue },
        // { title: 'offer人数', dataIndex: 'offerrs', align: 'center', width: 100, customRender: formatValue },
        // {
        //   title: '面试官',
        //   dataIndex: 'msg',
        //   align: 'center',
        //   width: 150,
        //   customRender: (text) => {
        //     return this.renderTooltip(text, 130)
        //   },
        // },
        // {
        //   title: '部门审批',
        //   dataIndex: 'deptSp',
        //   align: 'center',
        //   width: 150,
        //   customRender: (text) => {
        //     return this.renderTooltip(text, 130)
        //   },
        // },
        // {
        //   title: '用户会签',
        //   dataIndex: 'userHq',
        //   align: 'center',
        //   width: 150,
        //   customRender: (text) => {
        //     return this.renderTooltip(text, 130)
        //   },
        // },
        // {
        //   title: '抄送人',
        //   dataIndex: 'csr',
        //   align: 'center',
        //   width: 150,
        //   customRender: (text) => {
        //     return this.renderTooltip(text, 130)
        //   },
        // },
        // { title: '发起时间', dataIndex: 'fqsj', align: 'center', width: 170, customRender: formatValue },
      ],
      columnCode: 'HrmYrsq',
      url: {
        batchUp: '/zpManage/hrmYrsq/batchUpdateSpStatus',
        getTotal: '/zpManage/hrmYrsq/getTotal',

        list: '/zpManage/hrmYrsq/list',
        edit: '/zpManage/hrmYrsq/edit',
        delete: '/zpManage/hrmYrsq/delete',
        deleteBatch: '/zpManage/hrmYrsq/deleteBatch',
        exportXlsUrl: '/zpManage/hrmYrsq/exportXls',
        importExcelUrl: 'zpManage/hrmYrsq/importExcel',
        importExcelUrlNewName: 'HrmYrsq',
      },
      dictOptions: {},
      superFieldList: [],
    }
  },
  created() {
    console.log(this.listType)

    this.ipagination.pageSize = 20
    this.ipagination.pageSizeOptions = ['10', '20', '50']
    this.ipagination.showTotal = (total, range) => {
      return range[0] + '-' + range[1] + ' 共' + total + '条'
    }
    this.getSuperFieldList()
    if (this.listType === 'sp') {
      this.currentStatus = '审批中'
      this.handleStatusChange()
    } else {
      this.loadData(1)
    }

    this.initDictConfig()
  },
  computed: {
    applyStatusCards() {
      let arr = [
        { label: '全部', value: 'all', color: '#1890ff', soft: 'rgba(24,144,255,0.16)', bg: '#e6f7ff' },
        { label: '审批中', value: '审批中', color: '#fa8c16', soft: 'rgba(250,140,22,0.16)', bg: '#fff7e6' },
        { label: '已通过', value: '已通过', color: '#52c41a', soft: 'rgba(82,196,26,0.16)', bg: '#f6ffed' },
        { label: '不通过', value: '不通过', color: '#f5222d', soft: 'rgba(245,34,45,0.16)', bg: '#fff1f0' },
        { label: '已撤回', value: '已撤回', color: '#ff2b1f', soft: 'rgba(255,77,79,0.16)', bg: '#fff6f0' },
      ]
      if (this.listType === 'sp') {
        arr = [
          { label: '审批中', value: '审批中', color: '#fa8c16', soft: 'rgba(250,140,22,0.16)', bg: '#fff7e6' },
          { label: '已通过', value: '已通过', color: '#52c41a', soft: 'rgba(82,196,26,0.16)', bg: '#f6ffed' },
          { label: '不通过', value: '不通过', color: '#f5222d', soft: 'rgba(245,34,45,0.16)', bg: '#fff1f0' },
          { label: '抄送我的', value: '抄送我的', color: '#1890ff', soft: 'rgba(24,144,255,0.16)', bg: '#e6f7ff' },
        ]
      }
      return arr
    },
    statusOptions() {
      let arr = [
        { label: '全部', value: 'all', code: 'all', count: 0 },
        { label: '审批中', value: '审批中', code: 'orange', count: 0 },
        { label: '已通过', value: '已通过', code: 'green', count: 0 },
        { label: '招聘中', value: '招聘中', code: 'blue', count: 0 },
        { label: '已完成', value: '已完成', code: 'cyan', count: 0 },
        { label: '已撤回', value: '已撤回', code: 'yqx', count: 0 },
        { label: '不通过', value: '不通过', code: 'red', count: 0 },
      ]
      if (this.listType === 'sp') {
        arr = [
          { label: '审批中', value: '审批中', code: 'orange', count: 0 },
          { label: '已通过', value: '已通过', code: 'green', count: 0 },
          { label: '不通过', value: '不通过', code: 'red', count: 0 },
          { label: '抄送我的', value: '抄送我的', code: 'all', count: 0 },
        ]
      }
      return arr
    },

    importExcelUrl() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
    fieldTitleMap() {
      const map = {}
      this.originalColumns.forEach((col) => {
        if (col.dataIndex && col.title) {
          map[col.dataIndex] = col.title
        }
      })
      return map
    },
    columns() {
      const fixedColumns = [
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 100,
          scopedSlots: { customRender: 'action' },
        },
      ]
      return this.applyColumnConfig(this.originalColumns, { fixedColumns })
    },
    columnConfigNew() {
      return this.getColumnConfigData()
    },
  },
  methods: {
    initDictConfig() {},
    loadData(arg) {
      JeecgListMixin.methods.loadData.call(this, arg)
      this.getStatusTotal()
    },
    getStatusTotal() {
      httpAction(this.url.getTotal, '', 'get').then((res) => {
        if (res && res.success && Array.isArray(res.result)) {
          const totalMap = {}
          res.result.forEach((item) => {
            totalMap[item.statusText] = Number(item.statustotal) || 0
          })
          this.statusOptions.forEach((item) => {
            item.count = totalMap[item.label] || 0
          })
        }
      })
    },
    getSuperFieldList() {
      this.superFieldList = [
        { type: 'string', value: 'postName', text: '岗位名称', dictCode: '' },
        { type: 'string', value: 'levelName', text: '职级名称', dictCode: '' },
        { type: 'string', value: 'employeeType', text: '员工类型', dictCode: '' },
        { type: 'string', value: 'zprs', text: '招聘人数', dictCode: '' },
        { type: 'string', value: 'zdxz', text: '最低薪资(K)', dictCode: '' },
        { type: 'string', value: 'zgxz', text: '最高薪资(K)', dictCode: '' },
        { type: 'string', value: 'nlxx', text: '年龄下限', dictCode: '' },
        { type: 'string', value: 'nlsx', text: '年龄上限', dictCode: '' },
        { type: 'string', value: 'xb', text: '性别', dictCode: '' },
        { type: 'string', value: 'zy', text: '专业', dictCode: '' },
        { type: 'string', value: 'zdxl', text: '最低学历', dictCode: '' },
        { type: 'string', value: 'jyyq', text: '经验要求', dictCode: '' },
        { type: 'string', value: 'rzyq', text: '任职要求', dictCode: '' },
        { type: 'string', value: 'gwzz', text: '岗位职责', dictCode: '' },
        { type: 'string', value: 'sqyy', text: '申请原因', dictCode: '' },
        { type: 'string', value: 'msg', text: '面试官', dictCode: '' },
        { type: 'datetime', value: 'xwdgrq', text: '希望到岗日期' },
        { type: 'string', value: 'syzprs', text: '剩余招聘人数', dictCode: '' },
        { type: 'string', value: 'rzrs', text: '入职人数', dictCode: '' },
        { type: 'string', value: 'fqr', text: '发起人', dictCode: '' },
        { type: 'string', value: 'fqrgh', text: '发起人工号', dictCode: '' },
        { type: 'string', value: 'dept', text: '所属部门', dictCode: '' },
        { type: 'string', value: 'jlsl', text: '简历数量', dictCode: '' },
        { type: 'string', value: 'msrs', text: '面试人数', dictCode: '' },
        { type: 'string', value: 'offerrs', text: 'offer人数', dictCode: '' },
        { type: 'string', value: 'deptSp', text: '部门审批', dictCode: '' },
        { type: 'string', value: 'userHq', text: '用户会签', dictCode: '' },
        { type: 'string', value: 'csr', text: '抄送人', dictCode: '' },
        { type: 'datetime', value: 'fqsj', text: '发起时间' },
        { type: 'string', value: 'zt', text: '状态', dictCode: '' },
        { type: 'string', value: 'xh', text: '序号', dictCode: '' },
      ]
    },
    getRowIndex(index) {
      return (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1
    },
    getStatusText(status) {
      return STATUS_MAP[status] ? STATUS_MAP[status].text : formatValue(status)
    },
    getStatusColor(status) {
      return STATUS_MAP[status] ? STATUS_MAP[status].color : ''
    },
    getStatusCount(status) {
      if (status === 'all') {
        return this.currentStatus === 'all' ? this.ipagination.total : this.dataSource.length
      }
      if (status === this.currentStatus) {
        return this.ipagination.total
      }
      return this.dataSource.filter((item) => this.getRecordStatus(item) === status).length
    },
    getRecordStatus(record) {
      return normalizeStatus(record && record.zt)
    },
    formatSalary(record) {
      return formatSalaryText(record)
    },
    renderTooltip(text, width) {
      const value = String(formatValue(text))
      return this.$createElement(
        'a-tooltip',
        {
          style: {
            width: width + 'px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            display: 'block',
          },
          props: {
            title: value,
          },
        },
        [this.$createElement('span', value)]
      )
    },
    handleStatusChange() {
      this.queryParam.zt = this.currentStatus === 'all' ? '' : this.currentStatus
      this.searchQuery()
    },
    getStatusOptionCount(value) {
      const target = this.statusOptions.find((item) => item.value === value)
      return target ? target.count : 0
    },
    handleCardStatusChange(value) {
      this.currentStatus = value
      this.handleStatusChange()
    },
    handleCreateTimeRangeChange(value, dateString) {
      this.createTimeRange = value || []
      this.queryParam.fqsj_begin = dateString && dateString[0] ? dateString[0] : ''
      this.queryParam.fqsj_end = dateString && dateString[1] ? dateString[1] : ''
    },
    searchReset() {
      this.queryParam = getDefaultQueryParam()
      this.createTimeRange = getCreateTimeRange(this.queryParam)
      this.companyId = ''
      this.deptArr = []

      if (this.listType == 'sp') {
        this.currentStatus = '审批中'
        this.handleStatusChange()
      } else {
        this.loadData(1)
      }

      this.onClearSelected()
    },

    

    handleDetail(record, mode) {
      this.$refs.detailModal.open(record, mode || 'xq')
    },
    handleAgain(record) {
      this.$refs.modalForm.again(record)
    },
    handleSaveRemark({ record, remark }) {
      const payload = Object.assign({}, record, { remark })
      httpAction(this.url.edit, payload, 'put').then((res) => {
        if (res.success) {
          this.$message.success(res.message || '备注已保存')
          this.loadData()
        } else {
          this.$message.warning(res.message || '备注保存失败')
        }
      })
    },
    handleCancelApply(record) {
      this.$refs.detailModal.sharedSubmit(record, { result: '3', comment: '申请人撤回' })
    },
  },
}
</script>

<style scoped lang="less">
@import '~@assets/less/common.less';
.yrBox {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 87vh;
  background: #fff;
  padding: 10px 10px;
}

/* ===== 顶部状态大卡片 ===== */
.status-card-group {
  display: flex;
  gap: 14px;
  margin-bottom: 10px;
}

.status-card {
  flex: 1;
  min-width: 0;
  border: 1px solid #eef0f3;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(31, 45, 61, 0.05);
  overflow: hidden;
}

.status-card-header {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 14px;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);

  .header-bar {
    width: 4px;
    height: 14px;
    margin-right: 8px;
    border-radius: 2px;
    background: #fff;
  }
  .header-title {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
  }
}

.status-card-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 10px;
  padding: 12px 14px;
}

.mini-card {
  --c: #1890ff;
  --soft: rgba(24, 144, 255, 0.16);
  --bg: #e6f7ff;
  position: relative;
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fbfcfd;
  cursor: pointer;
  transition: all 0.22s ease;

  .mini-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    margin-right: 8px;
    border-radius: 50%;
    background: var(--c);
  }
  .mini-label {
    flex: 1;
    font-size: 13px;
    color: #595959;
    white-space: nowrap;
  }
  .mini-count {
    font-size: 18px;
    font-weight: 700;
    color: #262626;
    line-height: 1;
  }

  &:hover {
    border-color: var(--soft);
    background: var(--bg);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--soft);

    .mini-label {
      color: var(--c);
    }
    .mini-count {
      color: var(--c);
    }
  }
  &.active {
    border-color: var(--c);
    background: var(--bg);
    box-shadow: 0 4px 12px var(--soft);

    .mini-label {
      color: var(--c);
      font-weight: 600;
    }
    .mini-count {
      color: var(--c);
    }
  }
}

.recruitment-status-filter {
  margin-bottom: 10px;
  position: relative;

  /deep/ .ant-tabs-card > .ant-tabs-bar {
    margin: 0;
  }
  /deep/ .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab {
    color: #e6f7ff;
    border-radius: 10px 10px 0 0;
    background: #0082fc;
  }
  /deep/ .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active {
    background: #0082fc;
  }
}

/* ===== 按钮 ===== */
.pm-btn-primary {
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);

  &:hover,
  &:focus {
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    opacity: 0.92;
  }
}
.pm-btn-primary[disabled] {
  background: linear-gradient(135deg, #e8e8e8 0%, #ccc 100%);
  color: #ffffff;
  box-shadow: none;

}

.pm-btn-reset {
  height: 34px;
  border-radius: 8px;
  color: #64748b;
  border-color: #e2e8f0;
  background: #ffffff;

  &:hover {
    color: #1a2a3d;
    border-color: rgba(37, 99, 235, 0.35);
  }
}

.status-count {
  margin-left: 4px;
  font-size: 12px;
}

::v-deep .ant-tabs-card > .ant-tabs-bar {
  margin: 0;
}

::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab {
  color: #e6f7ff;
  border-radius: 10px 10px 0 0;
  background: #0082fc;
}

::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active {
  background: #0082fc;
}

/* 未激活状态 - 底部色条 */
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:not(.ant-tabs-tab-active):has([data-status='orange']) {
  background: #fa8c16;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:not(.ant-tabs-tab-active):has([data-status='green']) {
  background: #55c42a;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:not(.ant-tabs-tab-active):has([data-status='blue']) {
  background: #0082fc;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:not(.ant-tabs-tab-active):has([data-status='cyan']) {
  background: #18b6ff;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:not(.ant-tabs-tab-active):has([data-status='yqx']) {
  background: #0f7797;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab:not(.ant-tabs-tab-active):has([data-status='red']) {
  background: #b9242c;
}

/* 激活状态 - 背景色 + 底部色条 + 文字色 */
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status='orange']) {
  background: #fa8c16;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status='green']) {
  background: #55c42a;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status='blue']) {
  background: #0082fc;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status='cyan']) {
  background: #18b6ff;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status='yqx']) {
  background: #0f7797;
}
::v-deep .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active:has([data-status='red']) {
  background: #b9242c;
}
</style>
