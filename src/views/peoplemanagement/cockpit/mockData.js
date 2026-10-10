export const COLORS = {
  blue: '#2563eb',
  blueLight: '#3b82f6',
  cyan: '#0891b2',
  cyanLight: '#22d3ee',
  green: '#059669',
  warning: '#d97706',
  orange: '#ea580c',
  danger: '#dc2626',
  purple: '#7c3aed',
  pink: '#db2777',
  teal: '#0d9488',
  slate: '#475569'
}

export const TAB_LIST = [
  { key: 'overview', label: '集团总览大屏' },
  { key: 'humanCore', label: '人力核心看板' },
  { key: 'attendance', label: '考勤效能看板' },
  { key: 'risk', label: '风险预警中心' }
]

export const ORG_DATA = {
  group: {
    key: 'group',
    name: '强瑞集团',
    fullName: '强瑞集团 · 全集团数据',
    stats: {
      totalEmployees: 720,
      avgOnDuty: 614,
      fullPunchRate: 88.5,
      abnormalRate: 14.7,
      totalRecords: 74866,
      validRecords: 5084,
      statDays: 26,
      replenishCount: 228,
      punchEmployees: 720,
      onlyIn: 306,
      onlyOut: 92,
      lateCount: 211,
      earlyCount: 163,
      abnormalCount: 398,
      departments: 25,
      maxRate: 96.2,
      minRate: 78.6
    }
  },
  subsidiaries: {
    yinhe: {
      key: 'yinhe',
      name: '银星科技园',
      fullName: '子公司 · 银星科技园 · 深圳市强瑞精密',
      stats: {
        totalEmployees: 280,
        avgOnDuty: 245,
        fullPunchRate: 90.2,
        abnormalRate: 12.8,
        totalRecords: 29500,
        validRecords: 2050,
        statDays: 26,
        replenishCount: 90,
        punchEmployees: 280,
        onlyIn: 120,
        onlyOut: 36,
        lateCount: 85,
        earlyCount: 70,
        abnormalCount: 156,
        departments: 8,
        maxRate: 96.2,
        minRate: 82.5
      }
    },
    qiaoan: {
      key: 'qiaoan',
      name: '侨安科技工业园',
      fullName: '子公司 · 侨安科技工业园 · 深圳市强瑞技术',
      stats: {
        totalEmployees: 350,
        avgOnDuty: 298,
        fullPunchRate: 87.8,
        abnormalRate: 16.2,
        totalRecords: 36800,
        validRecords: 2480,
        statDays: 26,
        replenishCount: 118,
        punchEmployees: 350,
        onlyIn: 160,
        onlyOut: 38,
        lateCount: 106,
        earlyCount: 72,
        abnormalCount: 198,
        departments: 14,
        maxRate: 94.5,
        minRate: 78.6
      }
    },
    huangji: {
      key: 'huangji',
      name: '皇基御景',
      fullName: '子公司 · 皇基御景 · 深圳市国科智图',
      stats: {
        totalEmployees: 90,
        avgOnDuty: 71,
        fullPunchRate: 85.0,
        abnormalRate: 18.5,
        totalRecords: 8566,
        validRecords: 554,
        statDays: 26,
        replenishCount: 20,
        punchEmployees: 90,
        onlyIn: 26,
        onlyOut: 18,
        lateCount: 20,
        earlyCount: 21,
        abnormalCount: 40,
        departments: 3,
        maxRate: 88.0,
        minRate: 82.5
      }
    }
  }
}

export const SCOPE_OPTIONS = [
  { value: 'group', label: '集团总览' },
  { value: 'yinhe', label: '子公司 · 银星科技园' },
  { value: 'qiaoan', label: '子公司 · 侨安科技工业园' },
  { value: 'huangji', label: '子公司 · 皇基御景' }
]

