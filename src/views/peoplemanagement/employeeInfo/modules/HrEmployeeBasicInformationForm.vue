<template>
  <a-form-model ref="form" :model="model" :rules="validatorRules" class="employee-basic-information-form">
    <!-- 照片上传独立于配置化字段，便于保持证件照专用布局。 -->
    <section class="employee-section employee-section-photo">
      <div class="employee-section-title">
        <a-icon type="picture" />
        <span>员工照片</span>
      </div>
      <div class="employee-photo-section">
        <a-form-model-item prop="photo" class="employee-photo-item">
          <j-image-upload
            v-model="model.photo"
            class="employee-photo-upload"
            v-bind="photoUploadProps"
            text="点击上传照片"
            accept=".png,.jpg,.jpeg"
          />
        </a-form-model-item>
        <div class="employee-photo-hint">
          <strong>上传员工照片</strong>
          <span>支持 JPG / PNG 格式，建议使用清晰证件照。</span>
        </div>
      </div>
    </section>

    <!-- FIELD_GROUPS 同时定义分组、字段类型和栅格跨度，模板按类型选择对应控件。 -->
    <section v-for="group in visibleFieldGroups" :key="group.key" class="employee-section">
      <div class="employee-section-title">
        <a-icon :type="group.icon" />
        <span>{{ group.title }}</span>
      </div>
      <div class="employee-form-grid">
        <div v-for="field in group.fields" :key="field.prop" class="employee-field" :class="field.span">
          <div class="employee-label" :class="{ 'employee-label--required': field.required }">
            {{ field.label }}
          </div>
          <a-form-model-item :prop="field.prop">
            <a-input
              v-if="field.type === 'input'"
              v-model="model[field.prop]"
              :maxLength="field.maxLength"
              :disabled="disabled || field.disabled"
              :readOnly="field.readOnly"
              :placeholder="field.placeholder || '请输入'"
              @blur="handleInputBlur(field, $event)"
            />
            <a-select
              v-else-if="field.type === 'select'"
              v-model="model[field.prop]"
              allowClear
              :disabled="disabled"
              :placeholder="field.placeholder || '请选择'"
              :getPopupContainer="getPopupContainer"
            >
              <a-select-option v-for="item in getOptions(field)" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
            <j-dict-select-tag
              v-else-if="field.type === 'dict'"
              v-model="model[field.prop]"
              type="list"
              :dictCode="field.dictCode"
              :disabled="disabled || field.disabled"
              placeholder="请选择"
              @change="handleDictChange(field, $event)"
            />
            <!-- 计划转正日期字段：员工类型为劳务工时显示为不可编辑的输入框，值为"-" -->
            <a-input
              v-if="field.type === 'date' && field.prop === 'actualDate' && isSyqDisabled"
              :value="model[field.prop] || '-'"
              disabled
            />
            <j-date
              v-else-if="field.type === 'date'"
              v-model="model[field.prop]"
              date-format="YYYY-MM-DD"
              :placeholder="field.placeholder || '请选择'"
              :disabled="disabled || field.disabled"
              style="width: 100%"
              @change="handleDateChange(field, $event)"
            />
            <a-date-picker
              v-else-if="field.type === 'datetime'"
              :value="bdrqPickerValue"
              :disabled="disabled"
              :show-time="{ format: 'HH:mm' }"
              format="YYYY-MM-DD HH:mm"
              placeholder="请选择"
              style="width: 100%"
              :getCalendarContainer="getPopupContainer"
              @change="handleBdrqChange"
            />
            <!-- 试用期字段：员工类型为劳务工时显示为不可编辑的输入框 -->
            <a-input
              v-if="field.type === 'number' && field.prop === 'syq' && isSyqDisabled"
              :value="model[field.prop]"
              disabled
              placeholder="-"
            />
            <a-input-number
              v-else-if="field.type === 'number'"
              v-model="model[field.prop]"
              :disabled="disabled || field.disabled"
              :min="field.min"
              :precision="field.precision"
              :placeholder="field.placeholder || '请输入'"
              style="width: 100%"
              @change="handleNumberChange(field, $event)"
            />
            <a-cascader
              v-else-if="field.type === 'dept'"
              v-model="deptPath"
              :options="deptOptions"
              class="employee-main-dept-cascader"
              :disabled="disabled || mainDeptLoading"
              :show-search="{ filter: filterDeptOption }"
              :getPopupContainer="getPopupContainer"
              :placeholder="mainDeptLoading ? '加载中...' : '请选择'"
              expand-trigger="hover"
              :change-on-select="true"
              @change="handleDeptChange"
            />
            <a-select
              v-else-if="field.type === 'post'"
              v-model="model.postId"
              allowClear
              showSearch
              optionFilterProp="children"
              :disabled="disabled"
              placeholder="请选择"
              :getPopupContainer="getPopupContainer"
              @change="handlePostChange"
            >
              <a-select-option v-for="item in postOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
            <a-select
              v-else-if="field.type === 'rank'"
              v-model="model.postRank"
              allowClear
              showSearch
              optionFilterProp="children"
              placeholder="请选择"
              :getPopupContainer="getPopupContainer"
              :disabled="disabled || !model.postId"
            >
              <a-select-option v-for="item in postRankOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
        </div>
      </div>
    </section>
  </a-form-model>
