<template>
  <div :bordered="false" class="probation-period-page">
    <!-- 状态筛选区域 -->
    <div class="probation-period-status-filter">
      <a-tabs :activeKey="currentStatus" type="card" @change="handleStatusChange">
        <a-tab-pane v-for="item in statusOptions" :key="item.value">
          <span slot="tab" :data-status="item.code">
            {{ item.label }} <span class="status-count">({{ item.count }})</span>
          </span>
        </a-tab-pane>
      </a-tabs>
      <div class="table-operator pass-probation-toolbar">
        <!-- <a-button type="primary" icon="plus" @click="handleAdd">新增</a-button> -->
        <a-button type="primary" class="pm-btn-primary" icon="download" @click="handleExportXls('试用期跟踪')"
          >导出</a-button
        >
        <a-upload
          name="file"
          :showUploadList="false"
          :multiple="false"
          :headers="tokenHeader"
          :action="importExcelUrlNew"
          @change="handleImportExcelNew"
        >
          <a-button class="pm-btn-primary" type="primary" icon="import">导入</a-button>
        </a-upload>
        <a-button type="primary" class="pm-btn-primary" icon="setting" @click="toggleColumnConfig">字段配置</a-button>
        <!-- <j-super-query
          ref="superQueryModal"
          :fieldList="superFieldList"
          @handleSuperQuery="handleSuperQuery"
        ></j-super-query> -->
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px">批量操作 <a-icon type="down" /></a-button>
        </a-dropdown>
      </div>
    </div>

    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="公司">
              <a-select
                v-model="queryParam.companyId"
                allowClear
                showSearch
                optionFilterProp="children"
                :loading="orgLoading"
                placeholder="全部"
                @change="handleQueryCompanyChange"
              >
                <a-select-option v-for="item in companyList" :title="item.name" :key="item.id" :value="item.id">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="所属部门">
              <a-cascader
                v-model="queryDeptPath"
                :options="queryDeptOptions"
                :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                changeOnSelect
                allowClear
                :disabled="!queryParam.companyId"
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
              >
                <a-select-option v-for="item in queryPostOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="工号">
              <a-input v-model.trim="queryParam.gh" allowClear placeholder="请输入工号" />
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="姓名">
              <a-input v-model.trim="queryParam.xm" allowClear placeholder="请输入姓名" />
            </a-form-item>
          </a-col>

          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="试用开始时间">
              <j-date
                v-model="queryParam.syqkssj_begin"
                date-format="YYYY-MM-DD"
                placeholder="请选择开始日期"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="试用结束时间">
              <j-date
                v-model="queryParam.syqjssj_end"
                date-format="YYYY-MM-DD"
                placeholder="请选择结束日期"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24" class="search-btn-col">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" class="pm-btn-primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button icon="reload" style="margin-left: 8px" @click="searchReset">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- <div class="ant-alert ant-alert-info" style="margin-bottom: 16px">
      <i class="anticon anticon-info-circle ant-alert-icon"></i>
      已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a> 项
      <a style="margin-left: 24px" @click="onClearSelected">清空</a>
    </div> -->

    <a-table
      v-if="columnConfigReady"
      ref="table"
      size="middle"
      :scroll="tableScroll"
      bordered
      rowKey="id"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="ipagination"
      :loading="loading"
      class="j-table-force-nowrap"
      @change="handleTableChange"
    >
      <span slot="rowIndex" slot-scope="text, record, index">{{ getRowIndex(index) }}</span>
      <span slot="action" slot-scope="text, record">
        <a @click="handleInterview(record)">添加访谈</a>
        <!-- <a-divider type="vertical" />
        <a @click="handleEdit(record)">编辑</a> -->
        <template v-if="record.zt == '试用期'">
          <a-divider type="vertical" />
          <a class="regular-link" @click="handleRegular(record)">转正</a>
        </template>
        <template v-if="record.zt == '拒绝转正'">
          <a-divider type="vertical" />
          <a class="regular-link" @click="handleRegular(record)">再次转正</a>
        </template>
        <a-divider type="vertical" />
        <a @click="handleDetail(record)">详情</a>
        <!-- <a-dropdown>
          <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a @click="handleDetail(record)">详情</a>
            </a-menu-item>
            <a-menu-item>
              <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                <a>删除</a>
              </a-popconfirm>
            </a-menu-item>
          </a-menu>
        </a-dropdown> -->
      </span>
    </a-table>

    <!-- 配置加载中的提示 -->
    <div v-else class="table-loading-placeholder">
      <a-spin tip="正在加载表格配置...">
        <div style="padding: 50px; background: rgba(0, 0, 0, 0.05); border-radius: 4px"></div>
      </a-spin>
    </div>

    <hrm-syqgz-modal ref="modalForm" @ok="modalFormOk"></hrm-syqgz-modal>
    <probation-interview-modal ref="interviewModal" @ok="modalFormOk" />
    <probation-detail-modal ref="detailModal" />
    <probation-regular-modal ref="regularModal" @ok="modalFormOk" />
    <column-config-sidebar
      :visible="columnConfigVisible"
      :allColumns="columnConfigNew"
      :fieldTitleMap="fieldTitleMap"
      @close="columnConfigVisible = false"
      @confirm="handleColumnConfigConfirm"
    />
    <employee-form-modal
      type="rzgl"
      ref="employeeFormModal"
      :constractBelongOptions="constractBelongOptions"
      @ok="modalFormOk"
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
import HrmSyqgzModal from './modules/HrmSyqgzModal'
import ProbationDetailModal from './modules/ProbationDetailModal'
import ProbationInterviewModal from './modules/ProbationInterviewModal'
import ProbationRegularModal from './modules/ProbationRegularModal.vue'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'
import EmployeeFormModal from '@/views/peoplemanagement/employeeInfo/modules/EmployeeFormModal.vue'

