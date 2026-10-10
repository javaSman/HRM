import moment from 'moment'

export const DORM_AREA_OPTIONS = ['A区-员工公寓', 'B区-技术公寓', 'C区-管理公寓', 'D区-实习生宿舍']
export const DORM_TYPE_OPTIONS = ['单人间', '双人间', '四人间', '六人间']
const REPEATABLE_DETAIL_KEYS = ['jyjl', 'gzll', 'jtcy', 'grfj', 'gxsb']

function hasValue(value) {
  return value !== undefined && value !== null && value !== ''
}

function firstValue() {
  for (let index = 0; index < arguments.length; index++) {
    if (hasValue(arguments[index])) return arguments[index]
  }
  return ''
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

export function isConfirmDetail(detail) {
  return isObject(detail) && hasValue(detail.id) && isObject(detail.jbxx)
}

export function createEditableArrivalDetail(detail) {
  const result = clone(detail)
  REPEATABLE_DETAIL_KEYS.forEach(key => {
    if (!Array.isArray(result[key])) result[key] = []
  })
  return result
}

export function createArrivalModel(detail) {
  const jbxx = detail.jbxx
  const existingRzsq = isObject(detail.rzsq) ? detail.rzsq : {}
  return {
    actualDate: firstValue(jbxx.actualDate, detail.sjrzsj, moment().format('YYYY-MM-DD')),
    rzsq: {
      id:existingRzsq.id,
      hrmRzglId: detail.id,
      qy: firstValue(existingRzsq.qy),
      dept: firstValue(detail.dept, jbxx.dept),
      gh: firstValue(detail.gh, jbxx.no),
      xm: firstValue(detail.xm, jbxx.name),
      sfzh: firstValue(detail.sfzh, jbxx.idCard),
      sjhm: firstValue(detail.sjh, jbxx.phoneNumber),
      rzrq: firstValue(existingRzsq.rzrq, jbxx.entryDate, detail.yjrzsj, moment().format('YYYY-MM-DD')),
      sslx: firstValue(existingRzsq.sslx),
      rzyy: firstValue(existingRzsq.rzyy, '新员工入职'),
      sqsj: firstValue(existingRzsq.sqsj, moment().format('YYYY-MM-DD HH:mm:ss')),
      spr: firstValue(existingRzsq.spr),
      csr: firstValue(existingRzsq.csr)
    }
  }
}

function buildEditedOnboardingPayload(detail, model) {
  const payload = clone(detail)
  payload.jbxx.actualDate = model.actualDate
  payload.sjrzsj = model.actualDate
  payload.rzsq = payload.jbxx.zsfs === '内宿' ? clone(model.rzsq) : null
  return payload
}

export function buildDraftOnboardingPayload(detail, model) {
  if (!isConfirmDetail(detail)) throw new Error('暂存资料数据不完整')
  return buildEditedOnboardingPayload(detail, model)
}

export function buildConfirmOnboardingPayload(detail, model) {
  if (!isConfirmDetail(detail)) throw new Error('确认到岗详情数据不完整')
  const payload = buildEditedOnboardingPayload(detail, model)
  payload.jbxx.status = '已入职'
  return payload
}