</template>

<script>
import { getAction } from '@/api/manage'
import { checkUserHavePermission } from '@/utils/util'
import moment from 'moment'

// 静态选项与字段配置放在组件外，避免每个组件实例重复创建。
const GENDER_OPTIONS = [
  { label: '男', value: '男' },
  { label: '女', value: '女' },
]

const YES_NO_OPTIONS = [
  { label: '是', value: '是' },
  { label: '否', value: '否' },
]

// 字段配置是表单结构的唯一来源；新增字段时需同时确认 model 字段和校验规则。
const FIELD_GROUPS = [
  {
    key: 'identity',
    title: '基本身份信息',
    icon: 'user',
    fields: [
      { label: '姓名', prop: 'name', type: 'input', required: true, maxLength: 20 },
      { label: '性别', prop: 'gender', type: 'select', options: GENDER_OPTIONS },
      { label: '身份证号', prop: 'idCard', type: 'input', maxLength: 18 },
      { label: '民族', prop: 'mz', type: 'input' },
      { label: '籍贯', prop: 'jg', type: 'input' },
      { label: '出生年月', prop: 'birthDate', type: 'date' },
      { label: '婚姻状况', prop: 'hyzk', type: 'dict', dictCode: 'hyzt' },
      { label: '政治面貌', prop: 'zzmm', type: 'input' },
      { label: '手机号码', prop: 'phoneNumber', type: 'input', required: true, maxLength: 11 },
      { label: '电子邮箱', prop: 'email', type: 'input' },
      { label: '兴趣爱好', prop: 'xqah', type: 'input' },
      { label: '住宿方式', prop: 'zsfs', type: 'dict', dictCode: 'zsfs' },
      { label: '户籍性质', prop: 'hjxz', type: 'dict', dictCode: 'hjxz' },
      { label: '户籍地址', prop: 'hjdz', type: 'input', span: 'employee-field--span-2' },
      { label: '居住地', prop: 'jzd', type: 'input', span: 'employee-field--span-3' },
      { label: '健康状况', prop: 'jkzk', type: 'dict', dictCode: 'jkzk' },
      { label: '以往病史', prop: 'ywbs', type: 'input', span: 'employee-field--span-2' },
      { label: '暂住地址', prop: 'zzdz', type: 'input', span: 'employee-field--span-3' },
    ],
  },
  {
    key: 'position',
    title: '工作岗位',
    icon: 'solution',
    fields: [
      { label: '卡号', prop: 'card', type: 'input' },
      { label: '工号', prop: 'no', type: 'input', disabled: true, placeholder: '系统自动生成' },
      { label: '员工类型', prop: 'employeeType', required: true, type: 'dict', dictCode: 'yglx' },
      { label: '所属部门', prop: 'dept', type: 'dept', required: true, span: 'employee-field--span-2' },
      { label: '岗位', prop: 'postId', type: 'post' },
      { label: '岗位备注', prop: 'gwbz', type: 'input' },
      { label: '职级', prop: 'postRank', type: 'rank' },
      { label: '个人身份', prop: 'zjlb', type: 'dict', dictCode: 'process_identity', disabled: true },
      { label: '是否存在竞业限制协议', prop: 'sfczjyxzxy', type: 'select', options: YES_NO_OPTIONS },
    ],
  },
  {
    key: 'contract',
    title: '入职合同',
    icon: 'file-text',
    fields: [
      { label: '招聘计划', prop: 'sourceTag', type: 'input' },
      { label: '合同归属', prop: 'constractBelong', type: 'select', optionsKey: 'constractBelong' },
      { label: '合同类型', prop: 'constractType', type: 'dict', dictCode: 'htlx' },
      { label: '合同开始日期', prop: 'contractStartDate', type: 'date' },
      { label: '合同到期日期', prop: 'contractExpDate', type: 'date' },
      { label: '入职日期', prop: 'entryDate', type: 'date' },
      { label: '试用期（月）', prop: 'syq', type: 'number', min: 0, precision: 0, placeholder: '6' },
      { label: '报道时间', prop: 'bdrq', type: 'datetime', required: true },
      { label: '计划转正日期', prop: 'actualDate', type: 'date', disabled: true, placeholder: '自动计算' },
      {
        label: '工作年限',
        prop: 'workYears',
        type: 'input',
        disabled: true,
        readOnly: true,
        placeholder: '根据入职日期自动计算',
      },
    ],
  },
  {
    key: 'salary',
    title: '薪资与社会',
    icon: 'safety',
    fields: [
      { label: '薪资（K）', prop: 'salary', type: 'number', min: 0, precision: 1, auth: 'employee:info:salary' },
      { label: '薪资类型', prop: 'salaryType', type: 'dict', dictCode: 'xzlx', auth: 'employee:info:salaryType' },
      { label: '工资卡银行', prop: 'gzkyh', type: 'dict', dictCode: 'yhlx' },
      { label: '工资卡银行卡号', prop: 'gzkyhkh', type: 'input' },
      { label: '工资卡开户行', prop: 'gzkkhh', type: 'input', span: 'employee-field--span-2' },
      { label: '社保情况', prop: 'sbqk', type: 'dict', dictCode: 'sbqk', auth: 'employee:info:sbqk' },
      { label: '社保电脑号', prop: 'sbdnh', type: 'input' },
      { label: '公积金情况', prop: 'gjjqk', type: 'dict', dictCode: 'gjjqk', auth: 'employee:info:gjjqk' },
      { label: '公积金电脑号', prop: 'gjjdhh', type: 'input' },
      { label: '公积金银行', prop: 'gjjyh', type: 'dict', dictCode: 'yhlx' },
      { label: '公积金银行卡号', prop: 'gjjyhkh', type: 'input' },
      { label: '公积金开户行', prop: 'gjjkhyh', type: 'input', span: 'employee-field--span-2' },
    ],
  },
]

