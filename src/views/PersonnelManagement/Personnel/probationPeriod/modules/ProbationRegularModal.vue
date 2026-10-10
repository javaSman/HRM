<template>
  <j-modal title="发起转正申请" :width="900" :visible="visible" :maskClosable="!submitting" :keyboard="!submitting"
    :bodyStyle="{ padding: '12px 24px' }" @cancel="close">
    <a-form-model ref="form" :model="form" :rules="rules" layout="vertical" class="probation-regular-form">
      <div class="probation-section-title">待转正员工信息</div>
      <div class="probation-info-grid" style="margin-bottom: 10px">
        <div v-for="item in employeeItems" :key="item.label" class="probation-info-item">
          <div class="probation-info-label">{{ item.label }}</div>
          <div class="probation-info-value" :title="formatValue(item.value)">
            {{ formatValue(item.value) }}
          </div>
        </div>
      </div>

      <a-row :gutter="16">
        <a-col :xs="24" :sm="12">
          <a-form-model-item label="计划转正日期" prop="sjzzrq">
            <j-date v-model="form.sjzzrq" date-format="YYYY-MM-DD" placeholder="请选择计划转正日期" style="width: 100%" />
          </a-form-model-item>
        </a-col>
      </a-row>

      <div class="probation-section-title">转正意见</div>
      <a-form-model-item label="意见说明">
        <a-textarea v-model.trim="form.zzyj" :autoSize="{ minRows: 2, maxRows: 4 }" placeholder="请输入转正意见说明" />
      </a-form-model-item>

      <div class="probation-section-title">审批设置</div>
      <div class="approval-timeline">
        <div v-for="(node, nIndex) in processNodeList" :key="node.id || nIndex" class="timeline-node">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <div class="timeline-card-title">
              {{ node.nodeName }}
              <a-tag v-if="node.approvalRule === '1' || node.approvalRule === 1" color="orange"
                class="node-rule-tag">会签</a-tag>
              <a-tag v-if="node.approvalRule === '2' || node.approvalRule === 2" color="red"
                class="node-rule-tag">或签</a-tag>
            </div>
            <div class="approver-line">
              <template v-if="nodeObjList[nIndex] && nodeObjList[nIndex].arr.length > 0">
                <a-tag v-for="item in nodeObjList[nIndex].arr" :key="item.id" class="approver-tag"
                  :closable="canEditApprovers(node)" @close="handleEmployeeTagClose($event, nIndex, item.id)">
                  <span class="approver-avatar">{{ getAvatarText(item.name) }}</span>
                  <span class="approver-name">{{ item.name }}</span>
                </a-tag>
              </template>
              <span v-else-if="isKjSprTypeNode(node) && !canEditApprovers(node)" class="kj-spr-type-text">
                {{ node.kjSprType_dictText }}
              </span>
              <j-select-approver v-if="isLeaderNode(node)" v-model="nodeObjList[nIndex].str"
                :kj-spr-type="getNodeKjSprType(node)" placeholder="请选择审批人" value-field="name" button-only
                button-text="自选审批人" :button-icon="''" :button-type="'default'"
                @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
              <j-select-employee v-else-if="hasSprScope(node)" v-model="nodeObjList[nIndex].str"
                :placeholder="isCcNode(node) ? '请选择抄送人' : '请选择审批人'" value-field="name" button-only
                :button-text="isCcNode(node) ? '添加抄送人' : '添加审批人'" :button-icon="''" :button-type="'default'"
                @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
            </div>
          </div>
        </div>
        <div v-if="!processNodeList.length && !processNodesLoading" class="sqgl-empty-hint">
          暂无审批流程配置
        </div>
      </div>
    </a-form-model>

    <template slot="footer">
      <a-button :disabled="submitting" @click="close">取消</a-button>
      <a-button type="primary" :loading="submitting" :disabled="submitting" @click="handleSubmit">
        提交申请
      </a-button>
    </template>
  </j-modal>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
