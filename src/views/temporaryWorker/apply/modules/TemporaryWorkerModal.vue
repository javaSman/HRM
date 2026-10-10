<!--
  @description 临时工申请模态框组件
  @date 2026-08-19
  @functionality 提供临时工需求的新增/编辑功能，支持多需求项录入、审批流程配置
-->
<template>
  <!-- 新增/编辑模态框 -->
  <a-modal
    :title="title"
    :width="880"
    :visible="visible"
    :confirmLoading="confirmLoading"
    centered
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="取消"
    okText="确认提交"
  >
    <a-spin :spinning="confirmLoading">
      <a-form-model ref="form" :model="model" :rules="rules" layout="vertical">
        <!-- 基本信息：需求部门和申请人 -->
        <div class="section-title">基础信息</div>
        <a-row :gutter="14">
          <a-col :span="12">
            <a-form-model-item label="需求部门" prop="deptId">
              <a-cascader
                v-model="queryDeptPath"
                :options="queryDeptOptions"
                :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                changeOnSelect
                allowClear
                placeholder="请选择部门"
                @change="handleQueryDeptChange"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="申请人" prop="applicantId">
              <div class="approver-line">
                <a-tag
                  v-for="item in applicantList"
                  :key="item.userCode"
                  class="approver-tag"
                  closable
                  @close="handleApplicantClose($event, item.userCode)"
                >
                  <span class="approver-avatar">{{ getAvatarText(item.userName) }}</span>
                  <span class="approver-name">{{ item.userName }}</span>
                </a-tag>
                <j-select-employee
                  v-model="applicantIds"
                  value-field="no"
                  :multiple="true"
                  button-only
                  button-text="选择申请人"
                  :button-icon="''"
                  :button-type="'default'"
                  @change="handleXqrChange"
                />
              </div>
            </a-form-model-item>
          </a-col>
        </a-row>

        <!-- 需求明细：支持多个需求项录入 -->
        <div class="section-title">需求明细</div>
        <div class="demand-block">
          <div class="demand-list">
            <div v-for="(row, idx) in demandRows" :key="idx" class="demand-card">
              <div class="demand-head">
                <div class="demand-title">需求项{{ idx + 1 }}</div>
                <div class="demand-actions">
                  <a-button type="link" size="small" @click="duplicateDemand(idx)">复制</a-button>
                  <a-button
                    v-if="demandRows.length > 1"
                    type="link"
                    size="small"
                    class="danger-btn"
                    @click="removeDemandRow(idx)"
                  >
                    删除
                  </a-button>
                </div>
              </div>
              <a-row :gutter="14">
                <a-col :span="8">
                  <a-form-model-item label="需求工种" required>
                    <a-select
                      v-model="row.workType"
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      placeholder="请选择需求工种"
                      :loading="workTypeLoading"
                      :disabled="!model.deptId"
                      @change="(val) => handleWorkTypeChange(row, val)"
                    >
                      <a-select-option v-for="item in workTypeOptions" :key="item.value" :value="item.value">
                        {{ item.label }}
                      </a-select-option>
                    </a-select>
                  </a-form-model-item>
                </a-col>
                <a-col :span="8">
                  <a-form-model-item label="需求性质" required>
                    <a-select
                      v-model="row.demandNature"
                      placeholder="请选择需求性质"
                      @change="(val) => handleDemandNatureChange(row, val)"
                    >
                      <a-select-option value="新增">新增</a-select-option>
                      <a-select-option value="续签">续签</a-select-option>
                    </a-select>
                  </a-form-model-item>
                </a-col>
                <a-col :span="8">
                  <a-form-model-item label="人数" required>
                    <!-- 续签：从需求部门下在职临时工档案中多选人员 -->
                    <a-select
                      v-if="row.demandNature === '续签'"
                      :value="getXqNoList(row)"
                      mode="multiple"
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      placeholder="请选择续签人员"
                      :loading="renewWorkerLoading"
                      :disabled="!model.deptId"
                      :notFoundContent="renewWorkerLoading ? '加载中...' : '暂无在职临时工'"
                      @change="(vals) => handleRenewWorkerChange(row, vals)"
                    >
                      <a-select-option
                        v-for="item in renewWorkerOptions"
                        :key="item.workerCode"
                        :value="item.workerCode"
                      >
                        {{ item.name }}<span v-if="item.workerCode">（{{ item.workerCode }}）</span>
                      </a-select-option>
                    </a-select>
                    <!-- 新增：数字录入人数 -->
                    <a-input-number
                      v-else
                      v-model="row.personCount"
                      :min="1"
                      :step="1"
                      :precision="0"
                      placeholder="请输入人数"
                      style="width: 100%"
                    />
                  </a-form-model-item>
                </a-col>
                <a-col :span="8">
                  <a-form-model-item label="工期(天)">
                    <a-input-number
                      v-model="row.workDays"
                      :min="1"
                      :step="1"
                      :precision="0"
                      placeholder="请输入工期"
                      style="width: 100%"
                    />
                  </a-form-model-item>
                </a-col>
                <a-col :span="8">
                  <a-form-model-item label="开始日期">
                    <j-date
                      v-model="row.startDate"
                      dateFormat="YYYY-MM-DD"
                      placeholder="请选择开始日期"
                      style="width: 100%"
                    />
                  </a-form-model-item>
                </a-col>
                <a-col :span="8">
                  <a-form-model-item label="结束日期">
                    <j-date
                      v-model="row.endDate"
                      dateFormat="YYYY-MM-DD"
                      placeholder="请选择结束日期"
                      style="width: 100%"
                    />
                  </a-form-model-item>
                </a-col>
              </a-row>
              <!-- 服务项目、附件单独一行 -->
              <a-row :gutter="14">
                <a-col :span="24">
                  <a-form-model-item label="服务项目">
                    <a-textarea v-model="row.serviceProject" placeholder="请输入服务项目" :autoSize="{ minRows: 2 }" />
                  </a-form-model-item>
                </a-col>
                <a-col :span="24">
                  <a-form-model-item label="附件">
                    <j-upload v-model="row.attachment" text="选择文件" :returnUrl="true" />
                  </a-form-model-item>
                </a-col>
              </a-row>
            </div>
          </div>
          <div class="demand-add-btn">
            <a-button type="primary" @click="addDemandRow"> <a-icon type="plus" />新增需求项 </a-button>
          </div>
        </div>

        <!-- 审批流程：动态流程节点 -->
        <div class="section-title">审批流程</div>
        <div class="approval-timeline">
          <a-spin v-if="processNodesLoading" class="approval-spin" />
          <template v-else>
            <div v-for="(node, nIndex) in processNodeList" :key="node.id || nIndex" class="timeline-node">
              <div class="timeline-dot"></div>
              <div class="timeline-card">
                <div class="timeline-card-title">
                  {{ node.nodeName }}
                  <a-tag
                    v-if="node.approvalRule === '1' || node.approvalRule === 1"
                    color="orange"
                    class="node-rule-tag"
                    >会签</a-tag
                  >
                  <a-tag v-if="node.approvalRule === '2' || node.approvalRule === 2" color="red" class="node-rule-tag"
                    >或签</a-tag
                  >
                </div>
                <div class="approver-line">
                  <!-- 已选人员 tag 列表 -->
                  <template v-if="nodeObjList[nIndex] && nodeObjList[nIndex].arr.length > 0">
                    <a-tag
                      v-for="item in nodeObjList[nIndex].arr"
                      :key="item.id"
                      class="approver-tag"
                      :closable="canEditApprovers(node)"
                      @close="handleEmployeeTagClose($event, nIndex, item.id)"
                    >
                      <span class="approver-avatar">{{ getAvatarText(item.name) }}</span>
                      <span class="approver-name">{{ item.name }}</span>
                    </a-tag>
                  </template>
                  <!-- 空级审批类型（如"直属经理"） -->
                  <span v-else-if="isKjSprTypeNode(node) && !canEditApprovers(node)" class="kj-spr-type-text">
                    {{ node.kjSprType_dictText }}
                  </span>
                  <!-- 空级审批节点（直属主管/经理/总监）：独立的自选审批人组件 -->
                  <j-select-approver
                    v-if="isLeaderNode(node)"
                    v-model="nodeObjList[nIndex].str"
                    :kj-spr-type="getNodeKjSprType(node)"
                    placeholder="请选择审批人"
                    value-field="name"
                    button-only
                    button-text="自选审批人"
                    :button-icon="''"
                    :button-type="'default'"
                    @change="(value, rows) => handleSelectValue(nIndex, value, rows)"
                  />
                  <!-- 添加审批人/抄送人按钮 -->
                  <j-select-employee
                    v-else-if="hasSprScope(node)"
                    v-model="nodeObjList[nIndex].str"
                    :placeholder="isCcNode(node) ? '请选择抄送人' : '请选择审批人'"
                    value-field="name"
                    button-only
                    :button-text="isCcNode(node) ? '添加抄送人' : '添加审批人'"
                    :button-icon="''"
                    :button-type="'default'"
                    @change="(value, rows) => handleSelectValue(nIndex, value, rows)"
                  />
                </div>
              </div>
            </div>
            <div v-if="!processNodeList.length" class="sqgl-empty-hint">暂无审批流程配置</div>
          </template>
        </div>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import Vue from 'vue'
