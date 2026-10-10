import dayjs from 'dayjs'

const GENDER_OPTIONS = [
  { label: '男', value: '男' },
  { label: '女', value: '女' },
]

const YES_NO_OPTIONS = [
  { label: '是', value: '是' },
  { label: '否', value: '否' },
]

export const POLITICAL_STATUS_OPTIONS = [
  { label: '群众', value: '群众' },
  { label: '共青团员', value: '共青团员' },
  { label: '中共党员', value: '中共党员' },
  { label: '预备党员', value: '预备党员' },
  { label: '其他', value: '其他' },
]

export const EDUCATION_LEVEL_OPTIONS = [
  { label: '小学', value: '小学' },
  { label: '初中', value: '初中' },
  { label: '高中', value: '高中' },
  { label: '中专', value: '中专' },
  { label: '大专', value: '大专' },
  { label: '本科', value: '本科' },
  { label: '硕士', value: '硕士' },
  { label: '博士', value: '博士' },
]

const DEGREE_OPTIONS = [
  { label: '学士学位', value: '学士学位' },
  { label: '硕士学位', value: '硕士学位' },
  { label: '博士学位', value: '博士学位' },
]

const field = (key, label, type = 'input', config = {}) => Object.assign({ key, label: label.trim(), type }, config)

const CHILD_DETAIL_KEYS = ['grfj', 'gxsb', 'gzll', 'jbxx', 'jtcy', 'jyjl', 'rzsjtz']
const LEGACY_MAIN_FIELDS = ['ssbm', 'gwmc', 'zjmc']
// 基本信息
const MAIN_TO_JBXX_FIELDS = {
  xm: 'name',
  sjh: 'phoneNumber',
  sfzh: 'idCard',
  yx: 'email',
  xz: 'salary',
  xzlx: 'salaryType',
  yglx: 'employeeType',
  gh: 'no',
  yjrzsj: 'entryDate',
  sjrzsj: 'actualDate',
  htgs: 'constractBelong',
  htlx: 'constractType',
  rzzt: 'status',
  zlzt: 'profileStatus',
  rzfs: 'rzfs',
  companyId: 'companyId',
  dept: 'dept',
  postId: 'postId',
  postRank: 'postRank',
  companyId_dictText: 'gs',
  dept_dictText: 'dept_dictText',
  postId_dictText: 'postId_dictText',
  postRank_dictText: 'postRank_dictText',
}
// 显示
export const BASIC_FIELDS = [
  field('gh', '工号'),
  field('xm', '姓名'),
  field('sjh', '手机号'),
  field('sfzh', '身份证号'),
  field('yx', '邮箱'),
  field('xz', '薪资(k)'),
  field('xzlx', '薪资类型'),
  field('yglx', '员工类型'),
  field('gs', '公司'),
  field('dept_dictText', '所属部门'),
  field('postId_dictText', '岗位名称'),
  field('postRank_dictText', '职级名称'),
  field('yjrzsj', '预计入职时间'),
  // field('rzfs', '入职方式'),
  field('htgs', '合同归属'),
  field('htlx', '合同类型'),
  field('bz', '备注'),
  // field('rzzt', '入职状态'),
  // field('zlzt', '资料状态')
]

const grfj = [
  field('fjlx', '证件类型'),
  field('qdrq', '取得日期', 'date'),
  field('yxqjzr', '有效期截止日', 'date'),
  field('zsbm', '证书编号'),
  field('zsfj', '证书附件', 'upload'),
]

const gxsb = [
  field('xm', '姓名'),
  field('gx', '关系'),
  field('bm', '部门'),
  field('gw', '岗位'),
  field('lxdh', '联系电话'),
]

const gzll = [
  field('gzdw', '工作单位'),
  field('sshy', '所属行业'),
  field('rzgw', '任职岗位'),
  field('zzqssj', '在职起始时间', 'date'),
  field('zzjssj', '在职结束时间', 'date'),
  field('jbnpjgz', '近半年平均工资(k)', 'number'),
  field('lzyy', '离职原因'),
  field('zmrxm', '证明人姓名'),
  field('zmrlxdh', '证明人联系电话'),
]

