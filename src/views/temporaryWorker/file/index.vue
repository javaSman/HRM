<!--
  @description 临时工档案管理页面
  @date 2026-08-19
  @functionality 提供临时工档案的录入、编辑、查询、离职等功能，支持在职/离职状态筛选，支持字段配置和打卡记录导出
-->
<template>
  <div class="temporary-worker-file">
    <!-- 统计卡片：展示在职和离职员工数量 -->
    <div class="v-stat-bar">
      <div class="v-stat-card">
        <div class="v-stat-icon green">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="18"
            height="18"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <polyline points="16 11 18 13 22 9"></polyline>
          </svg>
        </div>
        <div>
          <div class="v-stat-num">{{ statistics.onjob }}</div>
          <div class="v-stat-label">在职临时工</div>
        </div>
      </div>
      <div class="v-stat-card">
        <div class="v-stat-icon purple">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="18"
            height="18"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="17" y1="11" x2="22" y2="11"></line>
          </svg>
        </div>
        <div>
          <div class="v-stat-num">{{ statistics.offjob }}</div>
          <div class="v-stat-label">离职临时工</div>
        </div>
      </div>
    </div>

    <!-- 筛选区：按姓名、工号、部门、入职/离职日期筛选 -->
    <div class="v-filter-bar">
      <div class="v-filter-row">
        <div class="v-filter-item">
          <span class="v-filter-item-label">姓名</span>
          <a-input
            v-model="queryParam.name"
            style="width: 120px"
            allowClear
            placeholder="请输入姓名"
            @pressEnter="searchQuery"
          />
        </div>
        <div class="v-filter-item">
          <span class="v-filter-item-label">工号</span>
          <a-input
            v-model="queryParam.workerCode"
            style="width: 120px"
            allowClear
            placeholder="请输入工号"
            @pressEnter="searchQuery"
          />
        </div>
        <div class="v-filter-item">
          <span class="v-filter-item-label">部门</span>
          <a-cascader
            v-model="queryDeptPath"
            :options="deptOptions"
            :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
            changeOnSelect
            allowClear
            placeholder="全部部门"
            style="width: 180px"
            @change="handleDeptChange"
          />
        </div>
        <div class="v-filter-item">
          <span class="v-filter-item-label">入职日期</span>
          <j-date v-model="queryParam.entryDate" placeholder="年-月-日" style="width: 120px" />
        </div>
        <div v-if="activeStatus === '1'" class="v-filter-item">
          <span class="v-filter-item-label">离职日期</span>
          <j-date v-model="queryParam.leaveDate" placeholder="年-月-日" style="width: 120px" />
        </div>
      </div>
      <div class="v-filter-bar-actions">
        <a-button type="primary" class="v-btn" @click="searchQuery"><a-icon type="search" />搜索</a-button>
        <a-button class="v-btn v-btn-secondary" @click="searchReset"><a-icon type="undo" />重置</a-button>
        <a-button type="primary" class="v-btn" @click="handleAdd"><a-icon type="user-add" />录入临时工</a-button>
        <a-button class="v-btn v-btn-secondary" @click="handleImport"><a-icon type="upload" />导入</a-button>
        <a-button class="v-btn v-btn-secondary" @click="handleExport"><a-icon type="download" />导出</a-button>
        <a-button class="v-btn v-btn-secondary" @click="handleClockExport"
          ><a-icon type="clock-circle" />导出打卡记录</a-button
        >
        <a-button class="v-btn v-btn-secondary" @click="toggleColumnConfig"><a-icon type="setting" />字段配置</a-button>
      </div>
    </div>

    <!-- 状态筛选 - 胶囊样式 -->
    <div class="v-status-tabs">
      <div
        v-for="tab in statusTabs"
        :key="tab.key"
        :class="['v-status-tab', activeStatus === tab.key ? 'active' : '']"
        @click="changeStatus(tab.key)"
      >
        {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
      </div>
    </div>

    <!-- 表格区：展示临时工档案列表  -->
    <div class="v-content">
      <div class="v-data-card">
        <div class="v-scroll-area">
          <a-table
            v-if="columnConfigReady"
            ref="table"
            size="middle"
            :bordered="false"
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :loading="loading"
            :scroll="tableScroll"
            @change="handleTableChange"
            :pagination="ipagination"
          >
            <!-- 状态列：显示在职/离职状态标签 -->
            <template slot="status" slot-scope="text, record">
              <span :class="['v-status-tag', record.status === '0' ? 'handled' : 'cancelled']">
                <span class="dot"></span>
                {{ record.status === '0' ? '在职' : '离职' }}
              </span>
            </template>
            <!-- 操作列：编辑和离职按钮 -->
            <template slot="action" slot-scope="text, record">
              <div class="v-action-cell">
                <button class="v-btn-icon" @click="handleEdit(record)"><a-icon type="edit" />编辑</button>
                <button v-if="record.status === '0'" class="v-btn-icon" @click="handleLeave(record)">
                  <a-icon type="logout" />离职
                </button>
              </div>
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <!-- 录入/编辑临时工模态框 -->
    <archive-modal
      :visible.sync="archiveModalVisible"
      :mode="modalMode"
      :record="currentRecord"
      @ok="handleArchiveOk"
    />

    <!-- 离职模态框 -->
    <leave-modal :visible.sync="leaveModalVisible" :record="leaveRecord" @ok="handleLeaveOk" />

    <!-- 导入模态框 -->
    <import-modal ref="importModal" @ok="loadData(1)" />

    <!-- 导出打卡记录模态框 -->
    <clock-export-modal
      :visible.sync="clockExportVisible"
      :data-source="filteredDataSource"
      :query-param="clockExportQueryParam"
    />

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
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { columnConfigMixin } from '@/mixins/columnConfigMixin'
import { tableAdaptiveMixin } from '@/mixins/tableAdaptiveMixin'
import { getAction, postAction, putAction, downloadFile } from '@/api/manage'
import JDate from '@/components/jeecg/JDate'
import ArchiveModal from './modules/ArchiveModal'
import LeaveModal from './modules/LeaveModal'
import ImportModal from './modules/ImportModal'
import ClockExportModal from './modules/ClockExportModal'
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'
import Vue from 'vue'

/**
 * 递归清洗树形数据，确保每个节点的 children 都是数组
 * @param {Array} nodes - 节点数组
 * @returns {Array} 清洗后的节点数组
 */
function cleanTreeData(nodes) {
  if (!Array.isArray(nodes)) return []
  return nodes.map((node) => {
    const cleaned = { ...node }
    if (!Array.isArray(cleaned.children)) {
      cleaned.children = []
    } else {
      cleaned.children = cleanTreeData(cleaned.children)
    }
    return cleaned
  })
}

/**
 * 临时工档案管理组件
 * 提供临时工档案的录入、编辑、查询、离职等功能
 * 支持在职/离职状态筛选
 * 支持字段配置和打卡记录导出
 */
export default {
  name: 'TemporaryWorkerFile',
  mixins: [JeecgListMixin, columnConfigMixin, tableAdaptiveMixin],
  components: { JDate, ArchiveModal, LeaveModal, ImportModal, ClockExportModal, ColumnConfigSidebar },
  data() {
    return {
      /** 页面描述 */
      description: '临时工档案管理',
      /** 禁用混入的自动加载 */
      disableMixinCreated: true,
      /** 接口地址配置 */
      url: {
        list: '/lsggl/tempWorkerArchive/list',
      },
      /** 查询参数 */
      queryParam: {
        name: '', // 姓名
        workerCode: '', // 工号
        companyId: '', // 公司ID
        deptId: '', // 部门ID
        entryDate: '', // 入职日期
        status: '0', // 状态：'0'-在职，'1'-离职（字符串格式）
        leaveDate: '', // 离职日期
      },
      /** 统计数据 */
      statistics: {
        onjob: 0, // 在职人数
        offjob: 0, // 离职人数
      },
      /** 当前选中的状态 */
      activeStatus: '0',
      /** 状态筛选标签列表 */
      statusTabs: [
        { key: '0', label: '在职', count: 0 },
        { key: '1', label: '离职', count: 0 },
      ],
      /** 部门筛选路径 */
      queryDeptPath: [],
      /** 部门选项列表 */
      deptOptions: [],
      /** 组织架构加载状态 */
      orgLoading: false,
      /** 字段配置标识 */
      columnCode: 'TempWorkerArchive',
      /** 原始表格列定义（不含操作列） */
      originalColumns: [
        { title: '状态', dataIndex: 'status', width: 80, scopedSlots: { customRender: 'status' }, ellipsis: true },
        { title: '工号', dataIndex: 'workerCode', width: 100, ellipsis: true },
        { title: '姓名', dataIndex: 'name', width: 100, ellipsis: true },
        { title: '性别', dataIndex: 'gender', width: 60, ellipsis: true },
        { title: '入职职位', dataIndex: 'postId_dictText', width: 100, ellipsis: true },
        { title: '派遣公司', dataIndex: 'dispatchCompany_dictText', width: 120, ellipsis: true },
        { title: '民族', dataIndex: 'nation', width: 80, ellipsis: true },
        { title: '身份证号', dataIndex: 'idCard', width: 180, ellipsis: true },
        { title: '家庭住址', dataIndex: 'address', width: 200, ellipsis: true },
        { title: '是否内宿', dataIndex: 'isInRoom', width: 90, ellipsis: true },
        { title: '入职日期', dataIndex: 'entryDate', width: 110, ellipsis: true },
        { title: '联系方式', dataIndex: 'phone', width: 120, ellipsis: true },
        { title: '入职公司', dataIndex: 'companyId_dictText', width: 120, ellipsis: true },
        { title: '入职部门', dataIndex: 'deptName', width: 120, ellipsis: true },
        { title: '工价', dataIndex: 'price', width: 80, ellipsis: true },
        { title: '银行卡号', dataIndex: 'bankCard', width: 180, ellipsis: true },
        { title: '开户行', dataIndex: 'bankName', width: 120, ellipsis: true },
        { title: '卡号', dataIndex: 'cardNo', width: 180, ellipsis: true },
        { title: '合同开始日期', dataIndex: 'contractStartDate', width: 120, ellipsis: true },
        { title: '合同到期日期', dataIndex: 'contractEndDate', width: 120, ellipsis: true },
        { title: '离职日期', dataIndex: 'leaveDate', width: 110, hideInJob: true, ellipsis: true }, // 离职状态下显示
        { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true },
      ],
      /** 录入/编辑模态框显示状态 */
      archiveModalVisible: false,
      /** 模态框模式：add-新增，edit-编辑 */
      modalMode: 'add',
      /** 当前编辑的记录 */
      currentRecord: null,
      /** 离职模态框显示状态 */
      leaveModalVisible: false,
      /** 离职记录 */
      leaveRecord: null,
      /** 导出打卡记录模态框显示状态 */
      clockExportVisible: false,
    }
  },
  computed: {
    /**
     * 字段标题映射
     * @returns {Object} 字段名到标题的映射对象
     */
    fieldTitleMap() {
      const map = {}
      this.originalColumns.forEach((col) => {
        if (col.dataIndex && col.title) {
          map[col.dataIndex] = col.title
        }
      })
      return map
    },
    /**
     * 字段配置数据（供侧边栏使用）
     * @returns {Array} 字段配置数组
     */
    columnConfigNew() {
      return this.getColumnConfigData()
    },
    /**
     * 根据状态筛选后的数据
     * @returns {Array} 筛选后的数据源
     */
    filteredDataSource() {
      if (this.activeStatus === 'all') {
        return this.dataSource
      }
      return this.dataSource.filter((item) => item.status === this.activeStatus)
    },
    /**
     * 打卡记录导出的查询参数（与列表查询保持一致）
     * @returns {Object} 处理后的查询参数对象
     */
    clockExportQueryParam() {
      const params = {
        ...this.queryParam,
        status: this.activeStatus,
      }
      // 姓名、工号前后加 * 进行模糊查询
      if (params.name) {
        params.name = `*${params.name}*`
      }
      if (params.workerCode) {
        params.no = `*${params.workerCode}*`
        params.workerCode = undefined
      }
      if (params.status == '0') {
        params.status = '已入职'
      } else {
        params.status = '已离职'
      }
      if (params.companyId) {
        params.deptBelong = params.companyId
        params.companyId = undefined
      }
      // 过滤空值
      const result = {}
      Object.keys(params).forEach((key) => {
        if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
          result[key] = params[key]
        }
      })
      return result
    },
    /**
     * 表格列配置
     * @returns {Array} 表格列数组
     */
    columns() {
      const fixedColumns = [
        {
          title: '操作',
          dataIndex: 'action',
          width: 150,
          align: 'center',
          scopedSlots: { customRender: 'action' },
          fixed: 'right',
        },
      ]
      // 序号列 - 使用 customRender 动态渲染
      const dynamicColumns = [
        {
          title: '序号',
          dataIndex: 'seq',
          width: 60,
          align: 'center',
          fixed: 'left',
          customRender: (text, record, index) => {
            // 根据分页计算序号
            return (this.ipagination.current - 1) * this.ipagination.pageSize + index + 1
          },
        },
      ]
      // 应用字段配置
      const configuredColumns = this.applyColumnConfig(this.originalColumns, {
        fixedColumns: [],
        excludedFields: [],
      })
      // 根据状态过滤离职日期列：在职状态下隐藏，离职状态下显示
      const filteredColumns = configuredColumns.filter((col) => {
        if (col.hideInJob && this.activeStatus === '0') {
          return false
        }
        return true
      })
      // 合并列
      const dataColumns = [...dynamicColumns, ...filteredColumns]
      // 智能处理列宽
      const processedColumns = this.adaptiveColumnsWidth(dataColumns, fixedColumns)
      // 表格列居中显示
      const centeredColumns = processedColumns.map((col) => ({ ...col, align: col.align || 'center' }))
      return [...centeredColumns, ...fixedColumns]
    },
  },
  created() {
    // 加载组织架构
    this.loadOrgTree()
    // 加载表格数据
    this.getColumnConfig().then(() => {
      this.loadData(1)
    })
    //this.loadData(1)
  },
  methods: {
    /**
     * 分页改变处理
     * @param {number} page - 页码
     * @param {number} pageSize - 每页条数
     * @returns {void}
     */
    handlePageChange(page, pageSize) {
      this.ipagination.current = page
      this.ipagination.pageSize = pageSize
      this.loadData()
    },
    /**
     * 每页条数改变处理
     * @param {number} current - 当前页
     * @param {number} size - 每页条数
     * @returns {void}
     */
    handleSizeChange(current, size) {
      this.ipagination.current = 1
      this.ipagination.pageSize = size
      this.loadData()
    },
    /**
     * 加载列表数据
     * @param {number} arg - 页码
     * @returns {void}
     */
    loadData(arg) {
      if (arg === 1) {
        this.ipagination.current = 1
      }
      this.loading = true

      // 构建查询参数，姓名、工号前后加 * 进行模糊查询
      const params = Object.assign({}, this.queryParam)
      if (params.name) {
        params.name = `*${params.name}*`
      }
      if (params.workerCode) {
        params.workerCode = `*${params.workerCode}*`
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

      this.updateStatistics()
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
          this.deptOptions = cleanTreeData(rawCompanyList)
        })
        .catch(() => {
          this.deptOptions = []
          this.$message.error('组织架构加载失败，请稍后重试')
        })
        .finally(() => {
          this.orgLoading = false
        })
    },
    /**
     * 查询条件-部门变更处理
     * @param {Array} value - 级联选择的路径数组
     * @returns {void}
     */
    handleDeptChange(value) {
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      this.queryDeptPath = path
      this.queryParam.companyId = path[0] || ''
      this.queryParam.deptId = path[path.length - 1] || ''
    },
    /**
     * 更新统计数据
     * @returns {void}
     */
    updateStatistics() {
      postAction('/commonTj/ztTjInfo/getTjListByCodes', { hrm_temp_worker_archive: {} })
        .then((res) => {
          if (
            res.success &&
            res.result &&
            res.result.hrm_temp_worker_archive &&
            res.result.hrm_temp_worker_archive.status
          ) {
            let ztList = res.result.hrm_temp_worker_archive.status

            // 创建状态到数量的映射
            const statusMap = {}
            ztList.forEach((item) => {
              statusMap[item.status] = item.count
            })

            // 更新 statistics
            this.statistics.onjob = statusMap['在职'] || 0
            this.statistics.offjob = statusMap['离职'] || 0

            // 更新 statusTabs
            this.statusTabs[0].count = statusMap['在职'] || 0
            this.statusTabs[1].count = statusMap['离职'] || 0
          }
        })
        .catch((error) => {
          console.error('获取统计数据失败:', error)
        })
    },
    /**
     * 切换状态Tab
     * @param {string} key - 状态key
     * @returns {void}
     */
    changeStatus(key) {
      this.activeStatus = key
      this.queryParam.status = key // 更新查询参数中的状态
      this.loadData(1)
    },
    /**
     * 执行搜索
     * @returns {void}
     */
    searchQuery() {
      this.loadData(1)
    },
    /**
     * 重置搜索条件
     * @returns {void}
     */
    searchReset() {
      this.queryParam = {
        name: '',
        workerCode: '',
        companyId: '',
        deptId: '',
        entryDate: '',
        status: this.activeStatus, // 状态：'0'-在职，'1'-离职（字符串格式）
        leaveDate: '', // 离职日期
      }
      this.queryDeptPath = []
      this.loadData(1)
    },
    /**
     * 新增临时工
     * @returns {void}
     */
    handleAdd() {
      this.modalMode = 'add'
      this.currentRecord = null
      this.archiveModalVisible = true
    },
    /**
     * 编辑临时工
     * @param {Object} record - 档案记录
     * @returns {void}
     */
    handleEdit(record) {
      this.modalMode = 'edit'
      this.currentRecord = { ...record }
      this.archiveModalVisible = true
    },
    /**
     * 录入/编辑提交
     * @param {Object} formData - 表单数据
     * @param {string} mode - 模式（add/edit）
     * @param {Function} onSuccess - 成功回调
     * @param {Function} onFail - 失败回调
     * @returns {void}
     */
    handleArchiveOk(formData, mode, onSuccess, onFail) {
      // 表单参数已与接口参数一致，直接提交
      const params = { ...formData }
      // 删除不需要的字段
      delete params.delFlag
      // 公司/职位名称改为 dictText 字段提交（companyId/postId 已单独提交）
      params.companyId_dictText = params.company
      params.postId_dictText = params.position
      // 删除入住申请相关字段（这些字段不提交到临时工档案接口）
      const roomFields = [
        'roomAreaId',
        'roomArea',
        'roomTypeId',
        'roomType',
        'roomDate',
        'roomApplyTime',
        'roomApplicant',
        'roomCode',
        'roomDept',
        'roomIdcard',
        'roomPhone',
        'roomReason',
        'roomApproveCode',
        'roomApproveName',
        'roomCcCode',
        'roomCcName',
        'hasRoomApply',
        'customProcessConfigurationDTOList',
      ]
      roomFields.forEach((field) => delete params[field])

      // 获取部门名称（如果表单中没有）
      if (!params.deptId && params.deptName) {
        // 如果有 deptName 但没有 deptId，保持现状
      } else if (!params.deptName && params.deptId) {
        params.deptName = this.getDeptNameById(params.deptId)
      }

      if (mode === 'add') {
        // 新增模式
        postAction('/lsggl/tempWorkerArchive/add', params)
          .then((res) => {
            if (res.success) {
              this.$message.success('录入成功')
              this.loadData(1) // 刷新列表

              // 如果是内宿，调用入住申请接口
              if (formData.isInRoom === '是') {
                this.submitRoomApply(formData)
              }

              // 调用成功回调关闭弹窗
              onSuccess && onSuccess()
            } else {
              this.$message.error(res.message || '录入失败')
              // 调用失败回调
              onFail && onFail()
            }
          })
          .catch(() => {
            this.$message.error('录入失败，请稍后重试')
            // 调用失败回调
            onFail && onFail()
          })
      } else {
        // 编辑模式
        putAction('/lsggl/tempWorkerArchive/edit', params)
          .then((res) => {
            if (res.success) {
              this.$message.success('修改成功')
              this.loadData(1) // 刷新列表
              // 如果是内宿且没有申请记录，调用入住申请接口
              if (formData.isInRoom === '是' && !formData.hasRoomApply) {
                this.submitRoomApply(formData)
              }
              // 调用成功回调关闭弹窗
              onSuccess && onSuccess()
            } else {
              this.$message.error(res.message || '修改失败')
              // 调用失败回调
              onFail && onFail()
            }
          })
          .catch(() => {
            this.$message.error('修改失败，请稍后重试')
            // 调用失败回调
            onFail && onFail()
          })
      }
    },
    /**
     * 提交入住申请
     * @param {Object} formData - 表单数据
     * @returns {void}
     */
    submitRoomApply(formData) {
      const perInfo = Vue.ls.get('perInfo')
      const params = {
        applyType: '0', // 申请类型：0-入住申请
        empNo: formData.workerCode, // 工号
        empName: formData.name, // 姓名
        idCard: formData.idCard, // 身份证号
        phone: formData.phone, // 联系电话
        company: formData.company, // 公司
        dept: formData.deptId, // 部门ID
        deptPath: formData.roomDept, // 部门路径
        approveName: formData.roomApproveName, // 审批人姓名
        approveCode: formData.roomApproveCode, // 审批人工号
        ccName: formData.roomCcName, // 抄送人姓名
        ccCode: formData.roomCcCode, // 抄送人工号
        remark: '', // 备注
        areaId: formData.roomAreaId, // 区域ID
        areaName: formData.roomArea, // 区域名称
        buildingName: '', // 楼栋名称
        roomName: '', // 房间名称
        dormType: formData.roomTypeId, // 宿舍类型ID
        checkinDate: formData.roomDate, // 入住日期
        reason: formData.roomReason, // 入住原因
        spouseName: '', // 配偶姓名
        spousePhone: '', // 配偶电话
        spouseIdcard: '', // 配偶身份证号
        spouseNo: '', // 配偶工号
        internalEmployee: '0', // 内部员工标识：0-否，1-是
        gridInfo: '0', // 网格信息
        personType: '1', // 人员类型：1-临时工
        sex: formData.gender,
        createByNo: perInfo.no,
      }

      // 动态流程节点数据
      if (formData.customProcessConfigurationDTOList && formData.customProcessConfigurationDTOList.length) {
        params.customProcessConfigurationDTOList = formData.customProcessConfigurationDTOList
      }

      // 直接调用，不处理返回值
      postAction('/sqgl/hrmSqglApply/add', params)
    },
    /**
     * 根据部门ID获取部门名称
     * @param {string} deptId - 部门ID
     * @returns {string} 部门名称
     */
    getDeptNameById(deptId) {
      if (!deptId) return ''
      const findNode = (nodes, id) => {
        for (const node of nodes || []) {
          if (String(node.id) === String(id)) {
            return node
          }
          const found = findNode(node.children || [], id)
          if (found) return found
        }
        return null
      }
      const node = findNode(this.deptOptions, deptId)
      return node ? node.name : ''
    },
    /**
     * 打开离职模态框
     * @param {Object} record - 档案记录
     * @returns {void}
     */
    handleLeave(record) {
      this.leaveRecord = record
      this.leaveModalVisible = true
    },
    /**
     * 离职提交
     * @param {string} lsrq - 离职日期
     * @param {Object} record - 档案记录
     * @param {Function} onSuccess - 成功回调
     * @param {Function} onFail - 失败回调
     * @returns {void}
     */
    handleLeaveOk(lsrq, record, onSuccess, onFail) {
      const params = {
        id: record.id,
        leaveDate: lsrq,
      }

      putAction('/lsggl/tempWorkerArchive/leave', params)
        .then((res) => {
          if (res.success) {
            this.$message.success('离职成功')
            this.loadData(1) // 刷新列表
            // 调用成功回调关闭弹窗
            onSuccess && onSuccess()
          } else {
            this.$message.error(res.message || '离职失败')
            // 调用失败回调
            onFail && onFail()
          }
        })
        .catch(() => {
          this.$message.error('离职失败，请稍后重试')
          // 调用失败回调
          onFail && onFail()
        })
    },
    /**
     * 打开导入模态框
     * @returns {void}
     */
    handleImport() {
      this.$refs.importModal.show()
    },
    /**
     * 导出档案
     * @returns {void}
     */
    handleExport() {
      // 构建查询参数，姓名、工号前后加 * 进行模糊查询（与列表查询保持一致）
      const params = {
        ...this.queryParam,
        status: this.activeStatus,
      }
      if (params.name) {
        params.name = `*${params.name}*`
      }
      if (params.workerCode) {
        params.workerCode = `*${params.workerCode}*`
      }

      // 过滤空值参数
      const filteredParams = {}
      Object.keys(params).forEach((key) => {
        if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
          filteredParams[key] = params[key]
        }
      })

      // 调用导出接口
      const fileName = '临时工档案_' + new Date().toISOString().slice(0, 10) + '.xlsx'
      downloadFile('/lsggl/tempWorkerArchive/export', fileName, filteredParams)
        .then(() => {
          this.$message.success('导出成功')
        })
        .catch(() => {
          this.$message.error('导出失败，请稍后重试')
        })
    },
    /**
     * 打开导出打卡记录模态框
     * @returns {void}
     */
    handleClockExport() {
      this.clockExportVisible = true
    },
  },
}
</script>

<style lang="less" scoped>
@import '../temporary-worker-theme.less';

.temporary-worker-file {
  padding: 0;
  background: var(--background);
  height: 100%;
  display: flex;
  flex-direction: column;
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

/* 统计卡片 */
.v-stat-bar {
  padding: 14px 24px 0;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.v-stat-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 150px;
  box-shadow: 0 2px 12px rgba(45, 120, 255, 0.06);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  }
}

.v-stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;

  &.green {
    background: rgba(16, 185, 129, 0.08);
    color: #10b981;
  }

  &.purple {
    background: rgba(139, 92, 246, 0.08);
    color: #8b5cf6;
  }
}

.v-stat-num {
  font-size: 22px;
  font-weight: 700;
  color: var(--foreground);
  line-height: 1.1;
}

.v-stat-label {
  font-size: 11.5px;
  color: var(--muted-foreground);
  font-weight: 500;
  margin-top: 3px;
}

/* 表格加载占位 */
.table-loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 40px 0;
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
