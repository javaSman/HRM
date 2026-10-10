<template>
  <a-modal
    title="设置负责人"
    :visible="visible"
    :confirmLoading="loading"
    :width="760"
    :bodyStyle="{ maxHeight: '72vh', overflow: 'hidden' }"
    okText="确认"
    cancelText="取消"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="manager-modal-toolbar">
      <a-input
        v-model.trim="queryParam.queryFileds"
        allowClear
        enterButton
        placeholder="搜索员工姓名、工号"
      />
      <a-button icon="search" @click="searchQuery">查询</a-button>
      <a-button icon="reload" @click="searchReset">重置</a-button>
    </div>
    <div class="manager-modal-table">
      <a-table
        rowKey="id"
        size="middle"
        :columns="columns"
        :dataSource="dataSource"
        :loading="loading"
        :pagination="ipagination"
        :rowSelection="rowSelection"
        @change="handleTableChange"
      />
    </div>
  </a-modal>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'SetManagerModal',
  data() {
    return {
      visible: false,
      loading: false,
      currentDeptId: '',
      currentDepartPrincipal: '',
      queryParam: {
        queryFileds: ''
      },
      dataSource: [],
      selectedRowKeys: [],
      selectionRows: [],
      ipagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30', '50'],
        showTotal: total => {
          return '共 ' + total + ' 条'
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0
      },
      columns: [
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'name'
        },
        {
          title: '工号',
          align: 'center',
          dataIndex: 'no'
        },
        {
          title: '部门',
          align: 'center',
          dataIndex: 'dept_dictText'
        },
        {
          title: '岗位',
          align: 'center',
          dataIndex: 'postId_dictText'
        }
      ],
      url: {
        list: '/hrm/hrEmployeeInformation/childrenList'
      }
    }
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange,
        type: 'radio'
      }
    }
  },
  methods: {
    open(node, departPrincipal) {
      const targetNode = node || {}
      const deptId = targetNode.id || targetNode.key || targetNode.value
      if (!deptId) {
        this.$message.warning('未获取到组织标识，无法设置负责人')
        return
      }
      const currentDepartPrincipal = departPrincipal !== undefined && departPrincipal !== null
        ? departPrincipal
        : (targetNode.departPrincipal || '')
      this.visible = true
      this.currentDeptId = String(deptId)
      this.currentDepartPrincipal = currentDepartPrincipal ? String(currentDepartPrincipal) : ''
      this.queryParam = {
        queryFileds: ''
      }
      this.ipagination.current = 1
      this.ipagination.pageSize = 10
      this.ipagination.total = 0
      this.dataSource = []
      this.selectedRowKeys = this.currentDepartPrincipal ? [this.currentDepartPrincipal] : []
      this.selectionRows = []
      this.loadData()
    },
    loadData(arg) {
      if (arg === 1) {
        this.ipagination.current = 1
      }
      if (!this.currentDeptId) {
        return Promise.resolve()
      }
      this.loading = true
      const params = Object.assign({}, this.queryParam, {
        deleteFlag: '否',
        column: 'px',
        order: 'asc',
        pageNo: this.ipagination.current,
        pageSize: this.ipagination.pageSize,
        dept: this.currentDeptId,
        type: 'personnel'
      })
      return getAction(this.url.list, params).then(res => {
        if (res && res.success === false) {
          this.dataSource = []
          this.ipagination.total = 0
          this.$message.warning(res.message || '负责人列表加载失败')
          return
        }
        const result = res && res.success !== undefined ? (res.result || {}) : (res || {})
        const list = this.getResultRows(result)
        this.dataSource = list
        this.ipagination.total = this.getResultTotal(result, list)
        // this.syncSelectionRows(list)
      }).catch(error => {
        this.dataSource = []
        this.ipagination.total = 0
        this.$message.warning(error.message || '负责人列表加载失败')
      }).finally(() => {
        this.loading = false
      })
    },
    getResultRows(result) {
      const source = result && result.data !== undefined ? result.data : result
      if (Array.isArray(source)) {
        return source
      }
      if (source && Array.isArray(source.records)) {
        return source.records
      }
      if (result && Array.isArray(result.records)) {
        return result.records
      }
      const rows = []
      Object.keys(source || {}).forEach(key => {
        const value = source[key]
        if (Array.isArray(value)) {
          rows.push(...value)
        }
      })
      return rows
    },
    getResultTotal(result, rows) {
      const source = result && result.data !== undefined ? result.data : result
      const total = [result && result.total, source && source.total, result && result.count, source && source.count]
        .find(item => item !== undefined && item !== null && item !== '')
      const totalNumber = Number(total)
      return total === undefined || Number.isNaN(totalNumber) ? rows.length : totalNumber
    },
    // syncSelectionRows(list) {
    //   const selectedKey = this.selectedRowKeys[0]
    //   if (!selectedKey) {
    //     this.selectionRows = []
    //     return
    //   }
    //   const manager = (list || []).find(item => String(item.id) === String(selectedKey))
    //   if (manager) {
    //     this.selectedRowKeys = [manager.id]
    //     this.selectionRows = [manager]
    //   } else {
    //     this.selectionRows = []
    //   }
    // },
    searchQuery() {
      // this.selectedRowKeys = []
      // this.selectionRows = []
      this.loadData(1)
    },
    searchReset() {
      this.queryParam = {
        queryFileds: ''
      }
      this.searchQuery()
    },
    handleTableChange(pagination) {
      this.ipagination = Object.assign({}, this.ipagination, pagination)
      // this.selectedRowKeys = []
      // this.selectionRows = []
      this.loadData()
    },
    onSelectChange(selectedRowKeys, selectionRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectionRows = selectionRows
    },
    handleOk() {
   const manager = this.selectionRows[0] || this.dataSource.find(item => String(item.id) === String(this.selectedRowKeys[0]))
      if (!manager) {
        this.$message.warning('请选择负责人')
        return
      }
      this.$emit('edit', manager.id)
      this.handleCancel()
    },
    handleCancel() {
      this.visible = false
      this.currentDeptId = ''
      this.currentDepartPrincipal = ''
      this.dataSource = []
      this.selectedRowKeys = []
      this.selectionRows = []
      this.ipagination.total = 0
    }
  }
}
</script>

<style scoped lang="less">
.manager-modal-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  /deep/ .ant-input-affix-wrapper,
  /deep/ .ant-input {
    width: 280px;
    max-width: 100%;
  }
}

.manager-modal-table {
  min-height: 0;
  padding-right: 2px;

  /deep/ .ant-table-body {
    max-height: calc(72vh - 164px);
    overflow-y: auto !important;
  }

  /deep/ .ant-table-pagination {
    margin-bottom: 0;
  }
}
</style>
