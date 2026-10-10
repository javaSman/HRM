export function normalizeIds(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item))
  }
  if (value === undefined || value === null || value === '') {
    return []
  }
  return [String(value)]
}

export function normalizeSelectionItems(ids, items, labelPrefix, description) {
  const itemMap = (Array.isArray(items) ? items : []).reduce((result, item) => {
    if (item && item.value !== undefined && item.value !== null) {
      result[String(item.value)] = item
    }
    return result
  }, {})

  return normalizeIds(ids).map(id => {
    return itemMap[id]
      ? Object.assign({}, itemMap[id], { value: id })
      : { value: id, label: labelPrefix + ' ' + id, description }
  })
}

export function normalizeOrgTree(list) {
  return (list || []).map(item => {
    const value = String(item.id || item.value || item.key || '')
    const title = item.name || item.title || ''
    return Object.assign({}, item, {
      key: value,
      value,
      title,
      scopedSlots: { title: 'orgTitle' },
      children: normalizeOrgTree(item.children || [])
    })
  }).filter(item => item.value)
}

export function filterOrgTreeData(list, keyword) {
  return (list || []).reduce((result, item) => {
    const children = filterOrgTreeData(item.children || [], keyword)
    const matched = String(item.title).toLowerCase().indexOf(keyword) > -1
    if (matched || children.length) {
      result.push(Object.assign({}, item, {
        children: matched ? item.children : children
      }))
    }
    return result
  }, [])
}

export function collectTreeKeys(list) {
  return (list || []).reduce((keys, item) => {
    if (item.children && item.children.length) {
      keys.push(item.key)
      keys = keys.concat(collectTreeKeys(item.children))
    }
    return keys
  }, [])
}

export function flattenOrgTree(list) {
  return (list || []).reduce((result, item) => {
    result.push(item)
    return result.concat(flattenOrgTree(item.children || []))
  }, [])
}
