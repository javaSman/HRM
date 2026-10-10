<template>
  <div class="node-modal-body">
    <a-form-model ref="form" :model="model" :rules="validatorRules" :labelCol="labelCol" :wrapperCol="wrapperCol">
      <div class="node-section">
        <div class="node-section-title">基础信息</div>

        <a-form-model-item label="节点名称" prop="nodeName">
          <a-input v-model="model.nodeName" placeholder="请输入节点名称" />
        </a-form-model-item>

        <a-form-model-item label="节点性质" prop="nodeProperties">
          <a-radio-group v-model="model.nodeProperties" @change="handleNodePropertiesChange">
            <a-radio value="审批">审批</a-radio>
            <a-radio value="抄送">抄送</a-radio>
          </a-radio-group>
        </a-form-model-item>

        <!-- ===== 审批面板 ===== -->
        <template v-if="model.nodeProperties === '审批'">
          <a-form-model-item label="审批方式" prop="approvalType">
            <a-radio-group v-model="model.approvalType" @change="handleApprovalTypeChange">
              <a-radio value="custom">自定义选择</a-radio>
              <a-radio value="default">默认审批</a-radio>
            </a-radio-group>
          </a-form-model-item>

          <!-- 自定义选择面板 -->
          <template v-if="model.approvalType === 'custom'">
            <a-form-model-item label="审批人范围">
              <j-dict-select-tag
                v-model="model.sprScope"
                type="radio"
                placeholder="请选择审批人范围"
                dictCode="spr_scope"
                @change="handleScopeTypeChange" />
            </a-form-model-item>

            <template v-if="model.sprScope === 1">
              <a-form-model-item label="用户" prop="yh">
                <j-select-user-by-dep v-model="model.chooseUsers" :multi="true" @select="handleUsersChange" />
              </a-form-model-item>
            </template>

            <template v-if="model.sprScope === 2">
              <a-form-model-item label="角色" prop="js">
                <j-multi-select-tag
                  v-model="model.chooseRoles"
                  :options="rolesOptions"
                  placeholder="请选择角色"
                  @change="handleRoleChange"></j-multi-select-tag>
              </a-form-model-item>
            </template>

            <template v-if="model.sprScope === 3">
              <a-form-model-item label="部门" prop="bm">
                <div class="selector-row">
                  <div class="selector-row-main">
                    <j-select-depart
                      ref="departmentSelector"
                      v-model="model.chooseDepartments"
                      :multi="true"
                      :backDepart="true"
                      @back="handleDepartmentBack"></j-select-depart>
                  </div>
                  <a-button type="primary" @click="openDepartmentModal">选择部门</a-button>
                </div>
              </a-form-model-item>
            </template>

            <a-form-model-item label="排序" prop="px">
              <a-input-number v-model="model.px" :min="0" :precision="0" style="width: 100%" />
            </a-form-model-item>

            <!-- 审批规则 -->
            <div class="node-section-title sub-title">审批规则</div>
            <a-form-model-item label="多人审批规则" prop="approvalRule">
              <a-radio-group v-model="model.approvalRule">
                <a-radio value="会签">会签（必须所有人同意）</a-radio>
                <a-radio value="或签">或签（一人同意即可）</a-radio>
              </a-radio-group>
            </a-form-model-item>
          </template>

          <!-- 默认审批面板 -->
          <template v-if="model.approvalType === 'default'">
            <a-form-model-item label="快捷选择审批人">
              <j-dict-select-tag
                v-model="model.kjSprType"
                type="radio"
                placeholder="请选择快捷审批人"
                dictCode="kj_spr_type" />
            </a-form-model-item>

            <a-form-model-item label="排序" prop="px">
              <a-input-number v-model="model.px" :min="0" :precision="0" style="width: 100%" />
            </a-form-model-item>
          </template>
        </template>

        <!-- ===== 抄送面板 ===== -->
        <template v-if="model.nodeProperties === '抄送'">
          <a-form-model-item label="是否选择默认抄送人" prop="isDefaultCc">
            <a-radio-group v-model="model.isDefaultCc" @change="handleDefaultCcChange">
              <a-radio :value="1">是</a-radio>
              <a-radio :value="0">否</a-radio>
            </a-radio-group>
          </a-form-model-item>

          <a-form-model-item v-if="model.isDefaultCc === 1" label="抄送人" prop="ccPerson">
            <div class="selector-row">
              <div class="selector-row-main">
                <j-select-user-by-dep v-model="model.ccPerson" :multi="true" @select="handleCcPersonChange" />
              </div>
            </div>
          </a-form-model-item>

          <a-form-model-item label="是否自选抄送人" prop="isSelfCc">
            <a-radio-group v-model="model.isSelfCc">
              <a-radio :value="1">是</a-radio>
              <a-radio :value="0">否</a-radio>
            </a-radio-group>
          </a-form-model-item>

          <a-form-model-item label="排序" prop="px">
            <a-input-number v-model="model.px" :min="0" :precision="0" style="width: 100%" />
          </a-form-model-item>
        </template>
      </div>
    </a-form-model>
  </div>