import { getAction, postAction } from '@/api/manage'

/**
 * 临时工申请模态框组件
 * 提供临时工需求的新增/编辑功能
 * 支持多需求项录入、审批流程配置
 */
export default {
  name: 'TemporaryWorkerModal',
  data() {
    return {
      /** 模态框标题 */
      title: '',
      /** 模态框显示状态 */
      visible: false,
      /** 确认按钮加载状态 */
      confirmLoading: false,
      /** 表单数据模型 */
      model: {
        deptId: '', // 部门ID
        deptName: '', // 部门名称
        applicantId: '', // 申请人ID（用于校验）
      },
      /** 申请人工号列表（逗号分隔） */
      applicantIds: '',
      /** 申请人列表 */
      applicantList: [],
      /** 表单默认数据 */
      modelDefault: {},
      /** 表单验证规则 */
      rules: {
        deptId: [{ required: true, message: '请选择需求部门', trigger: 'change' }],
        applicantId: [{ required: true, message: '请选择申请人', trigger: 'change' }],
      },
      /** 需求项列表 */
      demandRows: [],
      /** 需求工种选项（按所选需求部门加载） */
      workTypeOptions: [],
      /** 需求工种选项加载状态 */
      workTypeLoading: false,
      /** 续签可选临时工列表（需求部门下的在职临时工，来源临时工档案） */
      renewWorkerOptions: [],
      /** 续签人员列表加载状态 */
      renewWorkerLoading: false,
      /** 续签人员列表已加载的部门ID（避免同部门重复请求） */
      renewWorkerDeptId: '',
      /** 需求部门路径（级联选择器绑定值） */
      queryDeptPath: [],
      /** 需求部门选项（树形结构） */
      queryDeptOptions: [],
      /** 流程节点列表（后端返回） */
      processNodeList: [],
      /** 每个节点对应的审批人/抄送人数据（索引与 processNodeList 对应） */
      nodeObjList: [],
      /** 流程节点加载状态 */
      processNodesLoading: false,
      /** 接口地址 */
      url: {
        getLcjdList: '/process/customProcessConfiguration/getLcjdList',
      },
      /** 申请模块编码 */
      sqmkCode: '临时工申请',
    }
  },
  computed: {},
  created() {
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
    this.loadOrgTree()
  },
  methods: {
    /**
     * 打开新增模式
     * @returns {void}
     */
    add() {
      this.edit({})
    },
    /**
     * 打开编辑模式
     * @param {Object} record - 编辑记录
     * @returns {void}
     */
    edit(record) {
      this.model = Object.assign({}, this.modelDefault, record)
      this.visible = true
      this.queryDeptPath = [] // 清空需求部门路径
      this.demandRows = [
        {
          workType: '',
          workTypeName: '',
          demandNature: '',
          personCount: null,
          xqNos: '', // 续签工号（逗号分隔）
          workDays: null,
          startDate: '',
          endDate: '',
          serviceProject: '',
          attachment: '',
        },
      ]
      this.applicantIds = ''
      this.applicantList = []
      this.model.applicantId = '' // 重置校验字段
      // 重置动态流程节点
      this.processNodeList = []
      this.nodeObjList = []
      // 打开弹窗时默认取当前登录用户的部门和工号
      const perInfo = Vue.ls.get('perInfo') || {}
      if (perInfo.dept) {
        this.model.deptId = perInfo.dept
        this.model.deptName = perInfo.deptName || ''
      }
      // 申请人默认当前登录账号
      if (perInfo.no) {
        this.applicantIds = perInfo.no
        this.applicantList = [
          {
            userId: perInfo.id || '',
            userName: perInfo.name || '',
            userCode: perInfo.no,
          },
        ]
        this.model.applicantId = perInfo.no
      }
      this.loadProcessNodes()
    },
    /**
     * 申请人选择变更处理
     * @param {string} value - 选择值（逗号分隔）
     * @param {Array} rows - 选择的人员列表
     * @returns {void}
     */
    handleXqrChange(value, rows) {
      this.applicantIds = value
      this.applicantList = (rows || []).map((item) => ({
        userId: item.id || '',
        userName: item.name || '',
        userCode: item.no || '',
      }))
      // 更新 model.applicantId 以触发校验
      this.model.applicantId = value || ''
      // 手动触发校验（因为 v-model 绑定的是 applicantIds 而不是 model.applicantId）
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.validateField('applicantId')
      })
    },
    /**
     * 移除申请人 tag
     * @param {Event} event - 事件对象
     * @param {string} userCode - 申请人工号
     * @returns {void}
     */
    handleApplicantClose(event, userCode) {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      this.applicantList = this.applicantList.filter((item) => item.userCode !== userCode)
      this.applicantIds = this.applicantList
        .map((item) => item.userCode)
        .filter(Boolean)
        .join(',')
      this.model.applicantId = this.applicantIds
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.validateField('applicantId')
      })
    },
    /**
     * 新增需求项
     * @returns {void}
     */
    addDemandRow() {
      this.demandRows.push({
        workType: '',
        workTypeName: '',
        demandNature: '',
        personCount: null,
        xqNos: '', // 续签工号（逗号分隔）
        workDays: null,
        startDate: '',
        endDate: '',
        serviceProject: '',
        attachment: '',
      })
    },
    /**
     * 删除需求项
     * @param {number} idx - 需求项索引
     * @returns {void}
     */
    removeDemandRow(idx) {
      this.demandRows.splice(idx, 1)
    },
    /**
     * 复制需求项
     * @param {number} idx - 需求项索引
     * @returns {void}
     */
    duplicateDemand(idx) {
      const row = this.demandRows[idx]
      const newRow = JSON.parse(JSON.stringify(row))
      this.demandRows.splice(idx + 1, 0, newRow)
    },
    /**
     * 需求工种选择变更处理：workType 存 id，workTypeName 存中文名称
     * @param {Object} row - 需求项行数据
     * @param {string} value - 选中的工种ID
     * @returns {void}
     */
    handleWorkTypeChange(row, value) {
      const matched = this.workTypeOptions.find((item) => item.value === value)
      row.workTypeName = matched ? matched.label : ''
    },
    /**
     * 需求性质变更：切换时清空人数及续签人员，选续签时加载该部门在职临时工
     * @param {Object} row - 需求项行数据
     * @param {string} value - 需求性质
     * @returns {void}
     */
    handleDemandNatureChange(row, value) {
      row.personCount = null
      row.xqNos = ''
      if (value === '续签') {
        this.loadRenewWorkers(this.model.deptId)
      }
    },
    /**
     * 加载续签可选临时工（需求部门下的在职人员，数据来源临时工档案）
     * @param {string} deptId - 需求部门ID
     * @returns {void}
     */
    loadRenewWorkers(deptId) {
      if (!deptId) {
        this.renewWorkerOptions = []
        this.renewWorkerDeptId = ''
        return
      }
      // 同一部门已加载过则不重复请求
      if (this.renewWorkerDeptId === deptId) return
      this.renewWorkerDeptId = deptId
      this.renewWorkerLoading = true
      getAction('/lsggl/tempWorkerArchive/list', {
        name: '',
        workerCode: '',
        deptId: deptId,
        entryDate: '',
        status: '0', // 在职
        leaveDate: '',
        pageNo: 1,
        pageSize: 9999,
      })
        .then((res) => {
          if (res.success) {
            const result = res.result || {}
            this.renewWorkerOptions = result.records || (Array.isArray(result) ? result : [])
          } else {
            this.renewWorkerDeptId = ''
            this.renewWorkerOptions = []
            this.$message.warning(res.message || '临时工人员加载失败')
          }
        })
        .catch(() => {
          this.renewWorkerDeptId = ''
          this.renewWorkerOptions = []
        })
        .finally(() => {
          this.renewWorkerLoading = false
        })
    },
    /**
     * 获取续签工号数组（下拉 multiple 绑定值，由 xqNos 拆分）
     * @param {Object} row - 需求项行数据
     * @returns {Array} 续签工号列表
     */
    getXqNoList(row) {
      return row.xqNos ? row.xqNos.split(',').filter(Boolean) : []
    },
    /**
     * 续签人员选择变更：同步续签工号与人数
     * @param {Object} row - 需求项行数据
     * @param {Array} codes - 选中的续签工号列表
     * @returns {void}
     */
    handleRenewWorkerChange(row, codes) {
      const xqNoList = (codes || []).filter(Boolean)
      row.xqNos = xqNoList.join(',')
      // 人数等于续签工号数量
      row.personCount = xqNoList.length
      row.allocatedCount = xqNoList.length
    },
    /**
     * 判断节点是否为抄送节点（nodeProperties: 1=审批, 2=抄送）
     * @param {Object} node - 节点对象
     * @returns {boolean}
     */
    isCcNode(node) {
      return node && Number(node.nodeProperties) === 2
    },
    /**
     * 判断节点是否为 kjSprType 类型节点（users 为 null 时展示 kjSprType_dictText）
     * @param {Object} node - 节点对象
     * @returns {boolean}
     */
    isKjSprTypeNode(node) {
      if (!node) return false
      return node.users === null && node.kjSprType_dictText
    },
    /**
     * 判断节点是否显示添加审批人按钮（isselfSelect===1 或 sprScope===4）
     * @param {Object} node - 节点对象
     * @returns {boolean}
     */
    hasSprScope(node) {
      if (!node) return false
      return Number(node.isselfSelect) === 1 || Number(node.sprScope) === 4
    },
    /**
     * 判断节点是否为空级审批节点（直属主管/直属经理/直属总监，依据 kjSprType 判断）
     */
    isLeaderNode(node) {
      if (!node) return false
      const kjSprType = this.getNodeKjSprType(node)
      return kjSprType !== null && kjSprType !== undefined && kjSprType !== ''
    },
    /**
     * 获取节点的空级审批类型 kjSprType（优先取外层，兼容内层 customProcessNodeConfiguration）
     */
    getNodeKjSprType(node) {
      if (!node) return ''
      if (node.kjSprType != null && node.kjSprType !== '') return node.kjSprType
      const inner = node.customProcessNodeConfiguration
      return inner && inner.kjSprType != null && inner.kjSprType !== '' ? inner.kjSprType : ''
    },
    /**
     * 判断节点的审批人是否可编辑（可删除接口返回人员、可自选添加）
     */
    canEditApprovers(node) {
      return this.hasSprScope(node) || this.isLeaderNode(node)
    },
    /**
     * 从节点配置中提取默认人员（users/roles/departments 合并去重）
     * @param {Object} node - 节点对象
     * @returns {Array} 默认人员列表
     */
    extractDefaultPersons(node) {
      const list = []
      const addItems = (arr, idKey, nameKey) => {
        if (!Array.isArray(arr)) return
        arr.forEach((item) => {
          const ids = (item[idKey] || '').toString().split(',').filter(Boolean)
          const names = (item[nameKey] || '').toString().split(',').filter(Boolean)
          ids.forEach((id, idx) => {
            list.push({ id: id.trim(), name: (names[idx] || id).trim() })
          })
        })
      }
      addItems(node.users, 'chooseObjects', 'chooseObjectsName')
      addItems(node.roles, 'chooseObjects', 'chooseObjectsName')
      addItems(node.departments, 'chooseObjects', 'chooseObjectsName')
      // 空级审批节点（直属主管/直属经理/直属总监）：后端解析出的人员在节点外层 chooseObjects/chooseObjectsName，可能多人逗号分隔
      if (list.length === 0 && this.isLeaderNode(node)) {
        const ids = (node.chooseObjects || '')
          .toString()
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        const names = (node.chooseObjectsName || '')
          .toString()
          .split(',')
          .map((s) => s.trim())
        ids.forEach((id, idx) => {
          list.push({ id, name: names[idx] || id })
        })
      }
      // 去重
      const map = new Map()
      list.forEach((item) => {
        if (!map.has(item.id)) map.set(item.id, item)
      })
      return Array.from(map.values())
    },
    /**
     * 加载流程节点列表
     * @returns {void}
     */
    loadProcessNodes() {
      const perInfo = Vue.ls.get('perInfo') || {}
      const dept = this.model.deptId || perInfo.dept || ''
      const no = perInfo.no || ''
      if (!dept) {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      this.processNodesLoading = true
      getAction(this.url.getLcjdList, {
        sqmkCode: this.sqmkCode,
        dept: dept,
        no: no,
      })
        .then((res) => {
          if (res.success && Array.isArray(res.result)) {
            // 按 px 升序排列
            const list = res.result.slice().sort((a, b) => Number(a.px) - Number(b.px))
            this.processNodeList = list
            // 初始化每个节点的已选人员（提取默认人员）
            this.nodeObjList = list.map((node) => {
              const defaultPersons = this.extractDefaultPersons(node)
              return {
                arr: defaultPersons,
                str: defaultPersons.map((p) => p.name).join(','),
              }
            })
          } else {
            this.processNodeList = []
            this.nodeObjList = []
            this.$message.warning(res.message || '没有匹配到审批模板')
          }
        })
        .catch(() => {
          this.processNodeList = []
          this.nodeObjList = []
        })
        .finally(() => {
          this.processNodesLoading = false
        })
    },
    /**
     * 选择审批人/抄送人（追加合并，不覆盖默认人员）
     * @param {number} index - 节点索引
     * @param {string} value - 选择值
     * @param {Array} rows - 选择的人员列表
     * @returns {void}
     */
    handleSelectValue(index, value, rows) {
      if (this.nodeObjList[index]) {
        const existingArr = this.nodeObjList[index].arr || []
        const map = new Map()
        existingArr.forEach((item) => map.set(item.id, item))
        rows.forEach((item) => {
          if (!map.has(item.id)) {
            map.set(item.id, item)
          }
        })
        const mergedArr = Array.from(map.values())
        this.nodeObjList[index].arr = mergedArr
        this.nodeObjList[index].str = mergedArr.map((p) => p.name).join(',')
      }
    },
    /**
     * 移除审批人/抄送人 tag
     * @param {Event} event - 事件对象
     * @param {number} index - 节点索引
     * @param {string} id - 人员ID
     * @returns {void}
     */
    handleEmployeeTagClose(event, index, id) {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      if (this.nodeObjList[index]) {
        this.nodeObjList[index].arr = this.nodeObjList[index].arr.filter((item) => item.id != id)
        this.nodeObjList[index].str = this.nodeObjList[index].arr.map((item) => item.name).join(',')
      }
    },
    /**
     * 头像文字（取最后一个字）
     * @param {string} name - 姓名
     * @returns {string}
     */
    getAvatarText(name) {
      if (!name) return '?'
      const trimmed = String(name).trim()
      return trimmed.charAt(trimmed.length - 1).toUpperCase()
    },
    /**
     * 组装流程节点数据，用于提交
     * @returns {Array|null} 流程节点DTO列表
     */
    buildProcessDTOList() {
      if (!this.processNodeList || !this.processNodeList.length) return null
      return this.processNodeList.map((node, idx) => {
        const nodeCopy = JSON.parse(JSON.stringify(node))
        // 对于需要自选的节点，将选中的审批人写到节点外层
        if (this.canEditApprovers(node) && this.nodeObjList[idx]) {
          const selectedPersons = this.nodeObjList[idx].arr
          if (selectedPersons && selectedPersons.length > 0) {
            nodeCopy.chooseObjects = selectedPersons.map((p) => p.id).join(',')
            nodeCopy.chooseObjectsName = selectedPersons.map((p) => p.name).join(',')
            nodeCopy.sprScopeName = node.nodeName || ''
          }
        }
        return nodeCopy
      })
    },
    /**
     * 获取人员列表字段值
     * @param {Array} rows - 人员列表
     * @param {string} fieldName - 字段名
     * @returns {string} 字段值（逗号分隔）
     */
    getEmployeeRowValues(rows, fieldName) {
      return (rows || [])
        .map((item) => item[fieldName])
        .filter(Boolean)
        .join(',')
    },
    /**
     * 确认提交
     * @returns {void}
     */
    handleOk() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        // 校验需求项数量
        if (this.demandRows.length === 0) {
          this.$message.warning('请至少添加一个需求项')
          return
        }
        // 校验必填项及日期逻辑
        for (let i = 0; i < this.demandRows.length; i++) {
          const row = this.demandRows[i]
          const itemNum = i + 1
          if (!row.workType) {
            this.$message.warning(`需求项${itemNum}：请选择需求工种`)
            return
          }
          if (!row.demandNature) {
            this.$message.warning(`需求项${itemNum}：请选择需求性质`)
            return
          }
          if (row.demandNature === '续签') {
            if (!row.xqNos) {
              this.$message.warning(`需求项${itemNum}：请选择续签人员`)
              return
            }
          } else if (row.personCount === null || row.personCount === undefined || row.personCount === '') {
            this.$message.warning(`需求项${itemNum}：请输入人数`)
            return
          }
          if (row.startDate && row.endDate && row.startDate > row.endDate) {
            this.$message.warning(`需求项${itemNum}：开始日期不能晚于结束日期`)
            return
          }
        }
        // 校验审批流程节点
        let allValid = true
        this.processNodeList.forEach((node, idx) => {
          if (this.canEditApprovers(node) && this.nodeObjList[idx] && this.nodeObjList[idx].arr.length === 0) {
            this.$message.warning(`请选择「${node.nodeName}」的${this.isCcNode(node) ? '抄送' : '审批'}人`)
            allValid = false
          }
        })
        if (!allValid) return
        this.confirmLoading = true
        // 动态流程节点数据
        const processDTOList = this.buildProcessDTOList()
        const perInfo = Vue.ls.get('perInfo') || {}
        const formData = {
          deptId: this.model.deptId || '',
          deptName: this.model.deptName || '',
          applicantId: this.getEmployeeRowValues(this.applicantList, 'userId'),
          applicantName: this.getEmployeeRowValues(this.applicantList, 'userName'),
          applicantCode: this.getEmployeeRowValues(this.applicantList, 'userCode'),
          createByNo: perInfo.no || '',
          itemList: this.demandRows.map((r) => ({
            workType: r.workType || '',
            workTypeName: r.workTypeName || '',
            demandNature: r.demandNature || '',
            personCount: r.personCount || 1,
            allocatedCount: r.allocatedCount,
            xqNos: r.xqNos || '',
            workDays: r.workDays || 1,
            startDate: r.startDate || '',
            endDate: r.endDate || '',
            serviceProject: r.serviceProject || '',
            attachment: r.attachment || '',
          })),
          customProcessConfigurationDTOList: processDTOList && processDTOList.length > 0 ? processDTOList : [],
        }
        postAction('/lsggl/tempWorkerApply/add', formData)
          .then((res) => {
            if (res.success) {
              this.$message.success('申请已提交')
              this.visible = false
              this.$emit('ok')
            } else {
              this.$message.warning(res.message || '提交失败')
            }
          })
          .catch(() => {
            this.$message.error('提交失败')
          })
          .finally(() => {
            this.confirmLoading = false
          })
      })
    },
    /**
     * 取消操作
     * @returns {void}
     */
    handleCancel() {
      this.visible = false
      this.queryDeptPath = [] // 清空需求部门路径
      this.demandRows = []
      this.workTypeOptions = [] // 清空需求工种选项
      this.workTypeLoading = false
      this.renewWorkerOptions = [] // 清空续签人员列表
      this.renewWorkerDeptId = ''
      this.renewWorkerLoading = false
      this.applicantIds = ''
      this.applicantList = []
      this.model.applicantId = '' // 重置校验字段
      this.processNodeList = []
      this.nodeObjList = []
    },
    /**
     * 加载组织架构树（公司与部门）
     * @returns {void}
     */
    loadOrgTree() {
      getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 })
        .then((res) => {
          const roots = res && res.success && Array.isArray(res.result) ? res.result : []
          const rawCompanyList = roots.length && Array.isArray(roots[0].children) ? roots[0].children : []
          // 清洗数据，确保每个节点的 children 都是有效数组
          this.queryDeptOptions = this.cleanTreeData(rawCompanyList)
        })
        .catch(() => {
          this.queryDeptOptions = []
          this.$message.error('组织架构加载失败，请稍后重试')
        })
    },
    /**
     * 递归清洗树形数据，确保每个节点的 children 都是数组
     * @param {Array} nodes - 节点数组
     * @returns {Array} 清洗后的节点数组
     */
    cleanTreeData(nodes) {
      if (!Array.isArray(nodes)) return []
      return nodes.map((node) => {
        const cleaned = { ...node }
        // 确保 children 是数组，如果不存在或无效则设为空数组
        if (!Array.isArray(cleaned.children)) {
          cleaned.children = []
        } else {
          cleaned.children = this.cleanTreeData(cleaned.children)
        }
        return cleaned
      })
    },
    /**
     * 查询条件-部门变更处理
     * @param {Array} value - 级联选择的路径数组
     * @param {Array} selectedOptions - 选中的选项列表
     * @returns {void}
     */
    handleQueryDeptChange(value, selectedOptions) {
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      this.queryDeptPath = path
      this.model.deptId = path[path.length - 1] || ''
      // 获取部门名称
      if (selectedOptions && selectedOptions.length > 0) {
        const lastOption = selectedOptions[selectedOptions.length - 1]
        this.model.deptName = lastOption.name || ''
      }
      // 部门变更后清空各需求项已选工种，并重新加载工种选项
      this.demandRows.forEach((row) => {
        row.workType = ''
        row.workTypeName = ''
        // 续签人员属于原部门，需一并清空
        if (row.demandNature === '续签') {
          row.xqNos = ''
          row.personCount = null
          row.allocatedCount = null
        }
      })
      this.loadWorkTypeOptions(this.model.deptId)
      // 清空续签人员列表缓存，下次展开时按新部门重新加载
      this.renewWorkerOptions = []
      this.renewWorkerDeptId = ''
      // 手动触发校验（因为 v-model 绑定的是 queryDeptPath 而不是 model.deptId）
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.validateField('deptId')
      })
    },
    /**
     * 加载需求工种选项（根据需求部门查询子序列）
     * @param {string} deptId - 部门ID
     * @returns {void}
     */
    loadWorkTypeOptions(deptId) {
      this.workTypeOptions = []
      if (!deptId) {
        this.workTypeLoading = false
        return
      }
      this.workTypeLoading = true
      getAction('/hrJobSequence/hrJobSequence/getSequencesByDept', {
        deptId,
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 99999,
      })
        .then((res) => {
          const rows = Array.isArray(res) ? res : (res && res.result) || []
          this.workTypeOptions = rows.map((item) => ({ label: item.postName, value: item.id }))
        })
        .catch(() => {
          this.workTypeOptions = []
        })
        .finally(() => {
          this.workTypeLoading = false
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../temporary-worker-theme.less';

/deep/ .ant-modal-body {
  max-height: 700px;
  overflow-y: auto;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(@v-primary-rgb, 0.7);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: @v-gradient-blue;
    border-radius: 2px;
  }
}

.demand-block {
  border: 1px dashed @v-border;
  border-radius: 10px;
  padding: 14px 16px;
  background: #fff;
  margin-bottom: 16px;
}

.demand-add-btn {
  margin-top: 12px;
  text-align: center;
}

.demand-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demand-card {
  border: 1px solid @v-border;
  border-radius: 8px;
  padding: 12px 14px;

  /deep/ .ant-form-item {
    margin-bottom: 0px;
  }
}

.demand-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(45, 120, 255, 0.18);
}

.demand-title {
  font-size: 13px;
  font-weight: 600;
  color: @v-foreground;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 3px;
    height: 14px;
    background: @v-gradient-blue;
    border-radius: 2px;
  }
}