export default {
  name: 'HrEmployeeBasicInformationForm',
  props: {
    // 父组件持有完整员工模型，本组件直接维护其中的基础信息字段。
    model: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    constractBelongOptions: {
      type: Array,
      default: () => [],
    },
    photoBizPath: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      fieldGroups: FIELD_GROUPS,
      deptOptions: [],
      deptPath: [],
      mainDeptLoading: false,
      postRows: [],
      postOptions: [],
      postRankOptions: [],
      validatorRules: {
        name: [{ required: true, message: '请输入员工姓名' }],
        employeeType: [{ required: true, message: '请选择员工类型' }],
        dept: [{ required: true, message: '请选择所属部门' }],
        bdrq: [{ required: true, message: '请选择报道时间' }],
        idCard: [{ validator: this.validateIdCard }],
        phoneNumber: [{ validator: this.validatePhoneNumber }],
        email: [{ validator: this.validateEmail }],
      },
    }
  },
  computed: {
    // 按授权标识过滤字段，无权限的敏感字段（薪资、社保、公积金等）不渲染。
    visibleFieldGroups() {
      return this.fieldGroups.map((group) =>
        Object.assign({}, group, {
          fields: group.fields.filter((field) => !field.auth || checkUserHavePermission(field.auth)),
        })
      )
    },
    // 未指定业务目录时不向上传组件传入空的 bizPath。
    photoUploadProps() {
      return this.photoBizPath ? { bizPath: this.photoBizPath } : {}
    },
    // a-date-picker 需要 moment 对象，接口提交仍统一保存为秒级字符串。
    bdrqPickerValue() {
      const normalizedValue = this.normalizeDateTimeString(this.model.bdrq)
      const pickerValue = moment(normalizedValue, 'YYYY-MM-DD HH:mm:ss', true)
      return pickerValue.isValid() ? pickerValue : null
    },
    // 员工类型为"劳务工"时，试用期字段不可编辑
    isSyqDisabled() {
      return this.model.employeeType === '劳务工'
    },
  },
  watch: {
    // 父组件切换员工时会替换 model，需要重新同步派生字段和部门回显。
    model() {
      this.initialize()
    },
  },
  created() {
    this.initialize(false)
    this.loadMainDeptOptions()
  },
  methods: {
    // optionsKey 用于接入父组件提供的动态选项，其余下拉框使用字段内静态选项。
    getOptions(field) {
      if (field.optionsKey === 'constractBelong') return this.constractBelongOptions
      return field.options || []
    },
    getPopupContainer(node) {
      return node.parentNode
    },
    // 统一完成默认值、派生日期和部门岗位回显；首次创建由部门树加载流程补拉岗位。
    initialize(loadPostOptions = true) {
      // 根据员工类型设置试用期和计划转正日期：劳务工为 null，其他类型为 6 和计算值
      if (this.model.employeeType === '劳务工') {
        this.$set(this.model, 'syq', null)
        this.$set(this.model, 'actualDate', null)
      } else if (this.model.syq === undefined || this.model.syq === null || this.model.syq === '') {
        this.$set(this.model, 'syq', 6)
      }
      this.model.bdrq = this.normalizeDateTimeString(this.model.bdrq)
      this.model.workYears = this.calculateWorkYears(this.model.entryDate)
      if (this.model.employeeType !== '劳务工') {
        this.syncActualDateByProbation(false)
      }
      this.syncDeptPath()
      this.syncDeptCompany()
      if (loadPostOptions) this.loadPostOptions(this.model.dept)
      this.$nextTick(() => this.clearValidate())
    },
    validate(callback) {
      this.$refs.form.validate(callback)
    },
    clearValidate(props) {
      if (this.$refs.form) this.$refs.form.clearValidate(props)
    },
    // 提交前再次计算派生字段，防止外部直接修改 model 后提交旧值。
    prepareModel() {
      this.model.workYears = this.calculateWorkYears(this.model.entryDate)
      this.syncActualDateByProbation(Boolean(this.model.entryDate))
      this.model.bdrq = this.normalizeDateTimeString(this.model.bdrq)
      return this.model
    },
    handleDateChange(field, value) {
      if (field.prop !== 'entryDate') return
      this.model.entryDate = value
      this.model.workYears = this.calculateWorkYears(value)
      this.syncActualDateByProbation(true)
    },
    handleDictChange(field, value) {
      if (field.prop === 'employeeType') {
        // 员工类型为劳务工时，试用期和计划转正日期设为 null，页面显示 "-"
        if (value === '劳务工') {
          this.$set(this.model, 'syq', null)
          this.$set(this.model, 'actualDate', null)
        } else {
          this.$set(this.model, 'syq', 6)
          // 重新计算计划转正日期
          this.syncActualDateByProbation(true)
        }
      }
    },
    handleNumberChange(field, value) {
      if (field.prop !== 'syq') return
      this.model.syq = value
      this.syncActualDateByProbation(true)
    },
    handleBdrqChange(value) {
      this.model.bdrq = this.normalizeDateTimeString(value)
    },
    // 兼容日期控件、原生 Date 和接口字符串，最终统一为 YYYY-MM-DD HH:mm:ss。
    normalizeDateTimeString(value) {
      if (!value) return ''
      if (moment.isMoment(value)) return value.clone().second(0).format('YYYY-MM-DD HH:mm:ss')
      if (value instanceof Date) {
        const dateValue = moment(value)
        return dateValue.isValid() ? dateValue.second(0).format('YYYY-MM-DD HH:mm:ss') : ''
      }
      const textValue = String(value).trim()
      if (!textValue) return ''
      const dateValue = moment(
        textValue,
        ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY/MM/DD HH:mm:ss', 'YYYY/MM/DD HH:mm'],
        true
      )
      const nativeDateValue = new Date(textValue)
      const looseDateValue = dateValue.isValid() ? dateValue : moment(nativeDateValue)
      return looseDateValue.isValid() ? looseDateValue.second(0).format('YYYY-MM-DD HH:mm:ss') : textValue
    },
    syncActualDateByProbation(forceUpdate) {
      // 劳务工没有试用期，计划转正日期为 null
      if (this.model.employeeType === '劳务工') {
        this.model.actualDate = null
        return
      }
      const actualDate = this.calculateActualDate(this.model.entryDate, this.model.syq)
      if (actualDate || forceUpdate) this.model.actualDate = actualDate
    },
    // 先切到目标月份的 1 日，再恢复日期，避免 31 日跨月时被 Date 自动滚入下个月。
    calculateActualDate(entryDate, months) {
      if (!entryDate && entryDate !== 0) return ''
      const monthCount = Number(months)
      if (Number.isNaN(monthCount)) return ''
      const entryDateValue = new Date(String(entryDate).slice(0, 10).replace(/-/g, '/'))
      if (Number.isNaN(entryDateValue.getTime())) return ''
      const originalDay = entryDateValue.getDate()
      const resultDate = new Date(entryDateValue.getTime())
      resultDate.setDate(1)
      resultDate.setMonth(resultDate.getMonth() + monthCount)
      const lastDay = new Date(resultDate.getFullYear(), resultDate.getMonth() + 1, 0).getDate()
      resultDate.setDate(Math.min(originalDay, lastDay))
      return this.formatDate(resultDate)
    },
    formatDate(value) {
      const year = value.getFullYear()
      const month = String(value.getMonth() + 1).padStart(2, '0')
      const day = String(value.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    calculateWorkYears(entryDate) {
      if (!entryDate) return ''
      const entryDateValue = new Date(String(entryDate).replace(/-/g, '/'))
      if (Number.isNaN(entryDateValue.getTime())) return ''
      const diffTime = new Date().getTime() - entryDateValue.getTime()
      const workYears = diffTime / (1000 * 60 * 60 * 24 * 365)
      return workYears > 0 ? Math.floor(workYears) : 0
    },
    // 部门树加载完成后再同步路径、公司归属和当前部门对应的岗位。
    loadMainDeptOptions() {
      this.mainDeptLoading = true
      return getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 })
        .then((res) => {
          const list = res && res.success && Array.isArray(res.result) && res.result.length ? res.result : []
          const source = list.length > 0 ? list[0].children || list : []
          this.deptOptions = this.normalizeDeptOptions(source)
          this.syncDeptPath()
          this.syncDeptCompany()
          this.loadPostOptions(this.model.dept)
        })
        .catch(() => {
          this.deptOptions = []
          this.deptPath = []
          this.loadPostOptions(this.model.dept)
        })
        .finally(() => {
          this.mainDeptLoading = false
        })
    },
    // 岗位和职级均依赖部门；切换部门前先清空旧选项，避免跨部门残留。
    loadPostOptions(deptId) {
      const currentPostId = this.model.postId
      this.postRows = []
      this.postOptions = []
      this.postRankOptions = []
      this.syncDeptCompany()
      if (!deptId) {
        this.model.postId = ''
        this.model.postRank = ''
        return Promise.resolve()
      }
      return getAction('/hrJobSequence/hrJobSequence/getChildSequences', {
        deptId,
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 99999,
      })
        .then((res) => {
          const rows = Array.isArray(res) ? res : (res && res.result) || []
          this.postRows = rows
          this.postOptions = rows.map((item) => ({
            label: item.postName,
            value: item.id,
          }))
          const currentPost = rows.find((item) => String(item.id) === String(currentPostId))
          this.postRankOptions = ((currentPost && currentPost.hrJobLevels) || []).map((item) => ({
            label: item.levelName,
            value: item.id,
          }))
          // 编辑模式下同步已有岗位的个人身份
          if (currentPost && currentPost.processIdentity) {
            this.model.zjlb = currentPost.processIdentity
          }
        })
        .catch(() => {
          this.postRows = []
          this.postOptions = []
          this.postRankOptions = []
          this.model.postId = ''
          this.model.postRank = ''
        })
    },
    // 将组织树整理为 Cascader 数据，并把一级组织 ID 透传为 companyId。
    normalizeDeptOptions(list = [], parentPath, rootValue) {
      const path = parentPath || []
      return (list || [])
        .filter((item) => item && (item.id || item.key || item.value || item.name || item.title))
        .map((item) => {
          const label = item.name || item.title || ''
          const value = String(item.id || item.key || item.value || label)
          const companyId = rootValue || value
          const children = this.normalizeDeptOptions(item.children || [], path.concat(value), companyId)
          const info = {
            label,
            title: label,
            value,
            key: value,
            companyId,
            mainDeptPath: item.mainDeptPath || '',
            isLeaf: !children.length,
            children,
          }
          if (!children.length) delete info.children
          return info
        })
    },
    // 接口只保存末级部门 ID，回显时需要反查 Cascader 的完整路径。
    syncDeptPath() {
      this.deptPath = this.model.dept ? this.findDeptPath(this.deptOptions, this.model.dept) : []
    },
    findDeptPath(list, targetValue, parentPath) {
      const path = parentPath || []
      const normalizedTarget = String(targetValue || '')
      for (let index = 0; index < (list || []).length; index++) {
        const item = list[index]
        const nextPath = path.concat(String(item.value))
        if (String(item.value) === normalizedTarget) return nextPath
        const matchedPath = this.findDeptPath(item.children || [], normalizedTarget, nextPath)
        if (matchedPath.length) return matchedPath
      }
      return []
    },
    findDeptByValue(list, targetValue) {
      const normalizedTarget = String(targetValue || '')
      for (let index = 0; index < (list || []).length; index++) {
        const item = list[index]
        if (String(item.value) === normalizedTarget) return item
        const matchedDept = this.findDeptByValue(item.children || [], normalizedTarget)
        if (matchedDept) return matchedDept
      }
      return null
    },
    // 根据当前部门节点同步所属公司；部门树未加载时保留接口原值。
    syncDeptCompany() {
      if (!this.model.dept) {
        this.model.companyId = ''
        return
      }
      if (!this.deptOptions.length) return
      const currentDept = this.findDeptByValue(this.deptOptions, this.model.dept)
      this.model.companyId = currentDept ? currentDept.companyId : ''
    },
    // 部门变化后岗位和职级均失效，清空后按新部门重新加载。
    handleDeptChange(value, selectedOptions) {
      console.log('ddddddddddd')
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      const currentDept =
        Array.isArray(selectedOptions) && selectedOptions.length
          ? selectedOptions[selectedOptions.length - 1]
          : this.findDeptByValue(this.deptOptions, path[path.length - 1])
      this.deptPath = path
      this.model.dept = currentDept ? String(currentDept.value || '') : ''
      this.model.companyId = currentDept ? currentDept.companyId : ''
      // 获取节点的 mainDeptPath 并去除最后一个 /
      if (currentDept && currentDept.mainDeptPath) {
        const deptPath = currentDept.mainDeptPath.replace(/\\/g, '/')
        this.model.deptPath = deptPath.endsWith('/') ? deptPath.slice(0, -1) : deptPath
      } else {
        this.model.deptPath = ''
      }
      this.clearValidate(['dept'])
      this.model.postId = ''
      this.model.postRank = ''
      this.model.zjlb = ''
      this.loadPostOptions(this.model.dept)
      this.generateEmployeeNo(this.model.companyId)
    },
    filterDeptOption(inputValue, path) {
      const keyword = String(inputValue || '').toLowerCase()
      return (path || []).some(
        (option) =>
          String(option.label || option.title || '')
            .toLowerCase()
            .indexOf(keyword) > -1
      )
    },
    // 岗位切换后只保留该岗位下的职级，并清除旧职级选择。
    handlePostChange(value) {
      const currentPost = this.postRows.find((item) => String(item.id) === String(value || ''))
      this.postRankOptions = ((currentPost && currentPost.hrJobLevels) || []).map((item) => ({
        label: item.levelName,
        value: item.id,
      }))
      this.model.postRank = ''
      // 同步岗位的流程身份到个人身份字段
      this.model.zjlb = (currentPost && currentPost.processIdentity) || ''
    },
    validateIdCard(rule, value, callback) {
      if (!value) {
        callback()
        return
      }
      const idCardRule = /(^\d{15}$)|(^\d{17}(\d|X|x)$)/
      if (!idCardRule.test(value)) {
        callback(new Error('请输入正确的身份证号'))
        return
      }
      callback()
    },
    handleInputBlur(field) {
      if (field.prop === 'no') {
        this.checkNoUniqueness(this.model.no)
      }
    },
    // 工号失去焦点时检查唯一性
    checkNoUniqueness(val) {
      if (!val || !String(val).trim()) {
        return
      }
      getAction('/unique/common/checkUniqueMsg', {
        tableName: 'hr_employee_information',
        columnName: 'no',
        value: String(val).trim(),
      })
        .then((res) => {
          if (res.success && res.result) {
            if (res.result.includes('重复')) {
              this.$set(this.model, 'no', '')
              this.$nextTick(() => {
                if (!this.$refs.form) return
                const field = this.$refs.form.fields.find((f) => f.prop === 'no')
                if (!field) return
                field.validateState = 'error'
                field.validateMessage = res.message
              })
            }
          } else {
            this.$nextTick(() => {
              if (!this.$refs.form) return
              const field = this.$refs.form.fields.find((f) => f.prop === 'no')
              if (!field) return
              field.validateState = 'success'
              field.validateMessage = ''
            })
          }
        })
        .catch((err) => {
          console.error('工号唯一性校验失败:', err)
        })
    },

    generateEmployeeNo(companyId) {
      if (!companyId) {
        this.$set(this.model, 'no', '')
        return
      }
      getAction('/hr_no_config/hrNoConfig/generateNo', { companyId })
        .then((res) => {
          if (res && res.success && res.result) {
            this.$set(this.model, 'no', res.result)
          } else {
            console.warn('生成工号失败:', res.message)
          }
        })
        .catch((err) => {
          console.error('生成工号失败:', err)
        })
    },

    validatePhoneNumber(rule, value, callback) {
      if (!value) {
        callback(new Error('请输入手机号码'))
        return
      }
      const phoneRule = /^1[3-9]\d{9}$/
      if (!phoneRule.test(value)) {
        callback(new Error('请输入正确的手机号码'))
        return
      }
      callback()
    },
    validateEmail(rule, value, callback) {
      if (!value) {
        callback()
        return
      }
      const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRule.test(value)) {
        callback(new Error('请输入正确的电子邮箱'))
        return
      }
      callback()
    },
  },
}
</script>

