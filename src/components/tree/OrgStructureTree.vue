<template>
  <div class="org-structure-tree">
    <div class="org-tree-header">
      <h3>组织架构</h3>
    </div>

    <div class="org-search">
      <a-input
        v-model.trim="keyword"
        allowClear
        placeholder="搜索组织..."
        @change="handleSearchChange"
        @pressEnter="handleSearchChange"
      >
        <a-icon slot="prefix" type="search" />
      </a-input>
    </div>

    <div class="org-tree-body">
      <a-spin :spinning="loading">
        <a-empty v-if="!visibleTreeData.length && !loading" description="暂无组织数据" />
        <a-tree
          v-else
          class="org-tree-control"
          :show-line="false"
          :treeData="visibleTreeData"
          :selectedKeys="selectedKeys"
          :expandedKeys="expandedKeys"
          :autoExpandParent="false"
          @expand="handleExpand"
          @select="handleSelect"
        >
          <a-icon slot="switcherIcon" type="down" />
          <template slot="orgTitle" slot-scope="node">
            <a-dropdown v-if="enableContextMenu" :trigger="['contextmenu']">
              <span
                class="org-node-title"
                :class="{ 'org-node-title-selected': selectedKeys[0] === node.key }"
                :title="node.title"
                @contextmenu.prevent="handleNodeContext(node)"
              >
                <a-icon class="org-node-icon" :type="getNodeIcon(node)" />
                <span class="org-node-name">{{ node.title }}</span>
                <span v-if="node.children && node.children.length" class="org-node-type">
                  {{ node.children.length }}
                </span>
              </span>
              <a-menu slot="overlay" @click="({ key }) => handleContextMenuClick(key, node)">
                <template v-if="showDefaultContextMenu">
                  <a-menu-item key="add">
                    <a-icon type="plus" />
                    新增
                  </a-menu-item>
                  <a-menu-item key="edit">
                    <a-icon type="edit" />
                    编辑
                  </a-menu-item>
                </template>
                <template v-if="normalizedExtraContextMenuItems.length">
                  <a-menu-item
                    v-for="item in normalizedExtraContextMenuItems"
                    :key="'extra:' + item.key"
                    :disabled="item.disabled"
                  >
                    <a-icon v-if="item.icon" :type="item.icon" />
                    <span :class="{ 'org-context-danger': item.danger }">{{ item.title }}</span>
                  </a-menu-item>
                </template>
                <template v-if="showDefaultContextMenu">
                  <a-menu-divider />
                  <a-menu-item key="delete">
                    <a-icon type="delete" />
                    删除
                  </a-menu-item>
                </template>
              </a-menu>
            </a-dropdown>
            <span
              v-else
              class="org-node-title"
              :class="{ 'org-node-title-selected': selectedKeys[0] === node.key }"
              :title="node.title"
            >
              <a-icon class="org-node-icon" :type="getNodeIcon(node)" />
              <span class="org-node-name">{{ node.title }}</span>
              <span v-if="node.children && node.children.length" class="org-node-type">
                {{ node.children.length }}
              </span>
            </span>
          </template>
        </a-tree>
      </a-spin>
    </div>

    <a-modal
      :title="formTitle"
      :visible="formVisible"
      :confirmLoading="saving"
      okText="保存"
      cancelText="取消"
      @ok="handleFormOk"
      @cancel="closeForm"
    >
      <a-form-model
        ref="orgForm"
        :model="orgForm"
        :rules="orgRules"
        :labelCol="labelCol"
        :wrapperCol="wrapperCol"
      >
        <a-form-model-item :label="formMode === 'add' ? '上级组织' : '当前组织'">
          <span class="parent-name">{{ contextNode ? contextNode.title : '根节点' }}</span>
        </a-form-model-item>
        <a-form-model-item label="类型" prop="type">
          <j-dict-select-tag
            type="list"
            v-model="orgForm.type"
            dictCode="hrm_org_code"
            placeholder="请选择"
          />
        </a-form-model-item>
        <a-form-model-item label="名称" prop="name">
          <a-input v-model.trim="orgForm.name" placeholder="请输入名称" />
        </a-form-model-item>
        <a-form-model-item label="排序">
          <a-input v-model="orgForm.sort" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import { deleteAction, getAction, httpAction } from '@/api/manage'

const TYPE_ORDER = ['集团', '公司', '部门', '组别']

