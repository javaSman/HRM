import { getAction } from '@/api/manage'

const CONTRACT_BELONG_URL = '/org/hrmOrg/loadTreeRoot'

export function fetchConstractBelongOptions() {
  return getAction(CONTRACT_BELONG_URL, { pid: 0 }).then(res => {
    if (!res || !res.success || !Array.isArray(res.result)) {
      throw new Error((res && res.message) || '合同归属选项加载失败')
    }
    const children = res.result.length && Array.isArray(res.result[0].children) ? res.result[0].children : []
    return children
      .filter(item => item && item.name)
      .map(item => ({ label: item.name, value: item.name }))
  })
}

export function includeCurrentConstractBelong(options, currentValue) {
  const result = Array.isArray(options) ? options.slice() : []
  if (currentValue && !result.some(item => String(item.value) === String(currentValue))) {
    result.unshift({ label: currentValue, value: currentValue })
  }
  return result
}
