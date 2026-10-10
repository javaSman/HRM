<template>
  <a-card :bordered="false" class="process-step"
    :bodyStyle="{ height: '100%', padding: '24px', display: 'flex', flexDirection: 'column' }">
    <div class="process-shell">
      <div class="process-toolbar">
        <div class="process-toolbar-left">
          <a-button type="primary" icon="plus" @click="openAddNode()">
            新增流程节点
          </a-button>
          <a-button class="process-button-apply" icon="share-alt" @click="handleApplyOtherBusiness">
            应用至其他业务
          </a-button>
          <a-button class="process-button-deploy" icon="rocket" @click="handleDeploy">
            部署
          </a-button>
          <!-- 部署结果显示 -->
          <div class="deploy-result"
            :class="{ 'deploy-result-empty': deployInfo.syDeptType !== '1' && deployInfo.syDeptType !== '2' }"
            v-if="hasActiveProcess && deployInfo.loaded">
            <template v-if="deployInfo.syDeptType === '1'">
              <span class="deploy-result-label">全部部门</span>
            </template>
            <template v-else-if="deployInfo.syDeptType === '2'">
              <span class="deploy-result-label">指定部门：</span>
              <span class="deploy-result-value" :title="deployInfo.deptNames">{{ deployInfo.deptNames || '暂无' }}</span>
            </template>
            <template v-else>
              <span class="deploy-result-label">未部署</span>
            </template>
          </div>
        </div>
      </div>

      <div class="process-summary">
        <span>当前流程共{{ canvasNodes.length }}个节点</span>
        <a v-if="canvasNodes.length" @click="handleClearAll">清空全部节点</a>
      </div>
      <!-- 审批区 -->
      <div class="process-canvas">
        <a-spin :spinning="loading">
          <div class="process-canvas-inner" v-if="hasActiveProcess">
            <div class="process-flow">
              <div class="process-terminal process-terminal-start">
                <a-icon type="user" />
                <span>发起</span>
              </div>

              <div class="flow-add-box">
                <a-button shape="circle" icon="plus" class="flow-add-button" @click="openAddNode(0)"></a-button>
              </div>

              <div v-if="!canvasNodes.length" class="flow-empty-text">
                暂无流程节点，点击上方按钮或加号开始配置审批流程
              </div>

              <template v-for="(node, index) in canvasNodes">
                <div :key="node.id || index" class="flow-node-wrapper" @click="openEditNode(node)">
                  <div class="flow-node-card">
                    <div class="flow-node-header">
                      <div class="flow-node-title-wrap">
                        <span class="flow-node-icon">
                          <a-icon :type="getNodeIcon(node)" />
                        </span>
                        <div class="flow-node-title-block">
                          <div class="flow-node-title">{{ node.nodeName || ('节点' + (index + 1)) }}</div>
                          <div class="flow-node-order">排序 {{ node.px || index + 1 }}</div>
                        </div>
                      </div>
                      <div class="flow-node-actions">
                        <a-tag :color="getNodeTypeColor(node)">{{ getNodeTypeText(node) }}</a-tag>
                        <!-- <a class="flow-node-action" @click.stop="openEditNode(node)">编辑</a>
                        <a-popconfirm title="确定删除当前节点吗？" @confirm="handleDeleteNode(node)">
                          <a class="flow-node-action danger" @click.stop>删除</a>
                        </a-popconfirm> -->
                      </div>
                    </div>

                    <div class="flow-node-summary">
                      <span>{{ getNodeSummary(node) }}</span>
                      <a-icon type="right" />
                    </div>

                    <div class="flow-node-tags" v-if="getNodeBadges(node).length">
                      <a-tag v-for="tag in getNodeBadges(node)" :key="tag">{{ tag }}</a-tag>
                    </div>
                  </div>
                </div>

                <div :key="'add-' + (node.id || index)" class="flow-add-box">
                  <a-button shape="circle" icon="plus" class="flow-add-button"
                    @click="openAddNode(index + 1)"></a-button>
                </div>
              </template>

              <div class="process-terminal process-terminal-end">
                <span>结束</span>
              </div>
            </div>
          </div>

          <div v-else class="process-empty">
            <a-empty description="请先在左侧选择业务流程" />
          </div>
        </a-spin>
      </div>
    </div>

    <custom-process-node-modal ref="nodeModal" :bmid="bmid" @ok="handleNodeModalOk" />
    <!-- 部署弹窗 -->
    <deploy-modal ref="deployModal" @ok="handleDeployOk" />
    <!-- 应用至其他业务 -->
    <a-modal title="应用至其他业务" :visible="applyBusinessVisible" :confirmLoading="applyBusinessLoading"
      :maskClosable="false" destroyOnClose @ok="handleConfirmApplyOtherBusiness"
      @cancel="handleCancelApplyOtherBusiness">
      <div class="apply-business-tip">
        将当前审批流程配置复制一份，应用到选中的业务分类下
      </div>
      <div class="apply-business-current">
        <span class="apply-business-label">当前流程：</span>
        <a-input :value="currentBusinessName" disabled />
      </div>
      <div class="apply-business-target">
        <div class="apply-business-label required">目标业务：</div>
        <div v-if="applyBusinessOptions.length" class="apply-business-select-wrap">
          <a-select v-model="applyBusinessTargetId" show-search allow-clear class="apply-business-select"
            placeholder="请选择目标业务" :filter-option="filterBusinessOption">
            <a-select-option v-for="item in applyBusinessOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </div>
        <a-empty v-else description="暂无可应用的业务分类" />
      </div>
    </a-modal>
    <!-- 侧边编辑抽屉 -->
    <a-drawer :title="drawerTitle" :width="760" :visible="nodeDrawerVisible" :bodyStyle="{ paddingBottom: '72px' }"
      wrapClassName="custom-process-node-drawer" @close="handleNodeDrawerCloseRequest">
      <custom-process-node-form ref="nodeDrawerForm" :bmid="bmid" />
      <div class="node-drawer-footer">
        <a-button icon="copy" :loading="nodeDrawerLoading" @click="handleCopyCurrentNode">
          复制当前节点
        </a-button>
        <a-popconfirm title="确定删除当前节点吗？" @confirm="handleDeleteCurrentNode">
          <a-button type="danger" icon="delete" :loading="nodeDrawerLoading">
            删除当前节点
          </a-button>
        </a-popconfirm>
        <a-button type="primary" icon="save" :loading="nodeDrawerLoading" @click="handleSaveNodeDrawer">
          保存配置
        </a-button>
      </div>
    </a-drawer>
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { deleteAction, httpAction, getAction } from '@/api/manage'
import CustomProcessNodeModal from './modules/CustomProcessNodeModal.vue'
import CustomProcessNodeForm from './modules/CustomProcessNodeForm.vue'
import DeployModal from './modules/DeployModal.vue'

