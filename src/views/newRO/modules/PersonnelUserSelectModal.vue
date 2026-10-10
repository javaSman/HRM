<template>
  <j-modal
    :visible="visible"
    :width="1280"
    :title="title"
    switchFullscreen
    wrapClassName="person-user-select-wrap"
    style="top: 24px"
    :dialogStyle="{ top: '15px' }"
    @ok="handleOk"
    @cancel="close"
  >
    <template slot="footer">
      <a-button @click="close">{{ isRecycleTab ? '关闭' : '取消' }}</a-button>
      <a-button
        v-if="isRecycleTab"
        type="primary"
        icon="redo"
        :disabled="!selectedRowKeys.length"
        @click="handleRestoreBatch"
      >
        复原
      </a-button>
       <a-button
        v-if="isRecycleTab"
        type="primary"
        :disabled="!selectedRowKeys.length"
        @click="handleComfirm"
      >
        确认
      </a-button>
      <a-button v-if="!isRecycleTab" type="primary" @click="handleOk">确定</a-button>
    </template>

    <div v-if="visible" class="person-user-select-modal">
      <div class="person-user-select-content">
        <a-tabs class="person-user-select-tabs" :activeKey="activeTab" :animated="false" @change="handleTabChange">
          <a-tab-pane key="uncreated" tab="未建账号" />
          <a-tab-pane key="recycle" tab="已建账号" />
        </a-tabs>

        <div class="person-user-select-toolbar">
          <div class="person-user-select-search">
            <a-input
              v-model.trim="queryParam.queryFileds"
              allowClear
              @input="handleKeywordInput"
              placeholder="请输入姓名、工号"
              @pressEnter="searchQuery"
            />
          </div>
          <a-cascader
            :value="deptValue"
            :options="mainDeptOptions"
            class="employee-main-dept-cascader"
            :disabled="mainDeptLoading"
            :show-search="{ filter: filterMainDept }"
            :getPopupContainer="getPopupContainer"
            :placeholder="mainDeptLoading ? '加载中...' : '请选择部门'"
            expand-trigger="hover"
            :change-on-select="true"
            @change="handleDeptChange"
          />
          <a-select
            v-model="queryParam.postId"
            class="person-user-select-post"
            allowClear
            showSearch
            optionFilterProp="children"
            :loading="postLoading"
            :disabled="postLoading || !queryParam.dept"
            placeholder="请选择岗位"
            :getPopupContainer="getPopupContainer"
            @change="handlePostChange"
          >
            <a-select-option v-for="item in postOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
          <a-button icon="search" @click="searchQuery">查询</a-button>
          <a-button icon="reload" @click="searchReset">重置</a-button>
        </div>

        <personnel-user-uncreated-tab
          v-show="!isRecycleTab"
          ref="uncreatedTab"
          :org-id="selectedOrgId"
          :query="queryParam"
          :selected-dept-text="selectedDeptText"
          @selection-change="handleSelectionChange"
        />
        <personnel-user-recycle-tab
         :selectedTreeKeys="selectedTreeKeys"
          v-show="isRecycleTab"
          ref="recycleTab"
          :org-id="selectedOrgId"
          :query="queryParam"
          @selection-change="handleSelectionChange"
          @recycle-ok="handleRecycleOk"
        />
      </div>
    </div>
  </j-modal>
</template>

<script>
import { getAction } from '@/api/manage'
import PersonnelUserUncreatedTab from './PersonnelUserUncreatedTab.vue'
import PersonnelUserRecycleTab from './PersonnelUserRecycleTab.vue'
import debounce from 'lodash/debounce'
import { postAction } from '../../../api/manage'

const USER_TAB = 'uncreated' // 未建
const RECYCLE_TAB = 'recycle' // 已建

// 根据当前 tab 生成默认查询参数。
function createDefaultQueryParam(activeTab) {
  const baseParam = {
    queryFileds: '',
    dept: '',
    postId: ''
  }
  if (activeTab === RECYCLE_TAB) {
    return Object.assign(baseParam, {
      deleteFlag: '是',
      type: 'maintain'
    })
  }
  return Object.assign(baseParam, {
    ops: '否',
    deleteFlag: '否'
  })
}