export const OVERVIEW_DATA = {
  updateTimeText: '数据更新: 2026-06-03 09:00 | 支持五级下钻',
  humanStructure: {
    education: [
      { label: '博士', value: 12, width: '2%', color: 'var(--purple)' },
      { label: '硕士', value: 58, width: '8%', color: 'var(--cyan)' },
      { label: '本科', value: 252, width: '35%', color: 'var(--blue-light)' },
      { label: '大专', value: 216, width: '30%', color: 'var(--success)' },
      { label: '高中以下', value: 182, width: '25%', color: 'var(--text-secondary)' }
    ],
    educationNote: '研发部学历: 博4 硕22 本65 | 工艺研究院: 博2 硕15 本28',
    seniority: [
      { label: '<1年', value: 144, width: '20%', color: 'var(--orange)' },
      { label: '1-3年', value: 302, width: '42%', color: 'var(--warning)' },
      { label: '3-5年', value: 180, width: '25%', color: 'var(--cyan)' },
      { label: '5-10年', value: 72, width: '10%', color: 'var(--blue-primary)' },
      { label: '>=10年', value: 22, width: '3%', color: 'var(--purple)' }
    ],
    seniorityNote: '生产岗<1年流失率: 28%',
    seniorityNoteTag: '预警'
  },
  subsidiaryRanking: {
    list: [
      { rank: 1, name: '银星科技园', value: '90.2%', className: 'good' },
      { rank: 2, name: '侨安科技工业园', value: '87.8%', className: 'warn' },
      { rank: 3, name: '皇基御景', value: '85.0%', className: 'bad' }
    ],
    footnotes: [
      '应出勤总工时: 49,088h | 实际: 43,446h',
      '工时利用率: 88.5% | 全勤奖发放: ¥12.8万'
    ]
  },
  replenishPanels: [
    {
      title: '补卡申请明细',
      icon: 'file-text',
      items: [
        { label: '待审批补卡', value: '23条', level: 'danger', tag: '需处理', tagType: 'high', valueStyle: { color: 'var(--danger)' } },
        { label: '驳回补卡', value: '12条', level: 'warn', tag: '待补充', tagType: 'mid' },
        { label: '已通过补卡', value: '186条', tag: '正常', tagType: 'good' },
        { label: '撤销补卡', value: '7条' },
        { type: 'subHeader', label: '高频补卡人员(Top3)', color: 'blue' },
        { label: '张XX (侨安-事业一部)', value: '8次', level: 'warn', tag: '异常', tagType: 'mid' },
        { label: '李XX (银星-研发部)', value: '6次' },
        { label: '王XX (皇基-市场部)', value: '5次' }
      ]
    },
    {
      title: '补卡时效分析',
      icon: 'clock-circle',
      items: [
        { label: '平均审批时长', value: '4.2h' },
        { label: '超24h未审批', value: '8条', level: 'warn', tag: '积压', tagType: 'mid' },
        { label: '平均补卡提交距漏打卡', value: '1.8天' },
        { label: '超7天补卡申请', value: '15条', level: 'danger', tag: '违规', tagType: 'high' },
        { type: 'subHeader', label: '月度趋势', color: 'cyan' },
        { label: '上月补卡总数', value: '198次' },
        { label: '本月补卡(截至3日)', value: '228次', level: 'warn', tag: '环比+15%', tagType: 'mid' },
        { label: '人均月补卡次数', value: '0.32次' }
      ]
    },
    {
      title: '补卡异常预警',
      icon: 'warning',
      items: [
        { label: '月度补卡>=5次人员', value: '3人', level: 'danger', tag: '异常', tagType: 'high' },
        { label: '连续两月补卡>=3次', value: '12人', level: 'warn', tag: '关注', tagType: 'mid' },
        { label: '同天多次补卡', value: '5起', level: 'danger', tag: '需核查', tagType: 'high' },
        { label: '补卡集中在周一', value: '38%' },
        { label: '补卡原因填“忘记打卡”占比', value: '62%', level: 'warn', tag: '偏高', tagType: 'mid' },
        { label: '侨安补卡率(人次/总人数)', value: '33.7%' },
        { label: '皇基补卡率', value: '22.2%', level: 'warn', tag: '需关注', tagType: 'mid' }
      ]
    }
  ],
  riskPanels: [
    {
      title: '旷工 & 请假 & 大小周异常',
      icon: 'warning',
      items: [
        { label: '月度旷工人次', value: '47人次', level: 'danger', tag: '高发', tagType: 'high', valueStyle: { color: 'var(--danger)' } },
        { label: '大小周执行率<80%部门', value: '事业二部', level: 'warn', tag: '标红', tagType: 'high' },
        { label: '高发单位: 侨安科技园', value: '22人次' },
        { label: '连续3天异常人员', value: '8人', level: 'danger', tag: '已标注', tagType: 'high' },
        { label: '事假占比', value: '38%', level: 'warn', barPercent: 38 },
        { label: '病假占比', value: '22%', level: 'warn', barPercent: 22 },
        { label: '超长病假(>=15天)', value: '8人', level: 'danger', tag: '关注', tagType: 'high' },
        { label: '批量集中请假异常', value: '3起', level: 'warn', tag: '已核查', tagType: 'mid' }
      ]
    },
    {
      title: '加班管控 & 迟到早退',
      icon: 'clock-circle',
      items: [
        { label: '全集团加班总工时', value: '3,840h', level: 'danger', tag: '超预算12%', tagType: 'high', valueStyle: { color: 'var(--danger)' } },
        { label: '人均月加班>36h部门', value: '侨安:1,680h', level: 'danger', tag: '超标', tagType: 'high' },
        { label: '加班成本(估算)', value: '¥19.2万' },
        { label: '无效加班偏高预警', value: '23%', level: 'warn', tag: '需核查', tagType: 'high' },
        { label: '调休总余额', value: '1,860h' },
        { label: '即将过期调休', value: '320h', level: 'warn', tag: '30天内', tagType: 'mid' },
        { label: '月度迟到累计', value: '211人次', level: 'warn' },
        { label: '月度早退累计', value: '163人次', level: 'warn' }
      ]
    },
    {
      title: '合规 & 外勤 & 干部梯队',
      icon: 'notification',
      items: [
        { type: 'subHeader', label: '外勤/出差管控', color: 'blue' },
        { label: '外勤日均人数', value: '42人' },
        { label: '长期驻外未核销', value: '5人', level: 'warn', tag: '超30天', tagType: 'mid' },
        { type: 'subHeader', label: '用工合规风险', color: 'red' },
        { label: '合同到期30天未续签', value: '3人', level: 'danger', tag: '紧急', tagType: 'high', valueStyle: { color: 'var(--danger)' } },
        { label: '合同到期90天未续签', value: '11人', level: 'warn', tag: '关注', tagType: 'mid' },
        { label: '劳务占比超标', value: '11.9%', level: 'danger', tag: '阈值10%', tagType: 'high' },
        { label: '超龄用工(>=60岁)', value: '4人', level: 'warn' },
        { type: 'subHeader', label: '干部梯队', color: 'cyan' },
        { label: '中高层在岗/空缺', value: '38/5' },
        { label: '关键人才培养进度', value: '68%', level: 'warn', tag: '落后', tagType: 'mid' }
      ]
    }
  ]
}

