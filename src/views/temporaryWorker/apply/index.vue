<!--
  @description 临时工申请管理页面
  @date 2026-08-19
  @functionality 提供临时工需求的申请、查询、撤回等功能，支持按部门、申请人、工号等条件筛选，支持状态快速筛选（审批中/已通过/不通过/已撤回）
-->
<template>
  <div class="temporary-worker-apply">
    <!-- 筛选区：提供按需求部门、申请人、工号等条件进行查询 -->
    <div class="v-filter-bar">
      <div class="v-filter-row">
        <div class="v-filter-item">
          <span class="v-filter-item-label">需求部门</span>
          <a-cascader
            v-model="queryDeptPath"
            :options="queryDeptOptions"
            :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
            changeOnSelect
            allowClear
            placeholder="请选择部门"
            @change="handleQueryDeptChange"
          />
        </div>
        <div class="v-filter-item">
          <span class="v-filter-item-label">申请人</span>
          <a-input
            v-model="queryParam.applicantName"
            allowClear
            placeholder="请输入申请人姓名"
            @pressEnter="searchQuery"
          />
        </div>
        <!-- <div class="v-filter-item">
          <span class="v-filter-item-label">工号</span>
          <a-input v-model="queryParam.applicantCode" allowClear placeholder="请输入工号" @pressEnter="searchQuery" />
        </div> -->
        <div class="v-filter-item" style="flex-direction: row">
          <a-button type="primary" class="v-btn" @click="searchQuery"><a-icon type="search" />查询</a-button>
          <a-button class="v-btn v-btn-secondary" @click="searchReset"> <a-icon type="undo" />重置 </a-button>
        </div>
      </div>
      <div class="v-filter-bar-actions">
        <a-button v-if="mode == 'apply'" class="v-btn v-btn-primary" icon="plus" @click="handleAdd"
          >新增临时工需求</a-button
        >
      </div>
    </div>

    <!-- 状态筛选 - 胶囊样式：按审批状态(全部/审批中/已通过/不通过)快速筛选 -->
    <div class="v-status-tabs">
      <div
        v-for="status in statusList"
        :key="status.key"
        :class="['v-status-tab', isStatusActive(status.key) ? 'active' : '']"
        @click="changeStatus(status.key)"
      >
        {{ status.label }} <span class="tab-count">{{ status.count }}</span>
      </div>
    </div>

    <!-- 数据表格：展示临时工申请列表 -->
    <div class="v-content">
      <div class="v-data-card">
        <div class="v-scroll-area">
          <a-table
            ref="table"
            size="middle"
            :bordered="false"
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="ipagination"
            :loading="loading"
            :scroll="tableScroll"
            @change="handleTableChange"
          >
            <!-- 状态列：显示审核状态标签 -->
            <template slot="status" slot-scope="text, record">
              <span :class="['v-status-tag', getStatusClass(record.status)]">
                <span class="dot"></span>
                {{ getStatusText(record.status) }}
              </span>
            </template>
            <!-- 操作列：根据状态和模式显示不同的操作按钮 -->
            <template slot="action" slot-scope="text, record">
              <div class="v-action-cell">
                <button
                  v-if="mode === 'audit' && (record.status === '0' || record.status === 0) && record.brSpStatus == 1"
                  class="v-btn-icon primary"
                  @click="handleAudit(record)"
                >
                  <a-icon type="check" />审批
                </button>
                <button
                  v-if="mode === 'apply' && (record.status === '0' || record.status === 0)"
                  class="v-btn-icon danger"
                  @click="handleCancel(record)"
                >
                  <a-icon type="close" />撤回
                </button>
                <button class="v-btn-icon" @click="handleDetail(record)"><a-icon type="eye" />查看</button>
              </div>
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <!-- 新增/编辑模态框 -->
    <temporary-worker-modal ref="modalForm" @ok="modalFormOk"></temporary-worker-modal>
    <!-- 详情/审批模态框 -->
    <temporary-worker-detail ref="detailModal" :mode="mode" @ok="modalFormOk"></temporary-worker-detail>
  </div>
</template>

<script>
/**
 * 临时工申请管理组件
 * 提供临时工需求的申请、查询、撤回等功能
 * 支持按部门、申请人、工号等条件筛选
 * 支持状态快速筛选（审批中/已通过/不通过/已撤回）
 */
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { mixinDevice } from '@/utils/mixin'
import { getAction, postAction, putAction } from '@/api/manage'
import { filterDictTextByCache } from '@/components/dict/JDictSelectUtil'
import TemporaryWorkerModal from './modules/TemporaryWorkerModal.vue'
import TemporaryWorkerDetail from './modules/TemporaryWorkerDetail.vue'

