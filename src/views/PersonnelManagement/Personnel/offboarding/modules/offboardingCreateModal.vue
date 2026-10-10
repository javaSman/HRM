<!--
  发起离职申请模态框组件

  功能说明：
  - 用于创建新的离职申请
  - 包含员工选择、离职日期、离职原因等信息
  - 支持选择审批人和抄送人
  - 提交后状态为「审批中」

  组件属性：
  - visible: 控制模态框显示/隐藏

  事件：
  - ok: 提交成功后触发，通知父组件刷新列表

 
-->
<template>
  <a-modal
    :title="title"
    :width="700"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :maskClosable="false"
  >
    <a-spin :spinning="confirmLoading">
      <a-form-model ref="form" :model="model" :rules="validatorRules" layout="vertical">
        <!-- 第一行：离职员工和工号 -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item label="离职员工" prop="lzyg">
              <j-select-employee
                v-model="model.lzyg"
                placeholder="请选择员工"
                :multiple="false"
                valueField="id"
                buttonText="选择"
                @change="handleEmployeeChange"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="工号">
              <a-input v-model="model.gh" disabled />
            </a-form-model-item>
          </a-col>
        </a-row>

        <!-- 第二行：所属部门和岗位名称 -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item label="所属部门">
              <a-input v-model="model.dept_dictText" disabled />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="岗位名称">
              <a-input v-model="model.postId_dictText" disabled />
            </a-form-model-item>
          </a-col>
        </a-row>

        <!-- 第三行：预计离职日期和离职原因 -->
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item label="预计离职日期" prop="yjlzrq">
              <a-date-picker
                v-model="model.yjlzrq"
                placeholder="请选择预计离职日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                :disabledDate="disabledDate"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="离职原因" prop="lzyy">
              <a-select v-model="model.lzyy" placeholder="请选择离职原因" allowClear>
                <a-select-option value="个人发展">个人发展</a-select-option>
                <a-select-option value="薪资待遇">薪资待遇</a-select-option>
                <a-select-option value="家庭原因">家庭原因</a-select-option>
                <a-select-option value="工作环境">工作环境</a-select-option>
                <a-select-option value="职业规划">职业规划</a-select-option>
                <a-select-option value="健康原因">健康原因</a-select-option>
                <a-select-option value="其他">其他</a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <!-- 具体说明 -->
        <a-form-model-item label="具体说明" prop="jtsm">
          <a-textarea v-model="model.jtsm" placeholder="请输入具体说明" :rows="3" :maxLength="500" />
        </a-form-model-item>

        <!-- 审批流程区域 -->
        <div class="sqgl-sec-title" style="margin-top: 18px">审批流程</div>
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
                <!-- 已选人员 tag 列表 -->
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
                  @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
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
                  @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
              </div>
            </div>
          </div>
          <div v-if="!processNodeList.length && !processNodesLoading" class="sqgl-empty-hint">
            暂无审批流程配置
          </div>
        </div>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
import moment from 'moment'
import Vue from 'vue'