export const HUMAN_CORE_DATA = {
  summaryCards: [
    { value: '25', label: '部门总数', icon: 'apartment', theme: 'blue' },
    { value: '720', label: '在编总人数', icon: 'team', theme: 'cyan' },
    { value: '85.3%', label: '在岗率', icon: 'user-switch', theme: 'green' },
    { value: '5', label: '编制缺口>20%部门', icon: 'warning', theme: 'orange' },
    { value: '22', label: '储备干部', icon: 'star', theme: 'purple' }
  ],
  recruitPills: [
    { label: '招聘计划完成率', value: '76.5%', dotClass: 'green', trendText: '目标80%', trendType: 'up' },
    { label: '核心岗平均到岗周期', value: '18天', dotClass: 'blue', trendText: '环比-2天', trendType: 'up' },
    { label: '简历转化率', value: '32%', dotClass: 'cyan' },
    { label: '面试通过率', value: '68%', dotClass: 'warn' },
    { label: 'Offer接受率', value: '82%', dotClass: 'orange', trendText: '同比+5%', trendType: 'up' }
  ],
  lifecyclePanels: [
    {
      title: '试用期跟踪',
      icon: 'team',
      items: [
        { label: '试用期总人数', value: '63人' },
        { label: '本月转正人数', value: '8人', tag: '已完成', tagType: 'good' },
        { label: '转正率', value: '92%' },
        { label: '试用期离职率', value: '8%', level: 'warn', tag: '关注', tagType: 'mid' },
        { type: 'subHeader', label: '待转正倒计时', color: 'red' },
        { label: '7天内到期', value: '3人', level: 'danger', tag: '紧急', tagType: 'high' },
        { label: '14天内到期', value: '7人', level: 'warn' }
      ]
    },
    {
      title: '合同合规监控',
      icon: 'file-text',
      items: [
        { label: '未签合同', value: '0人', level: 'danger', tag: '合规', tagType: 'good', valueStyle: { color: 'var(--danger)' } },
        { label: '合同过期', value: '0人' },
        { type: 'subHeader', label: '合同到期预警', color: 'blue' },
        { label: '30天内到期', value: '3人', level: 'danger', tag: '紧急', tagType: 'high', valueStyle: { color: 'var(--danger)' } },
        { label: '60天内到期', value: '11人', level: 'warn', tag: '关注', tagType: 'mid' },
        { label: '90天内到期', value: '23人' },
        { type: 'subHeader', label: '合同类型分布', color: 'cyan' },
        { label: '固定期限', value: '72%', barPercent: 72 },
        { label: '无固定期限', value: '18%', barPercent: 18 },
        { label: '试用期', value: '10%', barPercent: 10 }
      ]
    },
    {
      title: '调薪晋升 & 假期统计',
      icon: 'line-chart',
      items: [
        { type: 'subHeader', label: '调薪与晋升', color: 'blue' },
        { label: '本年度调薪人数', value: '186人' },
        { label: '调薪比例', value: '25.8%' },
        { label: '晋升人数', value: '32人' },
        { label: '平均调薪幅度', value: '8.5%' },
        { type: 'subHeader', label: '工龄与假期', color: 'green' },
        { label: '未休年假总时长', value: '1,860h' },
        { label: '30天过期年假', value: '320h', level: 'warn', tag: '预警', tagType: 'mid' },
        { label: '平均工龄', value: '2.8年' }
      ]
    }
  ]
}

