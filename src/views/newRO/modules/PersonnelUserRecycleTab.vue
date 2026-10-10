<template>
  <div class="person-user-tab">
    <div class="person-user-select-summary">
      <span class="summary-label"
        >已选择 <strong>{{ selectedRowKeys.length }}</strong> 项</span
      >
      <span v-if="selectedRowKeys.length" class="summary-actions">
        <a @click="onClearSelected">清空选择</a>
        <!-- <a-divider type="vertical" />
        <a @click="restoreBatch">
          <a-icon type="redo" />
          批量复原
        </a> -->
      </span>
    </div>

    <a-table
      ref="table"
      class="person-user-select-table"
      size="middle"
      rowKey="id"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="ipagination"
      :scroll="{ y: 470 }"
      :loading="loading"
      :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      :customRow="customRow"
      @change="handleTableChange"
    >
      <span slot="action" slot-scope="text, record" class="person-user-select-row-actions" @click.stop>
        <!-- <a @click="openRestoreConfirm([record.id])">
          <a-icon type="redo" />
          复原
        </a>
        <a-divider type="vertical" /> -->
        <a class="danger" @click="handleRecycleDelete(record)">
          <!-- <a-icon type="delete" /> -->
          删除
        </a>
      </span>
    </a-table>
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { deleteAction, getAction, postAction } from '@/api/manage'
import { filterObj } from '@/utils/util'