const jbxx = [
  // 无法修改的字段
  field('name', '员工姓名', 'input', { disabled: true }),
  // 必填字段
  field('gender', '性别', 'select', { options: GENDER_OPTIONS, required: true }),
  field('birthDate', '出生日期', 'date', { required: true }),
  field('mz', '民族', 'input', { required: true }),
  field('jg', '籍贯', 'input', { required: true }),
  // field('idType', '证件类型'),
  field('idCard', '身份证号码', 'input', { required: true, disabled: true }),
  field('hjxz', '户籍性质', 'dict', { dictCode: 'hjxz', required: true }),
  field('hjdz', '户籍地址', 'input', { required: true }),
  field('photo', '员工照片', 'upload', { required: true }),
  field('zzmm', '政治面貌', 'select', { options: POLITICAL_STATUS_OPTIONS, required: true }),
  field('hyzk', '婚姻状况', 'dict', { dictCode: 'hyzt', required: true }),
  field('jkzk', '健康状况', 'dict', { dictCode: 'jkzk', required: true }),
  // 选填字段
  field('ywbs', '以往病史'),
  field('xqah', '兴趣爱好'),
  // 必填且可修改
  field('phoneNumber', '联系方式', 'input', { required: true, disabled: true }),
  // 选填且可修改
  field('email', '邮箱'),
  // field('address', '联系地址'),
  field('jzd', '居住地'),
  field('zzdz', '暂住地址'),
  field('zsfs', '住宿方式', 'dict', { dictCode: 'zsfs', required: true }),
  // field('dormitory', '宿舍信息'),
  // field('card', '员工卡号'),
  //  field('no', '员工工号'),
  // 无法修改的字段
  field('employeeType', '员工类型', 'dict', { dictCode: 'yglx', disabled: true }),
  // field('companyId', '所属公司 ID'), field('dept', '所属部门 ID'),
  // field('mainDept', '主部门'),
  // field('postId', '所属岗位 ID'), field('postRank', '岗位职级 ID'),
  // field('positionInfoId', '岗位信息 ID'),
  // 选填字段
  field('gwbz', '岗位备注'),
  // field('rzfs', '入职方式'),
  // 无法修改的字段
  field('sourceTag', '招聘计划', 'input', { disabled: true }),
  // field('status', '入职状态'),
  field('syq', '试用期（月）', 'number', { min: 0, precision: 0 }),
  // 必填字段
  field('entryDate', '入职日期', 'date', { required: true }),
  // 无法修改的字段
  field('actualDate', '实际到岗日期', 'date', { disabled: true }),
  field('bdrq', '报到日期', 'datetime', { disabled: true }),
  // field('becomeType', '转正类型'),
  field('sjzzrq', '计划转正日期', 'date', { disabled: true }),
  // field('formalResignDate', '正式离职日期', 'date'),
  field('workYears', '工作年限', 'number', { min: 0, precision: 0, disabled: true }),
  // field('entryDirector', '入职维护人'),
  // field('mentor', '导师姓名'),
  // field('profileStatus', '资料状态'),
  // field('informationId', '个人信息 ID'),
  // field('workLocation', '工作厂区 / 位置'),
  // 必填字段
  field('sfczjyxzxy', '是否存在竞业限制协议', 'select', { options: YES_NO_OPTIONS, required: true }),
  // field('constractBelong', '合同归属', 'select', { optionsKey: 'constractBelong' }),
  // 无法修改的字段
  field('constractType', '合同类型', 'dict', { dictCode: 'htlx', disabled: true }),
  field('contractStartDate', '合同开始日期', 'date', {}),
  field('contractExpDate', '合同到期日期', 'date', {}),
  field('salary', '薪资（K）', 'number', { min: 0, precision: 1 }),
  field('salaryType', '薪资类型', 'dict', { dictCode: 'xzlx' }),
  // 选填字段
  field('gzkyhkh', '工资卡银行卡号'),
  field('gzkyh', '工资卡银行', 'dict', { dictCode: 'yhlx' }),
  field('gzkkhh', '工资卡开户行'),
  // field('socialSecurityStatus', '社保状态'),
  // 必填字段
  field('sbqk', '社保情况', 'dict', { dictCode: 'sbqk', required: true }),
  // 选填字段
  field('sbdnh', '社保电脑号'),
  // field('stopSocialSecurityStatus', '社保停缴状态'),
  // field('sbStartDate', '首次社保缴纳日期', 'date'),
  // field('accumulationFundStatus', '公积金状态'),
  // 必填字段
  field('gjjqk', '公积金情况', 'dict', { dictCode: 'gjjqk', required: true }),
  // 选填字段
  field('gjjdhh', '公积金电脑号'),
  // field('stopAccumulationFundStatus', '公积金停缴状态'),
  field('gjjyhkh', '公积金银行卡号'),
  field('gjjyh', '公积金银行', 'dict', { dictCode: 'yhlx' }),
  field('gjjkhyh', '公积金开户银行'),
  // field('byyx', '毕业院校'),
  // field('xl', '学历'),
  // field('zy', '专业'),
  // field('xw', '学位')
]

const jtcy = [
  field('xm', '姓名', 'input', { required: true }),
  field('gx', '关系', 'input', { required: true }),
  field('zw', '职务', 'input', { required: true }),
  field('gzdw', '工作单位', 'input', { required: true }),
  field('lxdh', '联系电话', 'input', { required: true }),
]