export const ATTENDANCE_DATA = {
  specialPanels: [
    {
      title: '大小周执行看板',
      icon: 'calendar',
      items: [
        { label: '本月应上小周天数', value: '4天' },
        { label: '实际小周出勤天数', value: '3.5天', level: 'warn', tag: '偏差', tagType: 'mid' },
        { label: '银星小周出勤率', value: '91.2%' },
        { label: '侨安小周出勤率', value: '86.5%' },
        { label: '皇基小周出勤率', value: '78.2%', level: 'danger', tag: '标红', tagType: 'high' },
        { label: '执行率<80%部门', value: '皇基御景', level: 'warn', tag: '需整改', tagType: 'high' },
        { type: 'subHeader', label: '加班补缺勤执行', color: 'red' },
        { label: '加班结余补全缺勤比例', value: '76%', level: 'warn', tag: '偏低', tagType: 'mid' }
      ]
    },
    {
      title: '核心生产车间考勤',
      icon: 'setting',
      items: [
        { type: 'subHeader', label: '机加部', color: 'blue' },
        { label: '班组出勤率', value: '89.5%' },
        { label: '夜班人数', value: '42人' },
        { label: '异常考勤', value: '18人次' },
        { type: 'subHeader', label: '装配部', color: 'cyan' },
        { label: '班组出勤率', value: '87.2%' },
        { label: '夜班人数', value: '35人' },
        { label: '异常考勤', value: '22人次', level: 'warn', tag: '偏高', tagType: 'mid' },
        { type: 'subHeader', label: '钣金部', color: 'green' },
        { label: '班组出勤率', value: '91.0%' },
        { label: '夜班人数', value: '28人' },
        { label: '异常考勤', value: '10人次' }
      ]
    },
    {
      title: '外勤人员考勤',
      icon: 'environment',
      items: [
        { label: '外勤人员总数', value: '42人' },
        { label: '外勤打卡率', value: '88.2%' },
        { label: '外勤点覆盖', value: '12个' },
        { label: '未打卡外勤', value: '5人', level: 'warn', tag: '需核实', tagType: 'mid' },
        { label: '考勤确认进度', value: '85%', barPercent: 85 },
        { label: '未确认人员', value: '12人', level: 'warn', tag: '待催办', tagType: 'mid' }
      ]
    }
  ],
  overtimePanels: [
    {
      title: '时薪岗位加班费专项',
      icon: 'dollar',
      items: [
        { label: '司机加班总时长', value: '420h', level: 'danger', tag: '夜班为主', tagType: 'high' },
        { label: '厨房加班总时长', value: '180h' },
        { label: '保洁加班总时长', value: '95h' },
        { label: '仓储加班总时长', value: '210h' },
        { label: '预估加班费总额', value: '¥8.6万', level: 'danger', tag: '超预算15%', tagType: 'high', valueStyle: { color: 'var(--danger)' } }
      ]
    },
    {
      title: '调休账户监控',
      icon: 'credit-card',
      items: [
        { label: '集团调休总余额', value: '1,860h' },
        { label: '7天内过期', value: '120h', level: 'warn', tag: '紧急', tagType: 'high' },
        { label: '30天内过期', value: '320h', level: 'warn', tag: '关注', tagType: 'mid' },
        { label: '超3个月未使用', value: '560h', level: 'danger', tag: '12人', tagType: 'high' },
        { type: 'subHeader', label: '部门调休积压排名', color: 'blue' },
        { label: '研发部', value: '420h' },
        { label: '事业一部', value: '380h' }
      ]
    },
    {
      title: '加班合规性检查',
      icon: 'check-circle',
      items: [
        { label: '人均月加班>36h部门', value: '侨安', level: 'danger', tag: '超标', tagType: 'high' },
        { label: '人均月加班>36h人员', value: '28人', level: 'warn', tag: '需核查', tagType: 'mid' },
        { label: '夜班自动加班(司机)', value: '合规', tag: '已校验', tagType: 'good' },
        { label: '加班审批流程', value: '96%', tag: '规范', tagType: 'good' },
        { label: '考勤薪酬数据一致性', value: '98.5%', level: 'warn', tag: '差异项', tagType: 'mid' }
      ]
    }
  ]
}

