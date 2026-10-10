/**
 * 申请类型注册表
 *
 * 联合视图 vUserSqdUnion 把各申请模块的数据挂在记录的不同嵌套对象里
 * （加班 hrJbApplication、后续的请假/补卡/外出…），每种类型的标签色、
 * 嵌套 key、详情字段都不一样。把这些差异集中在本文件，页面主流程
 * （列表/分页/Tab/审批流程/操作区）对具体类型无感知。
 *
 * 接入新类型只需两步：
 * 1. 后端在联合视图记录里返回该类型的嵌套对象（含 spStatus、name/no/dept/createTime、
 *    customProcessSqdSpjdList 审批节点）；
 * 2. 在下方 APPLY_TYPES 里加一个配置块（标签色 + nestedKey + buildInfo）。
 *
 * 若取消接口先行、详情字段未就绪：配置 detailReady:false + buildInfo 返回空数组 + cancel 描述块，
 * 详情区只显示「暂未接入」占位、不提供取消入口；待详情接入后操作区（含取消按钮）随详情一起开放（见 MyApply.vue）。
 * cancel.send 四种风格：body（整条实体回传，考勤族）/ idBody（只传 id+merge，edit 改状态）/
 * queryId（PUT cancel?id=）/ pathId（PUT cancel/{id}），由 workbench.cancelApply 统一分发。
 */

/** 空值统一返回空串（高度由页面 .ma-info-value 的 min-height 兜底，盒子不会塌陷） */
export function dash(v) {
  return v === '' || v == null ? '' : v
}

/** 取日期时间字符串的日期部分 */
export function datePart(v) {
  return v ? String(v).slice(0, 10) : ''
}

/** 未注册类型的卡片标签色（紫色） */
export const DEFAULT_TAG_CLASS = 't-other'

/**
 * 考勤族撤回接口描述（加班/补卡/请假/外出/移动打卡 同款）：
 * POST updateWithdraw，整条实体记录回传并把 spStatus 置 3（已撤回），
 * 与各模块列表页 handleRevoke 的调用方式保持一致。
 * 注意：依赖联合视图下发的嵌套对象是完整实体行（待后端确认），字段不全时撤回会失败。
 * @param {String} url 各模块 updateWithdraw 完整地址
 */
function attendanceCancel(url) {
  return {
    method: 'post',
    url,
    // body=整条实体 + merge 覆盖（预留：queryId=PUT ?id=、pathId=PUT /cancel/{id}）
    send: 'body',
    merge: { spStatus: 3 },
    // 需要取消原因时填实体字段名（如调动 spyj / 离职 qxyy），弹窗会据此渲染必填文本域；考勤族不需要
    reasonField: ''
  }
}

/**
 * 编辑式取消：POST 各模块 edit，后端明确只收业务表 id + 状态字段 zt（不回传整条实体）
 * @param {String} url 各模块 edit 地址
 * @param {String} zt 取消后的状态值（访客/放行条为字符串 '3'，人事模块为中文 '已取消'）
 */
function editCancel(url, zt) {
  return {
    method: 'post',
    url,
    send: 'idBody',
    merge: { zt },
    reasonField: ''
  }
}

