<template>
  <div class="position-role-picker">
    <section class="picker-pane dept-pane">
      <header class="picker-header">
        <span><a-icon type="bank" /> 选择部门</span>
      </header>
      <div class="picker-search">
        <a-input v-model.trim="deptKeyword" allowClear placeholder="搜索部门...">
          <a-icon slot="prefix" type="search" />
        </a-input>
      </div>
      <div class="picker-body dept-tree-body">
        <a-tree
          v-if="visibleDeptTreeData.length"
          :treeData="visibleDeptTreeData"
          :selectedKeys="selectedDeptKeys"
          @select="handleDeptSelect"
        >
          <template slot="orgTitle" slot-scope="node">
            <span class="dept-tree-title">
              <a-icon type="folder-open" />
              <span>{{ node.title }}</span>
            </span>
          </template>
        </a-tree>
        <a-empty v-else description="暂无组织" />
      </div>
    </section>

    <section class="picker-pane role-pane">
      <header class="picker-header">
        <span><a-icon type="user" /> 选择岗位角色</span>
      </header>
      <div class="picker-search">
        <a-input v-model.trim="roleKeyword" allowClear placeholder="搜索岗位角色...">
          <a-icon slot="prefix" type="search" />
        </a-input>
      </div>
      <div class="picker-body role-tree-body">
        <a-spin :spinning="roleLoading">
          <position-role-card-tree
            v-if="visibleRoleTreeData.length"
            :tree-data="visibleRoleTreeData"
            :expanded-keys="roleExpandedKeys"
            :selected-keys="selectedRoleKeys"
            :force-expand="!!roleKeyword"
            @expand="handleRoleExpand"
            @select="handleRoleSelect"
          />
          <a-empty v-else :description="selectedDeptKeys.length ? '暂无岗位角色' : '请选择部门'" />
        </a-spin>
      </div>
    </section>
  </div>
</template>

<script>
import { getAction } from '@/api/manage'
import PositionRoleCardTree from './PositionRoleCardTree.vue'

