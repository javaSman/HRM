import moment from 'moment'

export const STATUS_ACTIVE = '在榜'
export const STATUS_REMOVED = '已移出'

export const LEVEL_OPTIONS = [
  { value: '1年', label: '1年' },
  { value: '3年', label: '3年' },
  { value: '5年', label: '5年' },
  { value: '永久', label: '永久' }
]

export const JOIN_REASON_OPTIONS = [
  { value: '简历造假', label: '简历造假' },
  { value: '学历造假', label: '学历造假' },
  { value: '面试爽约', label: '面试爽约（3次以上）' },
  { value: 'Offer违约', label: 'Offer违约/放鸽子' },
  { value: '试用期不合格', label: '试用期不合格' },
  { value: '严重违纪', label: '严重违纪/违反公司规定' },
  { value: '泄露机密', label: '泄露公司机密' },
  { value: '职场霸凌', label: '职场霸凌/骚扰' },
  { value: '经济问题', label: '经济问题/贪污受贿' },
  { value: '其他', label: '其他' }
]

export const SOURCE_OPTIONS = [
  { value: 'resume', label: '简历筛选发现', shortLabel: '简历筛选' },
  { value: 'interview', label: '面试阶段发现', shortLabel: '面试阶段' },
  { value: 'offer', label: 'Offer阶段违约', shortLabel: 'Offer阶段' },
  { value: 'probation', label: '试用期淘汰', shortLabel: '试用期' },
  { value: 'employment', label: '在职期间违纪', shortLabel: '在职期间' },
  { value: 'report', label: '外部举报/背调发现', shortLabel: '外部举报' }
]

export const REMOVE_REASON_OPTIONS = [
  { value: '信息核实有误', label: '信息核实有误/误加入' },
  { value: '当事人申诉成功', label: '当事人申诉成功' },
  { value: '已过限制期', label: '已过限制期（一般黑名单1年）' },
  { value: '表现良好解除', label: '表现良好/特殊情况解除' },
  { value: '其他', label: '其他原因' }
]

const LEVEL_MAP = LEVEL_OPTIONS.reduce((map, item) => {
  map[item.value] = item.label
  return map
}, {})

const LEVEL_CLASS_MAP = {
  '1年': '1year',
  '3年': '3year',
  '5年': '5year',
  永久: 'permanent',
  '1year': '1year',
  '3year': '3year',
  '5year': '5year',
  permanent: 'permanent'
}

const LEVEL_DURATION_YEAR_MAP = {
  '1年': 1,
  '3年': 3,
  '5年': 5,
  '1year': 1,
  '3year': 3,
  '5year': 5
}

const SOURCE_MAP = SOURCE_OPTIONS.reduce((map, item) => {
  map[item.value] = item.label
  return map
}, {})

const rowIndexColumn = {
  title: '序号',
  dataIndex: 'rowIndex',
  width: 70,
  align: 'center',
  scopedSlots: { customRender: 'rowIndex' }
}

const actionColumn = {
  title: '操作',
  dataIndex: 'action',
  align: 'center',
  fixed: 'right',
  width: 180,
  scopedSlots: { customRender: 'action' }
}

const commonColumns = [
  { title: '姓名', dataIndex: 'xm', align: 'center' },
  { title: '手机号', dataIndex: 'sjh', align: 'center' },
  { title: '身份证号', dataIndex: 'sfzh', align: 'center', width: 180 },
  { title: '黑名单等级', dataIndex: 'hmddj', align: 'center', scopedSlots: { customRender: 'hmddj' } },
  { title: '加入时间', dataIndex: 'jrsj', align: 'center', width: 160 }
]

export function getBlacklistColumns(status) {
  const tail = status === STATUS_REMOVED
    ? [
      { title: '来源渠道', dataIndex: 'lyqd', align: 'center', scopedSlots: { customRender: 'lyqd' } },
      { title: '移出时间', dataIndex: 'ycsj', align: 'center', width: 160 },
      { title: '移出原因', dataIndex: 'ycyy', align: 'center' },
      { title: '移出操作人', dataIndex: 'ycczr', align: 'center' }
    ]
    : [
      { title: '加入原因', dataIndex: 'jryy', align: 'center' },
      { title: '来源渠道', dataIndex: 'lyqd', align: 'center', scopedSlots: { customRender: 'lyqd' } },
      { title: '操作人', dataIndex: 'czr', align: 'center' }
    ]
  return [rowIndexColumn].concat(commonColumns, tail, [actionColumn])
}

export function getLevelText(value) {
  return LEVEL_MAP[value] || value || '-'
}

export function getLevelClass(value) {
  return 'level-' + (LEVEL_CLASS_MAP[value] || 'unknown')
}

export function isPermanentLevel(value) {
  return value === '永久' || value === 'permanent'
}

export function getRemovalRestriction(record, now = moment()) {
  const currentRecord = record || {}
  if (isPermanentLevel(currentRecord.hmddj)) {
    return '永久黑名单不可移出'
  }

  const durationYears = LEVEL_DURATION_YEAR_MAP[currentRecord.hmddj]
  if (!durationYears) {
    return '黑名单等级数据异常，暂无法移出'
  }

  const joinTime = moment(currentRecord.jrsj, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD'], true)
  if (!joinTime.isValid()) {
    return '加入时间数据异常，暂无法移出'
  }

  const removableAt = joinTime.clone().add(durationYears, 'year')
  return moment(now).isBefore(removableAt)
    ? `该记录需到 ${removableAt.format('YYYY-MM-DD HH:mm:ss')} 才可移出`
    : ''
}

export function getSourceText(value) {
  return SOURCE_MAP[value] || value || '-'
}

export function getNowText() {
  const date = new Date()
  const pad = value => String(value).padStart(2, '0')
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' +
    pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds())
}

export function getCurrentOperator(vm) {
  const userInfo = (vm.$store && vm.$store.getters && vm.$store.getters.userInfo) || {}
  return userInfo.realname || userInfo.username || ''
}

export function fetchBlacklistSummary() {
  return Promise.resolve({ total: 0, oneYear: 0, threeYear: 0, fiveYear: 0, permanent: 0, removed: 0 })
}