const jyjl = [
  field('xlcc', '学历层次', 'select', { options: EDUCATION_LEVEL_OPTIONS, required: true }),
  // 是否全日制 - 根据学历层次动态显示和必填
  field('sfqrz', '是否全日制', 'select', {
    options: YES_NO_OPTIONS,
    dependsOn: {
      field: 'xlcc',
      showWhen: ['大专', '本科', '硕士', '博士'],
      requireWhen: ['大专', '本科', '硕士', '博士'],
    },
  }),
  // 学位 - 改为下拉选择，根据学历层次动态显示和必填
  field('xw', '学位', 'select', {
    options: DEGREE_OPTIONS,
    dependsOn: {
      field: 'xlcc',
      showWhen: ['本科', '硕士', '博士'],
      requireWhen: ['本科', '硕士', '博士'],
    },
  }),
  // 学信网报告 - 大专以上学历必填
  field('xxwbg', '学信网报告', 'upload', {
    dependsOn: {
      field: 'xlcc',
      showWhen: ['大专', '本科', '硕士', '博士'],
      requireWhen: ['大专', '本科', '硕士', '博士'],
    },
  }),
  field('byyxjg', '毕业院校/机构', 'input', { required: true }),
  field('zy', '专业', 'input', { required: true }),
  field('rxsj', '入学时间', 'date'),
  field('bysj', '毕业时间', 'date', { required: true }),
  field('zsbh', '证书编号'),
  field('zypxnr', '专业/培训内容'),
  field('zsfj', '证书附件', 'upload'),
]

export const SUPPLEMENT_GROUPS = [
  { key: 'jbxx', title: '基本信息', fields: jbxx, repeatable: false },
  { key: 'jyjl', title: '教育经历', fields: jyjl },
  { key: 'gzll', title: '工作履历', fields: gzll },
  { key: 'jtcy', title: '家庭成员', fields: jtcy },
  { key: 'grfj', title: '个人附件', fields: grfj },
  { key: 'gxsb', title: '关系申报', fields: gxsb },
]

export function createSupplementRecord(detail) {
  return { hrmRzglId: detail.id, ghId: detail.sfzh }
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== ''
}

function removeLegacyMainFields(detail) {
  LEGACY_MAIN_FIELDS.forEach((key) => delete detail[key])
}

function mergeMainFieldsIntoJbxx(detail) {
  // 子表不参与主表到 jbxx 的映射，避免数组或子记录字段被展开到基本信息中。
  const mainDetail = Object.keys(detail).reduce((result, key) => {
    if (CHILD_DETAIL_KEYS.indexOf(key) === -1) result[key] = detail[key]
    return result
  }, {})

  // 仅同步白名单内的主表非空值，避免系统字段覆盖 jbxx.id，也避免空值清除已有资料。
  Object.keys(MAIN_TO_JBXX_FIELDS).forEach((sourceKey) => {
    if (hasValue(mainDetail[sourceKey])) {
      detail.jbxx[MAIN_TO_JBXX_FIELDS[sourceKey]] = mainDetail[sourceKey]
    }
  })
}

function fillParentIds(detail) {
  SUPPLEMENT_GROUPS.forEach((group) => {
    if (group.repeatable === false) {
      detail[group.key].hrmRzglId = detail.id
      return
    }
    detail[group.key].forEach((record) => {
      record.hrmRzglId = detail.id
      record.ghId = detail.sfzh
    })
  })
  return detail
}

export function normalizeSupplementDetail(result) {
  const detail = JSON.parse(JSON.stringify(result))
  removeLegacyMainFields(detail)
  // rzsjtz 已下线，查询结果不再保留该子结构。
  delete detail.rzsjtz
  SUPPLEMENT_GROUPS.forEach((group) => {
    if (group.repeatable === false) {
      if (!detail[group.key] || typeof detail[group.key] !== 'object' || Array.isArray(detail[group.key])) {
        detail[group.key] = {}
      }
      return
    }
    if (!Array.isArray(detail[group.key])) detail[group.key] = []
  })
  mergeMainFieldsIntoJbxx(detail)
  // 设置默认值
  // if (!hasValue(detail.jbxx.syq)) detail.jbxx.syq = 6
  if (!hasValue(detail.jbxx.entryDate)) detail.jbxx.entryDate = dayjs().format('YYYY-MM-DD')
  return fillParentIds(detail)
}

export function buildSupplementPayload(detail) {
  const payload = JSON.parse(JSON.stringify(detail))
  removeLegacyMainFields(payload)
  // 提交前只移除下线字段并刷新关联 ID，不重复覆盖用户已编辑的 jbxx。
  delete payload.rzsjtz
  return fillParentIds(payload)
}

