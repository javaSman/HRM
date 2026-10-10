<template>
  <div class="position-picker">
    <section class="position-picker-pane dept-pane">
      <header class="position-picker-header">
        <span><a-icon type="bank" /> 选择部门</span>
      </header>
      <div class="position-picker-search">
        <a-input v-model.trim="deptKeyword" allowClear placeholder="搜索部门...">
          <a-icon slot="prefix" type="search" />
        </a-input>
      </div>
      <div class="position-picker-body dept-tree-body">
        <a-tree
          v-if="filteredOrgTreeData.length"
          :defaultExpandedKeys="selectedDeptKeys"
          :treeData="filteredOrgTreeData"
          :defaultSelectedKeys="selectedDeptKeys"
          :selectedKeys="selectedDeptKeys"
          @select="handleDeptSelect"
        >
          <template slot="orgTitle" slot-scope="node">
            <span class="dept-tree-title">
              <a-icon type="folder-open" />
              <span>{{ node.title }}</span>
              <small v-if="node.children && node.children.length">{{ node.children.length }}</small>
            </span>
          </template>
        </a-tree>
        <a-empty v-else description="暂无组织" />
      </div>
    </section>

    <section class="position-picker-pane position-pane">
      <header class="position-picker-header">
        <span><a-icon type="user" /> {{ selectedDeptName || '请选择部门' }}</span>
      </header>
      <div class="position-picker-search">
        <a-input
          v-model.trim="positionKeyword"
          allowClear
          placeholder="搜索岗位..."
          @pressEnter="searchPositions"
        />
        <a-button type="primary" @click="searchPositions">搜索</a-button>
      </div>
      <div class="position-picker-body position-list-body">
        <a-spin :spinning="positionLoading">
          <div v-if="positions.length" class="position-list">
            <button
              v-for="position in positions"
              :key="position.id"
              type="button"
              class="position-item"
              :class="{ active: isPositionSelected(position.id) }"
              @click="togglePosition(position)"
            >
              <span class="position-item-main">
                <strong>{{ position.postName || '-' }}</strong>
                <small>{{ position.mainDeptPath }}</small>
              </span>
              <a-icon :type="isPositionSelected(position.id) ? 'check-circle' : 'plus-circle'" />
            </button>
          </div>
          <a-empty v-else :description="selectedDeptKeys.length ? '暂无岗位' : '请选择部门'" />
        </a-spin>
      </div>
      <footer class="position-pagination">
        <a-pagination
          size="small"
          showSizeChanger
          :current="pagination.current"
          :pageSize="pagination.pageSize"
          :pageSizeOptions="pagination.pageSizeOptions"
          :total="pagination.total"
          :showTotal="total => '共 ' + total + ' 条'"
          @change="handlePageChange"
          @showSizeChange="handlePageSizeChange"
        />
      </footer>
    </section>
  </div>
</template>

