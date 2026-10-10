<template>
  <a-modal
    :width="1200"
    :visible="visible"
    :maskClosable="false"
    :destroyOnClose="false"
    wrapClassName="employee-recycle-modal-wrap"
    @cancel="handleCancel"
  >
    <template slot="title">
      <span class="recycle-modal-title">
        <a-icon type="delete" />
        {{ title }}
      </span>
    </template>

    <template slot="footer">
        <a-button size="small" type="primary" @click="handleRestoreBatch">
          <a-icon type="redo" />
          批量移出
        </a-button>
      <a-button class="footer-delete-btn" :disabled="!selectedRowKeys.length" @click="handleDeleteBatch">
        <a-icon type="delete" />
        批量删除
      </a-button>
      <a-button @click="handleCancel">关闭</a-button>
    </template>

    <div v-show="selectedRowKeys.length > 0" class="recycle-selection-bar">
      <a-icon type="check-square" />
      <div class="selection-summary">
        <span>已选择</span>
        <span class="sel-count">{{ selectedRowKeys.length }}</span>
        <span>项</span>
      </div>
      <div class="sel-actions">
        <a-button size="small" @click="handleClearSelection">清空选择</a-button>
        <!-- <a-button size="small" type="primary" @click="handleRestoreBatch">
          <a-icon type="redo" />
          批量移出
        </a-button> -->
      </div>
    </div>

    <div class="recycle-modal-toolbar">
      <div class="rb-search-wrap">
        <a-input
          v-model.trim="queryParam.queryFileds"
          class="rb-search"
          allowClear
          placeholder="搜索工牌号、姓名、手机号..."
          @pressEnter="searchQuery"
          @change="handleKeywordChange"
        >
          <a-icon slot="prefix" type="search" />
        </a-input>
      </div>
      <span class="rb-total">
        共 <strong>{{ ipagination.total }}</strong> 条
      </span>
    </div>

    <div class="recycle-modal-body">
      <a-table
        ref="table"
        class="recycle-table"
        rowKey="id"
        size="middle"
        :columns="columns"
        :loading="loading"
        :dataSource="dataSource"
        :pagination="ipagination"
        :rowSelection="{ selectedRowKeys, onChange: handleTableSelectChange }"
        :rowClassName="getRowClassName"
        :scroll="{ x: 960 }"
        :locale="{ emptyText: '回收站为空' }"
        @change="handleTableChange"
      >
        <span slot="action" slot-scope="text, record" class="recycle-row-actions">
          <a-button size="small" @click="openRestoreConfirm([record.id])">
            <a-icon type="redo" />
            移出
          </a-button>
          <a-button size="small" class="rb-del" @click="handleDelete(record)">
            <a-icon type="delete" />
            删除
          </a-button>
        </span>
      </a-table>
    </div>
  </a-modal>
</template>

<script>
import { filterObj } from '@/utils/util'
import { deleteAction, getAction } from '@/api/manage'

function getDefaultQueryParam() {
  return {
    deleteFlag: '是',
    ops: '否',
    type: 'personnel',
    queryFileds: ''
  }
}