export const RISK_DATA = {
  total: 15,
  badge: 5,
  hrRisks: [
    { category: '人力', categoryClass: 'hr', levelClass: 'level-high', name: '事业一部月度离职率16.5%，超阈值15%', detail: '本月离职5人', action: '查看详情' },
    { category: '人力', categoryClass: 'hr', levelClass: 'level-high', name: '博士工作站1人提出离职: 张XX，电控方向', detail: '核心人才', action: '立即处理' },
    { category: '人力', categoryClass: 'hr', levelClass: 'level-high', name: '装配部班组批量离职3人，触发批量预警', detail: '需关注', action: '查看详情' },
    { category: '人力', categoryClass: 'hr', levelClass: 'level-medium', name: '试用期离职率8%，接近阈值10%', detail: '本月已离5人', action: '查看详情' },
    { category: '人力', categoryClass: 'hr', levelClass: 'level-medium', name: '关键岗位空缺: 电控工程师(空缺30天)、软件架构师(空缺22天)', detail: '2个岗位', action: '启动招聘' }
  ],
  attendRisks: [
    { category: '考勤', categoryClass: 'attend', levelClass: 'level-high', name: '皇基御景大小周执行率78.2%，低于阈值80%', detail: '需整改', action: '下发督办' },
    { category: '考勤', categoryClass: 'attend', levelClass: 'level-high', name: '侨安科技园人均月加班42.5h，超36h标准', detail: '28人超标', action: '查看名单' },
    { category: '考勤', categoryClass: 'attend', levelClass: 'level-high', name: '调休过期未使用>=100h，12人合计560h', detail: '需催办', action: '发通知' },
    { category: '考勤', categoryClass: 'attend', levelClass: 'level-medium', name: '连续旷工>=3天: 侨安3人、银星1人', detail: '4人', action: '查看详情' },
    { category: '考勤', categoryClass: 'attend', levelClass: 'level-medium', name: '月度异常考勤>=5次/人: 共12人', detail: '最高8次', action: '查看名单' },
    { category: '考勤', categoryClass: 'attend', levelClass: 'level-medium', name: '时薪岗位加班费超预算15%，预计超支¥1.2万', detail: '需审批', action: '查看明细' }
  ],
  complyRisks: [
    { category: '合规', categoryClass: 'comply', levelClass: 'level-high', name: '劳务占比11.9%，超阈值10%，需降本调整', detail: '86人', action: '制定方案' },
    { category: '合规', categoryClass: 'comply', levelClass: 'level-high', name: '合同到期30天内未续签: 3人，触发合规红线', detail: '紧急', action: '立即处理' },
    { category: '合规', categoryClass: 'comply', levelClass: 'level-medium', name: '超龄用工>=60岁: 4人，需复核合规性', detail: '关注', action: '复核' },
    { category: '合规', categoryClass: 'comply', levelClass: 'level-medium', name: '年假过期未休>=50天: 累计320h，涉及28人', detail: '需催休', action: '发通知' },
    { category: '合规', categoryClass: 'comply', levelClass: 'level-low', name: '加班审批流程不规范: 4%加班单未完整审批', detail: '可优化', action: '查看' }
  ],
  summaryPills: [
    { label: '人力高风险', value: '5', dotClass: 'red', danger: true },
    { label: '考勤中高风险', value: '6', dotClass: 'warn' },
    { label: '合规高风险', value: '2', dotClass: 'red', danger: true },
    { label: '预警总数', value: '15', dotClass: 'blue' }
  ]
}

