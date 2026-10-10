const STORAGE_PREFIX = 'qr_hrm_recruitment_'

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }
  return window.localStorage
}

function getStorageKey(type) {
  return STORAGE_PREFIX + type
}

function getItemKey(item) {
  if (!item) {
    return ''
  }
  return String(item.id || item.planId || item.applyId || '')
}

function readPayload(type) {
  const storage = getStorage()
  if (!storage) {
    return null
  }
  try {
    const raw = storage.getItem(getStorageKey(type))
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return { mode: 'full', list: parsed }
    }
    if (parsed && Array.isArray(parsed.list)) {
      return {
        mode: parsed.mode === 'partial' ? 'partial' : 'full',
        list: parsed.list
      }
    }
  } catch (e) {
    return null
  }
  return null
}

function writePayload(type, payload) {
  const storage = getStorage()
  if (!storage) {
    return
  }
  storage.setItem(getStorageKey(type), JSON.stringify(payload))
}

function mergeStoredWithDefaults(storedList, defaults) {
  const result = (storedList || []).map(item => Object.assign({}, item))
  const resultKeys = result.map(item => getItemKey(item)).filter(Boolean)
  ;(defaults || []).forEach(item => {
    const key = getItemKey(item)
    if (!key || resultKeys.indexOf(key) === -1) {
      result.push(Object.assign({}, item))
    }
  })
  return result
}

export function loadMockList(type, defaults = []) {
  const payload = readPayload(type)
  if (!payload) {
    return (defaults || []).map(item => Object.assign({}, item))
  }
  if (payload.mode === 'partial') {
    return mergeStoredWithDefaults(payload.list, defaults)
  }
  return (payload.list || []).map(item => Object.assign({}, item))
}

export function saveMockList(type, list) {
  writePayload(type, {
    mode: 'full',
    list: (list || []).map(item => Object.assign({}, item))
  })
}

export function upsertMockItem(type, item) {
  const payload = readPayload(type)
  const mode = payload ? payload.mode : 'partial'
  const list = payload ? (payload.list || []).map(row => Object.assign({}, row)) : []
  const key = getItemKey(item)
  const index = list.findIndex(row => getItemKey(row) === key)
  if (index > -1) {
    list.splice(index, 1, Object.assign({}, list[index], item))
  } else {
    list.unshift(Object.assign({}, item))
  }
  writePayload(type, { mode, list })
}