export default {
  name: 'OrgStructureTree',
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    enableContextMenu: {
      type: Boolean,
      default: true
    },
    extraContextMenuItems: {
      type: Array,
      default: () => []
    },
    extraContextMenuAppendDefault: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      keyword: '',
      searchTimer: null,
      loading: false,
      saving: false,
      treeData: [],
      selectedKeys: [],
      expandedKeys: [],
      contextNode: null,
      formVisible: false,
      formMode: 'add',
      orgForm: {
        type: '部门',
        name: '',
        sort: 0
      },
      orgRules: {
        type: [{ required: true, message: '请选择类型' }],
        name: [{ required: true, message: '请输入名称' }]
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      url: {
        tree: '/org/hrmOrg/loadTreeRoot',
        add: '/org/hrmOrg/add',
        edit: '/org/hrmOrg/edit',
        delete: '/org/hrmOrg/delete'
      }
    }
  },
  computed: {
    formTitle() {
      return this.formMode === 'edit' ? '编辑组织' : '新增组织'
    },
    visibleTreeData() {
      if (!this.keyword) {
        return this.treeData
      }
      return this.filterTree(this.treeData, this.keyword)
    },
    normalizedExtraContextMenuItems() {
      return (this.extraContextMenuItems || [])
        .filter(item => item && item.key)
        .map(item => {
          return {
            key: String(item.key),
            title: item.title || item.label || item.text || String(item.key),
            icon: item.icon || '',
            disabled: !!item.disabled,
            danger: !!item.danger,
            raw: item
          }
        })
    },
    showDefaultContextMenu() {
      return !this.normalizedExtraContextMenuItems.length || this.extraContextMenuAppendDefault
    }
  },
  watch: {
    value(val) {
      this.syncSelectedByValue(val)
    }
  },
  created() {
    this.loadTree(true)
  },
  beforeDestroy() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
    }
  },
  methods: {
    loadTree(defaultExpand) {
      this.loading = true
      getAction(this.url.tree, { pid: 0 }).then(res => {
        if (res.success) {
          this.treeData = this.normalizeTreeData(res.result || [])
          this.$emit('treeData', this.treeData)
          if (defaultExpand) {
            this.expandedKeys = this.collectInitialExpandedKeys(this.treeData)
          }
          this.ensureSelection()
        } else {
          this.treeData = []
          this.$message.warning(res.message || '组织架构加载失败')
        }
      }).finally(() => {
        this.loading = false
      })
    },
    normalizeTreeData(list, parentPath) {
      const path = parentPath || []
      return (list || [])
        .filter(item => item && (item.id || item.name))
        .map(item => {
          const title = item.name || item.title || ''
          const key = String(item.id)
          const children = this.normalizeTreeData(item.children || [], path.concat(title))
          return Object.assign({}, item, {
            title,
            key,
            value: key,
            path: path.concat(title),
            children,
            scopedSlots: { title: 'orgTitle' }
          })
        })
    },
    filterTree(list, keyword) {
      const lowerKeyword = String(keyword).toLowerCase()
      return (list || []).reduce((result, item) => {
        const children = this.filterTree(item.children || [], keyword)
        const matched = String(item.name || item.title || '').toLowerCase().indexOf(lowerKeyword) > -1
        if (matched || children.length) {
          result.push(Object.assign({}, item, { children }))
        }
        return result
      }, [])
    },
    handleSearchChange() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        if (this.keyword) {
          this.expandedKeys = this.collectAllKeys(this.visibleTreeData)
        }
      }, 180)
    },
    handleExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
    },
    handleSelect(selectedKeys, event) {
      const node = selectedKeys.length && event.node ? event.node.dataRef : null
      if (node) {
        this.selectNode(node)
      }
    },
    handleNodeContext(node) {
      this.contextNode = node
      this.selectedKeys = [node.key]
      this.emitNode(node)
      this.$emit('context-menu-open', node)
    },
    handleContextMenuClick(key, node) {
      if (String(key).indexOf('extra:') === 0) {
        const customKey = String(key).replace('extra:', '')
        const item = this.normalizedExtraContextMenuItems.find(menuItem => menuItem.key === customKey)
        const payload = {
          key: customKey,
          node,
          item: item ? item.raw : null
        }
        this.$emit('context-menu-click', Object.assign({ source: 'extra' }, payload))
        this.$emit('custom-context-menu-click', payload)
        return
      }
      this.$emit('context-menu-click', {
        key,
        node,
        source: 'default'
      })
      if (key === 'add') {
        this.openAddForm(node)
      } else if (key === 'edit') {
        this.openEditForm(node)
      } else if (key === 'delete') {
        this.deleteNode(node)
      }
    },
    openAddForm(node) {
      this.contextNode = node
      this.formMode = 'add'
      this.orgForm = {
        type: this.getDefaultChildType(node),
        name: '',
        sort: 0
      }
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.orgForm && this.$refs.orgForm.clearValidate()
      })
    },
    openEditForm(node) {
      this.contextNode = node
      this.formMode = 'edit'
      this.orgForm = {
        type: node.type || '部门',
        name: node.name || node.title || '',
        sort: node.sort || 0
      }
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.orgForm && this.$refs.orgForm.clearValidate()
      })
    },
    handleFormOk() {
      if (this.saving) {
        return
      }
      this.$refs.orgForm.validate(valid => {
        if (!valid) {
          return
        }
        if (this.formMode === 'edit') {
          this.submitEdit()
        } else {
          this.submitAdd()
        }
      })
    },
    submitAdd() {
      const parent = this.contextNode || {}
      const params = {
        type: this.orgForm.type,
        name: this.orgForm.name,
        pid: parent.id || '0',
        sort: this.orgForm.sort
      }
      this.saving = true
      httpAction(this.url.add, params, 'post').then(res => {
        if (res.success) {
          this.$message.success(res.message || '新增成功')
          this.formVisible = false
          this.loadTree()
        } else {
          this.$message.warning(res.message || '新增失败')
        }
      }).finally(() => {
        this.saving = false
      })
    },
    submitEdit(extraParams) {
      const node = this.contextNode || {}
      const extraFields = extraParams && typeof extraParams === 'object'
        ? extraParams
        : (extraParams !== undefined && extraParams !== null ? { departPrincipal: extraParams } : {})
      const useNodeValue = Object.keys(extraFields).length > 0
      const params = Object.assign({}, node, {
        name: useNodeValue ? (node.name || node.title || '') : this.orgForm.name,
        type: useNodeValue ? (node.type || '部门') : this.orgForm.type,
        sort: useNodeValue ? (node.sort || 0) : this.orgForm.sort
      }, extraFields)
      this.saving = true
      return httpAction(this.url.edit, params, 'put').then(res => {
        if (res.success) {
          this.$message.success(res.message || '保存成功')
          this.formVisible = false
          this.loadTree()
        } else {
          this.$message.warning(res.message || '保存失败')
        }
      }).finally(() => {
        this.saving = false
      })
    },
    deleteNode(node) {
      this.$confirm({
        title: '确认删除',
        content: `确定删除“${node.title}”及其子节点吗？`,
        okType: 'danger',
        onOk: () => {
          return deleteAction(this.url.delete, { id: node.id }).then(res => {
            if (res.success) {
              this.$message.success(res.message || '删除成功')
              if (this.selectedKeys[0] === node.key) {
                this.selectedKeys = []
                this.$emit('input', '')
                this.$emit('change', null)
              }
              this.loadTree()
            } else {
              this.$message.warning(res.message || '删除失败')
            }
          })
        }
      })
    },
    closeForm() {
      this.formVisible = false
    },
    selectNode(node) {
      this.selectedKeys = [node.key]
      this.emitNode(node)
    },
    emitNode(node) {
      this.$emit('input', node.id || node.key)
      this.$emit('change', node)
    },
    ensureSelection() {
      if (this.value && this.syncSelectedByValue(this.value)) {
        const node = this.findNodeByKey(this.treeData, this.value)
        node && this.emitNode(node)
        return
      }
      const selectedNode = this.findNodeByKey(this.treeData, this.selectedKeys[0])
      if (selectedNode) {
        this.emitNode(selectedNode)
        return
      }
      if (this.treeData.length) {
        this.selectNode(this.treeData[0])
      }
    },
    syncSelectedByValue(value) {
      if (!value || !this.treeData.length) {
        return false
      }
      const node = this.findNodeByKey(this.treeData, value)
      if (node) {
        this.selectedKeys = [node.key]
        return true
      }
      return false
    },
    findNodeByKey(list, key) {
      return this.findNode(list, item => String(item.key) === String(key) || String(item.id) === String(key))
    },
    findNode(list, matcher) {
      for (let i = 0; i < (list || []).length; i++) {
        const item = list[i]
        if (matcher(item)) {
          return item
        }
        const child = this.findNode(item.children || [], matcher)
        if (child) {
          return child
        }
      }
      return null
    },
    collectInitialExpandedKeys(list) {
      return (list || [])
        .filter(item => item.children && item.children.length)
        .map(item => item.key)
    },
    collectAllKeys(list) {
      const result = []
      ;(list || []).forEach(item => {
        result.push(item.key)
        if (item.children && item.children.length) {
          result.push(...this.collectAllKeys(item.children))
        }
      })
      return result
    },
    getDefaultChildType(node) {
      if (!node || !node.type) {
        return '集团'
      }
      const index = TYPE_ORDER.indexOf(node.type)
      if (index < 0 || index >= TYPE_ORDER.length - 1) {
        return '组别'
      }
      return TYPE_ORDER[index + 1]
    },
    getNodeIcon(node) {
      if (node.type === '集团') {
        return 'cluster'
      }
      if (node.type === '公司') {
        return 'bank'
      }
      if (node.type === '组别') {
        return 'team'
      }
      return 'apartment'
    }
  }
}
</script>

