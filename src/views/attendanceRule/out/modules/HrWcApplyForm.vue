<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container>
      <a-form-model ref="form" slot="detail" layout="vertical" :model="model" :rules="validatorRules"
        class="wc-apply-form">
        <a-row :gutter="24" class="wc-form-row">
          <!-- ===== 左侧：申请信息 ===== -->
          <a-col :xs="24" :sm="12" class="form-col-left">
            <div class="form-section-title">
              <span>申请信息</span>
            </div>

            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="姓名">
                  <a-input v-model="model.name" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="工号">
                  <a-input v-model="model.no" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="公司">
                  <a-input :value="model.companyId_dictText || perInfo.companyId_dictText || ''" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="部门">
                  <a-input :value="model.dept_dictText || perInfo.dept_dictText || ''" disabled placeholder="自动获取" />
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="外出开始时间" prop="startTime" :required="true">
                  <j-date placeholder="请选择外出开始时间" :disabled="formDisabled" v-model="model.startTime" style="width: 100%"
                    showTime dateFormat="YYYY-MM-DD HH:mm:ss" />
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-model-item label="外出结束时间" prop="endTime" :required="true">
                  <j-date placeholder="请选择外出结束时间" :disabled="formDisabled" v-model="model.endTime" style="width: 100%"
                    showTime dateFormat="YYYY-MM-DD HH:mm:ss" :disabledDate="disabledEndTime" />
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-model-item label="外出地点" prop="wcdd" :required="true">
                  <a-input v-model="model.wcdd" :disabled="formDisabled" placeholder="请输入外出地点" />
                </a-form-model-item>
              </a-col>
              <a-col :span="24">
                <a-form-model-item label="申请原因" prop="sqyy" :required="true">
                  <a-textarea v-model="model.sqyy" :disabled="formDisabled" placeholder="请输入申请原因"
                    :auto-size="{ minRows: 3, maxRows: 5 }" />
                </a-form-model-item>
              </a-col>
              <a-col :span="24">
                <a-form-model-item label="附件">
                  <JUploadList v-model="model.attachmentUrls" :disabled="formDisabled" :buttonVisible="!formDisabled" />
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-col>

          <!-- ===== 右侧：审批流程 ===== -->
          <a-col v-if="!OK_show" :xs="24" :sm="12" class="form-col-right">
            <div class="form-section-title">
              <span>审批流程</span>
            </div>

            <div class="approval-timeline" v-if="title != '详情'">
              <!-- 动态审批节点（新增/编辑模式） -->
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
                      <a-tag v-for="item in nodeObjList[nIndex].arr" :key="item.id" class="approver-tag" :closable="canEditApprovers(node)"
                        @close="handleEmployeeTagClose($event, nIndex, item.id)">
                        <span class="approver-avatar">{{ getAvatarText(item.name) }}</span>
                        <span class="approver-name">{{ item.name }}</span>
                      </a-tag>
                    </template>
                    <span v-else-if="isKjSprTypeNode(node) && !canEditApprovers(node)" class="kj-spr-type-text">
                      {{ node.chooseObjectsName }}
                    </span>
                    <j-select-approver v-if="isLeaderNode(node)" v-model="nodeObjList[nIndex].str"
                      :kj-spr-type="getNodeKjSprType(node)" placeholder="请选择审批人" value-field="name" button-only
                      :button-text="'自选审批人'" :button-icon="''" :button-type="'default'"
                      :disabled="formDisabled" @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
                    <j-select-employee v-else-if="hasSprScope(node)" v-model="nodeObjList[nIndex].str"
                      :placeholder="isCcNode(node) ? '请选择抄送人' : '请选择审批人'" value-field="name" button-only
                      :button-text="isCcNode(node) ? '添加抄送人' : '添加审批人'" :button-icon="''" :button-type="'default'"
                      :disabled="formDisabled" @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <!-- 审批流程时间轴（详情模式） -->
              <approval-timeline :applyId="model.id" :LCdata="model" />
            </div>
          </a-col>

          <a-col v-if="OK_show" :xs="24" :sm="12" class="form-col-right">
            <div class="form-section-title">
              <span>审批意见</span>
            </div>

            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-model-item label="审批意见" prop="reason" :required="true">
                  <a-textarea v-model="model.reason" placeholder="请输入审批意见" :auto-size="{ minRows: 3, maxRows: 5 }" />
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import Vue from 'vue'
import ApprovalTimeline from './ApprovalTimeline'
import { httpAction, getAction } from '@/api/manage'
import moment from 'moment'

