<template>
  <div class="person-user-tab">
    <div class="person-user-select-summary">
      <span class="summary-label">筛选部门：{{ selectedDeptText }}</span>
      <span class="summary-count">已选 {{ selectedRowKeys.length }} 人</span>
      <a v-if="selectedRowKeys.length" @click="onClearSelected">清空</a>
    </div>

    <a-table
      ref="table"
      class="person-user-select-table"
      size="middle"
      rowKey="rowKey"
      :columns="columns"
      :dataSource="tableData"
      :pagination="ipagination"
      :scroll="{ y: 470 }"
      :loading="loading"
      :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      :customRow="customRow"
      @change="handleTableChange"
    />
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction } from '@/api/manage'
import { filterObj } from '@/utils/util'

export default {
  name: 'PersonnelUserUncreatedTab',
  mixins: [JeecgListMixin],
  props: {
    orgId: {
      type: [String, Number],
      default: ''
    },
    query: {
      type: Object,
      default: () => ({})
    },
    selectedDeptText: {
      type: String,
      default: '全部'
    }
  },
  // 维护未建账号表格列、数据和接口配置。
  data() {
    return {
      // 禁止 JeecgListMixin 自动加载，交给父弹窗按 tab 控制。
      disableMixinCreated: true,
      // 未建账号表格列。
      columns: [
        {
          title: '工牌号',
          align: 'center',
          dataIndex: 'no',
          width: 140,
          customRender: (text, record) => this.getDisplayBadge(record)
        },
        {
          title: '姓名',
          align: 'left',
          dataIndex: 'name',
          width: 120
        },
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
          dataIndex: 'postName',
          customRender: (text, record) => this.getDisplayPost(record)
        },
        {
          title: '联系电话',
          align: 'center',
          // width: 160,
          dataIndex: 'phoneNumber',
          customRender: (text, record) => this.getDisplayContact(record)
        }
      ],
      // 当前 tab 使用的接口地址。
      url: {
        list: '/hrm/hrEmployeeInformation/maintainList'
      }
    }
  },
  computed: {
    // 表格数据统一补 rowKey，支持跨页选择。
    tableData() {
      return (this.dataSource || []).map(item => Object.assign({}, item, {
        rowKey: this.getRowKey(item)
      }))
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
    // 按父组件传入的查询条件加载未建账号列表。
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
      return getAction(this.url.list, this.getQueryParams()).then((res) => {
        if (res.success) {
          const result = res.result || {}
          this.dataSource = Array.isArray(result) ? result : (result.records || [])
          this.ipagination.total = result.total || this.dataSource.length || 0
          this.ipagination.current = result.current || this.ipagination.current
          this.ipagination.pageSize = result.size || this.ipagination.pageSize
        } else {
          this.dataSource = []
          this.ipagination.total = 0
          this.$message.warning(res.message || '用户列表加载失败')
        }
      }).finally(() => {
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
    // 未建账号列表沿用后端默认字段。
    getQueryField() {
      return ''
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
    // 同步当前页表格选择，并保留跨页已选记录。
    onSelectChange(currentSelectedRowKeys, currentSelectedRows) {
      const pageKeys = this.tableData.map(item => this.getTableRowKey(item))
      const keepRows = (this.selectionRows || []).filter(row => pageKeys.indexOf(this.getTableRowKey(row)) === -1)
      const mergedRows = keepRows.concat(currentSelectedRows)
      const keepKeys = (this.selectedRowKeys || []).filter(key => pageKeys.indexOf(key) === -1)
      this.selectedRowKeys = this.uniqueKeys(keepKeys.concat(currentSelectedRowKeys))
      this.selectionRows = this.uniqueRows(mergedRows)
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
    // 对 key 列表去重并移除空值。
    uniqueKeys(list) {
      return Array.from(new Set((list || []).filter(Boolean)))
    },
    // 对记录列表按 rowKey 去重。
    uniqueRows(list) {
      const map = {}
      ;(list || []).forEach(item => {
        const key = this.getTableRowKey(item)
        if (key) {
          map[key] = item
        }
      })
      return Object.keys(map).map(key => map[key])
    },
    // 给表格行增加点击选中逻辑，并排除复选框。
    customRow(record) {
      return {
        on: {
          click: event => {
            const target = event && event.target
            if (target && target.closest && target.closest('.ant-checkbox-wrapper')) {
              return
            }
            this.toggleRow(record)
          }
        }
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
        this.selectedRowKeys = this.selectedRowKeys.filter(item => item !== key)
        this.selectionRows = this.selectionRows.filter(item => this.getTableRowKey(item) !== key)
      } else {
        this.selectedRowKeys = this.uniqueKeys(this.selectedRowKeys.concat(key))
        this.selectionRows = this.uniqueRows(this.selectionRows.concat(record))
      }
      this.emitSelection()
    },
    // 返回表格行 key。
    getTableRowKey(record) {
      return this.getRowKey(record)
    },
    // 向父组件同步选中状态。
    emitSelection() {
      this.$emit('selection-change', {
        selectedRowKeys: this.selectedRowKeys,
        selectionRows: this.selectionRows
      })
    },
    // 生成未建账号表格的稳定 rowKey。
    getRowKey(record) {
      const source = record || {}
      return String(source.userId || source.id || source.username || source.workNo || source.realname || source.name || '')
    },
    // 获取工牌号显示文本。
    getDisplayBadge(record) {
      return this.readValue(record, ['no'])
    },
    // 获取岗位显示文本。
    getDisplayPost(record) {
      return this.readValue(record, ['postId_dictText'], '-')
    },
    // 获取部门显示文本。
    getDisplayDept(record) {
      const value = this.readValue(record, ['dept_dictText'], '')
      return value || '-'
    },
    // 获取联系电话显示文本。
    getDisplayContact(record) {
      return this.readValue(record, ['phoneNumber'])
    },
    // 按候选字段顺序读取记录值。
    readValue(record, keys, fallback) {
      const source = record || {}
      for (let i = 0; i < keys.length; i++) {
        const value = source[keys[i]]
        if (value !== undefined && value !== null && value !== '') {
          return value
        }
      }
      return fallback === undefined ? '-' : fallback
    }
  }
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

.summary-count {
  color: var(--employee-primary);
  font-weight: 600;
}

.person-user-select-table {
  flex: 1;
  min-height: 0;
}
</style>