<style scoped lang="less">
.org-structure-tree {
  width: 280px;
  min-width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--employee-card, #ffffff);
  border-right: 1px solid rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08);
  overflow: hidden;
  animation: employee-slide-in-left 0.3s ease-out both;
}

.org-tree-header {
  padding: 20px 20px 4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h3 {
    margin: 0;
    font-size: 18px;
    margin-bottom: 3px;
    line-height: 18px;
    font-weight: 600;
    color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.6);
    text-transform: uppercase;
    letter-spacing: 2px;
  }
}

.org-search {
  padding: 0 16px 12px;
  flex-shrink: 0;

  /deep/ .ant-input {
    height: 32px;
    border: 0;
    border-radius: 8px;
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.03);
    color: var(--employee-foreground, #1a2a3d);
    box-shadow: none;
    font-size: 13px;
    transition: all 0.3s ease;
  }

  /deep/ .ant-input:focus {
    background: #ffffff;
    box-shadow: 0 0 0 2px rgba(var(--employee-primary-rgb, 37, 99, 235), 0.15), 0 0 0 4px rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08);
  }

  /deep/ .ant-input-prefix {
    color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.3);
  }
}

.org-tree-body {
  flex: 1;
  min-height: 0;
  padding: 0 8px 16px;
  overflow: auto;
  background-image: radial-gradient(circle, rgba(var(--employee-primary-rgb, 37, 99, 235), 0.04) 1px, transparent 1px);
  background-size: 20px 20px;

  /deep/ .ant-spin-nested-loading,
  /deep/ .ant-spin-container {
    min-height: 100%;
  }
}

