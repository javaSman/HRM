import { getAction, httpAction } from '@/api/manage'
import { getApplyType } from './applyTypeRegistry'

// 工作台「我的申请 / 我的审批」跨模块申请单联合视图
const UNION_LIST = '/v_user_sqd_union/vUserSqdUnion/list'
// 各审批状态数量统计（URL 按现有模块 getSpStatusCount 惯例推定，如后端调整只改此处）
const UNION_SP_STATUS_COUNT = '/v_user_sqd_union/vUserSqdUnion/getSpStatusCount'
// 组织架构树（递归返回公司-部门全量树，用于部门 ID -> 名称兜底翻译）
const HRM_ORG_TREE = '/org/hrmOrg/loadTreeRoot'

/**
 * 联合视图分页列表
 * @param {Object} params pageNo/pageSize/spStatus/mkname/createtime_begin/createtime_end
 */
export function getUnionList(params) {
  return getAction(UNION_LIST, params)
}

/**
 * 各审批状态单据数量
 * @returns Promise<[{ spStatus, total }]>
 */
export function getUnionSpStatusCount() {
  return getAction(UNION_SP_STATUS_COUNT)
}

/**
 * 组织架构树（公司 -> 部门，递归全量）
 * @param {String} pid 父级 id，根节点传 '0'
 */
export function getHrmOrgTree(pid = '0') {
  return getAction(HRM_ORG_TREE, { pid })
}

/**
 * 取消（撤回）申请：按注册表 cancel 描述块向各模块接口分发，调用方无需关心接口差异
 * @param {String} type 申请类型（联合视图 mkname）
 * @param {Object} item 归一化后的卡片视图模型（含 raw 联合视图原始行、nested 嵌套实体）
 * @param {String} [reason] 取消原因（描述块 reasonField 存在时按字段名合并进 body）
 * @returns Promise
 */
export function cancelApply(type, item, reason) {
  const conf = getApplyType(type)
  const cancel = conf && conf.cancel
  if (!cancel) return Promise.reject(new Error('该申请类型暂不支持取消申请'))
  const method = cancel.method || 'post'
  const nested = (item && item.nested) || {}
  const raw = (item && item.raw) || {}
  // 业务表主键：优先嵌套实体 id，兜底联合视图顶层 id（联合视图每行来自单一业务表，顶层 id 即业务行 id）
  const id = nested.id || raw.id

  // queryId：PUT /xxx/cancel?id=（宿舍风格）
  if (cancel.send === 'queryId') {
    return httpAction(`${cancel.url}?id=${encodeURIComponent(id)}`, {}, method)
  }
  // pathId：PUT /xxx/cancel/{id}（临时工风格）
  if (cancel.send === 'pathId') {
    return httpAction(`${cancel.url}/${encodeURIComponent(id)}`, {}, method)
  }
  // idBody：POST /xxx/edit，只回传业务 id + 状态覆盖（访客/放行条/离职/调动/调薪风格，后端明确只收 id+zt）
  if (cancel.send === 'idBody') {
    const body = { id, ...(cancel.merge || {}) }
    if (cancel.reasonField) body[cancel.reasonField] = reason
    return httpAction(cancel.url, body, method)
  }
  // body：整条实体回传并覆盖状态字段（考勤族 updateWithdraw 风格，与各模块列表页撤回逻辑一致）
  const body = { ...nested, ...(cancel.merge || {}) }
  if (cancel.reasonField) body[cancel.reasonField] = reason
  return httpAction(cancel.url, body, method)
}
