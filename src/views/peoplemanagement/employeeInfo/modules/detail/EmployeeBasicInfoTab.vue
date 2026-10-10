<template>
  <section class="detail-section detail-basic-section">
    <div class="detail-section-header">
      <div class="section-title-text">
        <a-icon type="user" />
        基本身份信息
      </div>
      <div class="detail-edit-actions">
        <a-button v-if="!isEditing" class="btn-edit-basic" size="small" @click="handleEdit">
          <a-icon type="edit" />
          编辑
        </a-button>
        <template v-else>
          <a-button class="btn-save-basic" type="primary" size="small" :loading="saving" @click="handleSave">
            保存
          </a-button>
          <a-button class="btn-cancel-basic" size="small" :disabled="saving" @click="handleCancel"> 取消 </a-button>
        </template>
      </div>
    </div>

    <a-form-model ref="form" :model="editModel" :rules="validatorRules" class="detail-edit-form">
      <div v-for="group in visibleFieldGroups" :key="group.key" class="detail-field-group">
        <div v-if="group.divider" class="sub-divider">
          <span class="line"></span>
          <span class="label">{{ group.title }}</span>
          <span class="line"></span>
        </div>
        <div class="field-grid">
          <div v-for="field in group.fields" :key="group.key + '-' + field.prop" class="field-item" :class="field.span">
            <label class="field-label"> <span v-if="field.required" class="required">*</span>{{ field.label }} </label>

            <template v-if="!isEditing">
              <div
                v-if="field.type === 'upload'"
                class="field-display field-photo-display"
                :class="{ empty: !getPhotoUrl() }"
              >
                <img v-if="getPhotoUrl()" :src="getPhotoUrl()" alt="员工照片" />
                <span v-else class="field-photo-empty">未上传</span>
              </div>
              <div
                v-else
                class="field-display"
                :style="field.diyStyle"
                :class="{ empty: formatFieldValue(field) === '-' }"
              >
                {{ formatFieldValue(field) }}
              </div>
            </template>

            <a-form-model-item v-else :prop="field.prop">
              <j-image-upload
                v-if="field.type === 'upload'"
                v-model="editModel[field.prop]"
                class="detail-photo-upload"
                text="点击上传照片"
                accept=".png,.jpg,.jpeg"
              ></j-image-upload>
              <a-input
                v-if="field.type === 'input'"
                v-model="editModel[field.prop]"
                :maxLength="field.maxLength"
                :disabled="field.disabled"
                placeholder="请输入"
              ></a-input>

              <a-select
                v-else-if="field.type === 'select'"
                v-model="editModel[field.prop]"
                allowClear
                placeholder="请选择"
                :getPopupContainer="getPopupContainer"
              >
                <a-select-option v-for="item in getOptions(field)" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>

              <j-dict-select-tag
                v-else-if="field.type === 'dict'"
                type="list"
                v-model="editModel[field.prop]"
                :dictCode="field.dictCode"
                :disabled="field.disabled"
                placeholder="请选择"
              />

              <j-date
                v-else-if="field.type === 'date'"
                v-model="editModel[field.prop]"
                date-format="YYYY-MM-DD"
                placeholder="请选择"
                style="width: 100%"
                :disabled="field.disabled"
                @change="handleDateChange(field, $event)"
              />

              <a-date-picker
                v-else-if="field.type === 'datetime'"
                :value="bdrqPickerValue"
                :show-time="{ format: 'HH:mm' }"
                format="YYYY-MM-DD HH:mm"
                placeholder="请选择"
                style="width: 100%; min-width: 154.83px"
                :getCalendarContainer="getPopupContainer"
                @change="handleBdrqChange"
              />

              <a-input-number
                v-else-if="field.type === 'number'"
                v-model="editModel[field.prop]"
                :min="field.min"
                :precision="field.precision"
                placeholder="请输入"
                style="width: 100%"
                @change="handleNumberChange(field, $event)"
              />

              <a-cascader
                v-else-if="field.type === 'dept'"
                :value="deptValue"
                :options="mainDeptOptions"
                :disabled="mainDeptLoading"
                :show-search="{ filter: filterMainDept }"
                :getPopupContainer="getPopupContainer"
                :placeholder="mainDeptLoading ? '加载中...' : '请选择'"
                expand-trigger="hover"
                :change-on-select="true"
                @change="handleDeptChange"
              />

              <a-select
                v-else-if="field.type === 'post'"
                v-model="editModel.postId"
                allowClear
                showSearch
                optionFilterProp="children"
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
                v-model="editModel.postRank"
                allowClear
                showSearch
                optionFilterProp="children"
                placeholder="请选择"
                :getPopupContainer="getPopupContainer"
                :disabled="!editModel.postId"
              >
                <a-select-option v-for="item in postRankOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </div>
        </div>
      </div>
    </a-form-model>
  </section>
