<template>
  <div class="scope-tab">
    <a-input
      v-model.trim="searchKeyword"
      allowClear
      placeholder="搜索部门"
      class="scope-tab-search"
      @input="handleSearchChange"
    >
      <a-icon slot="suffix" type="search" />
    </a-input>

    <a-spin :spinning="loading">
      <div class="scope-option-panel">
        <a-tree
          v-if="filteredOrgTreeData.length"
          checkable
          :checkStrictly="true"
          :treeData="filteredOrgTreeData"
          :checkedKeys="selectedIds"
          :expandedKeys="expandedKeys"
          :autoExpandParent="autoExpandParent"
          @check="handleCheck"
          @expand="handleExpand"
        />
        <a-empty v-else description="暂无组织" />
      </div>
    </a-spin>
  </div>
</template>

<script>
  import { getAction } from '@/api/manage'
  import {
    collectTreeKeys,
    filterOrgTreeData,
    flattenOrgTree,
    normalizeIds,
    normalizeOrgTree
  } from './HrKqRuleScopeUtils'

  export default {
    name: 'HrKqRuleScopeOrgTab',
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
        orgTreeData: [],
        expandedKeys: [],
        autoExpandParent: true,
        loading: false,
        url: {
          orgTree: '/org/hrmOrg/loadTreeRoot'
        }
      }
    },
    computed: {
      selectedIds() {
        return normalizeIds(this.value.map(item => item.value))
      },
      filteredOrgTreeData() {
        const keyword = this.searchKeyword.toLowerCase()
        return keyword ? filterOrgTreeData(this.orgTreeData, keyword) : this.orgTreeData
      }
    },
    watch: {
      visible: {
        immediate: true,
        handler(visible) {
          if (visible) {
            this.searchKeyword = ''
            this.loadOrgTree()
          }
        }
      }
    },
    methods: {
      loadOrgTree() {
        this.loading = true
        this.$emit('loading-change', true)
        return getAction(this.url.orgTree, { _t: new Date().getTime(), pid: 0 })
          .then(res => {
            const source = res && res.success && Array.isArray(res.result) ? res.result : []
            this.orgTreeData = normalizeOrgTree(source)
            this.expandedKeys = collectTreeKeys(this.orgTreeData)
            this.autoExpandParent = true
          })
          .catch(() => {
            this.orgTreeData = []
            this.expandedKeys = []
          })
          .finally(() => {
            this.loading = false
            this.$emit('loading-change', false)
          })
      },
      handleSearchChange() {
        if (!this.searchKeyword) {
          return
        }
        this.$nextTick(() => {
          this.expandedKeys = collectTreeKeys(this.filteredOrgTreeData)
          this.autoExpandParent = true
        })
      },
      handleCheck(checkedKeys) {
        const selectedIds = normalizeIds(checkedKeys.checked || checkedKeys)
        const selectedMap = this.value.reduce((result, item) => {
          result[String(item.value)] = item
          return result
        }, {})
        const orgMap = flattenOrgTree(this.orgTreeData).reduce((result, item) => {
          result[String(item.value)] = item
          return result
        }, {})
        const selection = selectedIds.map(id => {
          if (selectedMap[id]) {
            return Object.assign({}, selectedMap[id], { value: id })
          }
          return {
            value: id,
            label: orgMap[id] ? orgMap[id].title : '组织 ' + id,
            description: '组织'
          }
        })
        this.$emit('input', selection)
      },
      handleExpand(expandedKeys) {
        this.expandedKeys = expandedKeys
        this.autoExpandParent = false
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

  .scope-option-panel /deep/ .ant-tree li .ant-tree-node-content-wrapper {
    width: calc(100% - 48px);
  }
</style>
