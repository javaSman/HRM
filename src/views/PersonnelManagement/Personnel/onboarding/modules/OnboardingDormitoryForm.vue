<template>
  <div class="arrival-dormitory-card">
    <div class="arrival-section-title"><a-icon type="home" /><span>入住申请</span></div>
    <a-form-model ref="form" :model="model" :rules="validatorRules" layout="vertical">
      <div class="arrival-field-grid">
        <a-form-model-item label="宿舍区域" prop="qyId">
          <a-select v-model="model.qyId" placeholder="请选择宿舍区域" @change="handleSelectChange('qyId', $event)">
            <a-select-option v-for="item in areaOptions" :title="item" :key="item.id" :value="item.id">{{
              item.name
            }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="宿舍类型" prop="sslxId">
          <a-select v-model="model.sslxId" placeholder="请选择宿舍类型" @change="handleSelectChange('sslxId', $event)">
            <a-select-option v-for="item in typeOptions" :key="item.value" :value="item.value">{{
              item.text
            }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="入住日期" prop="rzrq">
          <j-date v-model="model.rzrq" date-format="YYYY-MM-DD" placeholder="请选择入住日期" style="width: 100%" />
        </a-form-model-item>
        <a-form-model-item label="申请人"><a-input v-model="detail.jbxx.name" disabled /></a-form-model-item>
        <a-form-model-item label="工号"><a-input v-model="detail.jbxx.no" disabled /></a-form-model-item>
        <a-form-model-item label="所属部门"><a-input :value="departmentText" disabled /></a-form-model-item>
        <a-form-model-item label="身份证号"><a-input v-model="detail.jbxx.idCard" disabled /></a-form-model-item>
        <a-form-model-item label="手机号码"><a-input v-model="detail.jbxx.phoneNumber" disabled /></a-form-model-item>
        <a-form-model-item label="申请时间"><a-input v-model="model.sqsj" disabled /></a-form-model-item>
        <a-form-model-item class="arrival-field--span-2" label="入住原因" prop="rzyy">
          <a-input v-model.trim="model.rzyy" placeholder="请输入入住原因" />
        </a-form-model-item>
      </div>
    </a-form-model>
    <!-- 审批流程 -->
    <div class="approval-section">
      <div class="arrival-section-title"><a-icon type="swap" /><span>审批流程</span></div>
      <div class="approval-timeline">
        <div v-for="(node, nIndex) in processNodeList" :key="node.id || nIndex" class="timeline-node">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <div class="timeline-card-title">
              {{ node.nodeName }}
              <a-tag v-if="node.approvalRule === '1' || node.approvalRule === 1" color="orange" class="node-rule-tag">会签</a-tag>
              <a-tag v-if="node.approvalRule === '2' || node.approvalRule === 2" color="red" class="node-rule-tag">或签</a-tag>
            </div>
            <div class="approver-line">
              <template v-if="nodeObjList[nIndex] && nodeObjList[nIndex].arr.length > 0">
                <a-tag
                  v-for="item in nodeObjList[nIndex].arr"
                  :key="item.id"
                  class="approver-tag"
                  :closable="canEditApprovers(node)"
                  @close="handleEmployeeTagClose($event, nIndex, item.id)">
                  <span class="approver-avatar">{{ getAvatarText(item.name) }}</span>
                  <span class="approver-name">{{ item.name }}</span>
                </a-tag>
              </template>
              <span v-else-if="isKjSprTypeNode(node) && !canEditApprovers(node)" class="kj-spr-type-text">
                {{ node.chooseObjectsName }}
              </span>
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
                @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
              <j-select-employee
                v-else-if="hasSprScope(node)"
                v-model="nodeObjList[nIndex].str"
                :placeholder="isCcNode(node) ? '请选择抄送人' : '请选择审批人'"
                value-field="name"
                button-only
                :button-text="isCcNode(node) ? '添加抄送人' : '添加审批人'"
                :button-icon="''"
                :button-type="'default'"
                @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
            </div>
          </div>
        </div>
        <div v-if="!processNodeList.length && !processNodesLoading" class="empty-hint">
          暂无审批流程配置
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'
import { getAction } from '@/api/manage'
import Vue from 'vue'
export default {
  name: 'OnboardingDormitoryForm',
  props: {
    model: { type: Object, required: true },
    detail: { type: Object, required: true },
  },
  data() {
    return {
      areaOptions: [],
      typeOptions: [],
      // 流程节点列表（后端返回）
      processNodeList: [],
      // 每个节点对应的审批人/抄送人数据
      nodeObjList: [],
      processNodesLoading: false,
      url: {
        getLcjdList: '/process/customProcessConfiguration/getLcjdList',
      },
      validatorRules: {
        qyId: [{ required: true, message: '请选择宿舍区域', trigger: 'change' }],
        sslxId: [{ required: true, message: '请选择宿舍类型', trigger: 'change' }],
        rzrq: [{ required: true, message: '请选择入住日期', trigger: 'change' }],
        rzyy: [{ required: true, message: '请输入入住原因', trigger: 'blur' }],
      },
    }
  },
  watch: {
    'detail.jbxx.dept': {
      handler() {
        this.loadProcessNodes()
      },
      immediate: false,
    },
  },
  created() {
    this.initAreaData()
    this.initDictData()
    this.loadProcessNodes()
  },
  computed: {
    departmentText() {
      return this.detail.dept_dictText || this.model.dept || '-'
    },
  },
  methods: {
    handleSelectChange(field, value) {
      if (field === 'qyId') {
        this.model.qy = this.areaOptions.find((item) => item.id === value).name
      } else if (field === 'sslxId') {
        this.model.sslx = this.typeOptions.find((item) => item.value === value).text
      }
    },
    initAreaData() {
      // 获取宿舍区域列表
      getAction('/sqgl/hrmSqglArea/listWithStats', null).then((res) => {
        if (res.success) {
          this.areaOptions = res.result || []
        }
      })
    },
    initDictData() {
      const dictCode = 'hrm_sqgl_apply_dorm_type'
      // 优先从缓存中读取字典配置
      if (getDictItemsFromCache(dictCode)) {
        this.typeOptions = getDictItemsFromCache(dictCode)
        return
      }
      // 根据字典Code, 初始化字典数组
      ajaxGetDictItems(dictCode, null).then((res) => {
        if (res.success) {
          this.typeOptions = res.result
        }
      })
    },
    // ============ 动态流程节点 ============
    /** 判断节点是否为抄送节点（nodeProperties: 1=审批, 2=抄送） */
    isCcNode(node) {
      return node && Number(node.nodeProperties) === 2
    },
    /** 判断节点是否为 kjSprType 类型节点（users 为 null 时展示 chooseObjectsName） */
    isKjSprTypeNode(node) {
      if (!node) return false
      return node.users === null && node.chooseObjectsName
    },
    /** 判断节点是否显示添加审批人按钮 */
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
    /** 从节点配置中提取默认人员列表 */
    extractDefaultPersons(node) {
      const list = []
      const addItems = (arr, idKey, nameKey) => {
        if (!Array.isArray(arr)) return
        arr.forEach((item) => {
          const ids = (item[idKey] || '').toString().split(',').filter(Boolean)
          const names = (item[nameKey] || '').toString().split(',').filter(Boolean)
          ids.forEach((id, idx) => {
            list.push({
              id: id.trim(),
              name: (names[idx] || id).trim(),
            })
          })
        })
      }
      addItems(node.users, 'chooseObjects', 'chooseObjectsName')
      addItems(node.roles, 'chooseObjects', 'chooseObjectsName')
      addItems(node.departments, 'chooseObjects', 'chooseObjectsName')
      // 空级审批节点（直属主管/直属经理/直属总监）：后端解析出的人员在节点外层 chooseObjects/chooseObjectsName，可能多人逗号分隔
      if (list.length === 0 && this.isLeaderNode(node)) {
        const ids = (node.chooseObjects || '').toString().split(',').map((s) => s.trim()).filter(Boolean)
        const names = (node.chooseObjectsName || '').toString().split(',').map((s) => s.trim())
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
    /** 加载流程节点列表 */
    loadProcessNodes() {
      const perInfo = Vue.ls.get('perInfo')
      const dept = (this.detail && this.detail.jbxx && this.detail.jbxx.dept) || this.model.dept || ''
      if (!dept) {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      const sqmkCode = '入住申请'
      this.processNodesLoading = true
      getAction(this.url.getLcjdList, {
        sqmkCode: sqmkCode,
        dept: dept,
        no: perInfo.no,
      })
        .then((res) => {
          if (res.success && Array.isArray(res.result)) {
            const list = res.result.slice().sort((a, b) => Number(a.px) - Number(b.px))
            this.processNodeList = list
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
    /** 选择审批人/抄送人（追加合并） */
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
    /** 移除审批人/抄送人 tag */
    handleEmployeeTagClose(event, index, id) {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      if (this.nodeObjList[index]) {
        this.nodeObjList[index].arr = this.nodeObjList[index].arr.filter((item) => item.id != id)
        this.nodeObjList[index].str = this.nodeObjList[index].arr.map((item) => item.name).join(',')
      }
    },
    /** 头像文字（取最后一个字） */
    getAvatarText(name) {
      if (!name) return '?'
      const trimmed = String(name).trim()
      return trimmed.charAt(trimmed.length - 1).toUpperCase()
    },
    /** 组装流程节点数据，用于提交 */
    buildProcessDTOList() {
      if (!this.processNodeList || !this.processNodeList.length) return null
      return this.processNodeList.map((node, idx) => {
        const nodeCopy = JSON.parse(JSON.stringify(node))
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
    /** 校验流程节点 */
    validateProcessNodes() {
      let allValid = true
      this.processNodeList.forEach((node, idx) => {
        if (this.canEditApprovers(node) && this.nodeObjList[idx] && this.nodeObjList[idx].arr.length === 0) {
          this.$message.warning(
            `请选择「${node.nodeName}」的${this.isCcNode(node) ? '抄送' : '审批'}人`
          )
          allValid = false
        }
      })
      return allValid
    },
    validate(callback) {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          callback(false)
          return
        }
        // 校验流程节点
        if (!this.validateProcessNodes()) {
          callback(false)
          return
        }
        // 将流程节点数据挂载到 model 上，供父组件提交使用
        const processDTOList = this.buildProcessDTOList()
        if (processDTOList && processDTOList.length > 0) {
          this.model['customProcessConfigurationDTOList'] = processDTOList
        } else {
          this.model['customProcessConfigurationDTOList'] = null
        }
        callback(true)
      })
    },
  },
}
</script>

<style lang="less" scoped>
.arrival-dormitory-card {
  padding: 0;
}

.approval-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
}

/* ===== 审批流程时间轴 ===== */
.approval-timeline {
  position: relative;
  padding-left: 0;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 4px;
  margin-top: 12px;
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
  align-items: center;
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

.empty-hint {
  text-align: center;
  color: #94a3b8;
  font-size: 12.5px;
  padding: 20px 0;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
}
</style>