.demand-actions {
  display: flex;
  gap: 6px;
}

.danger-btn {
  color: @v-destructive !important;
  &:hover {
    color: darken(@v-destructive, 10%) !important;
  }
}

/* ===== 审批流程时间轴 ===== */
.approval-timeline {
  position: relative;
  padding-left: 0;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 4px;
}
.approval-timeline::-webkit-scrollbar {
  width: 6px;
}
.approval-timeline::-webkit-scrollbar-thumb {
  background: #c7d0e4;
  border-radius: 3px;
}
.approval-timeline::-webkit-scrollbar-track {
  background: transparent;
}
.timeline-node {
  position: relative;
  padding-left: 22px;
  padding-bottom: 16px;
}
.timeline-node:last-child {
  padding-bottom: 0;
}
.timeline-node:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 12px;
  bottom: -4px;
  width: 2px;
  background: #e6e8eb;
  border-radius: 1px;
}
.timeline-dot {
  position: absolute;
  left: 0;
  top: 12px;
  width: 12px;
  height: 12px;
  border: 2px solid #4a7bf7;
  background: #fff;
  border-radius: 50%;
  z-index: 1;
}
.timeline-card {
  background: #f0f4fb;
  border: 1px solid #e3e9f5;
  border-radius: 8px;
  padding: 12px 14px;
}
.timeline-card-title {
  margin-bottom: 10px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.timeline-card-title .node-rule-tag {
  margin: 0;
  font-size: 11px;
  line-height: 18px;
  height: 18px;
  padding: 0 6px;
  font-weight: 500;
}
.approver-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}
.approver-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0 8px 0 4px;
  height: 28px;
  border: 1px solid #d6e0f5;
  border-radius: 14px;
  background: #fff;
  color: #1f2937;
  font-size: 13px;
  line-height: 26px;
}
.approver-tag /deep/ .anticon-close {
  color: #b3b8c2;
  margin-left: 0;
}
.approver-tag /deep/ .anticon-close:hover {
  color: #ff4d4f;
}
.approver-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #4a7bf7;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}
.approver-name {
  color: #1f2937;
  font-size: 13px;
}
.kj-spr-type-text {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 14px;
  border: 1px solid #d6e0f5;
  border-radius: 14px;
  background: #fff;
  color: #1f2937;
  font-size: 13px;
  line-height: 26px;
}
.approver-line /deep/ .j-select-employee-button-only,
.approver-line /deep/ .j-select-approver-button-only {
  display: inline-flex;
  width: auto;
  flex: none;
}
.approver-line /deep/ .j-select-employee-button-only .ant-btn,
.approver-line /deep/ .j-select-approver-button-only .ant-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 12px;
  border: 1px dashed #4a7bf7;
  border-radius: 14px;
  background: #fff;
  color: #4a7bf7;
  font-size: 13px;
  font-weight: 400;
  line-height: 1;
  box-shadow: none;
}
.approver-line /deep/ .j-select-employee-button-only .ant-btn::before,
.approver-line /deep/ .j-select-approver-button-only .ant-btn::before {
  content: '+';
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  margin-right: 2px;
  line-height: 1;
  position: relative;
}
.approver-line /deep/ .j-select-employee-button-only .ant-btn:hover,
.approver-line /deep/ .j-select-employee-button-only .ant-btn:focus,
.approver-line /deep/ .j-select-approver-button-only .ant-btn:hover,
.approver-line /deep/ .j-select-approver-button-only .ant-btn:focus {
  border-color: #2d5fe0;
  color: #2d5fe0;
  background: #f5f8ff;
}
.sqgl-empty-hint {
  text-align: center;
  color: #94a3b8;
  font-size: 12.5px;
  padding: 20px 0;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
}
.approval-spin {
  display: block;
  text-align: center;
  padding: 20px 0;
}
</style>
