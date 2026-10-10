<template>
  <a-modal
    class="zt-modal employee-visitor-modal"
    :title="title"
    :width="800"
    :visible="visible"
    :bodyStyle="bodyStyle"
    :confirmLoading="confirmLoading"
    centered
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <a-form-model ref="form" :model="model" :rules="rules" layout="vertical">
        <!-- 访客基本信息 -->
        <div class="section-title">访客基本信息</div>
        <a-row :gutter="14">
          <a-col :span="6">
            <a-form-model-item label="姓名" prop="xm">
              <a-input v-model="model.xm" placeholder="请输入" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="联系方式" prop="lxfs">
              <a-input v-model="model.lxfs" placeholder="请输入" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="车牌号" prop="cph">
              <a-input v-model="model.cph" placeholder="请输入" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="身份证号" prop="sfzh">
              <a-input v-model="model.sfzh" placeholder="请输入" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="所属公司或个人" prop="ssgshgr">
              <a-input v-model="model.ssgshgr" placeholder="请输入" />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="来访区域" prop="lfqy">
              <j-dict-select-tag
                type="list"
                v-model="model.lfqy"
                dictCode="hrm_fkzx_sq_lfqy"
                placeholder="请选择来访区域"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="来访事由" prop="lfsy">
              <j-dict-select-tag
                type="list"
                v-model="model.lfsy"
                dictCode="hrm_fkzx_sq_lfsy"
                placeholder="请选择来访事由"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="预计来访时间" prop="yjlfsj">
              <j-date
                v-model="model.yjlfsj"
                :showTime="{
                  format: 'HH:mm',
                }"
                dateFormat="YYYY-MM-DD HH:mm"
                placeholder="请选择"
                style="width: 100%; min-width: auto"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="接待人" prop="jdr">
              <j-select-employee
                v-model="model.jdr"
                placeholder="请选择接待人"
                value-field="name"
                :multiple="false"
                :buttonShow="false"
                @change="handleReceiverChange"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="6">
            <a-form-model-item label="接待人联系方式" prop="jdrlxfs">
              <a-input v-model="model.jdrlxfs" placeholder="请输入" disabled />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="来访事由详细" prop="lfsrxx">
              <a-textarea v-model="model.lfsrxx" placeholder="请输入" autosize />
            </a-form-model-item>
          </a-col>
        </a-row>

        <!-- 同行人 -->
        <div class="section-title">同行人</div>
        <div class="companion-block">
          <div class="companion-empty" v-if="companions.length === 0">
            <a-icon type="inbox" class="box-icon" />
            <div class="text">暂无数据</div>
          </div>
          <div class="companion-rows" v-else>
            <div class="companion-row" v-for="(item, index) in companions" :key="index">
              <a-input v-model="item.xm" placeholder="姓名" class="companion-input" />
              <a-input v-model="item.sfzh" placeholder="身份证号" class="companion-input" />
              <a-button type="link" class="row-del" @click="removeCompanion(index)">
                <a-icon type="delete" />
              </a-button>
            </div>
          </div>
          <a-button type="dashed" class="companion-add-btn" @click="addCompanion">
            <a-icon type="plus" />添加
          </a-button>
          <div class="companion-tip">无同行人可不添加</div>
        </div>

        <!-- 上传附件 -->
        <div class="section-title">上传附件</div>
        <div class="upload-block">
          <j-upload-list v-model="model.scfj" text="选择文件" bizPath="visitor" :returnUrl="true" />
          <div class="upload-tip">支持多文件上传</div>
        </div>

        <!-- 审批流程 -->
        <div class="section-title">审批流程</div>
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
                  {{ node.chooseObjectsName }}
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
import Vue from 'vue'
import JUploadList from '@/components/jeecg/JUploadList.vue'
// 手机号校验器
var validatePhone = function (rule, value, callback) {
  if (!value) {
    callback(new Error('请输入手机号'))
    return
  }
  var phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(value)) {
    callback(new Error('请输入正确的手机号'))
    return
  }
  callback()
}

// 身份证号校验器
var validateIdCard = function (rule, value, callback) {
  if (!value) {
    callback(new Error('请输入身份证号'))
    return
  }
  var idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  if (!idCardReg.test(value)) {
    callback(new Error('请输入正确的身份证号'))
    return
  }
  callback()
}