export default {
  name: 'PersonnelUserSelectModal',
  components: {
    PersonnelUserRecycleTab,
    PersonnelUserUncreatedTab
  },
  created() {
    this.autoSearchQuery = debounce(this.executeSearchQuery, 300)
  },
  beforeDestroy() {
    this.cancelAutoSearchQuery()
  },
  props: {
    treeData: {
      type: Array,
      default: () => []
    }
  },
  // 维护弹窗、查询栏、tab 和父子组件通信状态。
  data() {
    return {
      // 弹窗标题。
      title: '选择用户',
      // 弹窗显示状态。
      visible: false,
      // 当前激活 tab。
      activeTab: USER_TAB,
      // 父页面当前组织 ID。
      selectedOrgId: '',
      // 当前 tab 的查询条件。
      queryParam: createDefaultQueryParam(USER_TAB),
      // 父组件组织树转换出的部门级联选项。
      mainDeptOptions: [],
      // 部门级联 loading 状态。
      mainDeptLoading: false,
      // 岗位接口原始行数据。
      postRows: [],
      // 岗位下拉选项。
      postOptions: [],
      // 岗位下拉 loading 状态。
      postLoading: false,
      // 当前 tab 已选行 key，用于 footer 按钮状态。
      selectedRowKeys: [],
      // 当前 tab 已选行数据。
      selectionRows: [],
      selectedTreeKeys:[],
      // 当前弹窗使用的接口地址。
      url: {
        postList: '/hrJobSequence/hrJobSequence/childrenList'
        // postList: '/hrJobSequence/hrJobSequence/list'
      }
    }
  },
  computed: {
    // 判断当前是否处于回收站 tab。
    isRecycleTab() {
      return this.activeTab === RECYCLE_TAB
    },
    // 将部门 ID 转成 cascader 需要的路径值。
    deptValue() {
      return this.getPathValueByValue(this.queryParam.dept)
    },
    // 显示当前部门筛选文本。
    selectedDeptText() {
      return this.queryParam.dept ? this.getDeptTextByValue(this.queryParam.dept) : '全部'
    }
  },
  watch: {
    treeData: {
      immediate: true,
      // 父组件组织树变化后同步刷新部门级联选项。
      handler(val) {
        const root = Array.isArray(val) && val.length ? val[0] : null
        this.mainDeptOptions = this.normalizeMainDeptOptions((root && root.children) || [])
      }
    }
  },
  methods: {
    // 让弹层挂载到当前控件父节点下，避免 modal 内下拉定位错位。
    getPopupContainer(node) {
      return node.parentNode
    },
    // 根据 activeTab 生成默认查询条件。
    getDefaultQueryParam() {
      return createDefaultQueryParam(this.activeTab)
    },
    // 打开弹窗并加载默认 tab。
    open(orgId,selectedTreeKeys) {
      this.cancelAutoSearchQuery()
      this.selectedTreeKeys = selectedTreeKeys
      this.activeTab = USER_TAB
      this.selectedOrgId = orgId === undefined || orgId === null ? '' : String(orgId)
      this.queryParam = this.getDefaultQueryParam()
      this.resetPostOptions()
      this.resetSelection()
      this.visible = true
      this.loadPostOptions()
      this.$nextTick(() => {
        this.resetTabs()
        this.loadActiveTab(1)
      })
    },
    // 关闭弹窗并清空内部状态。
    close() {
      this.cancelAutoSearchQuery()
      this.resetTabs()
      this.visible = false
      this.activeTab = USER_TAB
      this.selectedOrgId = ''
      this.queryParam = this.getDefaultQueryParam()
      this.resetPostOptions()
      this.resetSelection()
    },
    // 切换 tab 时重置查询和当前 tab 数据。
    handleTabChange(activeTab) {
      if (this.activeTab === activeTab) {
        return
      }
      this.cancelAutoSearchQuery()
      this.activeTab = activeTab
      this.queryParam = this.getDefaultQueryParam()
      this.resetSelection()
      this.$nextTick(() => {
        this.getActiveTabRef() && this.getActiveTabRef().reset()
        this.loadActiveTab(1)
      })
    },
    // 未建账号 tab 确认选择；回收站 tab 只负责关闭。
    handleOk() {
      if (this.isRecycleTab) {
        this.close()
        return
      }
      const rows = this.getActiveSelectionRows()
      if (!rows.length) {
        this.$message.warning('请至少选择一位用户')
        return
      }
      this.$emit('selectFinished', rows)
      this.close()
    },
    // 查询当前 tab。
    searchQuery() {
      this.cancelAutoSearchQuery()
      this.executeSearchQuery()
    },
    // 重置查询条件并重新加载当前 tab。
    searchReset() {
      this.cancelAutoSearchQuery()
      this.queryParam = this.getDefaultQueryParam()
      this.resetSelection()
      this.$nextTick(() => {
        const activeTab = this.getActiveTabRef()
        activeTab && activeTab.reset()
        this.loadActiveTab(1)
      })
    },
    // 同步子组件选中状态。
    handleSelectionChange(payload) {
      const source = payload || {}
      this.selectedRowKeys = (source.selectedRowKeys || []).slice()
      this.selectionRows = (source.selectionRows || []).slice()
    },
    // 调用回收站子组件的批量复原。
    handleRestoreBatch() {
      if (this.$refs.recycleTab) {
        this.$refs.recycleTab.restoreBatch()
      }
    },
    handleComfirm(){
       if (this.$refs.recycleTab) {
        this.$refs.recycleTab.restoreBatch2()
      }
    },
    // 回收站操作成功后通知父列表刷新。
    handleRecycleOk() {
      this.resetSelection()
      this.$emit('recycleOk')
    },
    // 部门切换后只写入 dept 查询字段，岗位筛选保持独立。
    handleDeptChange(value, selectedOptions) {
      const selectedPath = Array.isArray(value) ? value.map(item => String(item)) : []
      const optionPath = Array.isArray(selectedOptions) && selectedOptions.length
        ? selectedOptions
        : this.getMainDeptSelectedOptions(selectedPath)
      const currentOption = optionPath[optionPath.length - 1]
      this.queryParam.dept = currentOption ? String(currentOption.value || '') : ''
      this.loadPostOptions()
      this.searchQuery()
    },
    // 岗位切换后写入 postId 查询字段。
    handlePostChange(value) {
      this.queryParam.postId = value || ''
      this.searchQuery()
    },
    // 加载岗位下拉数据。
    loadPostOptions() {
      this.resetPostOptions()
      this.postLoading = true
      return getAction(this.url.postList, {
        deptId:this.queryParam.dept,
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 99999
      }).then(res => {
        const result = res && res.result
        const rows = Array.isArray(res) ? res : (Array.isArray(result) ? result : ((result && result.records) || []))
        this.postRows = rows
        this.postOptions = rows.map(item => ({
          label: item.postName,
          value: item.id
        })).filter(item => item.label && item.value)
      }).catch(() => {
        this.resetPostOptions()
      }).finally(() => {
        this.postLoading = false
      })
    },
    // 清空岗位相关状态。
    resetPostOptions() {
      this.postRows = []
      this.postOptions = []
    },
    // 清空父组件记录的选中状态。
    resetSelection() {
      this.selectedRowKeys = []
      this.selectionRows = []
    },
    // 重置两个 tab 子组件。
    resetTabs() {
      this.$refs.uncreatedTab && this.$refs.uncreatedTab.reset()
      this.$refs.recycleTab && this.$refs.recycleTab.reset()
    },
    // 获取当前 tab 子组件引用。
    getActiveTabRef() {
      return this.isRecycleTab ? this.$refs.recycleTab : this.$refs.uncreatedTab
    },
    // 加载当前 tab 数据。
    loadActiveTab(arg) {
      const activeTab = this.getActiveTabRef()
      if (activeTab) {
        activeTab.loadData(arg)
      }
    },
    // 获取当前 tab 已选记录。
    getActiveSelectionRows() {
      const activeTab = this.getActiveTabRef()
      return activeTab ? activeTab.getSelectionRows() : []
    },
    handleKeywordInput() {
      this.autoSearchQuery()
    },
    cancelAutoSearchQuery() {
      if (this.autoSearchQuery && this.autoSearchQuery.cancel) {
        this.autoSearchQuery.cancel()
      }
    },
    executeSearchQuery() {
      const activeTab = this.getActiveTabRef()
      activeTab && activeTab.clearSelection()
      this.loadActiveTab(1)
    },
    // 将父组件组织树转换为 a-cascader 需要的节点结构。
    normalizeMainDeptOptions(list = [], parentPath) {
      const path = parentPath || []
      return (list || [])
        .filter(item => item && (item.id || item.key || item.value || item.name || item.title))
        .map(item => {
          const label = item.name || item.title || ''
          const value = String(item.id || item.key || item.value || label)
          const children = this.normalizeMainDeptOptions(item.children || [], path.concat(label))
          return {
            label,
            title: label,
            value,
            key: value,
            path: path.concat(label),
            raw: item,
            isLeaf: !children.length,
            children
          }
        })
    },
    // 根据部门 ID 查找级联路径。
    getPathValueByValue(value) {
      if (!this.mainDeptOptions.length || !value) {
        return []
      }
      return this.findMainDeptPathByValue(this.mainDeptOptions, value)
    },
    // 递归按节点值查找级联路径。
    findMainDeptPathByValue(list, targetValue, parentPath) {
      const currentPath = parentPath || []
      const normalizedTarget = String(targetValue || '')
      for (let i = 0; i < (list || []).length; i++) {
        const item = list[i]
        const nextPath = currentPath.concat(String(item.value))
        if (String(item.value) === normalizedTarget) {
          return nextPath
        }
        const matchedPath = this.findMainDeptPathByValue(item.children || [], normalizedTarget, nextPath)
        if (matchedPath.length) {
          return matchedPath
        }
      }
      return []
    },
    // 根据级联路径取出当前选中的节点链。
    getMainDeptSelectedOptions(pathValue) {
      const selectedPath = Array.isArray(pathValue) ? pathValue.map(item => String(item)) : []
      const selectedOptions = []
      let source = this.mainDeptOptions
      for (let i = 0; i < selectedPath.length; i++) {
        const currentValue = selectedPath[i]
        const currentOption = (source || []).find(item => String(item.value) === currentValue)
        if (!currentOption) {
          break
        }
        selectedOptions.push(currentOption)
        source = currentOption.children || []
      }
      return selectedOptions
    },
    // 根据部门 ID 读取部门显示文本。
    getDeptTextByValue(value) {
      const pathValue = this.getPathValueByValue(value)
      const selectedOptions = this.getMainDeptSelectedOptions(pathValue)
      if (!selectedOptions.length) {
        return '-'
      }
      return selectedOptions.map(item => item.label || item.title).filter(Boolean).join(' / ')
    },
    // 支持部门级联搜索时按路径名称模糊匹配。
    filterMainDept(inputValue, path) {
      const keyword = String(inputValue || '').toLowerCase()
      return (path || []).some(option => String(option.label || option.title || '').toLowerCase().indexOf(keyword) > -1)
    }
  }
}
</script>

<style scoped lang="less">
.person-user-select-modal {
  --employee-background: #f8fafd;
  --employee-card: #ffffff;
  --employee-foreground: #1a2a3d;
  --employee-primary: #2563eb;
  --employee-primary-rgb: 37, 99, 235;

  height: 750px;
  padding-bottom: 20px;
}

.person-user-select-content {
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 3px 20px 16px;
  background: var(--employee-background);
}

.person-user-select-tabs {
  margin-bottom: 12px;

  /deep/ .ant-tabs-bar {
    margin: 0;
  }
}

.person-user-select-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.person-user-select-search {
  width: 240px;
  max-width: 100%;
}

.employee-main-dept-cascader,
.person-user-select-post {
  width: 220px;
  max-width: 100%;
}

.person-user-select-wrap /deep/ .ant-modal-body {
  padding: 0;
}
/deep/ .ant-modal-body{
  padding-bottom: 0;
}

.person-user-select-wrap /deep/ .ant-modal-content {
  overflow: hidden;
}
</style>