export default {
  name: 'PositionRolePicker',
  components: {
    PositionRoleCardTree
  },
  props: {
    treeData: { type: Array, default: () => [] },
    visible: { type: Boolean, default: false },
    activeDeptId: { type: [String, Number], default: '' },
    value: { type: [String, Number], default: '' },
    initialSequenceId: { type: [String, Number], default: '' }
  },
  data() {
    return {
      deptKeyword: '',
      roleKeyword: '',
      selectedDeptKeys: [],
      selectedDeptName: '',
      roles: [],
      roleLoading: false,
      roleExpandedKeys: []
    }
  },
  computed: {
    visibleDeptTreeData() {
      return this.deptKeyword ? this.filterTreeData(this.treeData, this.deptKeyword, 'title') : this.treeData
    },
    roleTreeData() {
      return this.normalizeRoleTree(this.roles)
    },
    visibleRoleTreeData() {
      return this.roleKeyword ? this.filterTreeData(this.roleTreeData, this.roleKeyword, 'roleName') : this.roleTreeData
    },
    selectedRoleKeys() {
      const roleId = this.value || this.findRoleIdBySequence(this.roleTreeData, this.initialSequenceId)
      return roleId ? [String(roleId)] : []
    }
  },
  watch: {
    visible(value) {
      if (value) this.reset()
    },
    activeDeptId(value) {
      if (this.visible && value) this.selectDeptById(value)
    }
  },
  methods: {
    reset() {
      this.deptKeyword = ''
      this.roleKeyword = ''
      this.roleExpandedKeys = []
      this.selectDeptById(this.activeDeptId)
    },
    selectDeptById(deptId) {
      const node = this.findDeptNode(this.treeData, deptId)
      if (node) this.selectDept(node)
    },
    findDeptNode(list, deptId) {
      for (const item of list || []) {
        if (String(item.id || item.key) === String(deptId)) return item
        const result = this.findDeptNode(item.children, deptId)
        if (result) return result
      }
      return null
    },
    filterTreeData(list, keyword, field) {
      const text = keyword.toLowerCase()
      return (list || []).reduce((result, item) => {
        const children = this.filterTreeData(item.children, keyword, field)
        if (String(item[field] || item.title || '').toLowerCase().includes(text) || children.length) {
          result.push(Object.assign({}, item, { children }))
        }
        return result
      }, [])
    },
    normalizeRoleTree(list) {
      return (Array.isArray(list) ? list : []).map(item => {
        const children = this.normalizeRoleTree(item.children || item.atuList)
        const hasChildren = children.length > 0
        return Object.assign({}, item, {
          key: String(item.id),
          title: item.roleName || item.roleCode || '-',
          children,
          selectable: true,
          isLeaf: !hasChildren
        })
      })
    },
    findRoleIdBySequence(list, sequenceId) {
      for (const item of list || []) {
        if (String(item.sequenceId || '') === String(sequenceId || '') && !item.children.length) return item.id
        const result = this.findRoleIdBySequence(item.children, sequenceId)
        if (result) return result
      }
      return ''
    },
    handleDeptSelect(selectedKeys, event) {
      if (selectedKeys.length) this.selectDept(event.node.dataRef)
    },
    selectDept(node) {
      const deptId = String(node.id || node.key)
      this.selectedDeptKeys = [deptId]
      this.selectedDeptName = node.title || ''
      this.roleKeyword = ''
      this.roles = []
      this.$emit('dept-change', node)
      this.loadRoles(deptId)
    },
    loadRoles(deptId) {
      this.roleLoading = true
      return getAction('/hrJobSequence/hrJobSequence/SysRoleListAll', {
        deptId,
        pageNo: 1,
        pageSize: 999999
      }).then(res => {
        if (res.success) {
          const result = res.result || {}
          this.roles = Array.isArray(result) ? result : (result.records || [])
          this.roleExpandedKeys = this.getDefaultRoleExpandedKeys()
        } else {
          this.roles = []
          this.$message.warning(res.message || '岗位角色加载失败')
        }
      }).catch(() => {
        this.roles = []
        this.$message.warning('岗位角色加载失败')
      }).finally(() => {
        this.roleLoading = false
      })
    },
    getDefaultRoleExpandedKeys() {
      const selectedKey = this.selectedRoleKeys[0]
      if (selectedKey) {
        const parentKeys = this.findRoleParentKeys(this.roleTreeData, selectedKey, [])
        if (parentKeys) return parentKeys
      }
      return this.findFirstExpandableRoleKey(this.roleTreeData)
    },
    findRoleParentKeys(list, targetKey, parentKeys) {
      for (const item of list || []) {
        const key = String(item.key || item.id)
        if (key === targetKey) return parentKeys
        const result = this.findRoleParentKeys(item.children, targetKey, parentKeys.concat(key))
        if (result) return result
      }
      return null
    },
    findFirstExpandableRoleKey(list) {
      for (const item of list || []) {
        if ((item.children || []).length) return [String(item.key || item.id)]
      }
      return []
    },
    handleRoleExpand(keys) {
      this.roleExpandedKeys = keys
    },
    handleRoleSelect(role) {
      this.$emit('input', String(role.id))
      this.$emit('change', role)
    }
  }
}
</script>

<style scoped lang="less">
.position-role-picker {
  height: 350px;
  display: grid;
  grid-template-columns: 42% 58%;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
}

.picker-pane {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.role-pane {
  border-left: 1px solid #e2e8f0;
}

.picker-header {
  height: 50px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  color: #1f2937;
  font-weight: 600;
}

.picker-header .anticon {
  margin-right: 6px;
  color: #1677ff;
}

.picker-search {
  flex: 0 0 auto;
  padding: 12px;
  border-bottom: 1px solid #edf2f7;
}

.picker-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.dept-tree-body,
.role-tree-body {
  padding: 8px 10px 14px;
}

.dept-tree-body /deep/ .ant-tree-node-content-wrapper {
  width: calc(100% - 24px);
}

.dept-tree-title {
  width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dept-tree-title .anticon {
  color: #52c41a;
}

.dept-tree-title span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-tree-body /deep/ .ant-spin-nested-loading,
.role-tree-body /deep/ .ant-spin-container {
  min-height: 100%;
}

@media (max-width: 760px) {
  .position-role-picker {
    height: 560px;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .role-pane {
    border-top: 1px solid #e2e8f0;
    border-left: none;
  }
}

</style>
