<template>
  <div class="scope-tab">
    <a-input
      v-model.trim="searchKeyword"
      allowClear
      placeholder="搜索员工、部门或岗位"
      class="scope-tab-search"
    >
      <a-icon slot="suffix" type="search" />
    </a-input>

    <a-spin :spinning="loading">
      <div class="scope-option-panel">
        <div v-if="filteredEmployeeList.length" class="employee-checkbox-list">
          <a-checkbox
            v-for="employee in filteredEmployeeList"
            :key="employee.id"
            :checked="isEmployeeSelected(employee.no)"
            @change="handleEmployeeCheck(employee, $event)"
          >
            <span class="employee-name">{{ employee.name }}</span>
            <span class="employee-meta">{{ employee.dept_dictText }} · {{ employee.postId_dictText || '员工' }}</span>
          </a-checkbox>
        </div>
        <a-empty v-else description="暂无员工" />
      </div>
    </a-spin>
  </div>
</template>

<script>
  import { getAction } from '@/api/manage'
  import { normalizeIds } from './HrKqRuleScopeUtils'

  export default {
    name: 'HrKqRuleScopeEmployeeTab',
    props: {
      value: {
        type: Array,
        default: () => []
      },
      visible: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        searchKeyword: '',
        employeeList: [],
        loading: false,
        url: {
          employeeList: '/hrm/hrEmployeeInformation/list'
        }
      }
    },
    computed: {
      selectedIds() {
        return normalizeIds(this.value.map(item => item.value))
      },
      filteredEmployeeList() {
        const keyword = this.searchKeyword.toLowerCase()
        if (!keyword) {
          return this.employeeList
        }
        return this.employeeList.filter(item => {
          return [item.name, item.dept_dictText, item.postId_dictText]
            .some(value => String(value).toLowerCase().indexOf(keyword) > -1)
        })
      }
    },
    watch: {
      visible: {
        immediate: true,
        handler(visible) {
          if (visible) {
            this.searchKeyword = ''
            this.loadEmployeeList()
          }
        }
      }
    },
    methods: {
      loadEmployeeList() {
        this.loading = true
        return getAction(this.url.employeeList, {
          column: 'createTime',
          order: 'desc',
          deleteFlag: '否',
          pageSize: 999999
        }).then(res => {
          const result = res && res.success ? res.result : {}
          this.employeeList = result && Array.isArray(result.records) ? result.records : []
        }).catch(() => {
          this.employeeList = []
        }).finally(() => {
          this.loading = false
        })
      },
      isEmployeeSelected(employeeNo) {
        return this.selectedIds.indexOf(String(employeeNo)) > -1
      },
      handleEmployeeCheck(employee, event) {
        const no = String(employee.no)
        const selection = this.value.slice()
        const index = selection.findIndex(item => String(item.value) === no)
        if (event.target.checked && index === -1) {
          selection.push({
            value: no,
            label: employee.name,
            description: employee.dept_dictText + ' · ' + (employee.postId_dictText || '员工')
          })
        } else if (!event.target.checked && index > -1) {
          selection.splice(index, 1)
        }
        this.$emit('input', selection)
      }
    }
  }
</script>

<style scoped lang="less">
  .scope-tab-search {
    margin-bottom: 12px;
  }

  .scope-option-panel {
    height: 410px;
    padding: 10px 12px;
    overflow-y: auto;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
  }

  .employee-checkbox-list {
    display: flex;
    flex-direction: column;
  }

  .employee-checkbox-list /deep/ .ant-checkbox-wrapper {
    display: flex;
    align-items: flex-start;
    min-height: 34px;
    margin-left: 0;
    padding: 7px 8px;
    border-radius: 3px;
  }

  .employee-checkbox-list /deep/ .ant-checkbox-wrapper:hover {
    background: #f5f7ff;
  }

  .employee-checkbox-list /deep/ .ant-checkbox-wrapper > span:last-child {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }

  .employee-name {
    color: #262626;
    line-height: 14px;
  }

  .employee-meta {
    overflow: hidden;
    color: #8c8c8c;
    font-size: 12px;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