export const CHART_SOURCE = {
  parkDistribution: [
    { value: 280, name: '银星科技园', color: COLORS.blue },
    { value: 350, name: '侨安科技工业园', color: COLORS.cyan },
    { value: 90, name: '皇基御景', color: COLORS.green }
  ],
  replenishOverview: [
    { value: 186, name: '已通过', color: COLORS.green },
    { value: 23, name: '待审批', color: COLORS.warning },
    { value: 12, name: '已驳回', color: COLORS.danger },
    { value: 7, name: '已撤销', color: COLORS.slate }
  ],
  ondutyTrend: {
    days: ['5/1', '5/2', '5/3', '5/4', '5/5', '5/6', '5/7', '5/8', '5/9', '5/10', '5/11', '5/12', '5/13', '5/14', '5/15', '5/16', '5/17', '5/18', '5/19', '5/20', '5/21', '5/22', '5/23', '5/24', '5/25', '5/26'],
    rates: [85.7, 78.6, 96.2, 92.9, 86.1, 91.5, 91.5, 89.9, 92.7, 87.5, 89.0, 89.1, 92.3, 89.8, 91.9, 91.6, 81.8, 86.8, 90.2, 78.9, 90.1, 89.1, 88.8, 82.5, 86.6, 87.6],
    counts: [52, 42, 121, 447, 586, 686, 696, 695, 656, 305, 698, 702, 617, 694, 690, 631, 318, 687, 698, 688, 693, 689, 587, 240, 681, 677]
  },
  replenishDept: {
    categories: ['皇基御景', '银星科技园', '侨安科技工业园', '事业一部', '事业二部', '研发部', '供应链', '工艺研究院'],
    values: [20, 90, 118, 45, 38, 28, 22, 15]
  },
  replenishReason: {
    categories: ['忘记打卡', '设备故障', '外勤公出', '请假补录', '出差漏打', '其他'],
    counts: [142, 35, 22, 15, 8, 6],
    passRates: [78, 92, 88, 95, 90, 85]
  },
  staffingCompare: {
    departments: ['研发部', '工艺研究院', '事业一部', '事业二部', '供应链', '总经办', '人力资源', '财务部', '机加部', '装配部', '钣金部'],
    plan: [60, 50, 85, 70, 80, 12, 30, 15, 42, 35, 28],
    actual: [55, 45, 80, 65, 80, 12, 28, 15, 38, 30, 26]
  },
  jobTypeDetail: [
    { value: 380, name: '生产岗', color: COLORS.blue },
    { value: 145, name: '技术岗', color: COLORS.cyan },
    { value: 120, name: '职能岗', color: COLORS.green },
    { value: 75, name: '管理岗', color: COLORS.purple }
  ],
  turnoverTrend: {
    months: ['6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月', '4月', '5月'],
    group: [2.1, 1.8, 2.3, 1.9, 2.0, 1.7, 2.5, 1.6, 1.4, 1.8, 1.9, 1.7],
    yinhe: [1.8, 1.5, 2.0, 1.6, 1.7, 1.5, 2.2, 1.3, 1.2, 1.5, 1.6, 1.4],
    qiaoan: [2.5, 2.2, 2.8, 2.3, 2.4, 2.0, 2.9, 1.9, 1.6, 2.1, 2.3, 2.0],
    huangji: [1.8, 1.6, 1.9, 1.7, 1.8, 1.5, 2.0, 1.4, 1.3, 1.6, 1.7, 1.5]
  },
  turnoverReason: [
    { value: 38, name: '薪资', color: COLORS.blue },
    { value: 28, name: '个人发展', color: COLORS.cyan },
    { value: 18, name: '家庭原因', color: COLORS.warning },
    { value: 16, name: '管理因素', color: COLORS.danger }
  ],
  overtimeType: [
    { value: 1920, name: '工作日1.5倍', color: COLORS.blue },
    { value: 1344, name: '休息日2倍', color: COLORS.warning },
    { value: 576, name: '法定节假日3倍', color: COLORS.danger }
  ],
  deptOvertime: {
    departments: ['研发部', '事业一部', '供应链', '工艺研究院', '事业二部', '财务部', '总经办', '人力资源'],
    hours: [58, 52, 45, 40, 38, 28, 18, 12]
  }
}