export default {
  name: 'EmployeeRecycleBinModal',
  props: {
    restoreHandler: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      title: '员工回收站',
      visible: false,
      loading: false,
      currentOrgId: '',
      queryParam: getDefaultQueryParam(),
      filters: {},
      searchTimer: null,
      isorter: {
        column: 'createTime',
        order: 'desc'
      },
      selectedRowKeys: [],
      dataSource: [],
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          // 按当前页顺序显示行号。
          customRender: (text, record, index) => index + 1
        },
        {
          title: '工牌号',
          align: 'center',
          dataIndex: 'no',
          width: 120
        },
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'name',
          width: 120
        },
        {
          title: '部门',
          align: 'center',
          dataIndex: 'dept_dictText',
          width: 170
        },
        {
          title: '岗位',
          align: 'center',
          dataIndex: 'postId_dictText',
          width: 150
        },
        {
          title: '联系电话',
          align: 'center',
          dataIndex: 'phoneNumber',
          width: 140
        },
        {
          title: '操作',
          align: 'center',
          dataIndex: 'action',
          width: 150,
          scopedSlots: { customRender: 'action' }
        }
      ],
      ipagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30'],
        total: 0,
        showQuickJumper: true,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`
      },
      url: {
        list: '/hrm/hrEmployeeInformation/list',
        // delete: '/hrm/hrEmployeeInformation/deleteBatch',
        delete: '/hrm/hrEmployeeInformation/deleteBatch'
      }
    }
  },
  beforeDestroy() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  },
  methods: {
    handleDelete(record) {
      this.openDeleteConfirm([record.id])
    },
    handleDeleteBatch() {
      this.openDeleteConfirm(this.selectedRowKeys)
    },
    openDeleteConfirm(ids) {
      const deleteIds = (ids || []).filter(Boolean)
      if (!deleteIds.length) {
        this.$message.warning('请选择需要删除的员工')
        return
      }
      this.$confirm({
        title: '确认删除',
        content: deleteIds.length > 1 ? `是否删除选中的 ${deleteIds.length} 条数据?` : '是否删除选中数据?',
        onOk: () => this.deleteByIds(deleteIds)
      })
    },
    deleteByIds(ids) {
      const deleteIds = (ids || []).filter(Boolean).join(',')
      if (!deleteIds) {
        return Promise.resolve()
      }
      return deleteAction(this.url.delete, {
        ids: deleteIds,
        deleteFlag: '否'
      }).then((res) => {
        if (res.success) {
          this.$message.success(res.message)
          this.handleClearSelection()
          this.loadData()
        } else {
          this.$message.warning(res.message)
        }
      })
    },
    show(orgId) {
      this.currentOrgId = orgId || ''
      this.queryParam = getDefaultQueryParam()
      this.filters = {}
      this.selectedRowKeys = []
      this.ipagination.current = 1
      this.visible = true
      this.loadData(1)
    },
    handleCancel() {
      this.visible = false
      this.handleClearSelection()
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
        this.searchTimer = null
      }
    },
    getQueryField() {
      return 'id,no,name,mainDept,postName,phoneNumber,createTime,deleteFlag'
    },
    getQueryParams() {
      const param = Object.assign({}, this.queryParam, this.isorter, this.filters)
      param.field = this.getQueryField()
      param.pageNo = this.ipagination.current
      param.pageSize = this.ipagination.pageSize
      return filterObj(param)
    },
    loadData(arg) {
      if (!this.currentOrgId) {
        this.dataSource = []
        this.ipagination.total = 0
        return
      }
      if (arg === 1) {
        this.ipagination.current = 1
      }
      this.loading = true
      getAction(this.url.list, this.getQueryParams())
        .then((res) => {
          if (res.success) {
            const result = res.result || {}
            this.dataSource = result.records || []
            this.ipagination.total = result.total || 0
            this.ipagination.current = result.current || this.ipagination.current
            this.ipagination.pageSize = result.size || this.ipagination.pageSize
          } else {
            this.dataSource = []
            this.ipagination.total = 0
            this.$message.warning(res.message || '回收站列表加载失败')
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleTableChange(pagination, filters, sorter) {
      if (Object.keys(sorter || {}).length > 0) {
        this.isorter.column = sorter.field
        this.isorter.order = sorter.order === 'ascend' ? 'asc' : 'desc'
      }
      this.filters = filters || {}
      this.ipagination = Object.assign({}, this.ipagination, pagination)
      this.loadData()
    },
    handleTableSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    searchQuery() {
      this.handleClearSelection()
      this.loadData(1)
    },
    handleKeywordChange() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        this.searchQuery()
      }, 300)
    },
    getRowClassName(record) {
      return this.selectedRowKeys.indexOf(record.id) >= 0 ? 'recycle-row-selected' : ''
    },
    handleClearSelection() {
      this.selectedRowKeys = []
    },
    handleRestoreBatch() {
      this.openRestoreConfirm(this.selectedRowKeys)
    },
    openRestoreConfirm(ids) {
      const restoreIds = (ids || []).filter(Boolean)
      if (!restoreIds.length) {
        this.$message.warning('请选择需要移出的员工')
        return
      }
      this.$confirm({
        title: '确认移出',
        content: '是否将选中员工移出回收站？',
        onOk: () => this.handleRestore(restoreIds)
      })
    },
    handleRestore(ids) {
      const restoreIds = (ids || []).filter(Boolean).join(',')
      if (!restoreIds) {
        return Promise.resolve()
      }
      if (typeof this.restoreHandler !== 'function') {
        this.$message.warning('未配置移出操作')
        return Promise.resolve()
      }
      return Promise.resolve(this.restoreHandler(restoreIds))
        .then((res) => {
          if (res && res.success) {
            this.$message.success('移出成功')
            this.handleClearSelection()
            this.loadData()
            this.$emit('ok')
          } else if (res) {
            this.$message.warning('移出失败')
          }
        })
        .catch((error) => {
          this.$message.warning((error && error.message) || '移出失败')
        })
    }
  }
}
</script>

<style lang="less">
.employee-recycle-modal-wrap {
  --recycle-primary: #2563eb;
  --recycle-primary-rgb: 37, 99, 235;
  --recycle-foreground: #1a2a3d;
  --recycle-muted: #f1f5f9;
  --recycle-muted-foreground: #64748b;
  --recycle-border: #e2e8f0;
  --recycle-card: #ffffff;
  --recycle-red: #ef4444;

  .ant-modal {
    max-width: 95vw;
    padding-bottom: 0;
  }

  .ant-modal-content {
    overflow: hidden;
    border-radius: 12px;
    background: var(--recycle-card);
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
  }

  .ant-modal-header {
    padding: 16px 24px;
    border-bottom: 1px solid var(--recycle-border);
  }

  .ant-modal-title {
    color: var(--recycle-foreground);
    font-size: 16px;
    font-weight: 700;
    line-height: 1.4;
  }

  .ant-modal-close-x {
    width: 54px;
    height: 54px;
    color: var(--recycle-muted-foreground);
    font-size: 16px;
    line-height: 54px;
  }

  .ant-modal-close:hover .ant-modal-close-x {
    color: var(--recycle-primary);
  }

  .ant-modal-body {
    max-height: calc(85vh - 112px);
    padding: 0;
    overflow-y: auto;
  }

  .ant-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 24px;
    border-top: 1px solid var(--recycle-border);
  }

  .ant-modal-footer .ant-btn {
    height: 34px;
    margin-left: 0;
    padding: 0 18px;
    border-radius: 8px;
    border-color: #dbe3ee;
    background: #f8fafc;
    color: var(--recycle-foreground);
    font-size: 13px;
    font-weight: 600;
  }

  .ant-modal-footer .footer-delete-btn:not([disabled]) {
    border-color: rgba(239, 68, 68, 0.25);
    background: rgba(239, 68, 68, 0.08);
    color: var(--recycle-red);
  }

  .ant-modal-footer .footer-delete-btn:not([disabled]):hover,
  .ant-modal-footer .footer-delete-btn:not([disabled]):focus {
    border-color: var(--recycle-red);
    background: rgba(239, 68, 68, 0.14);
    color: var(--recycle-red);
  }

  .recycle-modal-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .recycle-modal-title .anticon {
    color: var(--recycle-primary);
    font-size: 18px;
  }

  .recycle-selection-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 10px 24px;
    border-bottom: 1px solid var(--recycle-border);
    background: rgba(var(--recycle-primary-rgb), 0.04);
    color: var(--recycle-primary);
    font-size: 12px;
    font-weight: 600;
  }

  .selection-summary {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .sel-count {
    font-weight: 700;
  }

  .sel-actions {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }

  .sel-actions .ant-btn {
    height: 28px;
    padding: 0 14px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
  }

  .sel-actions .ant-btn-primary {
    border-color: rgba(var(--recycle-primary-rgb), 0.25);
    background: rgba(var(--recycle-primary-rgb), 0.08);
    box-shadow: none;
    color: var(--recycle-primary);
  }

  .sel-actions .ant-btn-primary:hover,
  .sel-actions .ant-btn-primary:focus {
    border-color: var(--recycle-primary);
    background: rgba(var(--recycle-primary-rgb), 0.14);
    color: var(--recycle-primary);
  }

  .recycle-modal-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 10px 24px;
    border-bottom: 1px solid var(--recycle-border);
    background: var(--recycle-card);
  }

  .rb-search-wrap {
    flex: 1;
    max-width: 260px;
  }

  .rb-search .ant-input {
    height: 32px;
    border-color: var(--recycle-border);
    border-radius: 6px;
    background: rgba(var(--recycle-primary-rgb), 0.02);
    color: var(--recycle-foreground);
    font-size: 12px;
  }

  .rb-search .ant-input:focus {
    border-color: rgba(var(--recycle-primary-rgb), 0.35);
    box-shadow: 0 0 0 3px rgba(var(--recycle-primary-rgb), 0.06);
  }

  .rb-search .ant-input-prefix {
    color: rgba(var(--recycle-primary-rgb), 0.35);
  }

  .rb-total {
    margin-left: auto;
    color: var(--recycle-muted-foreground);
    font-size: 12px;
    white-space: nowrap;
  }

  .rb-total strong {
    color: var(--recycle-primary);
    font-weight: 700;
  }

  .recycle-modal-body {
    padding: 0;
  }

  .recycle-table .ant-table {
    font-size: 12.5px;
  }

  .recycle-table .ant-table-thead > tr > th {
    padding: 10px 14px;
    border-bottom: 2px solid var(--recycle-border);
    background: var(--recycle-muted);
    color: var(--recycle-muted-foreground);
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }

  .recycle-table .ant-table-tbody > tr > td {
    padding: 9px 14px;
    border-bottom: 1px solid var(--recycle-border);
    color: var(--recycle-foreground);
    vertical-align: middle;
    white-space: nowrap;
  }

  .recycle-table .ant-table-tbody > tr:hover > td {
    background: rgba(var(--recycle-primary-rgb), 0.018);
  }

  .recycle-table .ant-table-tbody > tr.recycle-row-selected > td {
    background: rgba(var(--recycle-primary-rgb), 0.05);
  }

  .recycle-table .ant-table-tbody > tr.recycle-row-selected:hover > td {
    background: rgba(var(--recycle-primary-rgb), 0.07);
  }

  .recycle-table .ant-table-selection-column {
    min-width: 44px;
  }

  .recycle-table .ant-checkbox-checked .ant-checkbox-inner {
    border-color: var(--recycle-primary);
    background-color: var(--recycle-primary);
  }

  .recycle-table .ant-table-placeholder {
    padding: 48px 24px;
    color: var(--recycle-muted-foreground);
  }

  .recycle-table .ant-pagination {
    margin: 14px 24px;
  }

  .recycle-row-actions {
    display: inline-flex;
    gap: 6px;
  }

  .recycle-row-actions .ant-btn {
    height: 28px;
    padding: 0 12px;
    border-radius: 5px;
    border-color: var(--recycle-border);
    background: var(--recycle-card);
    color: var(--recycle-muted-foreground);
    font-size: 11px;
    font-weight: 600;
  }

  .recycle-row-actions .ant-btn:hover,
  .recycle-row-actions .ant-btn:focus {
    border-color: rgba(var(--recycle-primary-rgb), 0.25);
    background: rgba(var(--recycle-primary-rgb), 0.04);
    color: var(--recycle-primary);
  }

  .recycle-row-actions .rb-del:hover,
  .recycle-row-actions .rb-del:focus {
    border-color: rgba(239, 68, 68, 0.25);
    background: rgba(239, 68, 68, 0.08);
    color: var(--recycle-red);
  }
}

@media (max-width: 768px) {
  .employee-recycle-modal-wrap {
    .ant-modal {
      top: 0;
      width: 100vw !important;
      max-width: 100vw;
      margin: 0;
    }

    .ant-modal-content {
      min-height: 100vh;
      border-radius: 0;
    }

    .ant-modal-body {
      max-height: calc(100vh - 112px);
    }

    .recycle-selection-bar,
    .recycle-modal-toolbar {
      padding-right: 16px;
      padding-left: 16px;
    }
  }
}
</style>