<script>
  import { getAction } from '@/api/manage'
  import { filterOrgTreeData, normalizeIds, normalizeOrgTree } from './HrKqRuleScopeUtils'

  export default {
    name: 'HrKqRuleScopePositionTab',
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
        orgTreeData: [],
        deptKeyword: '',
        positionKeyword: '',
        selectedDeptKeys: [],
        selectedDeptName: '',
        positions: [],
        positionLoading: false,
        pagination: {
          current: 1,
          pageSize: 30,
          pageSizeOptions: ['30', '50', '100'],
          total: 0
        },
        url: {
          orgTree: '/org/hrmOrg/loadTreeRoot',
          positionList: '/hrJobSequence/hrJobSequence/childrenList'
        }
      }
    },
    computed: {
      selectedIds() {
        return normalizeIds(this.value.map(item => item.value))
      },
      filteredOrgTreeData() {
        const keyword = this.deptKeyword.toLowerCase()
        return keyword ? filterOrgTreeData(this.orgTreeData, keyword) : this.orgTreeData
      }
    },
    watch: {
      visible: {
        immediate: true,
        handler(visible) {
          if (visible) {
            this.reset()
            this.loadOrgTree()
          }
        }
      }
    },
    methods: {
      reset() {
        this.deptKeyword = ''
        this.positionKeyword = ''
        this.selectedDeptKeys = []
        this.selectedDeptName = ''
        this.positions = []
        this.pagination.current = 1
        this.pagination.total = 0
      },
      loadOrgTree() {
        return getAction(this.url.orgTree, { _t: new Date().getTime(), pid: 0 })
          .then(res => {
            const source = res && res.success && Array.isArray(res.result) ? res.result : []
            this.orgTreeData = normalizeOrgTree(source)
          })
          .catch(() => {
            this.orgTreeData = []
          })
      },
      handleDeptSelect(selectedKeys, event) {
        if (!selectedKeys.length) {
          return
        }
        const node = event.node.dataRef
        const deptId = String(node.id || node.key)
        this.selectedDeptKeys = [deptId]
        this.selectedDeptName = node.title
        this.positionKeyword = ''
        this.pagination.current = 1
        this.loadPositions(deptId)
      },
      searchPositions() {
        this.pagination.current = 1
        if (this.selectedDeptKeys.length) {
          this.loadPositions(this.selectedDeptKeys[0])
        }
      },
      handlePageChange(page, pageSize) {
        this.pagination.current = page
        this.pagination.pageSize = pageSize
        if (this.selectedDeptKeys.length) {
          this.loadPositions(this.selectedDeptKeys[0])
        }
      },
      handlePageSizeChange(current, pageSize) {
        this.pagination.current = 1
        this.pagination.pageSize = pageSize
        if (this.selectedDeptKeys.length) {
          this.loadPositions(this.selectedDeptKeys[0])
        }
      },
      loadPositions(deptId) {
        this.positionLoading = true
        this.positions = []
        return getAction(this.url.positionList, {
          deptId,
          postName: `*${this.positionKeyword}*`,
          pageNo: this.pagination.current,
          pageSize: this.pagination.pageSize,
          column: 'createTime',
          order: 'desc'
        }).then(res => {
          if (res.success) {
            const result = res.result || {}
            this.positions = Array.isArray(result) ? result : (result.records || [])
            this.pagination.total = Array.isArray(result) ? result.length : Number(result.total || 0)
          } else {
            this.pagination.total = 0
            this.$message.warning(res.message || '岗位加载失败')
          }
        }).finally(() => {
          this.positionLoading = false
        })
      },
      isPositionSelected(positionId) {
        return this.selectedIds.indexOf(String(positionId)) > -1
      },
      togglePosition(position) {
        const id = String(position.id)
        const selection = this.value.slice()
        const index = selection.findIndex(item => String(item.value) === id)
        if (index === -1) {
          selection.push({
            value: id,
            label: position.postName || position.name || id,
            description: position.gwsl_dictText || position.gwsl || '岗位'
          })
        } else {
          selection.splice(index, 1)
        }
        this.$emit('input', selection)
      }
    }
  }
</script>

<style scoped lang="less">
  .position-picker {
    display: grid;
    height: 454px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    grid-template-columns: 42% 58%;
  }

  .position-picker-pane {
    display: flex;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    flex-direction: column;
  }

  .position-pane {
    border-left: 1px solid #e2e8f0;
  }

  .position-picker-header {
    display: flex;
    align-items: center;
    height: 50px;
    padding: 0 16px;
    border-bottom: 1px solid #e2e8f0;
    color: #1f2937;
    font-weight: 600;
    line-height: 1;
    flex: 0 0 50px;
    justify-content: space-between;
  }

  .position-picker-header .anticon {
    margin-right: 6px;
    color: #1677ff;
  }

  .position-picker-search {
    display: flex;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #edf2f7;
    flex: 0 0 auto;
    gap: 10px;
  }

  .position-picker-body {
    height: 0;
    min-height: 0;
    overflow-y: auto;
    flex: 1;
    scrollbar-gutter: stable;
  }

  .dept-tree-body {
    padding: 8px 10px 14px;
  }

  .dept-tree-body /deep/ .ant-tree-node-content-wrapper {
    width: calc(100% - 24px);
  }

  .dept-tree-title {
    display: inline-flex;
    align-items: center;
    width: 100%;
    gap: 6px;
  }

  .dept-tree-title .anticon {
    color: #52c41a;
  }

  .dept-tree-title span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .dept-tree-title small {
    color: #94a3b8;
    font-size: 11px;
  }

  .position-list-body {
    padding: 12px;
  }

  .position-list-body /deep/ .ant-spin-nested-loading,
  .position-list-body /deep/ .ant-spin-container {
    height: 100%;
    min-height: 100%;
  }

  .position-pagination {
    padding: 10px 12px;
    border-top: 1px solid #edf2f7;
    text-align: right;
    flex: 0 0 auto;
  }

  .position-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .position-item {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 54px;
    padding: 9px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    color: #64748b;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    gap: 12px;
    justify-content: space-between;
  }

  .position-item:hover,
  .position-item.active {
    border-color: #1677ff;
    background: #eaf3ff;
    color: #1677ff;
  }

  .position-item-main {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }

  .position-item-main strong,
  .position-item-main small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .position-item-main strong {
    color: #1f2937;
    font-size: 13px;
  }

  .position-item-main small {
    margin-top: 3px;
    color: #94a3b8;
    font-size: 12px;
  }

  .position-item.active .position-item-main strong {
    color: #1677ff;
  }

  @media (max-width: 768px) {
    .position-picker {
      height: 560px;
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
    }

    .position-picker-pane {
      min-height: 0;
    }

    .position-pane {
      border-top: 1px solid #e2e8f0;
      border-left: none;
    }
  }
</style>