.org-tree-control {
  color: var(--employee-foreground, #1a2a3d);

  /deep/ li {
    padding: 2px 0;
  }

  /deep/ .ant-tree-switcher {
    width: 18px;
    height: 34px;
    line-height: 34px;
    color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.5);
    transition: all 0.2s ease;
  }

  /deep/ .ant-tree-node-content-wrapper {
    width: calc(100% - 24px);
    height: auto;
    min-height: 34px;
    line-height: 1.2;
    padding: 0;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  /deep/ .ant-tree-node-content-wrapper:hover {
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.04);
  }

  /deep/ .ant-tree-node-content-wrapper.ant-tree-node-selected {
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08);
    box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.2);
  }

  /deep/ li span.ant-tree-switcher.ant-tree-switcher-noop {
    width: 6px;
    height: 6px;
    margin-top: 14px;
    margin-right: 12px;
    border-radius: 50%;
    background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.2);
  }
}

.org-node-title {
  width: 100%;
  min-height: 34px;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--employee-foreground, #1a2a3d);
  font-size: 13px;
  transition: color 0.2s ease;
}

.org-node-title-selected {
  color: var(--employee-primary, #2563eb);
  font-weight: 500;

  .org-node-icon {
    color: #ffffff;
    border-color: var(--employee-primary, #2563eb);
    background: linear-gradient(135deg, var(--employee-primary, #2563eb), rgba(var(--employee-primary-rgb, 37, 99, 235), 0.75));
    box-shadow: 0 0 8px rgba(var(--employee-primary-rgb, 37, 99, 235), 0.15);
  }
}

.org-node-icon {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(var(--employee-primary-rgb, 37, 99, 235), 0.12);
  border-radius: 4px;
  background: linear-gradient(135deg, rgba(var(--employee-primary-rgb, 37, 99, 235), 0.08), rgba(var(--employee-primary-rgb, 37, 99, 235), 0.04));
  color: var(--employee-primary, #2563eb);
  font-size: 10px;
  transition: all 0.25s ease;
}

.org-node-title:hover .org-node-icon {
  transform: scale(1.08);
  border-color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.22);
}

.org-node-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-node-type {
  flex: 0 0 auto;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.06);
  color: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.5);
  font-size: 11px;
  line-height: 16px;
  font-variant-numeric: tabular-nums;
}

.org-node-title-selected .org-node-type {
  background: rgba(var(--employee-primary-rgb, 37, 99, 235), 0.12);
  color: var(--employee-primary, #2563eb);
}

.parent-name {
  color: var(--employee-foreground, #1a2a3d);
}

.org-context-danger {
  color: #ef4444;
}

@keyframes employee-slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
