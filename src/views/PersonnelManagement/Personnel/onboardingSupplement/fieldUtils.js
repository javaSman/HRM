/**
 * 字段工具函数
 * 用于处理字段的动态显示、必填和验证规则
 */

/**
 * 判断字段是否可见
 * @param {Object} field 字段配置
 * @param {Object} record 当前记录数据
 * @returns {boolean}
 */
export function isFieldVisible(field, record) {
  // 无依赖配置，始终显示
  if (!field.dependsOn) return true

  const { field: depField, showWhen, hideWhen } = field.dependsOn
  const depValue = record ? record[depField] : undefined

  // 优先判断 hideWhen：依赖字段值在 hideWhen 数组中时隐藏
  if (hideWhen && Array.isArray(hideWhen)) {
    return !hideWhen.includes(depValue)
  }

  // 再判断 showWhen：依赖字段值在 showWhen 数组中时显示
  if (showWhen && Array.isArray(showWhen)) {
    return showWhen.includes(depValue)
  }

  // 默认显示
  return true
}

/**
 * 判断字段是否必填
 * @param {Object} field 字段配置
 * @param {Object} record 当前记录数据
 * @returns {boolean}
 */
export function isFieldRequired(field, record) {
  // 静态必填配置，且无动态依赖
  if (field.required && !field.dependsOn) return true

  // 动态必填配置
  if (field.dependsOn && field.dependsOn.requireWhen) {
    const { field: depField, requireWhen } = field.dependsOn
    const depValue = record ? record[depField] : undefined
    return requireWhen.includes(depValue)
  }

  // 默认非必填
  return false
}

/**
 * 获取字段的验证规则
 * @param {Object} field 字段配置
 * @param {Object} record 当前记录数据
 * @param {Array} staticRules 静态规则
 * @returns {Array}
 */
export function getFieldValidationRules(field, record, staticRules = []) {
  // 字段隐藏时，不应用验证规则
  if (!isFieldVisible(field, record)) {
    return []
  }

  // 字段动态必填时，生成必填规则
  if (field.dependsOn && isFieldRequired(field, record)) {
    const trigger = ['select', 'dict', 'date', 'datetime'].includes(field.type) ? 'change' : 'blur'
    const action = field.type === 'upload' ? '上传' : ['select', 'dict'].includes(field.type) ? '选择' : '输入'
    return [{ required: true, message: `请${action}${field.label}`, trigger }]
  }

  // 返回静态规则
  return staticRules
}
