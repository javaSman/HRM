<template>
  <div class="planBox">
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
          
          <a-col :md="4" :sm="8">
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
          <a-col :md="4" :sm="8">
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
          <a-col :md="4" :sm="8">
            <a-form-item label="岗位名称">
              <j-select-recruitment-post
                url="/zpManage/hrmZpjh/getChildSequences"
                v-model="queryParam.postId"
                :dept-id="queryParam.deptId"
                value-field="id"
                placeholder="请选择岗位名称"
              />
            </a-form-item>
          </a-col>
          <a-col :md="10" :sm="10">
            <a-form-item>
              <a-button type="primary" class="pm-btn-primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button class="pm-btn-reset" icon="reload" style="margin-left: 5px" @click="searchReset">重置</a-button>

              
              
              <a-button
                style="margin-left: 5px"
                type="primary"
                class="pm-btn-primary"
                icon="download"
                @click="handleExportXlsByColumns(listType === 'sp' ? '招聘计划审批' : '招聘计划')"
                >导出</a-button>

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
                v-if="currentStatus == '计划中' && listType == 'sq'"
                type="primary"
                class="pm-btn-primary"
                style="margin-left: 5px"
                icon="to-top"
                :disabled="selectedRowKeys.length !== 1"
                @click="handlePublish"
                >提交审批
          </a-button>
          <a-button
            v-if="currentStatus == '审批中' && listType == 'sq'"
            :disabled="selectedRowKeys.length == 0"
            type="primary"
            class="pm-btn-primary"
            icon="rollback"
            @click="batchAll('ch')"
            >{{selectedRowKeys.length > 1?'批量':''}}撤回
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
          <!-- <a-button
            v-if="currentStatus == '已撤回'"
            :disabled="selectedRowKeys.length == 0"
            type="primary"
            class="pm-btn-primary"
            icon="delete"
            @click="batchDel"
            >批量删除
          </a-button> -->
        </div>
      </div>

    <!-- table区域-begin -->
    <div>
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
            @click="handleEdit(record)"
            >再次申请</a
          >

          <a-divider v-if="listType == 'sq' && getRecordStatus(record) === '审批中'" type="vertical" />
          <a-popconfirm
            v-if="listType == 'sq' && getRecordStatus(record) === '审批中'"
            title="确定撤回该招聘计划吗?"
            @confirm="() => handleCancelApply(record)"
          >
            <a style="color: #ff4d4f">撤回</a>
          </a-popconfirm> -->
        </span>
      </a-table>
    </div>

    <recruitment-plan-modal ref="modalForm" @ok="modalFormOk"></recruitment-plan-modal>
    <recruitment-plan-detail-modal ref="detailModal" @ok="modalFormOk"></recruitment-plan-detail-modal>
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
import { httpAction, postAction } from '@/api/manage'
import { columnConfigMixin } from '@/mixins/columnConfigMixin'
import RecruitmentPlanModal from './modules/RecruitmentPlanModal.vue'
import RecruitmentPlanDetailModal from './modules/RecruitmentPlanDetailModal.vue'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'
import { recruitmentOrgFilterMixin } from '../common/recruitmentOrgFilterMixin'
import moment from 'moment'

const STATUS_MAP = {
  计划中: { text: '计划中', color: 'orange' },
  审批中: { text: '审批中', color: 'gold' },
  已通过: { text: '已通过', color: 'green' },
  不通过: { text: '不通过', color: 'red' },
  已撤回: { text: '已撤回', color: '#ff4d4f' },
}

function getDefaultQueryParam() {
  return {
    createTime_begin: '',
    createTime_end: '',
    deptId: '',
    deptPath: '',
    postId: '',
    postName: '',
    zt: '',
  }
}

function getCreateTimeRange(params) {
  const startTime = params && params.createTime_begin ? moment(params.createTime_begin, 'YYYY-MM-DD', true) : null
  const endTime = params && params.createTime_end ? moment(params.createTime_end, 'YYYY-MM-DD', true) : null
  return startTime && startTime.isValid() && endTime && endTime.isValid() ? [startTime, endTime] : []
}

function isBlankValue(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
}

function formatValue(value) {
  return isBlankValue(value) ? '-' : value
}

function formatCompanyName(value) {
  return isBlankValue(value) ? '-' : String(value).split('/')[0]
}

function normalizeStatus(status) {
  const item = STATUS_MAP[status]
  return item ? item.text : status || ''
}

