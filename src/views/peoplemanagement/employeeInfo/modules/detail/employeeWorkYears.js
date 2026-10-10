const RESIGNED_STATUS = '已离职'
const DAY_TIME = 1000 * 60 * 60 * 24
const YEAR_DAYS = 365

function parseDate(value) {
  if (!value && value !== 0) {
    return null
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (value && typeof value.format === 'function') {
    const momentDate = value.format('YYYY-MM-DD')
    return parseDate(momentDate)
  }
  const text = String(value).trim()
  if (!text) {
    return null
  }
  const dateText = text.slice(0, 10).replace(/-/g, '/')
  const dateValue = new Date(dateText)
  return Number.isNaN(dateValue.getTime()) ? null : dateValue
}

export function calculateWorkYears(entryDate, endDate) {
  const entryDateValue = parseDate(entryDate)
  const endDateValue = parseDate(endDate)
  if (!entryDateValue || !endDateValue) {
    return ''
  }
  const workYears = (endDateValue.getTime() - entryDateValue.getTime()) / DAY_TIME / YEAR_DAYS
  return workYears > 0 ? Math.floor(workYears) : 0
}

export function calculateEmployeeWorkYears(employee) {
  const record = employee || {}
  const endDate = record.status === RESIGNED_STATUS ? record.formalResignDate : new Date()
  return calculateWorkYears(record.entryDate, endDate)
}