<style scoped lang="less">
.employee-basic-information-form {
  .employee-section {
    margin-bottom: 24px;
  }

  .employee-section:last-child {
  }

  .employee-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding: 6px 0;
    border-bottom: 2px solid rgba(37, 99, 235, 0.1);
    color: #2563eb;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .employee-section-title .anticon {
    color: rgba(37, 99, 235, 0.45);
    font-size: 14px;
  }

  .employee-photo-section {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 18px 20px;
    border: 1px dashed #e2e8f0;
    border-radius: 8px;
    background: #f8fafd;
  }

  .employee-photo-item {
    flex-shrink: 0;
    margin-bottom: 0;
  }

  .employee-photo-hint {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.6;
  }

  .employee-photo-hint strong {
    color: #1a2a3d;
    font-weight: 600;
  }

  .employee-form-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 14px 16px;
    align-items: start;
    align-content: start;
  }

  .employee-field {
    min-width: 0;
  }

  .employee-field--span-2 {
    grid-column: span 2;
  }

  .employee-field--span-3 {
    grid-column: span 3;
  }

  .employee-label {
    margin-bottom: 4px;
    color: #64748b;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0.04em;
  }

  .employee-label--required::after {
    color: #ef4444;
    content: ' *';
  }

  /deep/ .ant-form-item {
    margin-bottom: 0;
  }

  /deep/ .ant-form-item-control {
    line-height: normal;
  }

  /deep/ .ant-input,
  /deep/ .ant-select-selection,
  /deep/ .ant-input-number,
  /deep/ .ant-calendar-picker-input,
  /deep/ textarea.ant-input {
    border-color: #e2e8f0;
    border-radius: 8px;
    color: #1a2a3d;
    font-size: 13px;
    transition: all 0.2s ease;
  }

  /deep/ .ant-input,
  /deep/ .ant-calendar-picker-input {
    height: 38px;
    padding-right: 12px;
    padding-left: 12px;
  }

  /deep/ .ant-calendar-picker {
    min-width: 0 !important;
  }

  /deep/ .ant-input-number {
    width: 100%;
    height: 38px;
  }

  /deep/ .ant-input-number-input {
    height: 36px;
  }

  /deep/ .ant-select-selection--single {
    height: 38px;
  }

  /deep/ .ant-select-selection__rendered {
    line-height: 36px;
  }

  /deep/ .ant-calendar-picker,
  /deep/ .employee-main-dept-cascader,
  /deep/ .employee-main-dept-cascader .ant-cascader-picker {
    width: 100%;
  }

  /deep/ .employee-main-dept-cascader .ant-cascader-input.ant-input {
    height: 38px;
  }

  /deep/ .ant-input:focus,
  /deep/ .ant-select-focused .ant-select-selection,
  /deep/ .ant-input-number-focused,
  /deep/ .ant-calendar-picker:hover .ant-calendar-picker-input,
  /deep/ .ant-calendar-picker-input:focus,
  /deep/ textarea.ant-input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }

  /deep/ .ant-input::placeholder,
  /deep/ textarea.ant-input::placeholder {
    color: rgba(37, 99, 235, 0.24);
  }

  /deep/ .ant-input[readonly],
  /deep/ .ant-input[disabled],
  /deep/ .ant-select-disabled .ant-select-selection,
  /deep/ .ant-input-number-disabled,
  /deep/ .ant-calendar-picker-input[disabled] {
    color: #8fa0b8;
  }

  /deep/ .ant-form-explain {
    margin-top: 2px;
    font-size: 12px;
  }
}