</template>

<script>
import { queryall } from '@/api/api'
import JSelectUserByDep from '@/components/jeecgbiz/JSelectUserByDep.vue'
import JSelectDepart from '@/components/jeecgbiz/JSelectDepart.vue'
import JMultiSelectTag from '@/components/dict/JMultiSelectTag.vue'
import JDictSelectTag from '@/components/dict/JDictSelectTag.vue'

export default {
  name: 'CustomProcessNodeForm',
  components: {
    JSelectUserByDep,
    JSelectDepart,
    JMultiSelectTag,
    JDictSelectTag
  },
  props: {
    bmid: {
      type: String,
      required: false,
      default: ''
    }
  },
  data() {
    return {
      rolesOptions: [],
      selectionNames: {
        users: [],
        roles: [],
        departments: [],
        ccPerson: []
      },
      model: this.createDefaultModel(),
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      validatorRules: {
        nodeName: [{ required: true, message: '请输入节点名称', trigger: 'change' }],
        px: [{ required: true, message: '请输入排序', trigger: 'change' }]
      }
    }
  },
  created() {
    this.loadRoleOptions()
  },
  mounted() {
    // 给 body 加唯一类名，用于精准控制本页面内弹出的 j-select-user-by-dep 弹窗样式
    document.body.classList.add('custom-process-node-form-active')
  },
  beforeDestroy() {
    document.body.classList.remove('custom-process-node-form-active')
  },
  methods: {
    createDefaultModel() {
      return {
        id: '',
        customProcessId: this.bmid,
        nodeName: '',
        nodeProperties: '审批',
        approvalType: 'custom', // 审批方式：custom-自定义选择，default-默认审批
        sprScope: 1, // 审批人范围类型（字典编码：spr_scope）：1-用户，2-角色，3-部门，4-自选审批人
        kjSprType: undefined, // 快捷审批人类型（字典编码：kj_spr_type）
        chooseUsers: '',
        chooseRoles: '',
        chooseDepartments: '',
        ccPerson: '', // 抄送人
        isDefaultCc: 0, // 是否选择默认抄送人
        isSelfCc: 0, // 是否自选抄送人
        promoter: 0,
        px: 0,
        isselfSelect: 0,
        ismultiPerson: 1,
        approvalRule: '会签'
      }
    },
    loadRoleOptions() {
      queryall()
        .then((res) => {
          if (!res.success) {
            this.$message.warning(res.message)
            return
          }
          const roles = Array.isArray(res.result) ? res.result : []
          this.rolesOptions = roles.map((item) => ({
            label: item.roleName,
            value: item.id
          }))
        })
        .catch(() => {
          this.rolesOptions = []
        })
    },
    add(defaults = {}) {
      this.resetSelections()
      this.model = Object.assign(this.createDefaultModel(), defaults)
      this.clearValidate()
    },
    edit(record) {
      // 判断审批类型：如果有快捷审批人类型则为默认审批，否则为自定义选择
      const approvalType = record.kjSprType ? 'default' : 'custom'

      // 判断审批人范围类型：优先取 record.sprScope，否则向后兼容推导
      let sprScope
      if (record.sprScope != null && record.sprScope !== '') {
        sprScope = Number(record.sprScope)
      } else {
        sprScope = 1
        if (Number(record.isselfSelect) === 1) {
          sprScope = 4
        } else if (Number(record.chooseRoles) === 1) {
          sprScope = 2
        } else if (Number(record.chooseDepartments) === 1) {
          sprScope = 3
        }
      }

      const userValue = this.extractChoiceValue(record.users)
      const roleValue = this.extractChoiceValue(record.roles)
      const departmentValue = this.extractChoiceValue(record.departments)

      const isCc = record.nodeProperties === '抄送' || Number(record.nodeProperties) === 2
      const ccUserValue = isCc ? this.extractChoiceValue(record.users) : ''
      const ccUserNames = isCc ? this.extractChoiceNames(record.users) : []

      this.selectionNames = {
        users: this.extractChoiceNames(record.users),
        roles: this.extractChoiceNames(record.roles),
        departments: this.extractChoiceNames(record.departments),
        ccPerson: ccUserNames
      }

      this.model = Object.assign(this.createDefaultModel(), {
        id: record.id,
        customProcessId: record.customProcessId || this.bmid,
        nodeName: record.nodeName,
        nodeProperties: isCc ? '抄送' : '审批',
        approvalType: approvalType,
        sprScope: sprScope,
        kjSprType: record.kjSprType || undefined,
        chooseUsers: userValue,
        chooseRoles: roleValue,
        chooseDepartments: departmentValue,
        ccPerson: ccUserValue,
        isDefaultCc: Number(record.promoter || 0),
        isSelfCc: Number(record.isselfSelect || 0),
        promoter: Number(record.promoter || 0),
        px: Number(record.px || 0),
        isselfSelect: Number(record.isselfSelect || 0),
        ismultiPerson: Number(record.ismultiPerson === undefined ? 1 : record.ismultiPerson),
        approvalRule: record.approvalRule === '或签' || Number(record.approvalRule) === 2 ? '或签' : '会签'
      })

      this.clearValidate()
    },
    resetSelections() {
      this.selectionNames = {
        users: [],
        roles: [],
        departments: [],
        ccPerson: []
      }
    },
    clearValidate() {
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
    handleNodePropertiesChange(e) {
      const value = e.target.value
      this.model.nodeProperties = value
      if (value === '抄送') {
        this.model.approvalType = 'custom'
        this.model.sprScope = 1
        this.model.isselfSelect = 0
        this.model.ismultiPerson = 0
        this.model.approvalRule = '会签'
        this.model.kjSprType = undefined
      } else {
        this.model.promoter = 0
        this.model.isDefaultCc = 0
        this.model.isSelfCc = 0
        this.model.ismultiPerson = 1
      }
    },
    handleApprovalTypeChange(e) {
      const value = e.target.value
      this.model.approvalType = value
      if (value === 'custom') {
        this.model.kjSprType = undefined
      } else {
        this.model.sprScope = 1
        this.model.chooseUsers = ''
        this.model.chooseRoles = ''
        this.model.chooseDepartments = ''
        this.model.isselfSelect = 0
      }
    },
    handleScopeTypeChange(val) {
      // 字典组件返回字符串，统一转为数字
      this.model.sprScope = Number(val)
      // 切换审批人范围时清空之前的选择
      this.model.chooseUsers = ''
      this.model.chooseRoles = ''
      this.model.chooseDepartments = ''
      this.selectionNames = {
        users: [],
        roles: [],
        departments: []
      }
    },
    handleDefaultCcChange(e) {
      const value = e.target.value
      this.model.isDefaultCc = value
      if (value === 0) {
        this.model.ccPerson = ''
        this.selectionNames.ccPerson = []
      }
    },
    handleUsersChange(rows) {
      if (!rows || !rows.length) {
        this.selectionNames.users = []
        return
      }
      this.selectionNames.users = rows.map((item) => item.realname).filter(Boolean)
    },
    handleRoleChange(value) {
      if (!value) {
        this.selectionNames.roles = []
        return
      }
      const valueSet = value.split(',')
      this.selectionNames.roles = this.rolesOptions
        .filter((item) => valueSet.includes(String(item.value)))
        .map((item) => item.label)
    },
    handleDepartmentBack(rows) {
      this.selectionNames.departments = rows.map((item) => item.text)
    },
    handleCcPersonChange(rows) {
      if (!rows || !rows.length) {
        this.selectionNames.ccPerson = []
        return
      }
      this.selectionNames.ccPerson = rows.map((item) => item.realname).filter(Boolean)
    },
    openDepartmentModal() {
      if (this.$refs.departmentSelector) {
        this.$refs.departmentSelector.openModal()
      }
    },
    validateConfig() {
      // 抄送节点验证
      if (this.model.nodeProperties === '抄送') {
        if (this.model.isDefaultCc === 1 && !this.model.ccPerson) {
          this.$message.warning('请选择抄送人')
          return false
        }
        return true
      }

      // 审批节点 - 默认审批
      if (this.model.approvalType === 'default') {
        if (!this.model.kjSprType) {
          this.$message.warning('请选择快捷审批人')
          return false
        }
        return true
      }

      // 审批节点 - 自定义选择
      if (this.model.sprScope === 4) {
        // 自选审批人不需要选择具体对象，直接通过
        return true
      }
      if (this.model.sprScope === 1 && !this.model.chooseUsers) {
        this.$message.warning('请选择用户')
        return false
      }
      if (this.model.sprScope === 2 && !this.model.chooseRoles) {
        this.$message.warning('请选择角色')
        return false
      }
      if (this.model.sprScope === 3 && !this.model.chooseDepartments) {
        this.$message.warning('请选择部门')
        return false
      }

      return true
    },
    validateAndBuild(done) {
      this.$refs.form.validate((valid) => {
        if (!valid || !this.validateConfig()) {
          done(false)
          return
        }
        done(true, this.buildPayload())
      })
    },
    buildPayload() {
      const isApproval = this.model.nodeProperties === '审批'
      const isCc = this.model.nodeProperties === '抄送'
      const isCustom = isApproval && this.model.approvalType === 'custom'

      const hasUserScope = isCustom && this.model.sprScope === 1
      const hasRoleScope = isCustom && this.model.sprScope === 2
      const hasDepartmentScope = isCustom && this.model.sprScope === 3
      const hasSelfSelect = isCustom && this.model.sprScope === 4
      const hasCcUser = isCc && this.model.isDefaultCc === 1

      const payload = {
        id: this.model.id,
        customProcessId: this.model.customProcessId || this.bmid,
        nodeName: this.model.nodeName,
        promoter: isCc ? this.model.isDefaultCc : 0,
        nodeProperties: isCc ? 2 : 1,
        chooseUsers: hasUserScope || hasCcUser ? 1 : 0,
        chooseRoles: hasRoleScope ? 1 : 0,
        chooseDepartments: hasDepartmentScope ? 1 : 0,
        px: this.model.px,
        isselfSelect: isCc ? this.model.isSelfCc : (hasSelfSelect ? 1 : 0),
        ismultiPerson: this.model.ismultiPerson,
        approvalRule: this.model.approvalRule === '或签' ? 2 : 1,
        kjSprType: isApproval && this.model.approvalType === 'default' ? this.model.kjSprType : '',
        sprScope: isApproval && this.model.approvalType === 'custom' ? this.model.sprScope : '',
        users: [],
        roles: [],
        departments: []
      }

      const choiceGroups = [
        { checked: hasUserScope, list: payload.users, value: this.model.chooseUsers, type: 1, names: this.selectionNames.users },
        { checked: hasRoleScope, list: payload.roles, value: this.model.chooseRoles, type: 2, names: this.selectionNames.roles },
        { checked: hasDepartmentScope, list: payload.departments, value: this.model.chooseDepartments, type: 3, names: this.selectionNames.departments },
        { checked: hasCcUser, list: payload.users, value: this.model.ccPerson, type: 1, names: this.selectionNames.ccPerson }
      ]

      choiceGroups.forEach((item) => {
        if (!item.checked || !item.value) {
          return
        }
        item.list.push({
          chooseObjects: item.value,
          chooseType: item.type,
          customProcessConfigurationId: this.model.id || '',
          chooseObjectsName: item.names.length ? item.names.join(',') : item.value
        })
      })

      return payload
    },
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
    extractChoiceValue(list) {
      if (!Array.isArray(list) || !list.length) {
        return ''
      }
      const firstItem = list[0] || {}
      if (Array.isArray(firstItem.chooseObjects)) {
        return firstItem.chooseObjects.join(',')
      }
      return firstItem.chooseObjects || ''
    }
  }
}
</script>

<style lang="less">
/* 只在当前页面调整 j-select-user-by-dep 弹窗位置，向上移动 10px
   通过 body 上的 custom-process-node-form-active 类名限定作用域，
   避免影响其他页面的弹窗 */
.custom-process-node-form-active .j-user-select-modal .ant-modal {
  top: 40px;
}
</style>

<style lang="less" scoped>
.node-modal-body {
  max-height: 72vh;
  padding: 0 0 8px;
  overflow-y: auto;
}

.node-section {
  padding: 0 8px 8px;
}

.node-section + .node-section {
  margin-top: 4px;
}

.node-section-title {
  position: relative;
  margin-bottom: 22px;
  padding-left: 12px;
  color: #2d3a4f;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
}

.node-section-title::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  width: 3px;
  height: 22px;
  border-radius: 3px;
  background: #2f84f7;
}

.node-section-title.sub-title {
  margin-top: 20px;
  margin-bottom: 18px;
  font-size: 14px;
}

.node-section-title.sub-title::before {
  height: 18px;
  top: -1px;
}

.selector-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selector-row-main {
  flex: 1;
  min-width: 0;
}

.selector-row-main /deep/ .components-input-demo-presuffix {
  width: 100%;
}

.selector-row-main /deep/ .ant-input {
  width: 100%;
}

/deep/ .ant-form-item {
  margin-bottom: 5px;
}
</style>
