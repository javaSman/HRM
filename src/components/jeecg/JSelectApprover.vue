<template>
  <div class="j-select-employee" :class="{ 'j-select-employee-button-only': buttonOnly }">
    <a-button
      v-if="buttonOnly"
      :type="buttonType"
      :icon="buttonIcon"
      :disabled="disabled"
      @click="openModal"
    >
      {{ buttonText }}
    </a-button>

    <div v-else class="j-select-employee-control">
      <a-input
        class="j-select-employee-input"
        :value="displayText"
        :placeholder="placeholder"
        readOnly
        :disabled="disabled"
        @click="openModal"
      >
        <a-icon slot="prefix" type="team" />
        <a-icon
          v-if="allowClear && selectedValueList.length && !disabled"
          slot="suffix"
          class="j-select-employee-clear"
          type="close-circle"
          @click.stop="clearSelected"
        />
      </a-input>
      <a-button v-if="buttonShow" :type="buttonType" :icon="buttonIcon" :disabled="disabled" @click="openModal">
        {{ buttonText }}
      </a-button>
    </div>

    <a-modal
      title="选择人员"
      :width="modalWidth"
      :visible="visible"
      :confirmLoading="loading"
      :bodyStyle="{ padding: 0, height: '70vh', overflow: 'hidden' }"
      okText="确定"
      cancelText="取消"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div class="j-select-employee-modal">
        <div class="j-select-employee-tree">
          <org-structure-tree
            v-if="visible"
            ref="orgTree"
            v-model="currentDeptId"
            :enable-context-menu="false"
            @change="handleOrgChange"
          />
        </div>
        <div class="j-select-employee-content">
          <div class="j-select-employee-toolbar">
            <a-input
              v-model.trim="queryParam.queryFileds"
              class="j-select-employee-search"
              allowClear
              placeholder="搜索员工姓名、工号"
              @pressEnter="searchQuery"
            >
              <a-icon slot="prefix" type="search" />
            </a-input>
            <a-button type="primary" icon="search" @click="searchQuery">查询</a-button>
            <a-button icon="reload" @click="searchReset">重置</a-button>
            <a-button icon="delete" @click="clearSelected">重置所选人员</a-button>
          </div>

          <a-table
            rowKey="id"
            size="middle"
            bordered
            :columns="columns"
            :dataSource="dataSource"
            :loading="loading"
            :pagination="ipagination"
            :rowSelection="rowSelection"
            :scroll="{ y: tableBodyHeight }"
            @change="handleTableChange"
          />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { getAction } from '@/api/manage'
import OrgStructureTree from '@/components/tree/OrgStructureTree.vue'