export default {
  name: 'PersonnelUserRecycleTab',
  mixins: [JeecgListMixin],
  props: {
    orgId: {
      type: [String, Number],
      default: '',
    },
    query: {
      type: Object,
      default: () => ({}),
    },
    selectedTreeKeys: {
      type: Array,
      default: () => [],
    },
  },
  // 维护回收站表格列、数据和接口配置。
  data() {
    return {
      // 禁止 JeecgListMixin 自动加载，交给父弹窗按 tab 控制。
      disableMixinCreated: true,
      // 回收站表格列。
      columns: [
        // {
        //   title: '#',
        //   dataIndex: '',
        //   key: 'rowIndex',
        //   width: 80,
        //   align: 'center',
        //   customRender: (text, record, index) => index + 1,
        // },
        {
          title: '工牌号',
          align: 'center',
          dataIndex: 'no',
          width: 140,
        },
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'name',
          width: 120,
        },
        // {
        //   title: '所属部门',
        //   align: 'center',
        //   dataIndex: 'mainDeptPath',
        //   width: 230,
        //     customRender: (text, record) => {
        //     return  text.endsWith('/') ? text.slice(0, -1) : text
        //   }
        // },
        {
          title: '所属部门',
          align: 'center',
          dataIndex: 'mainDeptPath',
           width: 450,
          ellipsis: true,
          customRender: (str) => {
              let text  =  str
              return <a-tooltip style='width: 440px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block'>
                <template slot="title">{text.endsWith('/') ? text.slice(0, -1) : text}</template>
                <span >{text.endsWith('/') ? text.slice(0, -1) : text}</span>
              </a-tooltip>
            }
        },
        {
          title: '岗位',
          align: 'center',
          dataIndex: 'postId_dictText',
          // width: 160,
        },
        {
          title: '联系电话',
          align: 'center',
          dataIndex: 'phoneNumber',
          // width: 190,
        },
        {
          title: '操作',
          align: 'center',
          dataIndex: 'action',
          // width: 130,
          scopedSlots: { customRender: 'action' },
        },
      ],
      // 当前 tab 使用的接口地址。
      url: {
        list: '/hrm/hrEmployeeInformation/maintainList',
        delete: '/hrm/hrEmployeeInformation/deleteBatch',
        returnBack: '/hrm/hrEmployeeInformation/rturnBackSys',
      },
    }
  },
  methods: {
    // 重置表格、分页和选中状态。
    reset() {
      this.clearTable()
      this.onClearSelected()
    },
    // 清空表格数据和分页。
    clearTable() {
      this.dataSource = []
      this.ipagination.total = 0
      this.ipagination.current = 1
    },
    // 按父组件传入的查询条件加载回收站列表。
    loadData(arg) {
      if (!this.orgId) {
        this.clearTable()
        this.onClearSelected()
        return Promise.resolve()
      }
      if (arg === 1) {
        this.ipagination.current = 1
      }
      this.loading = true
      return getAction(this.url.list, this.getQueryParams())
        .then((res) => {
          if (res.success) {
            const result = res.result || {}
            this.dataSource = Array.isArray(result) ? result : result.records || []
            this.ipagination.total = result.total || this.dataSource.length || 0
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
    // 组装列表查询参数。
    getQueryParams() {
      const param = Object.assign({}, this.query, this.isorter, this.filters)
      param.field = this.getQueryField()
      param.pageNo = this.ipagination.current
      param.pageSize = this.ipagination.pageSize
      return filterObj(param)
    },
    // 回收站列表限定查询字段。
    getQueryField() {
      return 'id,no,name,dept_dictText,postId_dictText,phoneNumber,createTime,deleteFlag'
    },
    // 表格分页、排序和筛选变化时重新查询。
    handleTableChange(pagination, filters, sorter) {
      if (Object.keys(sorter || {}).length > 0) {
        this.isorter.column = sorter.field
        this.isorter.order = sorter.order === 'ascend' ? 'asc' : 'desc'
      }
      this.ipagination = pagination
      this.loadData()
    },
    // 同步表格选中项。
    onSelectChange(selectedRowKeys, selectionRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectionRows = selectionRows
      this.emitSelection()
    },
    // 清空当前表格选中项。
    onClearSelected() {
      this.selectedRowKeys = []
      this.selectionRows = []
      this.emitSelection()
    },
    // 供父组件统一调用清空选择。
    clearSelection() {
      this.onClearSelected()
    },
    // 返回当前已选记录。
    getSelectionRows() {
      return (this.selectionRows || []).slice()
    },
    // 给表格行增加点击选中逻辑，并排除复选框和操作列。
    customRow(record) {
      return {
        on: {
          click: (event) => {
            const target = event && event.target
            if (
              target &&
              target.closest &&
              (target.closest('.ant-checkbox-wrapper') || target.closest('.person-user-select-row-actions'))
            ) {
              return
            }
            this.toggleRow(record)
          },
        },
      }
    },
    // 切换单行选中状态。
    toggleRow(record) {
      const key = this.getTableRowKey(record)
      if (!key) {
        return
      }
      const exists = this.selectedRowKeys.indexOf(key) > -1
      if (exists) {
        this.selectedRowKeys = this.selectedRowKeys.filter((item) => item !== key)
        this.selectionRows = this.selectionRows.filter((item) => this.getTableRowKey(item) !== key)
      } else {
        this.selectedRowKeys = this.selectedRowKeys.concat(key)
        this.selectionRows = this.uniqueRows(this.selectionRows.concat(record))
      }
      this.emitSelection()
    },
    // 对记录列表按 rowKey 去重。
    uniqueRows(list) {
      const map = {}
      ;(list || []).forEach((item) => {
        const key = this.getTableRowKey(item)
        if (key) {
          map[key] = item
        }
      })
      return Object.keys(map).map((key) => map[key])
    },
    // 返回回收站表格行 key。
    getTableRowKey(record) {
      const source = record || {}
      return String(source.id || '')
    },
    // 向父组件同步选中状态。
    emitSelection() {
      this.$emit('selection-change', {
        selectedRowKeys: this.selectedRowKeys,
        selectionRows: this.selectionRows,
      })
    },
    // 对当前选中人员执行批量复原。
    restoreBatch() {
      this.openRestoreConfirm(this.selectedRowKeys)
    },
    restoreBatch2() {
      this.openRestoreConfirm2(this.selectionRows)
    },

    // 打开复原确认弹窗。
    openRestoreConfirm(ids) {
      const restoreIds = (ids || []).filter(Boolean)
      if (!restoreIds.length) {
        this.$message.warning('请选择需要复原的人员')
        return
      }
      this.$confirm({
        title: '确认复原',
        content: '是否将选中人员复原回收站？',
        onOk: () => this.handleRestore(restoreIds),
      })
    },
    openRestoreConfirm2(rows) {
      if (!rows.length) {
        this.$message.warning('请选择需要添加的人员')
        return
      }
      this.$confirm({
        title: '确认添加',
        content: '是否将选中人员添加当前角色？',
        onOk: () => this.handleRestore2(rows),
      })
    },
    // 调用恢复接口将人员复原回收站。
    handleRestore(ids) {
      const restoreIds = (ids || []).filter(Boolean).join(',')
      if (!restoreIds) {
        return Promise.resolve()
      }
      return getAction(this.url.returnBack, {
        ids: restoreIds,
      })
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '复原成功')
            this.onClearSelected()
            this.loadData()
            this.$emit('recycle-ok')
          } else {
            this.$message.warning(res.message || '复原失败')
          }
        })
        .catch((error) => {
          this.$message.warning((error && error.message) || '复原失败')
        })
    },
    // 调用恢复接口将人员复原回收站。
    handleRestore2(rows) {
      // const postId = this.selectedTreeKeys[1] || ''
      const managerId =  this.selectedTreeKeys.length === 3 ? this.selectedTreeKeys[2] : this.selectedTreeKeys[1] 

      const dataList = rows.map((item) => {
        return {
          ...item,
          // postId,
          // managerId,
         managerId:managerId,
         beforeRoleId:item.managerId,
         endRoleId:managerId,
          // deleteFlag: '否',
          // ops: '是',
        }
      })
      
      // postAction('hrm/hrEmployeeInformation/okEdit', dataList)
      postAction('hrm/hrEmployeeInformation/changePostRole', dataList)
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '添加成功')
            this.onClearSelected()
            this.loadData()
            this.$emit('recycle-ok')
          } else {
            this.$message.warning(res.message || '添加失败')
          }
        })
        .catch((err) => {
          console.error(err)
          this.$message.error('接口调用失败')
        })
    },
    // 删除回收站中的单条记录。
    handleRecycleDelete(record) {
      if (!record || !record.id) {
        this.$message.warning('缺少用户ID，无法删除')
        return
      }
      this.$confirm({
        title: '确认删除',
        content: '是否删除选中数据?',
        onOk: () => {
          return deleteAction(this.url.delete, {
            ids: record.id,
            deleteFlag: '否',
          }).then((res) => {
            if (res.success) {
              this.$message.success('删除成功')
              this.onClearSelected()
              this.loadData()
              this.$emit('recycle-ok')
            } else {
              this.$message.warning(res.message)
            }
          })
        },
      })
    },
  },
}
</script>

<style scoped lang="less">
.person-user-tab {
  min-height: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.person-user-select-summary {
  margin-bottom: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(var(--employee-primary-rgb), 0.1);
  border-radius: 10px;
  background: #ffffff;
}

.summary-label {
  flex: 1;
  min-width: 0;
  color: #1f2937;
  font-weight: 500;
}

.summary-label strong {
  color: var(--employee-primary);
}

.summary-actions {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.person-user-select-table {
  flex: 1;
  min-height: 0;
}

.person-user-select-row-actions {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.person-user-select-row-actions .danger {
  color: #ef4444;
  margin-left: -7px;
}
</style>
