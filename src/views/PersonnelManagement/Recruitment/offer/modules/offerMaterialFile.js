function getFileName(filePath) {
  const normalizedPath = String(filePath || '').replace(/\\/g, '/')
  return normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1) || '附件材料'
}

export function toMaterialFileList(value) {
  const paths = Array.isArray(value)
    ? value.map(item => (typeof item === 'string' ? item : item && item.filePath))
    : String(value || '').split(',')

  return paths.map(item => String(item || '').trim()).filter(Boolean).map(filePath => ({
    fileName: getFileName(filePath),
    filePath
  }))
}

export function toMaterialPathString(value) {
  return toMaterialFileList(value).map(item => item.filePath).join(',')
}