// ========== 基本信息分类配置（基于 jbxx 数组字段定义）==========
// 分类1：个人基本信息
const jbxx_personalInfo = [
  field('photo', '员工照片', 'upload', { required: true }),
  field('name', '员工姓名', 'input', { disabled: true }),
  field('gender', '性别', 'select', { options: GENDER_OPTIONS, required: true }),
  field('birthDate', '出生日期', 'date', { required: true }),
  field('idCard', '身份证号码', 'input', { required: true, disabled: true }),
  field('phoneNumber', '联系方式', 'input', { required: true, disabled: true }),
  // 选填且可修改
  field('email', '邮箱'),
  field('mz', '民族', 'input', { required: true }),
  field('jg', '籍贯', 'input', { required: true }),
  field('hjxz', '户籍性质', 'dict', { dictCode: 'hjxz', required: true }),
  field('hjdz', '户籍地址', 'input', { required: true }),
  field('zzmm', '政治面貌', 'select', { options: POLITICAL_STATUS_OPTIONS, required: true }),
  field('hyzk', '婚姻状况', 'dict', { dictCode: 'hyzt', required: true }),
]

// 分类2：健康与生活信息
const jbxx_healthLiving = [
  field('jkzk', '健康状况', 'dict', { dictCode: 'jkzk', required: true }),
  field('ywbs', '以往病史'),
  field('jzd', '现居住地'),
  field('zzdz', '暂住地址'),
  field('zsfs', '住宿方式', 'dict', { dictCode: 'zsfs', required: true }),
  field('xqah', '兴趣爱好'),
]

// 分类3：公司与岗位信息
const jbxx_companyPosition = [
  field('gs', '入职公司', 'input', { disabled: true }),
  field('dept_dictText', '所属部门', 'input', { disabled: true }),
  field('postId_dictText', '岗位名称', 'input', { disabled: true }),
  field('postRank_dictText', '职级名称', 'input', { disabled: true }),
]

// 分类4：入职与合同信息
const jbxx_entryContract = [
  field('entryDate', '入职日期', 'date', { required: true }),
  field('syq', '试用期（月）', 'number', { min: 0, precision: 0 }),
  field('constractType', '合同类型', 'dict', { dictCode: 'htlx', disabled: true }),
  field('constractBelong', '合同归属', 'dict', { disabled: true }),
  field('contractStartDate', '合同开始日期', 'date', {}),
  field('contractExpDate', '合同到期日期', 'date', {}),
  field('sfczjyxzxy', '是否存在竞业限制协议', 'select', { options: YES_NO_OPTIONS, required: true }),
  // field('actualDate', '实际到岗日期', 'date', { disabled: true }),
  // field('bdrq', '报到日期', 'datetime', { disabled: true }),
  // field('sjzzrq', '计划转正日期', 'date', { disabled: true }),
  // field('workYears', '工作年限', 'number', { min: 0, precision: 0, disabled: true }),
]

// 分类5：薪资与银行卡
const jbxx_salaryBank = [
  field('salary', '薪资（K）', 'number', { min: 0, precision: 1 }),
  field('salaryType', '薪资类型', 'dict', { dictCode: 'xzlx' }),
  field('gzkyhkh', '工资卡银行卡号'),
  field('gzkyh', '工资卡银行', 'dict', { dictCode: 'yhlx' }),
  field('gzkkhh', '工资卡开户行'),
]

// 分类6：社保与公积金
const jbxx_socialSecurity = [
  field('sbqk', '社保情况', 'dict', { dictCode: 'sbqk', required: true }),
  field('sbdnh', '社保电脑号'),
  field('gjjqk', '公积金情况', 'dict', { dictCode: 'gjjqk', required: true }),
  field('gjjdhh', '公积金电脑号'),
  field('gjjyhkh', '公积金银行卡号'),
  field('gjjyh', '公积金银行', 'dict', { dictCode: 'yhlx' }),
  field('gjjkhyh', '公积金开户银行'),
]

// 导出基本信息分类配置
export const JBXX_CATEGORIES = [
  {
    key: 'personalInfo',
    title: '个人基本信息',
    description: '请填写您的基本身份信息',
    fields: jbxx_personalInfo,
  },
  {
    key: 'healthLiving',
    title: '健康与生活信息',
    description: '填写健康状况及居住信息',
    fields: jbxx_healthLiving,
  },
  {
    key: 'companyPosition',
    title: '公司与岗位信息',
    description: '请确认您的入职公司与岗位',
    fields: jbxx_companyPosition,
  },
  {
    key: 'entryContract',
    title: '入职与合同信息',
    description: '入职时间及劳动合同相关',
    fields: jbxx_entryContract,
  },
  {
    key: 'salaryBank',
    title: '薪资与银行卡',
    description: '工资发放相关信息',
    fields: jbxx_salaryBank,
  },
  {
    key: 'socialSecurity',
    title: '社保与公积金',
    description: '社保公积金缴纳信息',
    fields: jbxx_socialSecurity,
  },
]