.employee-photo-upload {
  /deep/ .img {
    width: 100%;
  }

  /deep/ .ant-upload.ant-upload-select-picture-card,
  /deep/ .ant-upload-list-picture-card-container,
  /deep/ .ant-upload-list-picture-card .ant-upload-list-item {
    width: 100px;
    height: 100px;
    margin: 0;
    border-radius: 14px;
  }

  /deep/ .ant-upload.ant-upload-select-picture-card {
    border: 2px dashed rgba(37, 99, 235, 0.2);
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(37, 99, 235, 0.02));
  }

  /deep/ .ant-upload.ant-upload-select-picture-card:hover {
    border-color: #2563eb;
    background: rgba(37, 99, 235, 0.04);
  }

  /deep/ .iconp {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    height: 100%;
    color: #64748b;
  }

  /deep/ .iconp .anticon {
    color: rgba(37, 99, 235, 0.35);
    font-size: 22px;
  }

  /deep/ .ant-upload-text {
    margin-top: 0;
    color: #64748b;
    font-size: 11px;
  }

  /deep/ .ant-upload-list-item-info > span,
  /deep/ .ant-upload-list-item-thumbnail {
    display: block;
    width: 100%;
    height: 100%;
  }

  /deep/ .ant-upload-list-item-thumbnail img {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    object-fit: cover;
  }
}

@media (max-width: 1200px) {
  .employee-basic-information-form .employee-form-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .employee-basic-information-form {
    .employee-form-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .employee-field--span-2,
    .employee-field--span-3 {
      grid-column: 1 / -1;
    }

    .employee-photo-section {
      align-items: flex-start;
    }
  }
}

@media (max-width: 640px) {
  .employee-basic-information-form {
    .employee-form-grid {
      grid-template-columns: 1fr;
    }

    .employee-photo-section {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }
}
</style>