export default {
  name: 'JSelectEmployee',
  components: {
    OrgStructureTree
  },
  props: {
    value: {
      type: [String, Number, Array],
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择人员'
    },
    buttonShow:{
      type: Boolean,
      default: true
    },
    buttonText: {
      type: String,
      default: '选择'
    },
    buttonIcon: {
      type: String,
      default: 'search'
    },
    buttonType: {
      type: String,
      default: 'primary'
    },
    buttonOnly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    allowClear: {
      type: Boolean,
      default: true
    },
    multiple: {
      type: Boolean,
      default: true
    },
    valueType: {
      type: String,
      default: 'string'
    },
    valueField: {
      type: String,
      default: 'id'
    },
    modalWidth: {
      type: Number,
      default: 1100
    },
    tableBodyHeight: {
      type: Number,
      default: 470
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      currentDeptId: '',
      currentOrgNode: null,
      queryParam: {
        queryFileds: ''
      },
      dataSource: [],
      selectedRowKeys: [],
      selectionRows: [],
      selectedRowMap: {},
      selectedValueKeyMap: {},
      selectedTextMap: {},
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
    selectedValueList() {
      return this.parseValue(this.value)
    },
    displayText() {
      return this.selectedValueList
        .map(id => this.selectedTextMap[id] || id)
        .join(',')
    },
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange,
        type: this.multiple ? 'checkbox' : 'radio'
      }
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.syncSelectedKeys(val)
      }
    }
  },
  methods: {
    parseValue(value) {
      if (Array.isArray(value)) {
        return value
          .filter(item => item !== undefined && item !== null && item !== '')
          .map(item => String(item))
      }
      if (value === undefined || value === null || value === '') {
        return []
      }
      return String(value)
        .split(',')
        .map(item => item.trim())
        .filter(item => item)
    },
    syncSelectedKeys(value) {
      const values = this.multiple ? this.parseValue(value) : this.parseValue(value).slice(0, 1)
      const keys = values.map(item => this.selectedValueKeyMap[item] || item)
      this.selectedRowKeys = keys
      this.selectionRows = keys
        .map(key => this.selectedRowMap[key])
        .filter(Boolean)
    },
    openModal() {
      if (this.disabled) {
        return
      }
      this.visible = true
      this.syncSelectedKeys(this.value)
      if (this.currentDeptId) {
        this.loadData(1)
      }
    },
    handleCancel() {
      this.visible = false
      this.syncSelectedKeys(this.value)
    },
    handleOk() {
      this.emitSelectedValue(this.selectedRowKeys)
      this.visible = false
    },
    handleOrgChange(node) {
      const current = node || {}
      const deptId = current.id || current.key || current.value
      this.currentOrgNode = node || null
      this.currentDeptId = deptId ? String(deptId) : ''
      this.loadData(1)
    },
    loadData(arg) {
      if (arg === 1) {
        this.ipagination.current = 1
      }
      if (!this.currentDeptId) {
        this.dataSource = []
        this.ipagination.total = 0
        return Promise.resolve()
      }
      const params = Object.assign({}, this.queryParam, {
        deleteFlag: '否',
        column: 'px',
        order: 'asc',
        pageNo: this.ipagination.current,
        pageSize: this.ipagination.pageSize,
        dept: this.currentDeptId,
        type: 'personnel'
      })
      this.loading = true
      return getAction(this.url.list, params).then(res => {
        if (res && res.success === false) {
          this.dataSource = []
          this.ipagination.total = 0
          this.$message.warning(res.message || '人员列表加载失败')
          return
        }
        const result = res && res.success !== undefined ? (res.result || {}) : (res || {})
        const list = this.getResultRows(result)
        this.dataSource = list
        this.cacheRows(list)
        this.syncSelectedKeys(this.value)
        this.ipagination.total = this.getResultTotal(result, list)
      }).catch(error => {
        this.dataSource = []
        this.ipagination.total = 0
        this.$message.warning(error.message || '人员列表加载失败')
      }).finally(() => {
        this.loading = false
      })
    },
    getResultRows(result) {
      const source = result && result.data !== undefined ? result.data : result
      if (Array.isArray(source)) {
        return this.normalizeRows(source)
      }
      if (source && Array.isArray(source.records)) {
        return this.normalizeRows(source.records)
      }
      if (result && Array.isArray(result.records)) {
        return this.normalizeRows(result.records)
      }
      const rows = []
      Object.keys(source || {}).forEach(key => {
        const value = source[key]
        if (Array.isArray(value)) {
          rows.push(...value)
        }
      })
      return this.normalizeRows(rows)
    },
    normalizeRows(rows) {
      return (rows || [])
        .filter(item => item && (item.id || item.userId))
        .map(item => {
          const id = item.id || item.userId
          return Object.assign({}, item, {
            id: String(id)
          })
        })
    },
    getResultTotal(result, rows) {
      const source = result && result.data !== undefined ? result.data : result
      const total = [result && result.total, source && source.total, result && result.count, source && source.count]
        .find(item => item !== undefined && item !== null && item !== '')
      const totalNumber = Number(total)
      return total === undefined || Number.isNaN(totalNumber) ? rows.length : totalNumber
    },
    cacheRows(rows) {
      ;(rows || []).forEach(row => {
        const key = String(row.id)
        const value = this.getRowValue(row)
        this.$set(this.selectedRowMap, key, row)
        this.$set(this.selectedValueKeyMap, value, key)
        this.$set(this.selectedTextMap, value, this.getDisplayName(row))
        this.$set(this.selectedTextMap, key, this.getDisplayName(row))
      })
      this.selectionRows = this.selectedRowKeys
        .map(key => this.selectedRowMap[key])
        .filter(Boolean)
    },
    getRowValue(row) {
      const value = row && row[this.valueField]
      return String(value === undefined || value === null || value === '' ? row.id : value)
    },
    getDisplayName(row) {
      if (!row) {
        return ''
      }
      const name = row.name || row.realname || row.username || row.no || row.id
      const no = row.no && name !== row.no ? '（' + row.no + '）' : ''
      return name + no
    },
    searchQuery() {
      this.loadData(1)
    },
    searchReset() {
      this.queryParam = {
        queryFileds: ''
      }
      this.searchQuery()
    },
    clearSelected() {
      this.selectedRowKeys = []
      this.selectionRows = []
      this.selectedRowMap = {}
      this.selectedValueKeyMap = {}
      this.selectedTextMap = {}
      this.emitSelectedValue([])
    },
    handleTableChange(pagination) {
      this.ipagination = Object.assign({}, this.ipagination, pagination)
      this.loadData()
    },
    onSelectChange(selectedRowKeys, selectionRows) {
      const keys = this.multiple ? selectedRowKeys : selectedRowKeys.slice(-1)
      ;(selectionRows || []).forEach(row => {
        const key = String(row.id)
        this.$set(this.selectedRowMap, key, row)
        this.$set(this.selectedTextMap, key, this.getDisplayName(row))
      })
      Object.keys(this.selectedRowMap).forEach(key => {
        if (keys.indexOf(key) === -1) {
          this.$delete(this.selectedRowMap, key)
        }
      })
      this.selectedRowKeys = keys.map(key => String(key))
      this.selectionRows = this.selectedRowKeys
        .map(key => this.selectedRowMap[key])
        .filter(Boolean)
    },
    emitSelectedValue(keys) {
      const normalizedKeys = (keys || []).map(key => String(key))
      const values = normalizedKeys.map(key => {
        const row = this.selectedRowMap[key]
        return row ? this.getRowValue(row) : key
      })
      const value = this.valueType === 'array'
        ? values
        : values.join(',')
      const rows = (keys || [])
        .map(key => this.selectedRowMap[String(key)])
        .filter(Boolean)
      this.$emit('select', rows)
      this.$emit('input', value)
      this.$emit('change', value, rows)
    }
  }
}
</script>

<style scoped lang="less">
.j-select-employee {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}

.j-select-employee-control {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.j-select-employee-button-only {
  display: inline-flex;
  width: auto;
}

.j-select-employee-input {
  flex: 1;
  min-width: 0;
  cursor: pointer;

  /deep/ .ant-input {
    cursor: pointer;
  }
}

.j-select-employee-clear {
  color: rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: rgba(0, 0, 0, 0.45);
  }
}

.j-select-employee-modal {
  --employee-radius: 8px;
  --employee-background: #f8fafd;
  --employee-foreground: #1a2a3d;
  --employee-card: #ffffff;
  --employee-primary: #2563eb;
  --employee-primary-rgb: 37, 99, 235;
  --employee-muted-foreground: #64748b;
  --employee-border: #e2e8f0;

  height: 70vh;
  display: flex;
  overflow: hidden;
  background: var(--employee-background);
}

.j-select-employee-tree {
  width: 280px;
  min-width: 280px;
  height: 100%;
  overflow: hidden;
}

.j-select-employee-content {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.j-select-employee-toolbar {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.j-select-employee-search {
  width: 280px;
  max-width: 100%;
}

.j-select-employee-content /deep/ .ant-table-wrapper {
  flex: 1;
  min-height: 0;
}
</style>