import Vue from 'vue'

export default {
  name: 'ProbationRegularModal',
  data() {
    return {
      visible: false,
      submitting: false,
      record: {},
      form: {
        sjzzrq: '',
        zzyj: '',
        spr: '',
        csr: ''
      },
      rules: {
        sjzzrq: [{ required: true, message: '请选择计划转正日期', trigger: 'change' }]
      },
      // 动态流程节点
      processNodeList: [],
      nodeObjList: [],
      processNodesLoading: false,
      perInfo: {},
      sqmkCode: '转正申请',
      url: {
        applyPermanent: '/ryManage/hrmSyqgz/applyPermanent',
        getLcjdList: '/process/customProcessConfiguration/getLcjdList'
      }
    }
  },
  computed: {
    employeeItems() {
      return [
        { label: '姓名', value: this.record.xm },
        { label: '公司', value: this.record.companyId_dictText || this.record.companyId },
        { label: '所属部门', value: this.record.dept_dictText || this.record.dept },
        { label: '岗位名称', value: this.record.postId_dictText || this.record.postId },
        { label: '试用期开始', value: this.record.syqkssj },
        { label: '试用期结束', value: this.record.syqjssj }
      ]
    }
  },
  methods: {
    open(record) {
      if (!record || !record.id) {
        this.$message.warning('当前试用期记录不完整，无法发起转正申请')
        return
      }
      this.perInfo = Vue.ls.get('perInfo') || {}
      this.record = record
      this.submitting = false
      this.form = {
        sjzzrq: record.sjzzrq || record.syqjssj || '',
        zzyj: '',
        spr: '',
        csr: ''
      }
      this.processNodeList = []
      this.nodeObjList = []
      this.visible = true
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
      // 加载动态流程节点
      this.loadProcessNodes()
    },
    close() {
      if (this.submitting) {
        return
      }
      this.visible = false
    },
    handleSubmit() {
      if (this.submitting) {
        return
      }
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        // 校验每个需要选择审批人的节点是否选择了人员
        let allValid = true
        this.processNodeList.forEach((node, idx) => {
          if (this.canEditApprovers(node) && this.nodeObjList[idx] && this.nodeObjList[idx].arr.length === 0) {
            this.$message.warning(`请选择「${node.nodeName}」的${this.isCcNode(node) ? '抄送' : '审批'}人`)
            allValid = false
          }
        })
        if (!allValid) return
        this.submitApplication()
      })
    },
    submitApplication() {
      const payload = {
        gh: this.record.gh,
        csr: this.form.csr,
        companyId: this.record.companyId,
        hrmSyqgzId: this.record.id,
        zzyj: this.form.zzyj,
        postRank: this.record.postRank,
        dept: this.record.dept,
        deptPath: this.record.deptPath,
        postId: this.record.postId,
        spr: this.form.spr,
        xm: this.record.xm,
        zt: this.record.zt,
        sjzzrq: this.form.sjzzrq,
        jhzzrq: this.form.sjzzrq,
        syqkssj: this.record.syqkssj,
        syqjssj: this.record.syqjssj,
        createByNo: this.perInfo.no
      }
      // 动态流程节点数据
      const processDTOList = this.buildProcessDTOList()
      if (processDTOList && processDTOList.length > 0) {
        payload.customProcessConfigurationDTOList = processDTOList
      }
      this.submitting = true
      postAction(this.url.applyPermanent, payload).then(res => {
        if (!res || !res.success) {
          throw new Error((res && res.message) || '转正申请提交失败')
        }
        this.$message.success(res.message || '转正申请提交成功')
        this.visible = false
        this.$emit('ok')
      }).catch(error => {
        this.$message.error(error.message || '转正申请提交失败，请稍后重试')
      }).finally(() => {
        this.submitting = false
      })
    },
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    // ===== 动态流程节点方法 =====
    isCcNode(node) {
      return node && Number(node.nodeProperties) === 2
    },
    isKjSprTypeNode(node) {
      if (!node) return false
      return node.users === null && node.kjSprType_dictText
    },
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
    extractDefaultPersons(node) {
      const list = []
      const addItems = (arr, idKey, nameKey) => {
        if (!Array.isArray(arr)) return
        arr.forEach(item => {
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
        const ids = (node.chooseObjects || '').toString().split(',').map(s => s.trim()).filter(Boolean)
        const names = (node.chooseObjectsName || '').toString().split(',').map(s => s.trim())
        ids.forEach((id, idx) => {
          list.push({ id, name: names[idx] || id })
        })
      }
      const map = new Map()
      list.forEach(item => { if (!map.has(item.id)) map.set(item.id, item) })
      return Array.from(map.values())
    },
    loadProcessNodes() {
      const dept = this.record.dept || ''
      if (!dept) {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      this.processNodesLoading = true

      getAction(this.url.getLcjdList, {
        sqmkCode: this.sqmkCode,
        dept: dept,
        no: this.perInfo.no
      }).then(res => {
        if (res.success && Array.isArray(res.result)) {
          const list = res.result.slice().sort((a, b) => Number(a.px) - Number(b.px))
          this.processNodeList = list
          this.nodeObjList = list.map(node => {
            const defaultPersons = this.extractDefaultPersons(node)
            return {
              arr: defaultPersons,
              str: defaultPersons.map(p => p.name).join(',')
            }
          })
        } else {
          this.processNodeList = []
          this.nodeObjList = []
          this.$message.warning(res.message || '没有匹配到审批模板')
        }
      }).catch(() => {
        this.processNodeList = []
        this.nodeObjList = []
      }).finally(() => {
        this.processNodesLoading = false
      })
    },
    handleSelectValue(index, value, rows) {
      if (this.nodeObjList[index]) {
        const existingArr = this.nodeObjList[index].arr || []
        const map = new Map()
        existingArr.forEach(item => map.set(item.id, item))
        rows.forEach(item => {
          if (!map.has(item.id)) {
            map.set(item.id, item)
          }
        })
        const mergedArr = Array.from(map.values())
        this.nodeObjList[index].arr = mergedArr
        this.nodeObjList[index].str = mergedArr.map(p => p.name).join(',')
      }
    },
    handleEmployeeTagClose(event, index, id) {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      if (this.nodeObjList[index]) {
        this.nodeObjList[index].arr = this.nodeObjList[index].arr.filter(item => item.id != id)
        this.nodeObjList[index].str = this.nodeObjList[index].arr.map(item => item.name).join(',')
      }
    },
    getAvatarText(name) {
      if (!name) return '?'
      const trimmed = String(name).trim()
      return trimmed.charAt(trimmed.length - 1).toUpperCase()
    },
    buildProcessDTOList() {
      if (!this.processNodeList || !this.processNodeList.length) return null
      return this.processNodeList.map((node, idx) => {
        const nodeCopy = JSON.parse(JSON.stringify(node))
        if (this.canEditApprovers(node) && this.nodeObjList[idx]) {
          const selectedPersons = this.nodeObjList[idx].arr
          if (selectedPersons && selectedPersons.length > 0) {
            nodeCopy.chooseObjects = selectedPersons.map(p => p.id).join(',')
            nodeCopy.chooseObjectsName = selectedPersons.map(p => p.name).join(',')
            nodeCopy.sprScopeName = node.nodeName || ''
          }
        }
        return nodeCopy
      })
    }
  }
}
</script>

<style scoped lang="less">
@import './probation-dialogs.less';

.probation-regular-form {
  /deep/ .ant-form-item {
    margin-bottom: 12px;
  }

  /deep/ .ant-form-item-label {
    line-height: 28px;
  }

  /deep/ .ant-form-item-label>label {
    font-size: 13px;
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

.sqgl-empty-hint {
  text-align: center;
  color: #94a3b8;
  font-size: 12.5px;
  padding: 20px 0;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
}
</style>