export default {
  name: 'TemporaryWorkerApply',
  mixins: [JeecgListMixin, mixinDevice],
  components: { TemporaryWorkerModal, TemporaryWorkerDetail },
  props: {
    /** 页面模式：apply-申请模式，audit-审批模式 */
    mode: {
      type: String,
      default: 'apply',
    },
  },
  data() {
    // 根据 mode 决定列表接口：必须在 data 中确定，JeecgListMixin 的 created 会先于本组件 created 自动触发首次 loadData
    const listUrl = this.mode === 'audit' ? '/lsggl/tempWorkerAudit/list' : '/lsggl/tempWorkerApply/list'
    return {
      /** 页面描述 */
      description: '临时工申请',
      /** 状态筛选列表 */
      statusList: [],
      /** 查询参数 */
      queryParam: {
        deptId: '', // 部门ID
        applicantName: '', // 申请人姓名
        applicantCode: '', // 申请人工号
        status: '', // 状态
        tabStatus: '', // 状态中文
      },
      /** 需求部门路径（级联选择器绑定值） */
      queryDeptPath: [],
      /** 需求部门选项（树形结构） */
      queryDeptOptions: [],
      /** 组织架构加载状态 */
      orgLoading: false,
      /** 表格列配置 */
      columns: [
        {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: (_t, _r, index) => {
            return parseInt(index) + 1
          },
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          width: 90,
          align: 'center',
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '需求部门',
          dataIndex: 'deptName',
          key: 'deptName',
          align: 'center',
          ellipsis: true,
        },
        { title: '申请人', dataIndex: 'applicantName', key: 'applicantName', align: 'center', ellipsis: true },
        // { title: '工号', dataIndex: 'applicantCode', key: 'applicantCode', align: 'center' },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          key: 'applyDate',
          align: 'center',
          customRender: (t) => {
            return t ? t.slice(0, 10) : ''
          },
        },
        {
          title: '需求工种',
          dataIndex: 'itemList',
          key: 'workType',
          align: 'center',
          customRender: (itemList) => {
            if (Array.isArray(itemList) && itemList.length > 0) {
              return itemList[0].workTypeName || itemList[0].workType || ''
            }
            return ''
          },
        },
        {
          title: '需求性质',
          dataIndex: 'itemList',
          key: 'demandNature',
          align: 'center',
          customRender: (itemList) => {
            if (Array.isArray(itemList) && itemList.length > 0) {
              return itemList[0].demandNature || ''
            }
            return ''
          },
        },
        {
          title: '人数',
          dataIndex: 'itemList',
          key: 'personCount',
          align: 'center',
          customRender: (itemList) => {
            if (Array.isArray(itemList) && itemList.length > 0) {
              return itemList[0].personCount || ''
            }
            return ''
          },
        },
        {
          title: '开始时间',
          dataIndex: 'itemList',
          key: 'startDate',
          align: 'center',
          customRender: (itemList) => {
            if (Array.isArray(itemList) && itemList.length > 0) {
              const startDate = itemList[0].startDate
              return startDate ? startDate.slice(0, 10) : ''
            }
            return ''
          },
        },
        {
          title: '结束时间',
          dataIndex: 'itemList',
          key: 'endDate',
          align: 'center',
          customRender: (itemList) => {
            if (Array.isArray(itemList) && itemList.length > 0) {
              const endDate = itemList[0].endDate
              return endDate ? endDate.slice(0, 10) : ''
            }
            return ''
          },
        },
        {
          title: '工期',
          dataIndex: 'itemList',
          key: 'workDays',
          align: 'center',
          customRender: (itemList) => {
            if (Array.isArray(itemList) && itemList.length > 0) {
              return itemList[0].workDays || ''
            }
            return ''
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          key: 'action',
          width: 200,
          align: 'center',
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
        },
      ],
      /** 表格数据源 */
      dataSource: [],
      /** 接口地址配置 */
      url: {
        list: listUrl,
        delete: '/lsggl/tempWorkerApply/delete',
        deleteBatch: '/lsggl/tempWorkerApply/deleteBatch',
        exportXlsUrl: '/lsggl/tempWorkerApply/exportXls',
        importExcelUrl: 'lsgl/hrmLsglSqqq/importExcel',
      },
    }
  },
  created() {
    this.loadOrgTree()
    this.initStatusList()
  },
  methods: {
    /**
     * 初始化状态筛选列表
     * @returns {void}
     */
    initStatusList() {
      this.statusList = [
        { key: 'status_', label: '全部', count: 0, fields: 'status', value: '', countKeys: [] },
        { key: 'status_0', label: '审批中', count: 0, fields: 'status', value: '0', countKeys: ['审核中', '审批中'] },
        { key: 'status_1', label: '已通过', count: 0, fields: 'status', value: '1', countKeys: ['已通过'] },
        { key: 'status_3', label: '不通过', count: 0, fields: 'status', value: '3', countKeys: ['已驳回', '不通过'] },
        { key: 'status_2', label: '已撤回', count: 0, fields: 'status', value: '2', countKeys: ['已取消', '已撤回'] },
      ]
      this.loadStatusCount()
    },
    /**
     * 加载状态统计数量
     * @returns {void}
     */
    loadStatusCount() {
      postAction('/commonTj/ztTjInfo/getTjListByCodes', { hrm_temp_worker_apply: {} }).then((res) => {
        if (res.success && res.result && res.result.hrm_temp_worker_apply && res.result.hrm_temp_worker_apply.status) {
          let ztList = res.result.hrm_temp_worker_apply.status
          let countMap = {}
          let totalCount = 0
          ztList.forEach((item) => {
            countMap[item.status] = item.count
            totalCount += item.count || 0
          })
          // 更新 statusList 的 count：按 countKeys 匹配后端统计的中文状态，与显示标签解耦
          this.statusList.forEach((status) => {
            if (status.key === 'status_') {
              status.count = totalCount
            } else {
              status.count = status.countKeys.reduce((sum, key) => sum + (countMap[key] || 0), 0)
            }
          })
        }
      })
    },
    /**
     * 获取状态对应的样式类名
     * @param {string|number} status - 状态值
     * @returns {string} 样式类名
     */
    getStatusClass(status) {
      let classMap = { 0: 'pending', 1: 'handled', 2: 'cancelled', 3: 'rejected' }
      return classMap[status] || ''
    },
    /**
     * 获取状态对应的文本
     * @param {string|number} status - 状态值
     * @returns {string} 状态文本
     */
    getStatusText(status) {
      // 使用字典翻译
      const dictText = filterDictTextByCache('temp_worker_apply_status', status)
      if (dictText) {
        return dictText
      }
      // 降级使用默认映射
      let textMap = { 0: '审批中', 1: '已通过', 2: '已撤回', 3: '不通过' }
      return textMap[status] || status
    },
    /**
     * 判断状态筛选标签是否激活
     * @param {string} key - 状态key
     * @returns {boolean} 是否激活
     */
    isStatusActive(key) {
      let item = this.statusList.find((s) => s.key === key)
      if (!item) return false
      if (item.value === '' && item.fields === 'status') {
        return this.queryParam.status === '' || this.queryParam.status === null || this.queryParam.status === undefined
      }
      return this.queryParam.status === item.value
    },
    /**
     * 切换状态筛选
     * @param {string} key - 状态key
     * @returns {void}
     */
    changeStatus(key) {
      let item = this.statusList.find((s) => s.key === key)
      if (item) {
        this.queryParam.status = item.value
        // 根据 status 设置 tabStatus（中文）
        const statusTextMap = {
          0: '审批中',
          1: '已通过',
          3: '不通过',
          2: '已撤回',
        }
        this.queryParam.tabStatus = statusTextMap[item.value] || ''
      }
      this.loadData(1)
    },
    /**
     * 执行查询
     * @returns {void}
     */
    searchQuery() {
      this.loadData(1)
      this.selectedRowKeys = []
      this.selectionRows = []
      this.loadStatusCount()
    },
    /**
     * 重置查询条件
     * @returns {void}
     */
    searchReset() {
      this.queryParam = {
        deptId: '',
        applicantName: '',
        applicantCode: '',
        status: '',
        tabStatus: '',
      }
      this.queryDeptPath = []
      this.searchQuery()
    },
    /**
     * 重写 loadData 方法，在查询时给申请人、工号参数前后加 * 进行模糊查询
     * @param {number} arg - 页码
     * @returns {void}
     */
    loadData(arg) {
      if (arg === 1) {
        this.ipagination.current = 1
      }
      this.loading = true

      // 构建查询参数，申请人、工号前后加 * 进行模糊查询
      const params = Object.assign({}, this.queryParam)
      if (params.applicantName) {
        params.applicantName = `*${params.applicantName}*`
      }
      if (params.applicantCode) {
        params.applicantCode = `*${params.applicantCode}*`
      }

      // 添加分页参数
      params.pageNo = this.ipagination.current
      params.pageSize = this.ipagination.pageSize

      getAction(this.url.list, params)
        .then((res) => {
          if (res.success) {
            this.dataSource = res.result.records || res.result || []
            if (res.result.total) {
              this.ipagination.total = res.result.total
            }
          } else {
            this.$message.warning(res.message || '查询失败')
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
          this.$message.error('查询失败')
        })
    },
    /**
     * 新增临时工需求
     * @returns {void}
     */
    handleAdd() {
      this.$refs.modalForm.add()
      this.$refs.modalForm.title = '新增临时工需求'
    },
    /**
     * 查看详情
     * @param {Object} record - 申请记录
     * @returns {void}
     */
    handleDetail(record) {
      this.$refs.detailModal.show(record)
    },
    /**
     * 审批申请
     * @param {Object} record - 申请记录
     * @returns {void}
     */
    handleAudit(record) {
      this.$refs.detailModal.audit(record)
    },
    /**
     * 撤回申请
     * @param {Object} record - 申请记录
     * @returns {void}
     */
    handleCancel(record) {
      this.$confirm({
        title: '确认撤回',
        content: '确定要撤回该申请吗？撤回后将无法恢复。',
        okText: '确认撤回',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          return putAction(`/lsggl/tempWorkerApply/cancel/${record.id}`)
            .then((res) => {
              if (res.success) {
                this.$message.success('已撤回该申请')
                this.loadData()
                this.loadStatusCount()
              } else {
                this.$message.warning(res.message || '撤回失败')
              }
            })
            .catch(() => {
              this.$message.error('撤回失败')
            })
        },
      })
    },
    /**
     * 模态框确认回调
     * @returns {void}
     */
    modalFormOk() {
      this.loadData()
      this.loadStatusCount()
    },
    /**
     * 加载组织架构树（公司与部门）
     * @returns {void}
     */
    loadOrgTree() {
      this.orgLoading = true
      getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 })
        .then((res) => {
          const roots = res && res.success && Array.isArray(res.result) ? res.result : []
          const rawCompanyList = roots.length && Array.isArray(roots[0].children) ? roots[0].children : []
          // 清洗数据，确保每个节点的 children 都是有效数组
          this.queryDeptOptions = this.cleanTreeData(rawCompanyList)
        })
        .catch(() => {
          this.queryDeptOptions = []
          this.$message.error('组织架构加载失败，请稍后重试')
        })
        .finally(() => {
          this.orgLoading = false
        })
    },
    /**
     * 递归清洗树形数据，确保每个节点的 children 都是数组
     * @param {Array} nodes - 节点数组
     * @returns {Array} 清洗后的节点数组
     */
    cleanTreeData(nodes) {
      if (!Array.isArray(nodes)) return []
      return nodes.map((node) => {
        const cleaned = { ...node }
        // 确保 children 是数组，如果不存在或无效则设为空数组
        if (!Array.isArray(cleaned.children)) {
          cleaned.children = []
        } else {
          cleaned.children = this.cleanTreeData(cleaned.children)
        }
        return cleaned
      })
    },
    /**
     * 查询条件-部门变更处理
     * @param {Array} value - 级联选择的路径数组
     * @returns {void}
     */
    handleQueryDeptChange(value) {
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      this.queryDeptPath = path
      this.queryParam.deptId = path[path.length - 1] || ''
    },
  },
}
</script>

<style lang="less" scoped>
@import '../temporary-worker-theme.less';

.temporary-worker-apply {
  background: @v-background;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  /* 整页滚动：取消表格区域的内部滚动限制 */
  .v-content {
    flex: none;
    overflow: visible;
  }

  .v-scroll-area {
    overflow: visible;
  }
}

.v-pagination {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: rgba(@v-primary-rgb, 0.015);
  border-top: 1px solid @v-border;

  /deep/ .ant-pagination {
    margin: 0;
  }
}
</style>