export default {
  name: 'HrWcApplyForm',
  components: {
    ApprovalTimeline,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    title: {
      type: String,
      default: '',
      required: false,
    },
    OK_show: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      confirmLoading: false,

      perInfo: {},
      model: {},

      // 流程节点列表（后端返回）
      processNodeList: [],
      // 每个节点对应的审批人/抄送人数据（索引与 processNodeList 对应）
      nodeObjList: [],

      validatorRules: {
        companyId: [{ required: true, message: '请输入公司', trigger: 'blur' }],
        no: [{ required: true, message: '请输入工号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择外出开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择外出结束时间', trigger: 'change' }],
        wcdd: [{ required: true, message: '请输入外出地点', trigger: 'blur' }],
        sqyy: [{ required: true, message: '请输入申请原因', trigger: 'blur' }],
        reason: [{ required: true, message: '请输入审批意见', trigger: 'blur' }],
      },
      url: {
        add: '/hr_wc_application/hrWcApplication/add',
        edit: '/hr_wc_application/hrWcApplication/edit',
        queryById: '/hr_wc_application/hrWcApplication/queryById',
        // 流程节点配置接口
        getLcjdList: '/process/customProcessConfiguration/getLcjdList'
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  watch: {
    'model.startTime': function () {
      // this.calcApplyHours()
    },
    'model.endTime': function () {
      // this.calcApplyHours()
    },
  },
  created() {
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    disabledEndTime(current) {
      if (!this.model.startTime) {
        return false
      }
      // 禁用早于开始时间的日期
      return current && current < moment(this.model.startTime).startOf('day')
    },
    calcApplyHours() {
      if (this.model.startTime && this.model.endTime) {
        const start = new Date(this.model.startTime).getTime()
        const end = new Date(this.model.endTime).getTime()
        if (end > start) {
          const hours = (end - start) / 3600000
          this.model.applyHours = Math.max(0.5, Math.round(hours * 10) / 10)
        } else {
          this.model.applyHours = 0
        }
      }
    },
    add() {
      this.edit(this.modelDefault)
    },
    /**
     * 判断节点是否为抄送节点
     * nodeProperties: 1=审批, 2=抄送
     */
    isCcNode(node) {
      return node && Number(node.nodeProperties) === 2
    },
    /**
     * 判断节点是否为 kjSprType 类型节点（users 为 null 时展示 chooseObjectsName）
     */
    isKjSprTypeNode(node) {
      if (!node) return false
      return node.users === null && node.chooseObjectsName
    },
    /**
     * 判断节点是否显示添加审批人按钮
     * isselfSelect 值为 1 或 sprScope 值为 4 时显示添加按钮
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
     * 从节点配置中提取默认人员列表（users / roles / departments 都合并显示）
     */
    extractDefaultPersons(node) {
      const list = []
      const addItems = (arr, idKey, nameKey) => {
        if (!Array.isArray(arr)) return
        arr.forEach(item => {
          const ids = (item[idKey] || '').toString().split(',').filter(Boolean)
          const names = (item[nameKey] || '').toString().split(',').filter(Boolean)
          ids.forEach((id, idx) => {
            list.push({
              id: id.trim(),
              name: (names[idx] || id).trim()
            })
          })
        })
      }
      addItems(node.users, 'chooseObjects', 'chooseObjectsName')
      addItems(node.roles, 'chooseObjects', 'chooseObjectsName')
      addItems(node.departments, 'chooseObjects', 'chooseObjectsName')
      // 空级审批节点（直属主管/直属经理/直属总监）：users 等数组为 null，
      // 后端解析出的人员在节点外层 chooseObjects/chooseObjectsName，可能是多人逗号分隔
      if (list.length === 0 && this.isLeaderNode(node)) {
        const ids = (node.chooseObjects || '').toString().split(',').map(s => s.trim()).filter(Boolean)
        const names = (node.chooseObjectsName || '').toString().split(',').map(s => s.trim())
        ids.forEach((id, idx) => {
          list.push({ id, name: names[idx] || id })
        })
      }
      // 去重
      const map = new Map()
      list.forEach(item => {
        if (!map.has(item.id)) map.set(item.id, item)
      })
      return Array.from(map.values())
    },
    /**
     * 获取流程节点列表（新增/编辑模式调用，详情模式不调用）
     */
    loadProcessNodes() {
      if (this.title === '详情') {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      const dept = this.model.dept || (this.perInfo && this.perInfo.dept) || ''
      if (!dept) {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      getAction(this.url.getLcjdList, {
        sqmkCode: '外出申请',
        dept: dept,
        no: this.perInfo.no
      }).then(res => {
        if (res.success && Array.isArray(res.result)) {
          // 按 px 排序
          const list = res.result.slice().sort((a, b) => Number(a.px) - Number(b.px))
          this.processNodeList = list
          // 初始化每个节点的 obj
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
      })
    },
    edit(record) {
      this.model = Object.assign({}, record)

      // 非审批模式重置审批意见字段
      if (!this.OK_show) {
        this.$set(this.model, 'reason', '')
      }

      this.processNodeList = []
      this.nodeObjList = []

      this.perInfo = Vue.ls.get('perInfo')
      if (!this.model.id) {
        this.model['name'] = this.perInfo.name
        this.model['no'] = this.perInfo.no
        this.model['companyId'] = this.perInfo.companyId
        this.model['dept'] = this.perInfo.dept
        this.model['employeeId'] = this.perInfo.id
      }

      // 加载动态流程节点
      this.loadProcessNodes()

      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    submitForm() {
      const that = this
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 校验每个需要选择审批人的节点是否选择了人员
          let allValid = true
          this.processNodeList.forEach((node, idx) => {
            if (this.canEditApprovers(node) && this.nodeObjList[idx] && this.nodeObjList[idx].arr.length === 0) {
              this.$message.warning(`请选择「${node.nodeName}」的${this.isCcNode(node) ? '抄送' : '审批'}人`)
              allValid = false
            }
          })
          if (!allValid) return

          this.$emit('submit', true)
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }

          // 组装 customProcessConfigurationDTOList：将接口返回的节点数据深拷贝后放入
          // 对于 isselfSelect===1 或 sprScope===4 的节点，将选中的审批人数据写到节点外层
          const customProcessConfigurationDTOList = this.processNodeList.map((node, idx) => {
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
          this.model['customProcessConfigurationDTOList'] = customProcessConfigurationDTOList

          // ===== 真实接口调用（接入时取消注释） =====
          httpAction(httpurl, this.model, method)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              this.$emit('submit', false)
            })
        }
      })
    },
    handleSelectValue(index, value, rows) {
      if (this.nodeObjList[index]) {
        // 将新选择的人员追加到现有列表中，按 id 去重
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

    /**
     * 获取头像文字（取最后一个汉字/字符）
     */
    getAvatarText(name) {
      if (!name) return '?'
      const trimmed = String(name).trim()
      return trimmed.charAt(trimmed.length - 1).toUpperCase()
    },
  },
}
</script>

<style scoped lang="less">
.wc-apply-form {
  min-height: 400px;
}

/* ===== 全局表单项紧致 ===== */
.wc-apply-form /deep/ .ant-form-item {
  margin-bottom: 12px;
}

.wc-apply-form /deep/ .ant-form-item-label {
  padding-bottom: 4px;
  line-height: 20px;
}

.wc-apply-form /deep/ .ant-form-item-label>label {
  color: #555;
  font-size: 13px;
}

.wc-apply-form /deep/ .ant-form-item-required::before {
  color: #ff4d4f;
  font-size: 14px;
  margin-right: 2px;
}

/* ===== 左右两栏布局 ===== */
.wc-form-row {
  display: flex;
  flex-wrap: wrap;
}

.form-col-left {
  border-right: 1px dashed #e6e8eb;
  padding-right: 24px;
}

.form-col-right {
  padding-left: 8px;
}

@media (max-width: 768px) {
  .form-col-left {
    border-right: 0;
    padding-right: 0;
    margin-bottom: 16px;
  }

  .form-col-right {
    padding-left: 0;
  }
}

/* ===== 区块标题 ===== */
.form-section-title {
  position: relative;
  margin: 0 0 16px;
  padding: 0 0 10px;
  border-bottom: 1px solid #e6e8eb;
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}

/* ===== 审批流程时间轴 ===== */
.approval-timeline {
  position: relative;
  padding-left: 0;
  max-height: calc(100vh - 280px);
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

.timeline-dot-light {
  border-color: #c7d0e4;
  background: #fff;
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
}

.approver-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

/* 审批人 tag 样式 */
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

/* 添加审批人按钮样式 */
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

.multi-approval-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #e3e9f5;
}

.multi-approval-label {
  color: #6b7280;
  font-size: 13px;
  white-space: nowrap;
}

.multi-approval-line /deep/ .ant-radio-wrapper {
  font-size: 13px;
  color: #1f2937;
}

.multi-approval-line /deep/ .ant-radio-wrapper-checked .ant-radio-checked .ant-radio-inner {
  border-color: #4a7bf7;
  background: #4a7bf7;
}

.multi-approval-line /deep/ .ant-radio-inner::after {
  background: #fff;
}
</style>