</template>

<script>
import { getAction, getFileAccessHttpUrl } from '@/api/manage'
import { checkUserHavePermission } from '@/utils/util'
import moment from 'moment'
import { calculateEmployeeWorkYears } from './employeeWorkYears'

const GENDER_OPTIONS = [
  { label: '男', value: '男' },
  { label: '女', value: '女' },
]

const YES_NO_OPTIONS = [
  { label: '否', value: '否' },
  { label: '是', value: '是' },
]

const FIELD_GROUPS = [
  {
    key: 'identity',
    title: '基本身份信息',
    fields: [
      // { label: '员工照片', prop: 'photo', type: 'upload', span: 'wide3' },
      { label: '姓名', prop: 'name', type: 'input', required: true, maxLength: 20 },
      { label: '性别', prop: 'gender', type: 'select', optionsKey: 'genderOptions' },
      { label: '身份证号', prop: 'idCard', type: 'input', maxLength: 18 },
      { label: '民族', prop: 'mz', type: 'input' },
      { label: '籍贯', prop: 'jg', type: 'input' },
      { label: '出生年月', prop: 'birthDate', type: 'date' },
      { label: '婚姻状况', prop: 'hyzk', type: 'dict', dictCode: 'hyzt', displayKeys: ['hjxz'] },
      { label: '政治面貌', prop: 'zzmm', type: 'input' },
      { label: '手机号码', prop: 'phoneNumber', type: 'input', required: true, maxLength: 11 },
      { label: '电子邮箱', prop: 'email', type: 'input' },
      { label: '兴趣爱好', prop: 'xqah', type: 'input' },
      { label: '住宿方式', prop: 'zsfs', type: 'dict', dictCode: 'zsfs', displayKeys: ['zsfs_dictText', 'zsfs'] },
      { label: '户籍性质', prop: 'hjxz', type: 'dict', dictCode: 'hjxz', displayKeys: ['hjxz_dictText', 'hjxz'] },
      { label: '户籍地址', prop: 'hjdz', type: 'input', span: 'wide' },
      { label: '居住地', prop: 'jzd', type: 'input', span: 'wide-3' },
      { label: '健康状况', prop: 'jkzk', type: 'dict', dictCode: 'jkzk', displayKeys: ['jkzk_dictText', 'jkzk'] },
      { label: '以往病史', prop: 'ywbs', type: 'input', span: 'wide' },
      { label: '暂住地址', prop: 'zzdz', type: 'input', span: 'wide-3' },
    ],
  },
  {
    key: 'job',
    title: '工作岗位信息',
    divider: true,
    fields: [
      { label: '卡号', prop: 'card', type: 'input' },
      { label: '工号', prop: 'no', type: 'input', disabled: true },
      {
        label: '员工类型',
        prop: 'employeeType',
        type: 'dict',
        dictCode: 'yglx',
        displayKeys: ['employeeType_dictText', 'employeeType'],
      },
      { label: '所属部门', prop: 'dept', type: 'dept', required: true, span: 'wide-3' },
      { label: '岗位', prop: 'postId', type: 'post', displayKeys: ['postId_dictText', 'postId'] },
      { label: '岗位备注', prop: 'gwbz', type: 'input' },
      { label: '职级', prop: 'postRank', type: 'rank', displayKeys: ['postRank_dictText', 'postRank'] },
      { label: '个人身份', prop: 'zjlb', type: 'dict', dictCode: 'process_identity', displayKeys: ['zjlb_dictText', 'zjlb'], disabled: true },
      // { label: '是否存在竞业限制协议', prop: 'sfczjyxzxy', type: 'select', optionsKey: 'yesNoOptions', span: 'wide' }
      { label: '是否存在竞业限制协议', prop: 'sfczjyxzxy', type: 'select', optionsKey: 'yesNoOptions', span: '' },
    ],
  },
  {
    key: 'contract',
    title: '入职合同信息',
    divider: true,
    fields: [
      { label: '招聘计划', prop: 'sourceTag', type: 'input', span: 'wide' },
      { label: '合同归属', prop: 'constractBelong', type: 'select', optionsKey: 'constractBelongOptions' },
      {
        label: '合同类型',
        prop: 'constractType',
        type: 'dict',
        dictCode: 'htlx',
        displayKeys: ['constractType_dictText', 'constractType'],
      },
      { label: '合同开始日期', prop: 'contractStartDate', type: 'date' },
      { label: '合同到期日期', prop: 'contractExpDate', type: 'date' },
      { label: '入职日期', prop: 'entryDate', type: 'date' },
      { label: '试用期（月）', prop: 'syq', type: 'number', min: 0, precision: 0 },
      { label: '报道时间', prop: 'bdrq', type: 'datetime', required: true },
      { label: '计划转正日期', prop: 'actualDate', type: 'date', disabled: true },
      { label: '工作年限', prop: 'workYears', type: 'input', disabled: true },
      { label: '正式离职日期', prop: 'formalResignDate', type: 'date', disabled: false, visibleStatus: '已离职' }, // status离职才显示
      // { label: '正式离职日期', prop: 'formalResignDate', type: 'input', disabled: true, visibleStatus: '已离职' } // status离职才显示
    ],
  },
  {
    key: 'salary',
    title: '薪资与社会保障信息',
    divider: true,
    fields: [
      { label: '薪资（K）', prop: 'salary', type: 'number', min: 0, precision: 1, auth: 'employee:info:salary' },
      { label: '薪资类型', prop: 'salaryType', type: 'dict', dictCode: 'xzlx', auth: 'employee:info:salaryType' },
      { label: '工资卡银行', prop: 'gzkyh', type: 'dict', dictCode: 'yhlx', displayKeys: ['gzkyh_dictText', 'gzkyh'] },
      {
        label: '工资卡银行卡号',
        prop: 'gzkyhkh',
        type: 'input',
        diyStyle: {
          fontSize: '12.2px',
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
      { label: '工资卡开户行', prop: 'gzkkhh', type: 'input', span: 'wide' },
      {
        label: '社保情况',
        prop: 'sbqk',
        type: 'dict',
        dictCode: 'sbqk',
        auth: 'employee:info:sbqk',
        displayKeys: ['sbqk_dictText', 'sbqk'],
        diyStyle: {
          fontSize: '12.2px',
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
      { label: '社保电脑号', prop: 'sbdnh', type: 'input' },
      {
        label: '公积金情况',
        prop: 'gjjqk',
        type: 'dict',
        dictCode: 'gjjqk',
        auth: 'employee:info:gjjqk',
        displayKeys: ['gjjqk_dictText', 'gjjqk'],
        diyStyle: {
          fontSize: '12.2px',
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
      { label: '公积金电脑号', prop: 'gjjdhh', type: 'input' },
      { label: '公积金银行', prop: 'gjjyh', type: 'dict', dictCode: 'yhlx', displayKeys: ['gjjyh_dictText', 'gjjyh'] },
      {
        label: '公积金银行卡号',
        prop: 'gjjyhkh',
        type: 'input',
        diyStyle: {
          fontSize: '12.2px',
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
      {
        label: '公积金开户行',
        prop: 'gjjkhyh',
        type: 'input',
        span: 'wide',
        displayKeys: ['gjjkhyh_dictText', 'gjjkhyh'],
      },
    ],
  },
]

function createDefaultModel() {
  return {
    id: '',
    dept: '',
    mainDept: '',
    companyId: '',
    no: '',
    name: '',
    phoneNumber: '',
    email: '',
    idCard: '',
    gender: '',
    photo: '',
    salary: undefined,
    postId: '',
    zjlb: '',
    gwbz: '',
    postRank: '',
    employeeType: '',
    entryDate: '',
    actualDate: '',
    workYears: '',
    constractBelong: '',
    constractType: '',
    mz: '',
    jg: '',
    birthDate: '',
    hyzk: '',
    zzmm: '',
    xqah: '',
    zsfs: '',
    hjxz: '',
    hjdz: '',
    jzd: '',
    jkzk: '',
    ywbs: '',
    zzdz: '',
    card: '',
    sfczjyxzxy: '',
    sourceTag: '',
    contractStartDate: '',
    contractExpDate: '',
    syq: 6,
    bdrq: '',
    salaryType: '',
    gzkyh: '',
    gzkyhkh: '',
    gzkkhh: '',
    sbqk: '',
    sbdnh: '',
    gjjqk: '',
    gjjdhh: '',
    gjjyh: '',
    gjjkhyh: '',
    gjjyhkh: '',
  }
}

function cloneDeep(value) {
  return JSON.parse(JSON.stringify(value || {}))
}

export default {
  name: 'EmployeeBasicInfoTab',
  inject: ['constractBelongOptions'],
  props: {
    employee: {
      type: Object,
      default: null,
    },
    department: {
      type: Object,
      default: null,
    },
    saving: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isEditing: false,
      editModel: createDefaultModel(),
      snapshotModel: createDefaultModel(),
      fieldGroups: FIELD_GROUPS,
      genderOptions: GENDER_OPTIONS,
      yesNoOptions: YES_NO_OPTIONS,
      mainDeptOptions: [],
      mainDeptLoading: false,
      postRows: [],
      postOptions: [],
      postRankOptions: [],
      validatorRules: {
        name: [{ required: true, message: '请输入员工姓名' }],
        idCard: [{ validator: this.validateIdCard }],
        phoneNumber: [{ validator: this.validatePhoneNumber }],
        email: [{ validator: this.validateEmail }],
        dept: [{ required: true, message: '请选择所属部门' }],
        bdrq: [{ required: true, message: '请选择报道时间' }],
      },
    }
  },
  computed: {
    deptValue() {
      return this.getPathValueByValue(this.editModel.dept)
    },
    bdrqPickerValue() {
      const normalizedValue = this.normalizeDateTimeString(this.editModel.bdrq)
      const pickerValue = moment(normalizedValue, 'YYYY-MM-DD HH:mm:ss', true)
      return pickerValue.isValid() ? pickerValue : null
    },
    visibleFieldGroups() {
      return this.fieldGroups.map((group) =>
        Object.assign({}, group, {
          fields: group.fields.filter((field) => this.isFieldVisible(field)),
        })
      )
    },
  },
  watch: {
    employee: {
      immediate: true,
      deep: true,
      handler(record) {
        if (!this.isEditing) {
          this.resetEditModel(record)
        }
      },
    },
  },
  created() {
    this.loadMainDeptOptions()
  },
  beforeDestroy() {
    if (this.isEditing) {
      this.$emit('cancel-edit')
      this.$emit('editing-change', false)
    }
  },
  methods: {
    // 将下拉弹层挂载到当前控件父节点，避免详情页内定位偏移。
    getPopupContainer(node) {
      return node.parentNode
    },
    // 根据字段配置读取下拉选项。
    getOptions(field) {
      return this[field.optionsKey] || []
    },
    isFieldVisible(field) {
      if (field.auth) {
        console.log(checkUserHavePermission(field.auth), '????????????????')
      }
      if (field.auth && !checkUserHavePermission(field.auth)) {
        return false
      }
      if (!field.visibleStatus) {
        return true
      }
      return this.readRawValue(['status']) === field.visibleStatus
    },
    // 点击编辑时深拷贝当前员工，建立编辑模型和取消快照。
    handleEdit() {
      const current = Object.assign(createDefaultModel(), cloneDeep(this.employee))
      if (current.syq === undefined || current.syq === null || current.syq === '') {
        current.syq = 6
      }
      current.bdrq = this.normalizeDateTimeString(current.bdrq)
      this.editModel = current
      this.syncWorkYears()
      this.snapshotModel = cloneDeep(this.editModel)
      this.isEditing = true
      this.$emit('editing-change', true)
      this.syncActualDateByProbation(false)
      this.syncDeptSelection()
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
    // 取消编辑时用快照恢复本地模型。
    handleCancel() {
      this.editModel = Object.assign(createDefaultModel(), cloneDeep(this.snapshotModel))
      this.isEditing = false
      this.$emit('cancel-edit')
      this.$emit('editing-change', false)
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
    // 校验后把深拷贝数据交给父组件保存。
    handleSave() {
      if (!this.$refs.form) {
        return
      }
      this.$refs.form.validate((valid) => {
        if (!valid) {
          return
        }
        this.syncWorkYears()
        this.syncActualDateByProbation(Boolean(this.editModel.entryDate))
        this.editModel.bdrq = this.normalizeDateTimeString(this.editModel.bdrq)
        this.$emit('save', cloneDeep(this.editModel), this.finishSave, this.keepEditing)
      })
    },
    // 保存成功后切回展示态并同步最新记录。
    finishSave(record) {
      this.resetEditModel(record)
      this.snapshotModel = cloneDeep(this.editModel)
      this.isEditing = false
      this.$emit('editing-change', false)
    },
    // 保存失败时保留编辑态和当前输入值。
    keepEditing() {
      this.isEditing = true
      this.$emit('editing-change', true)
    },
    // 外部数据变化时刷新本地编辑模型。
    resetEditModel(record) {
      const next = Object.assign(createDefaultModel(), cloneDeep(record))
      if (next.syq === undefined || next.syq === null || next.syq === '') {
        next.syq = 6
      }
      next.bdrq = this.normalizeDateTimeString(next.bdrq)
      next.workYears = calculateEmployeeWorkYears(next)
      this.editModel = next
      this.snapshotModel = cloneDeep(next)
      if (next.dept) {
        this.syncDeptSelection()
      }
    },
    // 展示态按字段类型和字典文本格式化内容。
    formatFieldValue(field) {
      if (field.type === 'dept') {
        return this.getDepartmentDisplay()
      }
      if (field.type === 'datetime') {
        return this.formatDateTime(this.readRawValue(field.displayKeys || [field.prop]))
      }
      if (field.prop === 'workYears') {
        return this.formatValue(calculateEmployeeWorkYears(this.employee))
      }
      return this.formatValue(this.readRawValue(field.displayKeys || [field.prop]))
    },
    // 读取员工原始字段值。
    readRawValue(keys) {
      const source = this.employee || {}
      const list = Array.isArray(keys) ? keys : [keys]
      for (let i = 0; i < list.length; i++) {
        const value = source[list[i]]
        if (value !== undefined && value !== null && value !== '') {
          return value
        }
      }
      return ''
    },
    // 普通展示值统一为空时显示短横线。
    formatValue(value) {
      if (value === undefined || value === null || value === '') {
        return '-'
      }
      const text = String(value)
      // if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text)) {
      //   return text.replace('T', ' ').slice(0, 19)
      // }
      return text
    },
    // 报道时间展示到分钟。
    formatDateTime(value) {
      const normalizedValue = this.normalizeDateTimeString(value)
      return normalizedValue ? normalizedValue.slice(0, 16) : '-'
    },
    // 员工照片使用 JEECG 文件访问地址回显。
    getPhotoUrl() {
      const photo = this.readRawValue(['photo'])
      if (!photo) {
        return ''
      }
      if (/^(https?:)?\/\//.test(photo) || photo.indexOf('data:image') === 0) {
        return photo
      }
      return getFileAccessHttpUrl(photo)
    },
    // 所属部门展示优先使用后端文本和列表页传入部门。
    getDepartmentDisplay() {
      const mainDeptPath = this.normalizeDepartmentPath(this.readRawValue(['mainDeptPath']))
      if (mainDeptPath) {
        return mainDeptPath
      }
      const mainDept = this.readRawValue(['mainDept', 'dept_dictText'])
      if (mainDept) {
        return this.formatValue(mainDept)
      }
      if (this.department && this.department.title) {
        return this.department.title
      }
      return this.formatValue(this.readRawValue(['dept']))
    },
    // 部门路径去除空节点。
    normalizeDepartmentPath(value) {
      return String(value || '')
        .split('/')
        .map((item) => item.trim())
        .filter((item) => item)
        .join('/')
    },
    // 入职日期变更后同步工龄和计划转正日期。
    handleDateChange(field, value) {
      if (field.prop === 'entryDate') {
        this.editModel.entryDate = value
        this.syncWorkYears()
        this.syncActualDateByProbation(true)
      }
      if (field.prop === 'formalResignDate') {
        this.editModel.formalResignDate = value
        this.syncWorkYears()
      }
    },
    // 试用期变更后同步计划转正日期。
    handleNumberChange(field, value) {
      if (field.prop === 'syq') {
        this.editModel.syq = value
        this.syncActualDateByProbation(true)
      }
    },
    // 报道时间选择后存成带秒的后端格式。
    handleBdrqChange(value) {
      this.editModel.bdrq = this.normalizeDateTimeString(value)
    },
    // 将 Date、moment 或日期字符串统一为 YYYY-MM-DD HH:mm:00。
    normalizeDateTimeString(value) {
      if (!value) {
        return ''
      }
      if (moment.isMoment(value)) {
        return value.clone().second(0).format('YYYY-MM-DD HH:mm:ss')
      }
      if (value instanceof Date) {
        const dateValue = moment(value)
        return dateValue.isValid() ? dateValue.second(0).format('YYYY-MM-DD HH:mm:ss') : ''
      }
      const textValue = String(value).trim()
      if (!textValue) {
        return ''
      }
      const dateValue = moment(
        textValue,
        ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY/MM/DD HH:mm:ss', 'YYYY/MM/DD HH:mm'],
        true
      )
      const nativeDateValue = new Date(textValue)
      const looseDateValue = dateValue.isValid() ? dateValue : moment(nativeDateValue)
      return looseDateValue.isValid() ? looseDateValue.second(0).format('YYYY-MM-DD HH:mm:ss') : textValue
    },
    // 按入职日期和试用期刷新计划转正日期。
    syncActualDateByProbation(forceUpdate) {
      const actualDate = this.calculateActualDate(this.editModel.entryDate, this.editModel.syq)
      if (actualDate || forceUpdate) {
        this.editModel.actualDate = actualDate
      }
    },
    // 计算入职日期加试用期月份后的日期。
    calculateActualDate(entryDate, months) {
      if (!entryDate && entryDate !== 0) {
        return ''
      }
      const monthCount = Number(months)
      if (Number.isNaN(monthCount)) {
        return ''
      }
      const entryDateValue = new Date(String(entryDate).slice(0, 10).replace(/-/g, '/'))
      if (Number.isNaN(entryDateValue.getTime())) {
        return ''
      }
      const originalDay = entryDateValue.getDate()
      const resultDate = new Date(entryDateValue.getTime())
      resultDate.setDate(1)
      resultDate.setMonth(resultDate.getMonth() + monthCount)
      const lastDay = new Date(resultDate.getFullYear(), resultDate.getMonth() + 1, 0).getDate()
      resultDate.setDate(Math.min(originalDay, lastDay))
      return this.formatDate(resultDate)
    },
    // 将 Date 对象格式化为 YYYY-MM-DD。
    formatDate(value) {
      const year = value.getFullYear()
      const month = String(value.getMonth() + 1).padStart(2, '0')
      const day = String(value.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    // 根据员工状态同步工作年限。
    syncWorkYears() {
      this.editModel.workYears = calculateEmployeeWorkYears(this.editModel)
    },
    // 加载部门树并同步当前部门。
    loadMainDeptOptions() {
      this.mainDeptLoading = true
      return getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 })
        .then((res) => {
          const list = res && res.success && Array.isArray(res.result) && res.result.length ? res.result : []
          const source = list.length > 0 ? list[0].children || list : []
          this.mainDeptOptions = this.normalizeMainDeptOptions(source)
          this.syncDeptSelection()
        })
        .catch(() => {
          this.mainDeptOptions = this.normalizeMainDeptOptions([])
          this.syncDeptSelection()
        })
        .finally(() => {
          this.mainDeptLoading = false
        })
    },
    // 按所属部门加载岗位，并保留当前岗位对应的职级选项。
    loadPostOptions(deptId) {
      const currentPostId = this.editModel.postId
      this.postRows = []
      this.postOptions = []
      this.postRankOptions = []
      if (!deptId) {
        this.editModel.postId = ''
        this.editModel.postRank = ''
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
          if (currentPost && currentPost.processIdentity) {
            this.editModel.zjlb = currentPost.processIdentity
          }
        })
        .catch(() => {
          this.postRows = []
          this.postOptions = []
          this.postRankOptions = []
          this.editModel.postId = ''
          this.editModel.postRank = ''
        })
    },
    // 将后端部门树转换为 a-cascader 可用结构。
    normalizeMainDeptOptions(list = [], parentPath) {
      const path = parentPath || []
      return (list || [])
        .filter((item) => item && (item.id || item.name))
        .map((item) => {
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
            children,
          }
        })
    },
    // 根据部门 ID 查询级联回显路径。
    getPathValueByValue(value) {
      if (!this.mainDeptOptions.length || !value) {
        return []
      }
      return this.findMainDeptPathByValue(this.mainDeptOptions, value)
    },
    // 同步所属部门回显并刷新岗位列表。
    syncDeptSelection() {
      const selectedPath = this.getPathValueByValue(this.editModel.dept)
      if (selectedPath.length) {
        this.applyDeptSelection(selectedPath, this.getMainDeptSelectedOptions(selectedPath))
      }
      this.loadPostOptions(this.editModel.dept)
    },
    // 递归查找部门值对应的级联路径。
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
    // 根据级联路径取出已选中的部门节点链。
    getMainDeptSelectedOptions(pathValue) {
      const selectedPath = Array.isArray(pathValue) ? pathValue.map((item) => String(item)) : []
      const selectedOptions = []
      let source = this.mainDeptOptions
      for (let i = 0; i < selectedPath.length; i++) {
        const currentValue = selectedPath[i]
        const currentOption = (source || []).find((item) => String(item.value) === currentValue)
        if (!currentOption) {
          break
        }
        selectedOptions.push(currentOption)
        source = currentOption.children || []
      }
      return selectedOptions
    },
    // 所属部门变更后清空岗位并重新加载岗位选项。
    handleDeptChange(value, selectedOptions) {
      const selectedPath = Array.isArray(value) ? value.map((item) => String(item)) : []
      this.applyDeptSelection(selectedPath, selectedOptions)
      if (this.$refs.form) {
        this.$refs.form.clearValidate(['dept'])
      }
      this.editModel.postId = ''
      this.editModel.postRank = ''
      this.editModel.zjlb = ''
      this.loadPostOptions(this.editModel.dept)
    },
    // 将部门级联选择结果写入编辑模型。
    applyDeptSelection(pathValue, selectedOptions) {
      const selectedPath = Array.isArray(pathValue) ? pathValue.map((item) => String(item)) : []
      const optionPath =
        Array.isArray(selectedOptions) && selectedOptions.length
          ? selectedOptions
          : this.getMainDeptSelectedOptions(selectedPath)
      if (!selectedPath.length || !optionPath.length) {
        this.editModel.dept = ''
        this.editModel.companyId = ''
        return
      }
      const currentOption = optionPath[optionPath.length - 1]
      this.editModel.dept = String(currentOption.value || selectedPath[selectedPath.length - 1] || '')
      this.editModel.companyId = optionPath.length ? optionPath[0].value : ''
    },
    // 岗位变更后刷新可选职级。
    handlePostChange(value) {
      const currentPost = this.postRows.find((item) => String(item.id) === String(value || ''))
      this.postRankOptions = ((currentPost && currentPost.hrJobLevels) || []).map((item) => ({
        label: item.levelName,
        value: item.id,
      }))
      this.editModel.postRank = ''
      this.editModel.zjlb = (currentPost && currentPost.processIdentity) || ''
    },
    // 部门级联搜索时按节点名称模糊匹配。
    filterMainDept(inputValue, path) {
      const keyword = String(inputValue || '').toLowerCase()
      return (path || []).some(
        (option) =>
          String(option.label || option.title || '')
            .toLowerCase()
            .indexOf(keyword) > -1
      )
    },
    // 校验身份证号格式，允许为空；填写时支持 15 位或 18 位。
    validateIdCard(rule, value, callback) {
      if (!value) {
        callback()
        return
      }
      if (!/^(\d{15}|\d{17}[\dXx])$/.test(value)) {
        callback(new Error('请输入15位或18位身份证号'))
        return
      }
      callback()
    },
    // 校验手机号码必填和格式。
    validatePhoneNumber(rule, value, callback) {
      if (!value) {
        callback(new Error('请输入手机号码'))
        return
      }
      if (!/^1[1-9]\d{9}$/.test(value)) {
        callback(new Error('请输入11位手机号码'))
        return
      }
      callback()
    },
    // 校验电子邮箱格式，允许为空。
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
.detail-photo-upload {
  /deep/ .uploadty-disabled {
    opacity: 1;
  }
}
/deep/ .ant-form-item {
  margin-bottom: 4px;
}
</style>