export const APPLY_TYPES = {
  加班申请: {
    // 卡片标签色 class（样式仍在页面 less 的 .ma-card-tag 下）
    tagClass: 't-overtime',
    // 联合视图记录里该类型数据所在的嵌套对象 key
    nestedKey: 'hrJbApplication',
    // 卡片时间：顶层 createtime / 嵌套 createTime 都为空时的兜底字段
    cardTimeFallback(d) {
      return d.startTime || ''
    },
    /**
     * 类型私有申请信息行（公共头：申请人/工号/部门/提交时间，公共尾：备注说明，
     * 均由页面统一拼接，这里只写该类型特有的字段）
     * @param {Object} d 该类型的嵌套对象
     * @param {Object} ctx { raw, dash, datePart, dictText }
     * @returns {Array<{label:String, value:String, full?:Boolean}>}
     */
    buildInfo(d, ctx) {
      const otDate = d.overtimeDate || ctx.datePart(d.startTime)
      return [
        { label: '加班日期', value: ctx.dash(otDate) },
        { label: '加班开始时间', value: ctx.dash(d.startTime) },
        { label: '加班结束时间', value: ctx.dash(d.endTime) },
        { label: '加班时长', value: d.applyHours != null ? d.applyHours + ' 小时' : '' },
        { label: '加班原因', value: ctx.dash(d.reason) }
      ]
    },
    // 公共尾「备注说明」的取值字段（各实体字段名可能不同）；返回空则页面显示 —
    getRemark(d) {
      return d.remark || d.note || ''
    },
    cancel: attendanceCancel('/hr_jb_application/hrJbApplication/updateWithdraw')
  },
  补卡申请: {
    tagClass: 't-repair',
    // TODO 联合视图嵌套对象 key 待后端确认后填写（实体表 hr_bksq，确认前 supported 恒为 false，详情显示「暂未接入」）
    nestedKey: 'hrBksq',
    cardTimeFallback(d) {
      return d.bkTime || ''
    },
    buildInfo(d, ctx) {
      // 补卡日期优先 applyDate，没有则取补卡时间的日期部分
      const bkDate = d.applyDate || ctx.datePart(d.bkTime)
      // bkTime 实体为完整日期时间，列表只展示时间部分；长度不足 10 位时按原值展示
      const bkTime = d.bkTime ? (String(d.bkTime).length > 10 ? String(d.bkTime).slice(11) : d.bkTime) : ''
      // ycType 走字典 ycDkstatus；后端未挂 dictText 时退回原始值
      const ycTypeText = d.ycType_dictText || d.ycTypeDictText || d.ycType || ''
      return [
        { label: '补卡日期', value: ctx.dash(bkDate) },
        { label: '异常类型', value: ycTypeText },
        { label: '补卡时间', value: ctx.dash(bkTime) },
        { label: '补卡原因', value: ctx.dash(d.reason) }
      ]
    },
    // 实体表单暂无独立备注字段，先兼容 remark/note，后端确认无此字段时恒显示 —
    getRemark(d) {
      return d.remark || d.note || ''
    },
    cancel: attendanceCancel('/hr_bksq/hrBksq/updateWithdraw')
  },
  请假申请: {
    tagClass: 't-leave',
    // 联合视图嵌套对象 key（按加班 hrJbApplication 的命名惯例推定，
    // 若后端实际命名不同，只改这一个字符串）
    nestedKey: 'hrXjsq',
    cardTimeFallback(d) {
      return d.startTime || ''
    },
    buildInfo(d, ctx) {
      // xjType 走字典 xj_type；后端未挂 dictText 时退回原始值
      const typeText = d.xjType_dictText || d.xjTypeDictText || d.xjType || ''
      return [
        { label: '请假类型', value: typeText },
        { label: '开始日期', value: ctx.dash(ctx.datePart(d.startTime)) },
        { label: '结束日期', value: ctx.dash(ctx.datePart(d.endTime)) },
        // 实体只有小时粒度的 applyHours，没有天数字段
        { label: '申请时长', value: d.applyHours != null ? d.applyHours + ' 小时' : '' }
      ]
    },
    // 实体无独立备注字段，原型备注行展示的即申请原因
    getRemark(d) {
      return d.sqyy || ''
    },
    cancel: attendanceCancel('/hr_xjsq/hrXjsq/updateWithdraw')
  },
  外出申请: {
    tagClass: 't-out',
    // 联合视图记录顶层已确认存在 hrWcApplication 字段（实体表 hr_wc_application）
    nestedKey: 'hrWcApplication',
    cardTimeFallback(d) {
      return d.startTime || ''
    },
    buildInfo(d, ctx) {
      return [
        { label: '申请事由', value: ctx.dash(d.sqyy) },
        { label: '日期', value: ctx.dash(ctx.datePart(d.startTime)) },
        // TODO 实体（hr_wc_application）暂无天数字段，候选名待后端确认，无值时显示 —
        { label: '天数', value: d.wcDays != null ? d.wcDays + ' 天' : (d.applyDays != null ? d.applyDays + ' 天' : '') },
        // TODO 审批完成时间在审批记录 spTime 上，实体本身无该字段；待联合视图确认是否下发，候选 approveTime/spTime
        { label: '审批时间', value: ctx.dash(d.approveTime || d.spTime) }
      ]
    },
    // 实体无独立备注字段（reason 为审批意见，不能用作备注）；后端确认前恒显示 —
    getRemark(d) {
      return d.remark || d.note || ''
    },
    cancel: attendanceCancel('/hr_wc_application/hrWcApplication/updateWithdraw')
  },
  移动打卡申请: {
    tagClass: 't-other',
    // TODO 联合视图嵌套对象 key 按实体表 hr_yddksq 命名惯例推定（同补卡/请假），后端实际命名不同只改此字符串
    nestedKey: 'hrYddksq',
    cardTimeFallback(d) {
      return d.startTime || ''
    },
    headRows(d, ctx) {
      // 公司名：联合视图未挂 companyId_dictText 时，用页面已加载的组织树按 companyId 兜底翻译
      const name = ctx.dictText('companyId') || ctx.orgName(d.companyId) || d.companyName || ''
      return [
        { label: '公司', value: ctx.dash(name) }
      ]
    },
    buildInfo(d, ctx) {
      // 附件行 type:'files'，value 为逗号分隔的相对路径（JUploadList 存储格式），由页面渲染可点击链接
      return [
        { label: '开始时间', value: ctx.dash(d.startTime) },
        { label: '结束时间', value: ctx.dash(d.endTime) },
        { label: '地点', value: ctx.dash(d.sqdd) },
        { label: '申请原因', value: ctx.dash(d.sqyy) },
        { label: '附件', type: 'files', value: d.attachmentUrls || '' }
      ]
    },
    getRemark(d) {
      return d.remark || d.note || ''
    },
    cancel: attendanceCancel('/hr_yddksq/hrYddksq/updateWithdraw')
  },

  // ==================== 以下类型取消接口已接（详情暂未接入，detailReady:false） ====================
  // TODO 以下 7 个类型的 key（须等于联合视图 mkname）与 nestedKey 均按后端实体名推定，
  // 后端文档名与 mkname 并不严格一致（如文档「补卡申请单」实际 mkname 为「补卡申请」），
  // 联调时需按 vUserSqdUnion 实际返回核对，只改 key/nestedKey 两个字符串。

  宿舍申请: {
    tagClass: 't-other',
    detailReady: false,
    nestedKey: 'hrmSqglApply',
    buildInfo: () => [],
    getRemark: () => '',
    // PUT cancel?id=业务表id（与宿舍模块列表页取消逻辑一致）
    cancel: { method: 'put', url: '/sqgl/hrmSqglApply/cancel', send: 'queryId', reasonField: '' }
  },
  访客申请: {
    tagClass: 't-other',
    detailReady: false,
    nestedKey: 'hrmFkzxSq',
    buildInfo: () => [],
    getRemark: () => '',
    // 后端明确：POST edit，只传业务 id + zt:'3'（不是声明过的 /cancel 端点）
    cancel: editCancel('/fkzx/hrmFkzxSq/edit', '3')
  },
  放行条申请: {
    tagClass: 't-other',
    detailReady: false,
    nestedKey: 'hrmFxtsqxx',
    buildInfo: () => [],
    getRemark: () => '',
    cancel: editCancel('/fkzx/hrmFxtsqxx/edit', '3')
  },
  离职申请: {
    tagClass: 't-other',
    detailReady: false,
    nestedKey: 'hrmLzgl',
    buildInfo: () => [],
    getRemark: () => '',
    // 后端明确：POST edit，id + zt:'已取消'（旧列表页的 PUT + qxyy 必填已废弃）
    cancel: editCancel('/ryManage/hrmLzgl/edit', '已取消')
  },
  调动申请: {
    tagClass: 't-other',
    detailReady: false,
    nestedKey: 'hrmTdgl',
    buildInfo: () => [],
    getRemark: () => '',
    // 后端明确：POST edit，id + zt:'已取消'（旧列表页 spyj 必填已废弃）
    cancel: editCancel('/ryManage/hrmTdgl/edit', '已取消')
  },
  调薪申请: {
    tagClass: 't-other',
    detailReady: false,
    nestedKey: 'hrmTxsq',
    buildInfo: () => [],
    getRemark: () => '',
    cancel: editCancel('/ryManage/hrmTxsq/edit', '已取消')
  },
  临时工申请: {
    tagClass: 't-other',
    detailReady: false,
    nestedKey: 'tempWorkerApply',
    buildInfo: () => [],
    getRemark: () => '',
    // PUT cancel/{业务表id}
    cancel: { method: 'put', url: '/lsggl/tempWorkerApply/cancel', send: 'pathId', reasonField: '' }
  }
}

/** 按 mkname 取类型配置；未注册类型返回 null（卡片正常展示，详情走「暂未接入」占位） */
export function getApplyType(type) {
  return APPLY_TYPES[type] || null
}
