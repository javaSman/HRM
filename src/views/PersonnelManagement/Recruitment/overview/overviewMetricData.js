import { getAction } from '@/api/manage'

// 状态顺序与 code 均保持来源列表页一致，避免总览与各业务页展示口径漂移。
const CARD_CONFIGS = [
  {
    key: 'apply',
    icon: 'file-text',
    title: '用人申请',
    color: '#4A7BF7',
    iconColor: '#4A7BF7',
    iconBg: '#ECF2FF',
    // 用人申请统计接口，搬运自 yongren/index.vue
    totalUrl: '/zpManage/hrmYrsq/getTotal',
    statusOptions: [
      { label: '全部', value: 'all', code: 'all', count: 0 },
      { label: '审批中', value: '审批中', code: 'orange', count: 0 },
      { label: '已通过', value: '已通过', code: 'green', count: 0 },
      { label: '招聘中', value: '招聘中', code: 'blue', count: 0 },
      { label: '已完成', value: '已完成', code: 'cyan', count: 0 },
      { label: '已取消', value: '已取消', code: 'yqx', count: 0 },
      { label: '已拒绝', value: '已拒绝', code: 'red', count: 0 }
    ]
  },
  {
    key: 'plan',
    icon: 'calendar',
    title: '招聘计划',
    color: '#6B9AFF',
    iconColor: '#4A7BF7',
    iconBg: '#ECF2FF',
    // 招聘计划统计接口，搬运自 plan/index.vue
    totalUrl: '/zpManage/hrmZpjh/getTotal',
    statusOptions: [
      { label: '全部', value: 'all', code: 'all', count: 0 },
      { label: '待发布', value: '待发布', code: 'orange', count: 0 },
      { label: '招聘中', value: '招聘中', code: 'blue', count: 0 },
      { label: '已完成', value: '已完成', code: 'green', count: 0 },
      { label: '已取消', value: '已取消', code: 'yqx', count: 0 },
      { label: '不通过', value: '不通过', code: 'red', count: 0 }
    ]
  },
  {
    key: 'resume',
    icon: 'profile',
    title: '简历管理',
    color: '#22C55E',
    iconColor: '#22C55E',
    iconBg: '#E8F7E8',
    // 简历管理统计接口，搬运自 resume/index.vue
    totalUrl: '/zpManage/hrmJlgl/getTotal',
    statusOptions: [
      { label: '全部', value: 'all', currentStatus: 'all', queryStatus: '', code: 'all', count: 0 },
      { label: '待分配', value: '待分配', currentStatus: '待分配', queryStatus: '待分配', code: 'orange', count: 0 },
      { label: '待邀约', value: '待邀约', currentStatus: '待邀约', queryStatus: '待邀约', code: 'blue', count: 0 },
      { label: '已邀约', value: '已邀约', currentStatus: '已邀约', queryStatus: '已邀约', code: 'cyan', count: 0 },
      { label: '已淘汰', value: '已淘汰', currentStatus: '已淘汰', queryStatus: '已淘汰', code: 'red', count: 0 }
    ]
  },
  {
    key: 'interview',
    icon: 'team',
    title: '面试管理',
    color: '#F59E0B',
    iconColor: '#F59E0B',
    iconBg: '#FFF4E5',
    // 面试管理统计接口，搬运自 interview/index.vue
    totalUrl: '/zpManage/hrmMsgl/getTotal',
    statusOptions: [
      { label: '全部', value: 'all', code: 'all', count: 0 },
      { label: '面试中', value: '面试中', code: 'blue', count: 0 },
      { label: '面试通过', value: '面试通过', code: 'green', count: 0 },
      { label: '已淘汰', value: '已淘汰', code: 'red', count: 0 }
    ]
  },
  {
    key: 'offer',
    icon: 'solution',
    title: 'Offer管理',
    color: '#EF4444',
    iconColor: '#EF4444',
    iconBg: '#FDECEC',
    // Offer 管理统计接口，搬运自 offer/index.vue
    totalUrl: '/zpManage/hrmOffergl/getTotal',
    statusOptions: [
      { label: '全部', value: 'all', code: 'all', count: 0 },
      { label: '审批中', value: '审批中', code: 'orange', count: 0 },
      { label: '待确认', value: '待确认', code: 'blue', count: 0 },
      { label: '已确认', value: '已确认', code: 'green', count: 0 },
      { label: '审批拒绝', value: '审批拒绝', code: 'red', count: 0 },
      { label: '已拒绝', value: '已拒绝', code: 'yjj', count: 0 },
      { label: '已放弃', value: '已放弃', code: 'fq', count: 0 }
    ]
  },
  {
    key: 'onboard',
    icon: 'user-add',
    title: '入职管理',
    color: '#8B5CF6',
    iconColor: '#8B5CF6',
    iconBg: '#F0EBFF',
    // 入职管理暂未提供统计接口，先保留状态结构并统一显示 0。
    statusOptions: [
      { label: '全部', value: 'all', code: 'all', count: 0 },
      { label: '待入职', value: '待入职', code: 'blue', count: 0 },
      { label: '已入职', value: '已入职', code: 'green', count: 0 },
      { label: '放弃入职', value: '放弃入职', code: 'fq', count: 0 }
    ]
  }
]