function defaultQuery() {
  return {
    companyId: '',
    gh: '',
    xm: '',
    dept: '',
    postId: '',
    syqkssj_begin: '',
    syqjssj_end: '',
  }
}

function formatValue(value) {
  return value === undefined || value === null || value === '' ? '-' : value
}

export default {
  name: 'HrmSyqgzList',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin, tableAdaptiveMixin],
  components: {
    HrmSyqgzModal,
    ProbationDetailModal,
    ProbationInterviewModal,
    ProbationRegularModal,
    ColumnConfigSidebar,
    EmployeeFormModal,
  },
  data() {
    return {
      description: '试用期跟踪管理页面',
      // 当前选中的状态
      currentStatus: '全部',
      // 状态选项配置
      statusOptions: [
        { label: '全部', value: '全部', code: 'all', count: 0 },
        { label: '试用期', value: '试用期', code: 'probation', count: 0 },
        { label: '未转正', value: '未转正', code: 'pending', count: 0 },
        { label: '拒绝转正', value: '拒绝转正', code: 'rejected', count: 0 },
      ],
      queryParam: defaultQuery(),
      companyList: [],
      queryDeptOptions: [],
      queryDeptPath: [],
      queryPostOptions: [],
      queryPostLoading: false,
      orgLoading: false,
      disableMixinCreated: true,
      columnCode: 'HrmSyqgz', // 试用期管理字段配置标识
      originalColumns: [
        {
          title: '状态',
          align: 'center',
          width: 100,
          dataIndex: 'zt',
          customRender: (text) => {
            const colors = {
              已转正: '#55c42a',
              未转正: '#e6a23c',
              拒绝转正: '#f56c6c',
              试用期: '#0082fc',
            }
            return text ? <a-tag color={colors[text] || ''}>{text}</a-tag> : '-'
          },
        },
        {
          title: '公司',
          align: 'center',
          width: 180,
          dataIndex: 'companyId',
          customRender: (text, record) => formatValue(record.companyId_dictText || text),
        },
        {
          title: '所属部门',
          align: 'center',
          width: 150,
          dataIndex: 'dept',
          customRender: (text, record) => formatValue(record.dept_dictText || text),
        },
        {
          title: '岗位名称',
          align: 'center',
          width: 160,
          dataIndex: 'postId',
          customRender: (text, record) => formatValue(record.postId_dictText || text),
        },
        {
          title: '职级名称',
          align: 'center',
          width: 120,
          dataIndex: 'postRank',
          customRender: (text, record) => formatValue(record.postRank_dictText || text),
        },
        {
          title: '工号',
          align: 'center',
          width: 110,
          dataIndex: 'gh',
          customRender: formatValue,
        },
        {
          title: '姓名',
          align: 'center',
          width: 100,
          dataIndex: 'xm',
          customRender: formatValue,
        },
        {
          title: '试用期开始时间',
          align: 'center',
          width: 140,
          dataIndex: 'syqkssj',
          customRender: formatValue,
        },
        {
          title: '试用期结束时间',
          align: 'center',
          width: 140,
          dataIndex: 'syqjssj',
          customRender: formatValue,
        },
      ],
      url: {
        list: '/ryManage/hrmSyqgz/list',
        delete: '/ryManage/hrmSyqgz/delete',
        deleteBatch: '/ryManage/hrmSyqgz/deleteBatch',
        exportXlsUrl: '/ryManage/hrmSyqgz/exportXls',
        importExcelUrl: 'ryManage/hrmSyqgz/importExcel',
        importExcelUrlNewName: 'HrmSyqgz',
        getTotal: '/ryManage/hrmSyqgz/getTotal',
      },
      dictOptions: {},
      superFieldList: [],
    }
  },
  computed: {
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
    columnConfigNew() {
      return this.getColumnConfigData()
    },
    columns() {
      const fixedColumns = [
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width: 300,
          fixed: 'right',
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

      // 应用字段配置到 originalColumns
      const configuredColumns = this.applyColumnConfig(this.originalColumns, {
        fixedColumns: [],
        excludedFields: [],
      })

      // 合并数据列（不包含操作列）
      const dataColumns = [...dynamicColumns, ...configuredColumns]

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
    this.getSuperFieldList()
    this.loadOrgTree()
    // 先获取字段配置，再加载表格数据
    this.getColumnConfig().then(() => {
      this.loadData(1)
    })
  },
  methods: {
    initDictConfig() {},
    getRowIndex(index) {
      return (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1
    },
    loadOrgTree() {
      this.orgLoading = true
      getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 })
        .then((res) => {
          if (!res || !res.success || !Array.isArray(res.result)) {
            throw new Error((res && res.message) || '组织架构加载失败')
          }
          const root = res.result[0]
          this.companyList = root && Array.isArray(root.children) ? root.children : []
        })
        .catch((error) => {
          this.companyList = []
          this.$message.error(error.message || '组织架构加载失败，请稍后重试')
        })
        .finally(() => {
          this.orgLoading = false
        })
    },
    handleQueryCompanyChange(companyId) {
      const company = this.companyList.find((item) => String(item.id) === String(companyId))
      this.queryDeptOptions = company ? [company] : []
      this.queryDeptPath = []
      this.queryParam.dept = ''
      this.resetQueryPostOptions()
    },
    handleQueryDeptChange(value) {
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      this.queryDeptPath = path
      this.queryParam.dept = path.length > 1 ? path[path.length - 1] : ''
      this.resetQueryPostOptions()
      if (this.queryParam.dept) {
        this.loadQueryPostOptions(this.queryParam.dept)
      }
    },
    resetQueryPostOptions() {
      this.queryPostOptions = []
      this.queryParam.postId = ''
    },
    loadQueryPostOptions(deptId) {
      this.queryPostLoading = true
      getAction('/hrJobSequence/hrJobSequence/getChildSequences', {
        deptId,
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 99999,
      })
        .then((res) => {
          const rows = Array.isArray(res) ? res : (res && res.result) || []
          this.queryPostOptions = rows.map((item) => ({
            label: item.postName,
            value: item.id,
          }))
        })
        .catch(() => {
          this.queryPostOptions = []
          this.$message.error('岗位加载失败，请稍后重试')
        })
        .finally(() => {
          this.queryPostLoading = false
        })
    },
    searchReset() {
      this.queryParam = defaultQuery()
      this.queryDeptOptions = []
      this.queryDeptPath = []
      this.queryPostOptions = []
      this.queryPostLoading = false
      this.currentStatus = '全部'
      this.onClearSelected()
      this.loadData(1)
    },
    handleInterview(record) {
      this.$refs.interviewModal.open(record)
    },
    handleDetail(record) {
      const employeeNo = String(record.gh || '').trim()
      if (!employeeNo) {
        this.$message.warning('当前试用期记录缺少工号，无法加载员工详情')
        return
      }
      this.loading = true
      postAction('/ryManage/hrmSyqgz/queryByNo?no=' + employeeNo)
        .then((res) => {
          if (!res || !res.success || !res.result || typeof res.result !== 'object' || Array.isArray(res.result)) {
            throw new Error((res && res.message) || '员工详情加载失败')
          }
          if (!res.result.jbxx || typeof res.result.jbxx !== 'object' || Array.isArray(res.result.jbxx)) {
            throw new Error('员工详情数据不完整，缺少基本信息')
          }
          const detail = res.result
          const basicInfo = detail.jbxx
          const relationNo = String(detail.gh || employeeNo).trim()
          this.$refs.employeeFormModal.detail(Object.assign({}, basicInfo, { no: relationNo }))
        })
        .catch((error) => {
          this.$message.error(error.message || '员工详情加载失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleRegular(record) {
      this.$refs.regularModal.open(record)
    },
    // 重写 loadData 方法
    loadData(arg) {
      JeecgListMixin.methods.loadData.call(this, arg)
      this.getStatusTotal()
    },
    // 获取状态统计
    getStatusTotal() {
      httpAction(this.url.getTotal, '', 'get')
        .then((res) => {
          if (!res || !res.success || !Array.isArray(res.result)) {
            throw new Error((res && res.message) || '状态统计加载失败')
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
          this.$message.warning(error.message || '状态统计加载失败')
        })
    },
    // 处理状态切换
    handleStatusChange(status) {
      this.currentStatus = status
      if (status === '全部') {
        delete this.queryParam.zt
      } else {
        this.$set(this.queryParam, 'zt', status)
      }
      this.onClearSelected()
      this.loadData(1)
    },
    getSuperFieldList() {
      this.superFieldList = [
        { type: 'string', value: 'zt', text: '状态', dictCode: '' },
        { type: 'string', value: 'companyId', text: '公司', dictCode: 'sys_depart,depart_name,id' },
        { type: 'string', value: 'dept', text: '所属部门', dictCode: 'sys_depart,depart_name,id' },
        { type: 'string', value: 'postId', text: '岗位名称', dictCode: 'hr_job_sequence,post_name,id' },
        { type: 'string', value: 'postRank', text: '职级名称', dictCode: 'hr_job_level,level_name,id' },
        { type: 'string', value: 'gh', text: '工号', dictCode: '' },
        { type: 'string', value: 'xm', text: '姓名', dictCode: '' },
        { type: 'date', value: 'syqkssj', text: '试用期开始时间' },
        { type: 'date', value: 'syqjssj', text: '试用期结束时间' },
      ]
    },
  },
}
</script>

<style scoped lang="less">
@import './probationPeriod.less';
.regular-link {
  color: #52c41a;
}
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