export default {
  name: 'CustomProcessConfigurationList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    CustomProcessNodeModal,
    CustomProcessNodeForm,
    DeployModal
  },
  props: {
    bmid: {
      type: String,
      required: false,
      default: ''
    },
    treeData: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data() {
    return {
      description: '自定义流程配置管理页面',
      url: {
        list: '/process/customProcessConfiguration/getNodeList',
        add: '/process/customProcessConfiguration/add',
        edit: '/process/customProcessConfiguration/edit',
        delete: '/process/customProcessConfiguration/delete',
        deleteBatch: '/process/customProcessConfiguration/deleteBatch',
        exportXlsUrl: '/process/customProcessConfiguration/exportXls',
        importExcelUrl: 'process/customProcessConfiguration/importExcel',
        copyProcess: '/process/customProcess/copy'
      },
      columns: [],
      dictOptions: {},
      superFieldList: [],
      disableMixinCreated: true,
      nodeDrawerVisible: false,
      nodeDrawerLoading: false,
      currentNode: null,
      drawerTitle: '编辑流程节点',
      applyBusinessVisible: false,
      applyBusinessLoading: false,
      applyBusinessTargetId: '',
      // 部署结果信息
      deployInfo: {
        loaded: false,
        syDeptType: '', // 1=全部部门，2=指定部门，空=未部署
        deptNames: ''
      },
      deployQueryUrl: '/custom_process_bs/customProcessBs/queryBycustomProcessId'
    }
  },
  computed: {
    // 判断当前是否已选中可配置的流程。
    hasActiveProcess() {
      return !!this.bmid
    },
    // 对节点列表按排序字段进行稳定排序。
    canvasNodes() {
      return this.getSortedNodes(this.dataSource)
    },
    // 生成导入接口的完整地址。
    importExcelUrl() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
    // 根据当前 bmid 从树中定位当前流程节点。
    currentProcess() {
      return this.findProcessNodeById(this.bmid, this.treeData)
    },
    // 提取当前业务节点的主键，供复制时排除自身使用。
    currentBusinessId() {
      if (!this.currentProcess) {
        return ''
      }
      if (this.currentProcess.pid) {
        return this.currentProcess.pid
      }
      const parentNode = this.findParentNodeById(this.bmid, this.treeData)
      return parentNode ? parentNode.key || parentNode.id || '' : ''
    },
    // 展示当前业务名称。
    currentBusinessName() {
      return this.currentProcess
        ? this.currentProcess.title || this.currentProcess.name || this.currentProcess.lcmc || ''
        : ''
    },
    // 构建“应用至其他业务”弹窗使用的树形数据。
    applyBusinessOptions() {
      return this.buildApplyBusinessOptions(this.treeData)
    }
  },
  watch: {
    bmid: {
      immediate: true,
      handler(val) {
        this.handleProcessChange(val)
      }
    },
    applyBusinessVisible(val) {
      if (!val) {
        this.applyBusinessTargetId = ''
      }
    }
  },
  created() {
    this.ipagination.pageSize = 9999
    this.getSuperFieldList()
  },
  methods: {
    // 兼容列表页 mixin 的空字典初始化钩子。
    initDictConfig() { },
    // 定义列表页的超级查询字段。
    getSuperFieldList() {
      const fieldList = []
      fieldList.push({ type: 'string', value: 'customProcessId', text: '自定义流程id', dictCode: '' })
      fieldList.push({ type: 'string', value: 'spr', text: '审批人', dictCode: '' })
      fieldList.push({ type: 'int', value: 'px', text: '排序', dictCode: '' })
      this.superFieldList = fieldList
    },
    // 根据左侧选中的流程切换右侧节点数据。
    handleProcessChange(val) {
      if (!val) {
        this.queryParam = {}
        this.dataSource = []
        // 重置部署信息
        this.deployInfo = { loaded: false, syDeptType: '', deptNames: '' }
        return
      }
      this.queryParam = {
        customProcessId: val
      }
      this.loadData(1)
      // 切换流程时加载部署结果
      this.loadDeployInfo(val)
    },
    // 对节点数据按排序号和 id 做统一排序。
    getSortedNodes(list) {
      return [...(Array.isArray(list) ? list : [])].sort((a, b) => {
        const sortA = this.toNumber(a.px, 0)
        const sortB = this.toNumber(b.px, 0)
        if (sortA !== sortB) {
          return sortA - sortB
        }
        return String(a.id || '').localeCompare(String(b.id || ''))
      })
    },
    // 生成应用到其他业务时使用的树形勾选数据。
    buildApplyBusinessOptions(list) {
      return (Array.isArray(list) ? list : [])
        .map((item) => {
          if (!item) {
            return null
          }
          const value = item.id || item.key
          const label = item.title || item.lcmc || item.name
          if (!value || !label || item.fzlc !== '业务' || String(value) === String(this.currentBusinessId)) {
            return null
          }
          return {
            value,
            label
          }
        })
        .filter(Boolean)
    },
    filterBusinessOption(input, option) {
      const children = (option.componentOptions && option.componentOptions.children) || []
      const text = children[0] && children[0].text ? children[0].text : ''
      return text.toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0
    },
    // 将任意值安全转换为数字。
    toNumber(value, defaultValue = null) {
      const num = Number(value)
      return Number.isNaN(num) ? defaultValue : num
    },
    // 根据节点属性返回节点类型文案。
    getNodeTypeText(node) {
      return Number(node.nodeProperties) === 2 ? '抄送' : '审批'
    },
    // 根据节点属性返回节点类型颜色。
    getNodeTypeColor(node) {
      return Number(node.nodeProperties) === 2 ? 'orange' : 'blue'
    },
    // 根据节点属性返回节点图标。
    getNodeIcon(node) {
      return Number(node.nodeProperties) === 2 ? 'notification' : 'user'
    },
    // 汇总节点标签信息用于卡片展示。
    getNodeBadges(node) {
      const badges = []
      const isCc = Number(node.nodeProperties) === 2
      if (Number(node.isselfSelect) === 1) {
        badges.push(isCc ? '自选抄送' : '自选审批')
      }
      if (Number(node.approvalRule) === 1) {
        badges.push('会签')
      }
      if (Number(node.approvalRule) === 2) {
        badges.push('或签')
      }
      // if (Number(node.zszg) === 1) {
      //   badges.push('直属主管')
      // }
      // if (Number(node.zsjl) === 1) {
      //   badges.push('直属经理')
      // }
      // if (Number(node.zszj) === 1) {
      //   badges.push('直属总监')
      // }
      if (Number(node.promoter) === 1) {
        badges.push('发起人')
      }
      return badges
    },
    // 生成节点摘要文案。
    getNodeSummary(node) {
      const items = []
      const userText = this.extractChoiceDisplay(node.users)
      const roleText = this.extractChoiceDisplay(node.roles)
      const departmentText = this.extractChoiceDisplay(node.departments)

      // 处理快捷审批人（默认审批）
      if (node.kjSprType) {
        // 快捷审批人会将 chooseObjectsName 存放在 users/roles/departments 其中一个数组中
        const quickText = this.extractChoiceDisplay(node.users) || this.extractChoiceDisplay(node.roles) || this.extractChoiceDisplay(node.departments)
        if (quickText) {
          items.push(`快捷审批：${quickText}`)
        } else {
          // 如果没有获取到具体名称，至少显示快捷审批人类型
          items.push(`快捷审批人：${node.customProcessNodeConfiguration.chooseObjectsName}`)
        }
      }

      if (Number(node.chooseUsers) === 1 && userText) {
        items.push(`用户：${userText}`)
      }
      if (Number(node.chooseRoles) === 1 && roleText) {
        items.push(`角色：${roleText}`)
      }
      if (Number(node.chooseDepartments) === 1 && departmentText) {
        items.push(`部门：${departmentText}`)
      }
      // if (Number(node.zszg) === 1) {
      //   items.push('直属主管')
      // }
      // if (Number(node.zsjl) === 1) {
      //   items.push('直属经理')
      // }
      // if (Number(node.zszj) === 1) {
      //   items.push('直属总监')
      // }
      if (Number(node.isselfSelect) === 1) {
        items.push(Number(node.nodeProperties) === 2 ? '允许自选抄送人' : '允许自选审批人')
      }

      if (!items.length) {
        return '未配置处理对象'
      }
      if (items.length === 1) {
        return items[0]
      }
      return `${items[0]} 等${items.length}项`
    },
    // 将选人选角色情况拼接为展示文本。
    extractChoiceDisplay(list) {
      const names = this.extractChoiceNames(list)
      return names.join('、')
    },
    // 从配置明细中提取可读名称列表。
    extractChoiceNames(list) {
      if (!Array.isArray(list) || !list.length) {
        return []
      }
      const firstItem = list[0] || {}
      if (!firstItem.chooseObjectsName) {
        return []
      }
      return String(firstItem.chooseObjectsName)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    },
    // 在指定位置打开新增节点弹窗。
    openAddNode(insertIndex = this.canvasNodes.length) {
      if (!this.hasActiveProcess) {
        this.$message.warning('请先在左侧选择业务流程')
        return
      }
      if (!this.$refs.nodeModal) {
        return
      }
      this.$refs.nodeModal.add({
        customProcessId: this.bmid,
        px: this.getSuggestedSort(insertIndex)
      })
    },
    // 打开节点编辑抽屉并加载当前节点数据。
    openEditNode(record) {
      this.currentNode = record
      this.drawerTitle = record && record.nodeName ? `编辑节点：${record.nodeName}` : '编辑流程节点'
      this.nodeDrawerVisible = true
      this.$nextTick(() => {
        this.$refs.nodeDrawerForm.edit(record)
      })
    },
    // 为新增或复制节点计算推荐排序值。
    getSuggestedSort(insertIndex) {
      const nodes = this.canvasNodes
      if (!nodes.length) {
        return 1
      }

      const previousNode = insertIndex > 0 ? nodes[insertIndex - 1] : null
      const nextNode = insertIndex < nodes.length ? nodes[insertIndex] : null
      const previousSort = this.toNumber(previousNode && previousNode.px)
      const nextSort = this.toNumber(nextNode && nextNode.px)

      if (previousSort !== null && nextSort !== null && nextSort - previousSort > 1) {
        return previousSort + 1
      }
      if (previousSort !== null) {
        return previousSort + 1
      }
      if (nextSort !== null && nextSort > 1) {
        return nextSort - 1
      }
      return nodes.length + 1
    },
    // 节点弹窗保存成功后刷新列表。
    handleNodeModalOk() {
      this.loadData(1)
    },
    // 抽屉点击关闭前先进行二次确认。
    handleNodeDrawerCloseRequest() {
      this.$confirm({
        title: '确认关闭',
        content: '是否关闭当前编辑抽屉？未保存的修改将不会生效。',
        onOk: () => {
          this.handleNodeDrawerClose()
        }
      })
    },
    // 真正关闭节点编辑抽屉并清理当前节点。
    handleNodeDrawerClose() {
      this.nodeDrawerVisible = false
      this.currentNode = null
    },
    // 校验并保存当前抽屉中的节点配置。
    handleSaveNodeDrawer() {
      this.$refs.nodeDrawerForm.validateAndBuild((valid, payload) => {
        if (!valid) {
          return
        }
        this.nodeDrawerLoading = true
        httpAction(this.url.edit, payload, 'put')
          .then((res) => {
            if (res.success) {
              this.$message.success(res.message || '保存成功')
              this.handleNodeDrawerClose()
              this.loadData(1)
            } else {
              this.$message.warning(res.message)
            }
          })
          .catch(() => {
            this.$message.error('保存失败，请稍后重试')
          })
          .finally(() => {
            this.nodeDrawerLoading = false
          })
      })
    },
    // 按当前抽屉配置复制一个新节点。
    handleCopyCurrentNode() {
      this.$refs.nodeDrawerForm.validateAndBuild((valid, payload) => {
        if (!valid) {
          return
        }
        const copyPayload = this.createCopyPayload(payload)

        this.nodeDrawerLoading = true
        httpAction(this.url.add, copyPayload, 'post')
          .then((res) => {
            if (res.success) {
              this.$message.success(res.message || '复制成功')
              this.handleNodeDrawerClose()
              this.loadData(1)
            } else {
              this.$message.warning(res.message)
            }
          })
          .catch(() => {
            this.$message.error('复制失败，请稍后重试')
          })
          .finally(() => {
            this.nodeDrawerLoading = false
          })
      })
    },
    // 生成复制节点时需要提交的 payload。
    createCopyPayload(payload) {
      const copyPayload = Object.assign({}, payload, {
        id: '',
        nodeName: payload.nodeName ? `${payload.nodeName}副本` : '节点副本',
        px: this.getSuggestedSort(this.canvasNodes.length)
      })
      copyPayload.users = this.copyChoiceList(payload.users)
      copyPayload.roles = this.copyChoiceList(payload.roles)
      copyPayload.departments = this.copyChoiceList(payload.departments)
      return copyPayload
    },
    // 清洗节点复制时的明细列表主键。
    copyChoiceList(list) {
      return (Array.isArray(list) ? list : []).map((item) =>
        Object.assign({}, item, {
          id: '',
          customProcessConfigurationId: ''
        })
      )
    },
    // 删除当前抽屉正在编辑的节点。
    handleDeleteCurrentNode() {
      if (!this.currentNode || !this.currentNode.id) {
        return
      }
      this.deleteNode(this.currentNode, 'nodeDrawerLoading', () => {
        this.handleNodeDrawerClose()
        this.loadData(1)
      })
    },
    // 删除流程图中的单个节点。
    handleDeleteNode(record) {
      this.deleteNode(record, 'loading', () => {
        this.loadData()
      })
    },
    // 统一处理节点删除请求和删除后的回调。
    deleteNode(record, loadingKey, afterSuccess) {
      if (!record || !record.id) {
        return
      }
      this[loadingKey] = true
      deleteAction(this.url.delete, { id: record.id })
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            afterSuccess()
          } else {
            this.$message.warning(res.message)
          }
        })
        .catch(() => {
          this.$message.error('删除失败，请稍后重试')
        })
        .finally(() => {
          this[loadingKey] = false
        })
    },
    // 一键清空当前流程下的全部节点。
    handleClearAll() {
      if (!this.canvasNodes.length) {
        return
      }
      const ids = this.canvasNodes
        .map((item) => item.id)
        .filter(Boolean)
        .join(',')

      if (!ids) {
        return
      }

      this.$confirm({
        title: '确认清空',
        content: '是否清空当前流程下的全部节点？',
        onOk: () => {
          this.loading = true
          deleteAction(this.url.deleteBatch, { ids })
            .then((res) => {
              if (res.success) {
                this.$message.success(res.message)
                this.loadData(1)
              } else {
                this.$message.warning(res.message)
              }
            })
            .catch(() => {
              this.$message.error('清空失败，请稍后重试')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    // 打开“应用至其他业务”弹窗前做前置校验。
    handleApplyOtherBusiness() {
      if (!this.hasActiveProcess) {
        this.$message.warning('请先在左侧选择业务流程')
        return
      }
      if (!this.currentProcess || this.currentProcess.fzlc !== '审批流程') {
        this.$message.warning('请选择审批流程后再应用至其他业务')
        return
      }
      if (!this.currentBusinessId) {
        this.$message.warning('当前审批流程未关联业务分类，暂无法复制')
        return
      }
      if (!this.applyBusinessOptions.length) {
        this.$message.warning('暂无可应用的目标业务分类')
        return
      }
      this.applyBusinessTargetId = ''
      this.applyBusinessVisible = true
    },
    // 关闭“应用至其他业务”弹窗。
    handleCancelApplyOtherBusiness() {
      this.applyBusinessVisible = false
    },
    // 将当前流程复制到勾选的目标业务节点下。
    handleConfirmApplyOtherBusiness() {
      if (!this.applyBusinessTargetId) {
        this.$message.warning('请选择目标业务')
        return
      }
      this.applyBusinessLoading = true
      const targetBusinessId = this.applyBusinessTargetId
      const copyUrl = `${this.url.copyProcess}?curProcessId=${this.bmid}&moveProcessId=${targetBusinessId}`
      httpAction(copyUrl, {}, 'post')
        .then((res) => {
          if (!res || !res.success) {
            const targetItem = this.findProcessNodeById(targetBusinessId, this.treeData)
            const targetName = (targetItem && targetItem.title) || (targetItem && targetItem.name) || '未命名业务'
            this.$message.warning((res && res.message) || `业务复制失败：${targetName}`)
            return
          }
          this.$message.success('应用成功')
          this.applyBusinessVisible = false
          this.$emit('reload-process-tree')
        })
        .catch(() => {
          this.$message.error('应用失败，请稍后重试')
        })
        .finally(() => {
          this.applyBusinessLoading = false
        })
    },
    findParentNodeById(id, list, parent = null) {
      if (!id) {
        return null
      }
      const treeList = Array.isArray(list) ? list : []
      for (let i = 0; i < treeList.length; i++) {
        const item = treeList[i]
        if (String(item.key) === String(id) || String(item.id) === String(id)) {
          return parent
        }
        if (item.children && item.children.length) {
          const parentItem = this.findParentNodeById(id, item.children, item)
          if (parentItem) {
            return parentItem
          }
        }
      }
      return null
    },
    // 根据节点 id 在树形结构中递归查找对应节点。
    findProcessNodeById(id, list) {
      if (!id) {
        return null
      }
      const treeList = Array.isArray(list) ? list : []
      for (let i = 0; i < treeList.length; i++) {
        const item = treeList[i]
        if (String(item.key) === String(id) || String(item.id) === String(id)) {
          return item
        }
        if (item.children && item.children.length) {
          const childItem = this.findProcessNodeById(id, item.children)
          if (childItem) {
            return childItem
          }
        }
      }
      return null
    },
    // 打开部署弹窗
    handleDeploy() {
      if (!this.hasActiveProcess) {
        this.$message.warning('请先在左侧选择业务流程')
        return
      }
      this.$refs.deployModal.add({
        customProcessId: this.bmid
      })
    },
    // 部署成功后刷新部署结果显示
    handleDeployOk() {
      this.loadDeployInfo(this.bmid)
    },
    // 查询当前流程的部署结果
    loadDeployInfo(customProcessId) {
      if (!customProcessId) {
        this.deployInfo = { loaded: false, syDeptType: '', deptNames: '' }
        return
      }
      getAction(this.deployQueryUrl, { customProcessId }).then(res => {
        if (res.success && res.result && Array.isArray(res.result) && res.result.length > 0) {
          // 筛选指定部门的记录，合并去重
          const deptRecords = res.result.filter(item => item.syDeptType === '2')
          if (deptRecords.length > 0) {
            const nameSet = new Set()
            deptRecords.forEach(item => {
              const names = (item.zdDeptName || item.zdDeptNmae || '').split(',').filter(n => n)
              names.forEach(n => nameSet.add(n))
            })
            this.deployInfo = {
              loaded: true,
              syDeptType: '2',
              deptNames: Array.from(nameSet).join('、')
            }
          } else {
            // 全部部门
            this.deployInfo = {
              loaded: true,
              syDeptType: '1',
              deptNames: ''
            }
          }
        } else {
          // 未部署
          this.deployInfo = {
            loaded: true,
            syDeptType: '',
            deptNames: ''
          }
        }
      }).catch(() => {
        this.deployInfo = { loaded: true, syDeptType: '', deptNames: '' }
      })
    },
  }
}
</script>

<style lang="less" scoped>
@import '~@assets/less/common.less';

.process-step {
  // height: calc(100vh - 120px - 24px);
  background: #f3f7fc;
}

.process-shell {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.process-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.process-toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.process-button-apply {
  color: #fff;
  border-color: #fa8c16;
  background: linear-gradient(135deg, #fa8c16, #ffb347);
  box-shadow: 0 8px 18px rgba(250, 140, 22, 0.18);
}

.process-button-apply:hover,
.process-button-apply:focus {
  color: #fff;
  border-color: #ff9c2f;
  background: linear-gradient(135deg, #ff9c2f, #ffbe55);
}

.process-button-deploy {
  color: #fff;
  border-color: #52c41a;
  background: linear-gradient(135deg, #52c41a, #73d13d);
  box-shadow: 0 8px 18px rgba(82, 196, 26, 0.18);
}

.process-button-deploy:hover,
.process-button-deploy:focus {
  color: #fff;
  border-color: #73d13d;
  background: linear-gradient(135deg, #73d13d, #95de64);
}

.apply-business-tip {
  margin-bottom: 20px;
  color: #666;
  line-height: 22px;
}

.apply-business-current {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.apply-business-target {
  display: flex;
  align-items: flex-start;
}

.apply-business-label {
  flex: none;
  width: 120px;
  line-height: 32px;
  color: #333;
}

.apply-business-label.required::before {
  margin-right: 4px;
  color: #f5222d;
  content: '*';
}

.apply-business-current /deep/ .ant-input[disabled] {
  color: rgba(0, 0, 0, 0.65);
  background: #fff;
}

.apply-business-current /deep/ .ant-input {
  width: 360px;
}

.apply-business-select-wrap {
  flex: 1;
  padding-top: 4px;
}

.apply-business-select {
  width: 100%;
}

.process-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #d9e1f2;
  border-radius: 10px;
  color: #3d4b66;
}

/* 部署结果显示 */
.deploy-result {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
  background: #ecf5ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  font-size: 12px;
  color: #409eff;
}

.deploy-result-label {
  font-weight: 500;
}

.deploy-result-value {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

/* 未部署：整个容器变灰（class 挂在外层 .deploy-result 上，避免内层色带套蓝底） */
.deploy-result.deploy-result-empty {
  background: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  font-style: italic;
}

.process-canvas {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: #f8fbff;
  border: 1px solid #e5edf8;
  border-radius: 18px;
  background-image: radial-gradient(circle at 1px 1px, rgba(45, 116, 255, 0.12) 1px, transparent 0);
  background-size: 24px 24px;
}

.process-canvas-inner {
  min-height: 100%;
}

.process-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 420px;
}

.process-flow {
  display: flex;
  min-height: 420px;
  padding: 28px 24px;
  align-items: center;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 0;
}

.process-terminal {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 72px;
  padding: 8px 16px;
  border-radius: 999px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(45, 116, 255, 0.2);
  flex-shrink: 0;
}

.process-terminal-start {
  background: linear-gradient(135deg, #1f8cff, #2f6fff);
}

.process-terminal-end {
  min-width: 64px;
  background: linear-gradient(135deg, #9099aa, #6f7785);
  box-shadow: 0 6px 16px rgba(111, 119, 133, 0.15);
}

.flow-add-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  height: 100%;
  padding: 0;
  flex-shrink: 0;
}

.flow-add-box::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, rgba(80, 130, 255, 0.12), rgba(80, 130, 255, 0.4), rgba(80, 130, 255, 0.12));
}

.flow-add-button {
  position: relative;
  z-index: 1;
  width: 28px;
  height: 28px;
  color: #fff;
  border: none;
  background: linear-gradient(135deg, #1f8cff, #2f6fff);
  box-shadow: 0 6px 16px rgba(45, 116, 255, 0.18);
}

.flow-add-button:hover,
.flow-add-button:focus {
  color: #fff;
  background: linear-gradient(135deg, #2c94ff, #467cff);
}

.flow-empty-text {
  margin: 0 12px;
  color: #7b879c;
  font-size: 13px;
  white-space: nowrap;
}

.flow-node-wrapper {
  position: relative;
  cursor: pointer;
}

.flow-node-card {
  width: 260px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(216, 228, 245, 0.95);
  border-radius: 14px;
  box-shadow: 0 10px 28px rgba(34, 73, 135, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  flex-shrink: 0;
}

.flow-node-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(34, 73, 135, 0.12);
}

.flow-node-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.flow-node-title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}

.flow-node-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #fff;
  border-radius: 50%;
  background: linear-gradient(135deg, #1f8cff, #2f6fff);
  box-shadow: 0 4px 12px rgba(45, 116, 255, 0.16);
}

.flow-node-title-block {
  min-width: 0;
}

.flow-node-title {
  color: #1f2d3d;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.flow-node-order {
  margin-top: 1px;
  color: #8a94a6;
  font-size: 11px;
}

.flow-node-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.flow-node-action {
  color: #4a7dff;
  font-size: 12px;
}

.flow-node-action.danger {
  color: #ff4d4f;
}

.node-drawer-footer {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 24px;
  border-top: 1px solid #e8e8e8;
  background: #fff;
}

.flow-node-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  margin-top: 10px;
  color: #3d4b66;
  font-size: 12px;
  background: #f4f7fb;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.flow-node-summary:hover {
  color: #2f6fff;
  background: #edf3ff;
}

.flow-node-tags {
  margin-top: 10px;
}

.flow-node-tags /deep/ .ant-tag {
  margin-bottom: 4px;
  font-size: 11px;
}

@media (max-width: 960px) {
  .process-toolbar-left {
    width: 100%;
    flex-wrap: wrap;
  }

  .flow-node-card {
    width: 220px;
  }

  .process-flow {
    padding: 20px 16px;
  }
}
</style>