export default {
  name: 'EmployeeVisitorModal',
  components: {
    JUploadList,
  },
  data() {
    return {
      title: '员工访客申请',
      visible: false,
      confirmLoading: false,
      bodyStyle: {
        maxHeight: '700px',
        overflowY: 'auto',
      },
      model: {
        xm: '',
        lxfs: '',
        cph: '',
        sfzh: '',
        ssgshgr: '',
        lfqy: undefined,
        lfsy: undefined,
        yjlfsj: '',
        jdr: '',
        jdrlxfs: '',
        lfsrxx: '',
        scfj: '',
        lflx: 0,
        zt: 0,
        dept: '',
        empNo: '',
        no: '',
      },
      modelDefault: {},

      // 流程节点列表（后端返回）
      processNodeList: [],
      // 每个节点对应的审批人/抄送人数据（索引与 processNodeList 对应）
      nodeObjList: [],
      processNodesLoading: false,
      // 申请模块编码
      sqmkCode: '访客申请',

      // 表单校验规则
      rules: {
        xm: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        lxfs: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        sfzh: [{ required: true, validator: validateIdCard, trigger: 'blur' }],
        ssgshgr: [{ required: true, message: '请输入所属公司或个人', trigger: 'blur' }],
        lfqy: [{ required: true, message: '请选择来访区域', trigger: 'change' }],
        lfsy: [{ required: true, message: '请选择来访事由', trigger: 'change' }],
        yjlfsj: [{ required: true, message: '请选择预计来访时间', trigger: 'change' }],
        jdr: [{ required: true, message: '请选择接待人', trigger: 'change' }],
        jdrlxfs: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        lfsrxx: [{ required: true, message: '请输入来访事由详细', trigger: 'blur' }],
      },

      // 同行人
      companions: [],

      // 接口地址
      url: {
        add: '/fkzx/hrmFkzxSq/add',
        edit: '/fkzx/hrmFkzxSq/edit',
        getLcjdList: '/process/customProcessConfiguration/getLcjdList',
      },
    }
  },
  computed: {
    // 当前登录用户信息
    userInfo() {
      return this.$store.state.user.info || {}
    },
  },
  created() {
    // 备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    add() {
      this.edit(JSON.parse(JSON.stringify(this.modelDefault)))
      // 设置默认接待人为当前登录用户
      this.model.jdr = this.userInfo.realname
      // 从本地缓存获取 perInfo
      const perInfo = Vue.ls.get('perInfo') || {}
      this.model.dept = perInfo.dept || ''
      this.model.empNo = perInfo.no || this.userInfo.workNo || ''
      this.model.no = perInfo.no || this.userInfo.workNo || ''
      // 重置流程节点
      this.processNodeList = []
      this.nodeObjList = []
      // 如果已经有部门信息，先加载一次流程节点
      if (this.model.dept) {
        this.loadProcessNodes()
      }
      // 查询员工档案手机号 + 部门
      getAction('/hrm/hrEmployeeInformation/queryByNos', {
        nos: this.userInfo.workNo,
      })
        .then((res) => {
          if (Array.isArray(res.result) && res.result.length) {
            const item = res.result[0]
            this.model.jdrlxfs = item.phoneNumber
            // 从员工档案获取部门信息（以员工档案为准，重新加载节点）
            if (item.deptId && item.deptId !== this.model.dept) {
              this.model.dept = item.deptId
              this.loadProcessNodes()
            }
          }
        })
        .finally(() => {
          // 如果员工档案手机号为空，使用用户手机号
          if (!this.model.jdrlxfs) {
            this.model.jdrlxfs = this.userInfo.phone || ''
          }
        })
    },
    edit(record) {
      this.model = Object.assign({}, this.modelDefault, record)
      this.visible = true
      this.companions = record.txrList || []
      // 重置流程节点
      this.processNodeList = []
      this.nodeObjList = []
      this.$nextTick(
        function () {
          if (this.$refs.form) {
            this.$refs.form.clearValidate()
          }
        }.bind(this)
      )
    },

    // 接待人选择变化
    handleReceiverChange(value, rows) {
      if (rows && rows.length > 0) {
        var selected = rows[0]
        this.model.jdr = selected.name || ''
        this.model.jdrlxfs = selected.phoneNumber || ''
        // 接待人部门变化时，重新加载流程节点
        if (selected.deptId && selected.deptId !== this.model.dept) {
          this.model.dept = selected.deptId
          this.model.empNo = selected.no || ''
          this.model.no = selected.no || ''
          this.loadProcessNodes()
        }
      } else {
        this.model.jdr = value || ''
        this.model.jdrlxfs = ''
      }
    },

    /** 判断节点是否为抄送节点（nodeProperties: 1=审批, 2=抄送） */
    isCcNode(node) {
      return node && Number(node.nodeProperties) === 2
    },
    /** 判断节点是否为 kjSprType 类型节点（users 为 null 时展示 chooseObjectsName） */
    isKjSprTypeNode(node) {
      if (!node) return false
      return node.users === null && node.chooseObjectsName
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
    /** 加载流程节点列表 */
    loadProcessNodes() {
      const dept = this.model.dept || ''
      if (!dept) {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      this.processNodesLoading = true
      getAction(this.url.getLcjdList, {
        sqmkCode: this.sqmkCode,
        dept: dept,
        no: this.model.empNo || ''
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

    // 校验同行人身份证号
    validateCompanions() {
      var idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
      for (var i = 0; i < this.companions.length; i++) {
        var item = this.companions[i]
        if (item.sfzh && !idCardReg.test(item.sfzh)) {
          this.$message.warning('同行人身份证号格式不正确')
          return false
        }
      }
      return true
    },

    handleOk() {
      var that = this
      this.$refs.form.validate(function (valid) {
        if (!valid) return
        // 校验同行人身份证号
        if (!that.validateCompanions()) return
        // 校验每个需要选择审批人的节点是否选择了人员
        let allValid = true
        that.processNodeList.forEach((node, idx) => {
          if (that.canEditApprovers(node) && that.nodeObjList[idx] && that.nodeObjList[idx].arr.length === 0) {
            that.$message.warning(`请选择「${node.nodeName}」的${that.isCcNode(node) ? '抄送' : '审批'}人`)
            allValid = false
          }
        })
        if (!allValid) return
        that.confirmLoading = true
        // 处理同行人数据 txrList
        var txrList = that.companions.map(function (item) {
          return {
            xm: item.xm,
            sfzh: item.sfzh,
          }
        })
        // 来访人数 = 同行人数 + 1（访客本人）
        var lfrs = txrList.length + 1
        // 动态流程节点数据
        var customProcessConfigurationDTOList = that.buildProcessDTOList()

        var submitData = Object.assign({}, that.model, {
          txrList: txrList,
          lfrs: lfrs,
        })
        if (customProcessConfigurationDTOList && customProcessConfigurationDTOList.length > 0) {
          submitData.customProcessConfigurationDTOList = customProcessConfigurationDTOList
        }
        // 删除model中的旧字段
        delete submitData.spr
        delete submitData.csr
        delete submitData.sprXm
        delete submitData.csrXm

        var httpurl = that.model.id ? that.url.edit : that.url.add
        var method = that.model.id ? 'put' : 'post'

        httpAction(httpurl, submitData, method)
          .then(function (res) {
            if (res.success) {
              that.$message.success(res.message || '提交成功')
              that.$emit('ok')
              that.close()
            } else {
              that.$message.warning(res.message || '提交失败')
            }
          })
          .catch(function () {
            that.$message.error('提交失败，请稍后重试')
          })
          .finally(function () {
            that.confirmLoading = false
          })
      })
    },

    close() {
      this.$emit('close')
      this.visible = false
      this.companions = []
      this.processNodeList = []
      this.nodeObjList = []
    },

    handleCancel() {
      this.close()
    },

    // 同行人
    addCompanion() {
      this.companions.push({ xm: '', sfzh: '' })
    },
    removeCompanion(index) {
      this.companions.splice(index, 1)
    },
  },
}
</script>
<style lang="less">
@import '~@assets/less/common.less';
</style>
<style lang="less" scoped>
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(37, 99, 235, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    border-radius: 2px;
  }
}

.form-tip {
  font-size: 11.5px;
  color: #64748b;
  margin-top: 4px;
  line-height: 1.5;
}

// 同行人区块
.companion-block {
  border: 1px dashed #e2e8f0;
  border-radius: 10px;
  padding: 14px 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.companion-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
  color: #64748b;
  gap: 6px;

  .box-icon {
    font-size: 30px;
    color: #94a3b8;
  }

  .text {
    font-size: 12px;
  }
}

.companion-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.companion-row {
  display: flex;
  align-items: center;
  gap: 8px;

  .companion-input {
    flex: 1;
  }

  .row-del {
    color: #64748b;

    &:hover {
      color: #ef4444;
    }
  }
}

.companion-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 38px;
  border: 1px dashed rgba(37, 99, 235, 0.45);
  border-radius: 8px;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.025);
  font-size: 13px;

  &:hover {
    background: rgba(37, 99, 235, 0.08);
    border-color: #2563eb;
  }
}

.companion-tip {
  font-size: 11.5px;
  color: #64748b;
  text-align: center;
}

/* ===== 审批流程时间轴 ===== */
.approval-timeline {
  position: relative;
  padding-left: 0;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 16px;
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
.upload-block {
  position: relative;
  border: 1px dashed #e2e8f0;
  border-radius: 10px;
  background: #fafbfd;
  padding: 14px 16px;
  margin-bottom: 10px;
  .upload-tip {
    position: absolute;
    top: 20px;
    left: 140px;
    font-size: 12px;
    color: #64748b;
  }
}
</style>
