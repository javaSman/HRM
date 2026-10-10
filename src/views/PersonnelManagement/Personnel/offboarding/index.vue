<template>
  <div class="offboarding-page">
    <div class="offboarding-status-filter">
      <a-tabs :activeKey="currentStatus" type="card" @change="handleStatusChange">
        <a-tab-pane v-for="item in statusOptions" :key="item.value">
          <span slot="tab" :data-status="item.code">
            {{ item.label }} <span class="status-count">({{ item.count }})</span>
          </span>
        </a-tab-pane>
      </a-tabs>
    </div>

    <div class="table-operator offboarding-toolbar">
      <a-button type="primary" class="pm-btn-primary" icon="plus" @click="handleAdd">发起离职</a-button>
      <a-button type="primary" class="pm-btn-primary" icon="setting" @click="toggleColumnConfig"> 字段配置 </a-button>
    </div>

    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="工号"
              ><a-input v-model.trim="queryParam.gh" allowClear placeholder="请输入工号"
            /></a-form-item>
          </a-col>
          <a-col :xl="3" :lg="4" :md="6" :sm="12" :xs="24">
            <a-form-item label="姓名"
              ><a-input v-model.trim="queryParam.xm" allowClear placeholder="请输入姓名"
            /></a-form-item>
          </a-col>
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
                <a-select-option v-for="item in companyList" :title="item.name" :key="item.id" :value="item.id">{{
                  item.name
                }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="4" :lg="5" :md="6" :sm="12" :xs="24">
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
          <a-col :xl="3" :lg="5" :md="8" :sm="12" :xs="24">
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
      class="j-table-force-nowrap offboarding-table"
      @change="handleTableChange"
    >
      <span slot="rowIndex" slot-scope="text, record, index">{{ getRowIndex(index) }}</span>
      <template slot="zt" slot-scope="text"
        ><a-tag :color="getStatusColor(text)">{{ text || '-' }}</a-tag></template
      >
      <span slot="action" slot-scope="text, record" class="table-action">
        <a @click="handleDetail(record)">详情</a>
        <template v-if="record.zt !== '已离职' && record.zt !== '已取消'">
          <a-divider type="vertical" />
          <a style="color: #faad14" @click="handleInterview(record)">离职访谈</a>
        </template>
        <template v-if="record.zt === '审批中'">
          <template v-if="record.brSpStatus == 1">
            <a-divider type="vertical" />
            <a style="color: #52c41a" @click="handleApprove(record)">通过</a>
          </template>
          <a-divider type="vertical" />
          <a style="color: #ff4d4f" @click="handleCancelResignation(record)">取消</a>
        </template>
        <template v-if="record.zt === '待离职'">
          <a-divider type="vertical" />
          <a style="color: #1890ff" @click="handleSettle(record)">离职结算</a>
          <a-divider type="vertical" />
          <a style="color: #52c41a" @click="handleConfirm(record)">确认离职</a>
        </template>
        <template v-if="record.zt === '结算中'">
          <a-divider type="vertical" />
          <a style="color: #1890ff" @click="handleSettle(record)">结算处理</a>
        </template>
      </span>
    </a-table>

    <!-- 配置加载中的提示 -->
    <div v-else class="table-loading-placeholder">
      <a-spin tip="正在加载表格配置...">
        <div style="padding: 50px; background: rgba(0, 0, 0, 0.05); border-radius: 4px"></div>
      </a-spin>
    </div>

    <!-- 发起离职弹窗 -->
    <offboarding-create-modal ref="offboardingCreateModal" @ok="modalFormOk" />
    <!-- 离职访谈弹窗 -->
    <offboarding-interview-modal ref="offboardingInterviewModal" @ok="modalFormOk" />
    <!-- 审批通过弹窗 -->
    <offboarding-approve-modal ref="offboardingApproveModal" @ok="modalFormOk" />
    <!-- 取消离职弹窗 -->
    <offboarding-cancel-modal ref="offboardingCancelModal" @ok="modalFormOk" />
    <!-- 离职结算弹窗 -->
    <offboarding-settle-modal ref="offboardingSettleModal" @ok="modalFormOk" />
    <!-- 确认离职弹窗 -->
    <offboarding-confirm-modal ref="offboardingConfirmModal" @ok="modalFormOk" />
    <!-- 离职详情弹窗 -->
    <offboarding-detail-modal ref="offboardingDetailModal" />
    <!-- 字段配置侧边栏 -->
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
import offboardingCreateModal from './modules/offboardingCreateModal.vue'
import offboardingInterviewModal from './modules/offboardingInterviewModal.vue'
import offboardingApproveModal from './modules/offboardingApproveModal.vue'
import offboardingCancelModal from './modules/offboardingCancelModal.vue'
import offboardingSettleModal from './modules/offboardingSettleModal.vue'
import offboardingConfirmModal from './modules/offboardingConfirmModal.vue'
import offboardingDetailModal from './modules/offboardingDetailModal.vue'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'

/** 离职状态选项配置 */
const STATUS_OPTIONS = [
  { label: '全部', value: '全部', code: 'all' },
  { label: '审批中', value: '审批中', code: 'approving' },
  { label: '待离职', value: '待离职', code: 'pending' },
  { label: '结算中', value: '结算中', code: 'settling' },
  { label: '已离职', value: '已离职', code: 'completed' },
  { label: '已取消', value: '已取消', code: 'cancelled' },
]

/** 离职状态对应的标签颜色（与 tab 颜色保持一致） */
const STATUS_COLORS = { 审批中: '#0082fc', 待离职: '#e6a23c', 结算中: '#13c2c2', 已离职: '#67c23a', 已取消: '#909399' }

/**
 * 生成默认查询参数
 * @returns {Object} 查询参数对象
 */
function defaultQuery() {
  return {
    gh: '', // 工号
    xm: '', // 姓名
    companyId: '', // 公司ID
    dept: '', // 部门ID
  }
}

/**
 * 格式化显示值，空值显示为 '-'
 * @param {*} value - 待格式化的值
 * @returns {string} 格式化后的值
 */
function formatValue(value) {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ? '-' : value
}

/**
 * 递归清洗树形数据，确保每个节点的 children 都是数组
 * @param {Array} nodes - 节点数组
 * @returns {Array} 清洗后的节点数组
 */
function cleanTreeData(nodes) {
  if (!Array.isArray(nodes)) return []
  return nodes.map((node) => {
    const cleaned = { ...node }
    // 确保 children 是数组，如果不存在或无效则设为空数组
    if (!Array.isArray(cleaned.children)) {
      cleaned.children = []
    } else {
      cleaned.children = cleanTreeData(cleaned.children)
    }
    return cleaned
  })
}

export default {
  name: 'PersonnelOffboardingList',
  mixins: [JeecgListMixin, mixinDevice, columnConfigMixin, tableAdaptiveMixin],
  components: {
    offboardingCreateModal, // 发起离职弹窗
    offboardingInterviewModal, // 离职访谈弹窗
    offboardingApproveModal, // 审批通过弹窗
    offboardingCancelModal, // 取消离职弹窗
    offboardingSettleModal, // 离职结算弹窗
    offboardingConfirmModal, // 确认离职弹窗
    offboardingDetailModal, // 离职详情弹窗
    ColumnConfigSidebar, // 字段配置侧边栏
  },
  data() {
    const queryParam = defaultQuery()
    return {
      disableMixinCreated: true, // 禁用混入的自动加载
      currentStatus: '全部', // 当前选中的状态标签
      statusOptions: STATUS_OPTIONS.map((item) => Object.assign({ count: 0 }, item)), // 状态选项列表（含统计数量）
      queryParam, // 查询参数
      companyList: [], // 公司列表
      queryDeptOptions: [], // 查询条件-部门选项
      queryDeptPath: [], // 查询条件-部门路径
      orgLoading: false, // 组织架构加载状态
      /** 接口地址配置 */
      url: {
        list: '/ryManage/hrmLzgl/list',
        delete: '/ryManage/hrmLzgl/delete',
        deleteBatch: '/ryManage/hrmLzgl/deleteBatch',
        exportXlsUrl: '/ryManage/hrmLzgl/exportXls',
        importExcelUrl: 'ryManage/hrmLzgl/importExcel',
        queryById: '/ryManage/hrmLzgl/queryById',
        edit: '/ryManage/hrmLzgl/edit',
        getTotal: '/ryManage/hrmLzgl/getTotal',
      },
      columnCode: 'HrmLzgl', // 离职管理字段配置标识
      originalColumns: [
        {
          title: '状态',
          align: 'center',
          width: 100,
          dataIndex: 'zt',
          scopedSlots: { customRender: 'zt' },
        },
        {
          title: '公司',
          align: 'center',
          width: 170,
          dataIndex: 'companyId',
          ellipsis: true,
          customRender: (text, record) => this.renderTooltip(record.companyId_dictText, 150),
        },
        {
          title: '所属部门',
          align: 'center',
          width: 130,
          dataIndex: 'dept',
          ellipsis: true,
          customRender: (text, record) => this.renderTooltip(record.dept_dictText, 110),
        },
        {
          title: '岗位名称',
          align: 'center',
          width: 180,
          dataIndex: 'postId',
          ellipsis: true,
          customRender: (text, record) => this.renderTooltip(record.postId_dictText, 160),
        },
        {
          title: '职级名称',
          align: 'center',
          width: 110,
          dataIndex: 'postRank',
          ellipsis: true,
          customRender: (text, record) => this.renderTooltip(record.postRank_dictText, 90),
        },
        {
          title: '工号',
          align: 'center',
          width: 110,
          dataIndex: 'gh',
        },
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'xm',
        },
        {
          title: '离职原因',
          align: 'center',
          width: 150,
          dataIndex: 'lzyy',
          ellipsis: true,
          customRender: (text) => this.renderTooltip(text, 130),
        },
        {
          title: '预计离职日期',
          align: 'center',
          width: 130,
          dataIndex: 'yjlzrq',
          customRender: (text) => text || '-',
        },
        {
          title: '实际离职日期',
          align: 'center',
          width: 130,
          dataIndex: 'sjlzrq',
          customRender: (text) => text || '-',
        },
        {
          title: '申请时间',
          align: 'center',
          width: 180,
          dataIndex: 'sqsj',
          customRender: (text) => text || '-',
        },
      ],
    }
  },
  computed: {
    /** 字段标题映射 */
    fieldTitleMap() {
      const map = {}
      this.originalColumns.forEach((col) => {
        if (col.dataIndex && col.title) {
          map[col.dataIndex] = col.title
        }
      })
      return map
    },

    /** 字段配置数据（供侧边栏使用） */
    columnConfigNew() {
      return this.getColumnConfigData()
    },

    /** 表格列配置 */
    columns() {
      const fixedColumns = [
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 270,
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
  },
  /** 组件创建时初始化数据 */
  created() {
    this.loadOrgTree()
    // 先获取字段配置，再加载表格数据
    this.getColumnConfig().then(() => {
      this.loadData(1)
    })
  },
  methods: {
    /** 初始化字典配置（占位方法，由混入调用） */
    initDictConfig() {},

    /**
     * 加载列表数据
     * @param {number} arg - 页码
     */
    loadData(arg) {
      JeecgListMixin.methods.loadData.call(this, arg)
      this.getStatusTotal()
    },

    /** 获取各状态的统计数量 */
    getStatusTotal() {
      httpAction(this.url.getTotal, '', 'get')
        .then((res) => {
          if (!res || !res.success || !Array.isArray(res.result)) {
            throw new Error((res && res.message) || '离职状态统计加载失败')
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
          this.$message.warning(error.message || '离职状态统计加载失败')
        })
    },

    /**
     * 渲染带提示的单元格
     * @param {string} text - 显示文本
     * @param {number} width - 宽度
     * @returns {VNode} Vue 虚拟节点
     */
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

    /** 加载组织架构树（公司与部门） */
    loadOrgTree() {
      this.orgLoading = true
      getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 })
        .then((res) => {
          const roots = res && res.success && Array.isArray(res.result) ? res.result : []
          const rawCompanyList = roots.length && Array.isArray(roots[0].children) ? roots[0].children : []
          // 清洗数据，确保每个节点的 children 都是有效数组
          this.companyList = cleanTreeData(rawCompanyList)
          this.queryDeptOptions = this.companyList
        })
        .catch(() => {
          this.companyList = []
          this.queryDeptOptions = []
          this.$message.error('组织架构加载失败，请稍后重试')
        })
        .finally(() => {
          this.orgLoading = false
        })
    },

    /**
     * 获取行序号
     * @param {number} index - 当前行索引
     * @returns {number} 序号
     */
    getRowIndex(index) {
      return (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1
    },

    /**
     * 获取状态对应的颜色
     * @param {string} status - 状态名称
     * @returns {string} 颜色值
     */
    getStatusColor(status) {
      return STATUS_COLORS[status] || ''
    },

    /**
     * 切换状态筛选标签
     * @param {string} status - 状态值
     */
    handleStatusChange(status) {
      this.currentStatus = status
      if (status === '全部') delete this.queryParam.zt
      else this.$set(this.queryParam, 'zt', status)
      this.onClearSelected()
      this.loadData(1)
    },

    /**
     * 查询条件-公司变更处理
     * @param {string} companyName - 公司名称
     */
    handleQueryCompanyChange(companyName) {
      const company = this.companyList.find((item) => item.name === companyName)
      // 确保 queryDeptOptions 始终是有效数组
      this.queryDeptOptions = company ? cleanTreeData([company]) : this.companyList
      this.queryDeptPath = []
      this.queryParam.dept = ''
    },

    /**
     * 查询条件-部门变更处理
     * @param {Array} value - 级联选择的路径数组
     */
    handleQueryDeptChange(value) {
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      this.queryDeptPath = path
      this.queryParam.companyId = path[0] || ''
      this.queryParam.dept = path[path.length - 1] || ''
    },

    /** 重置查询条件 */
    searchReset() {
      this.queryParam = defaultQuery()
      this.queryDeptPath = []
      // queryDeptOptions 已经在 loadOrgTree 中清洗过了
      this.queryDeptOptions = this.companyList
      this.currentStatus = '全部'
      this.onClearSelected()
      this.loadData(1)
    },

    /** 打开发起离职弹窗 */
    handleAdd() {
      this.$refs.offboardingCreateModal.open()
    },

    /**
     * 打开离职详情弹窗
     * @param {Object} record - 离职记录
     */
    handleDetail(record) {
      if (!record || !record.id) {
        this.$message.warning('当前离职记录缺少主键，无法查看详情')
        return
      }
      this.$refs.offboardingDetailModal.open(record)
    },

    /**
     * 打开离职访谈弹窗
     * @param {Object} record - 离职记录
     */
    handleInterview(record) {
      if (!record || !record.id) {
        this.$message.warning('当前离职记录缺少主键，无法添加访谈')
        return
      }
      this.$refs.offboardingInterviewModal.open(record)
    },

    /**
     * 打开审批通过弹窗
     * @param {Object} record - 离职记录
     */
    handleApprove(record) {
      if (!record || !record.id) {
        this.$message.warning('当前离职记录缺少主键，无法审批')
        return
      }
      this.$refs.offboardingApproveModal.open(record)
    },

    /**
     * 打开离职结算弹窗
     * @param {Object} record - 离职记录
     */
    handleSettle(record) {
      if (!record || !record.id) {
        this.$message.warning('当前离职记录缺少主键，无法进行结算')
        return
      }
      this.$refs.offboardingSettleModal.open(record)
    },

    /**
     * 打开确认离职弹窗
     * @param {Object} record - 离职记录
     */
    handleConfirm(record) {
      if (!record || !record.id) {
        this.$message.warning('当前离职记录缺少主键，无法确认离职')
        return
      }
      this.$refs.offboardingConfirmModal.open(record)
    },

    /**
     * 打开取消离职弹窗
     * @param {Object} record - 离职记录
     */
    handleCancelResignation(record) {
      if (!record || !record.id) {
        this.$message.warning('当前离职记录缺少主键，无法取消')
        return
      }
      this.$refs.offboardingCancelModal.open(record)
    },

    /** 弹窗操作完成后的回调，刷新列表 */
    modalFormOk() {
      this.loadData(1)
      this.onClearSelected()
    },
  },
}
</script>

<style scoped lang="less">
@import './offboarding.less';

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