export default {
  name: 'offboardingCreateModal',
  data() {
    return {
      title: '发起离职申请', // 模态框标题
      visible: false, // 模态框显示状态
      confirmLoading: false, // 提交按钮加载状态
      model: {
        lzyg: '', // 提休日期/员工ID
        gh: '', // 工号
        xm: '', // 姓名
        companyId: '', // 公司ID
        companyId_dictText: '', // 公司名称
        dept: '', // 部门ID
        dept_dictText: '', // 部门名称
        postId: '', // 岗位ID
        postId_dictText: '', // 岗位名称
        yjlzrq: '', // 预计离职日期
        lzyy: '', // 离职原因
        jtsm: '', // 备注/具体说明
      },
      // 流程节点相关
      processNodeList: [],
      nodeObjList: [],
      processNodesLoading: false,
      sqmkCode: '离职申请',
      currentUserDept: '',
      currentUserNo: '',
      validatorRules: {
        lzyg: [{ required: true, message: '请选择离职员工!', trigger: 'change' }],
        yjlzrq: [{ required: true, message: '请选择预计离职日期!', trigger: 'change' }],
        lzyy: [{ required: true, message: '请选择离职原因!', trigger: 'change' }],
      },
      url: {
        add: '/ryManage/hrmLzgl/add', // 新增离职申请接口地址
        getLcjdList: '/process/customProcessConfiguration/getLcjdList',
      },
    }
  },
  methods: {
    /**
     * 打开模态框
     * 初始化表单数据
     */
    open() {
      this.visible = true
      // 重置表单数据
      this.model = {
        lzyg: '',
        gh: '',
        xm: '',
        companyId: '',
        companyId_dictText: '',
        dept: '',
        dept_dictText: '',
        postId: '',
        postId_dictText: '',
        yjlzrq: '',
        lzyy: '',
        jtsm: '',
      }
      // 重置流程节点
      this.processNodeList = []
      this.nodeObjList = []
      // 打开弹窗时用当前登录用户的部门和工号加载流程节点
      const perInfo = Vue.ls.get('perInfo') || {}
      if (perInfo.dept || perInfo.no) {
        this.currentUserDept = perInfo.dept || ''
        this.currentUserNo = perInfo.no || ''
        this.$nextTick(() => {
          this.loadProcessNodes(true)
        })
      }
    },

    /**
     * 关闭模态框
     * 重置所有状态
     */
    close() {
      this.visible = false
      this.confirmLoading = false
      // 重置表单数据
      this.model = {
        lzyg: '',
        gh: '',
        xm: '',
        companyId: '',
        companyId_dictText: '',
        dept: '',
        dept_dictText: '',
        postId: '',
        postId_dictText: '',
        yjlzrq: '',
        lzyy: '',
        jtsm: '',
      }
      this.processNodeList = []
      this.nodeObjList = []
    },

    /**
     * 取消按钮点击事件
     */
    handleCancel() {
      this.close()
    },

    /**
     * 禁用日期选择
     * 不能选择今天之前的日期
     * @param {Moment} current - 当前日期
     * @returns {boolean} 是否禁用
     */
    disabledDate(current) {
      return current && current < moment().startOf('day')
    },

    /**
     * 员工选择变化事件
     * 自动填充员工的基本信息
     * @param {String} value - 员工ID
     * @param {Array} rows - 员工数据列表
     */
    handleEmployeeChange(value, rows) {
      if (rows && rows.length > 0) {
        const employee = rows[0]
        this.model.gh = employee.no || ''
        this.model.xm = employee.name || ''
        this.model.companyId = employee.companyId || ''
        this.model.companyId_dictText = employee.companyId_dictText || ''
        this.model.dept = employee.dept || ''
        this.model.dept_dictText = employee.dept_dictText || ''
        this.model.postId = employee.postId || ''
        this.model.postId_dictText = employee.postId_dictText || ''
        this.model.postRank = employee.postRank || ''
        this.model.postRank_dictText = employee.postRank_dictText || ''
        this.model.sbzh = employee.sbdnh || '' //社保账号
        this.model.gjjzh = employee.gjjdhh || '' ///公积金账号
        this.model.rzsj = employee.entryDate || '' //入职时间
        // 选择员工后重新加载流程节点
        if (this.model.dept && this.model.gh) {
          this.$nextTick(() => {
            this.loadProcessNodes()
          })
        }
      } else {
        // 清空基本信息
        this.model.gh = ''
        this.model.xm = ''
        this.model.companyId = ''
        this.model.companyId_dictText = ''
        this.model.dept = ''
        this.model.dept_dictText = ''
        this.model.postId = ''
        this.model.postId_dictText = ''
        this.model.postRank = ''
        this.model.sbzh = '' //社保账号
        this.model.gjjzh = '' ///公积金账号
        this.model.rzsj = '' //入职时间
        // 清空员工后重置流程节点
        this.processNodeList = []
        this.nodeObjList = []
      }
    },

    /** 判断节点是否为抄送节点（nodeProperties: 1=审批, 2=抄送） */
    isCcNode(node) {
      return node && Number(node.nodeProperties) === 2
    },
    /** 判断节点是否为 kjSprType 类型节点（users 为 null 时展示 kjSprType_dictText） */
    isKjSprTypeNode(node) {
      if (!node) return false
      return node.users === null && node.kjSprType_dictText
    },
    /** 判断节点是否显示添加审批人按钮（isselfSelect===1 或 sprScope===4） */
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
    /** 从节点配置中提取默认人员（users/roles/departments 合并去重） */
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
      // 去重
      const map = new Map()
      list.forEach(item => { if (!map.has(item.id)) map.set(item.id, item) })
      return Array.from(map.values())
    },
    /**
     * 加载流程节点列表
     * @param {Boolean} useCurrentUser - 是否使用当前登录用户信息（新建模式，未选离职人员时）
     */
    loadProcessNodes(useCurrentUser = false) {
      let dept, no
      if (useCurrentUser) {
        dept = this.currentUserDept
        no = this.currentUserNo
      } else {
        dept = this.model.dept || ''
        no = this.model.gh || ''
      }
      if (!dept) {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      this.processNodesLoading = true
      getAction(this.url.getLcjdList, {
        sqmkCode: this.sqmkCode,
        dept: dept,
        no: no || ''
      }).then(res => {
        if (res.success && Array.isArray(res.result)) {
          // 按 px 升序排列
          const list = res.result.slice().sort((a, b) => Number(a.px) - Number(b.px))
          this.processNodeList = list
          // 初始化每个节点的已选人员（提取默认人员）
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
    /** 选择审批人/抄送人（追加合并，不覆盖默认人员） */
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
    /** 移除审批人/抄送人 tag */
    handleEmployeeTagClose(event, index, id) {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      if (this.nodeObjList[index]) {
        this.nodeObjList[index].arr = this.nodeObjList[index].arr.filter(item => item.id != id)
        this.nodeObjList[index].str = this.nodeObjList[index].arr.map(item => item.name).join(',')
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
        // 对于需要自选的节点，将选中的审批人写到节点外层
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
    },

    /**
     * 提交离职申请
     * 验证表单并调用新增接口
     */
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 验证审批流程节点
          let allValid = true
          this.processNodeList.forEach((node, idx) => {
            if (this.canEditApprovers(node) && this.nodeObjList[idx] && this.nodeObjList[idx].arr.length === 0) {
              this.$message.warning(`请选择「${node.nodeName}」的${this.isCcNode(node) ? '抄送' : '审批'}人`)
              allValid = false
            }
          })
          if (!allValid) return

          this.confirmLoading = true
          // 构建请求数据
          const perInfo = Vue.ls.get('perInfo') || {}
          const formData = Object.assign({}, this.model, {
            zt: '审批中', // 初始状态为审批中
            sqsj: moment().format('YYYY-MM-DD HH:mm'), // 申请时间
            sqr: this.$store.state.user.info.username,
            createByNo: perInfo.no || '',
          })
          // 组装动态流程节点数据
          const processDTOList = this.buildProcessDTOList()
          if (processDTOList && processDTOList.length > 0) {
            formData.customProcessConfigurationDTOList = processDTOList
          }

          httpAction(this.url.add, formData, 'post')
            .then((res) => {
              if (!res.success) {
                throw new Error(res.message || '提交失败')
              }
              this.$message.success('离职申请已提交')
              this.$emit('ok') // 通知父组件刷新列表
              this.close()
            })
            .catch((error) => {
              this.$message.error(error.message || '提交失败，请稍后重试')
            })
            .finally(() => {
              this.confirmLoading = false
            })
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
.sqgl-sec-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #4a7bf7;
  line-height: 1;
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

/deep/ .ant-form-item-label > label {
  color: #606266;
}
</style>