export default {
  name: 'RecruitmentPlanList',
  orgTreeUrl: '/zpManage/hrmZpjh/loadTreeRoot',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin, recruitmentOrgFilterMixin],
  components: {
    RecruitmentPlanModal,
    RecruitmentPlanDetailModal,
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
      description: '招聘计划列表',
      queryParam,
      createTimeRange: getCreateTimeRange(queryParam),
      currentStatus: 'all',

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
        { title: '岗位名称', dataIndex: 'postId_dictText', align: 'center', width: 180, customRender: formatValue },
        { title: '职级名称', dataIndex: 'levelId_dictText', align: 'center', width: 120, customRender: formatValue },
        { title: '员工类型', dataIndex: 'employeeType', align: 'center', width: 100, customRender: formatValue },
        { title: '申请招聘人数', dataIndex: 'zprs', align: 'center', width: 100, customRender: formatValue },
        { title: '计划招聘人数', dataIndex: 'dzprs', align: 'center', width: 120, customRender: formatValue },
      ],
      columnCode: 'HrmZpjh',
      url: {
        getTotal: '/zpManage/hrmZpjh/getTotal',
        list: '/zpManage/hrmZpjh/list',
        delete: '/zpManage/hrmZpjh/delete',
        deleteBatch: '/zpManage/hrmZpjh/deleteBatch',
        exportXlsUrl: '/zpManage/hrmZpjh/exportXls',
        importExcelUrl: 'zpManage/hrmZpjh/importExcel',
        importExcelUrlNewName: 'HrmZpjh',
        add: '/zpManage/hrmZpjh/add',
        edit: '/zpManage/hrmZpjh/edit',
        updateSpStatus: '/zpManage/hrmZpjh/updateSpStatus',
        batchUp: '/zpManage/hrmZpjh/batchUpdateSpStatus',

      },
      dictOptions: {},
      superFieldList: [],
    }
  },
  created() {
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
        { label: '计划中', value: '计划中', color: '#fa8c16', soft: 'rgba(250,140,22,0.16)', bg: '#fff7e6' },
        { label: '审批中', value: '审批中', color: '#faad14', soft: 'rgba(250,173,20,0.16)', bg: '#fffbe6' },
        { label: '已通过', value: '已通过', color: '#52c41a', soft: 'rgba(82,196,26,0.16)', bg: '#f6ffed' },
        { label: '不通过', value: '不通过', color: '#f5222d', soft: 'rgba(245,34,45,0.16)', bg: '#fff1f0' },
        { label: '已撤回', value: '已撤回', color: '#ff2b1f', soft: 'rgba(255,77,79,0.16)', bg: '#fff6f0' },
      ]
      if (this.listType === 'sp') {
        arr = [
          { label: '审批中', value: '审批中', color: '#fa8c16', soft: 'rgba(250,140,22,0.16)', bg: '#fff7e6' },
          { label: '已通过', value: '已通过', color: '#52c41a', soft: 'rgba(82,196,26,0.16)', bg: '#f6ffed' },
          { label: '不通过', value: '不通过', color: '#f5222d', soft: 'rgba(245,34,45,0.16)', bg: '#fff1f0' },
          { label: '抄送我的', value: '抄送我的',  color: '#1890ff', soft: 'rgba(24,144,255,0.16)', bg: '#e6f7ff' },
        ]
      }
      return arr
    },
    statusOptions() {
      let arr = [
        { label: '全部', value: 'all', code: 'all', count: 0 },
        { label: '计划中', value: '计划中', code: 'orange', count: 0 },
        { label: '审批中', value: '审批中', code: 'gold', count: 0 },
        { label: '已通过', value: '已通过', code: 'green', count: 0 },
        { label: '不通过', value: '不通过', code: 'red', count: 0 },
        { label: '已撤回', value: '已撤回', code: 'yqx', count: 0 },
      ]
      if (this.listType === 'sp') {
        arr = [
          { label: '审批中', value: '审批中', code: 'orange', count: 0 },
          { label: '已通过', value: '已通过', code: 'green', count: 0 },
          { label: '不通过', value: '不通过', code: 'red', count: 0 },
          { label: '抄送我的', value: '抄送我的', code: 'blue', count: 0 },
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
        { type: 'string', value: 'dzprs', text: '计划招聘人数', dictCode: '' },
        { type: 'string', value: 'zt', text: '状态', dictCode: '' },
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
    getRecordStatus(record) {
      return normalizeStatus(record && record.zt)
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
      this.queryParam.createTime_begin = dateString && dateString[0] ? dateString[0] : ''
      this.queryParam.createTime_end = dateString && dateString[1] ? dateString[1] : ''
    },
    searchReset() {
      this.queryParam = getDefaultQueryParam()
      this.createTimeRange = getCreateTimeRange(this.queryParam)
      this.companyId = ''
      this.deptArr = []

      this.loadData(1)
      this.onClearSelected()
    },
    
    handleEdit(record) {
      this.$refs.detailModal.open(record, 'bj')
    },
    handleDetail(record, mode) {
      this.$refs.detailModal.open(record, mode || 'xq')
    },
    handlePublish() {
      if (this.selectedRowKeys.length !== 1) {
        this.$message.warning('请勾选一条数据再发布')
        return
      }
      const record = this.selectionRows[0]
      this.$refs.detailModal.open(record, 'fb')
    },
    handleCancelApply(record) {
      this.$refs.detailModal.sharedSubmit(record,{result:'3',comment:'申请人撤回'})
    },
  },
}
</script>

<style scoped lang="less">
@import '~@assets/less/common.less';
.planBox {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 87vh;
  background: #fff;
  padding: 10px 10px;
}

/* ===== 顶部状态卡片 ===== */
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
</style>