function getCard(cards, key) {
  return cards.find(item => item.key === key)
}

function getStatusCount(card, label) {
  if (!card || !Array.isArray(card.statusOptions)) {
    return 0
  }
  const status = card.statusOptions.find(item => item.label === label)
  return status ? Number(status.count) || 0 : 0
}

export function createOverviewCards() {
  return CARD_CONFIGS.map(card => Object.assign({}, card, {
    statusOptions: card.statusOptions.map(item => Object.assign({}, item))
  }))
}

export function fetchOverviewCard(card) {
  if (!card.totalUrl) {
    return Promise.resolve(card)
  }
  return getAction(card.totalUrl).then(res => {
    // getTotal 沿用列表页契约：成功响应的 result 必须是状态统计数组。
    if (!res || !res.success || !Array.isArray(res.result)) {
      throw new Error((res && res.message) || `${card.title}统计加载失败`)
    }
    const totalMap = {}
    res.result.forEach(item => {
      totalMap[item.statusText] = Number(item.statustotal) || 0
    })
    return Object.assign({}, card, {
      statusOptions: card.statusOptions.map(item => Object.assign({}, item, {
        count: totalMap[item.label] || 0
      }))
    })
  })
}

export function createFunnelSteps(cards) {
  const apply = getCard(cards, 'apply')
  const resume = getCard(cards, 'resume')
  const interview = getCard(cards, 'interview')
  const offer = getCard(cards, 'offer')
  // 漏斗沿用原型口径：面试排除已淘汰，邀约仅统计待确认和已确认。
  return [
    { key: 'apply', label: '用人申请', value: getStatusCount(apply, '全部'), gradient: '#4A7BF7' },
    { key: 'resume', label: '简历', value: getStatusCount(resume, '全部'), gradient: '#6B9AFF' },
    { key: 'interview', label: '面试', value: getStatusCount(interview, '面试中') + getStatusCount(interview, '面试通过'), gradient: '#F59E0B' },
    { key: 'offer', label: '邀约', value: getStatusCount(resume, '已邀约'), gradient: '#EF4444' },
    // { key: 'offer', label: '邀约', value: getStatusCount(offer, '待确认') + getStatusCount(offer, '已确认'), gradient: '#EF4444' },
    { key: 'onboard', label: '入职', value: 0, gradient: '#22C55E' }
  ]
}

export function createQuickStats(cards) {
  // 面试接口暂无“待面试”分项，当前按约定暂用“面试中”数量展示。
  return [
    { key: 'pending-apply', icon: 'clock-circle', label: '待审批申请', value: getStatusCount(getCard(cards, 'apply'), '审批中'), level: 'urgent' },
    { key: 'pending-interview', icon: 'calendar', label: '待面试', value: getStatusCount(getCard(cards, 'interview'), '面试中'), level: 'urgent' },
    { key: 'pending-offer', icon: 'solution', label: '待确认邀约', value: getStatusCount(getCard(cards, 'offer'), '待确认'), level: 'warning' },
    { key: 'pending-onboard', icon: 'user-add', label: '待入职', value: 0, level: 'warning' },
    { key: 'to-invite', icon: 'mail', label: '待邀约简历', value: getStatusCount(getCard(cards, 'resume'), '待邀约'), level: 'normal' }
  ]
}
