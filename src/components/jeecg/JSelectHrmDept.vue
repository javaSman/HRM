<template>
  <a-cascader
    :value="deptPath"
    :options="deptOptions"
    :disabled="disabled || loading"
    :allowClear="allowClear"
    :show-search="showSearch ? { filter: filterDeptOption } : false"
    :getPopupContainer="getPopupContainer"
    :placeholder="loading ? loadingPlaceholder : placeholder"
    expand-trigger="hover"
    :change-on-select="changeOnSelect"
    style="width: 100%"
    @change="handleChange"
  />
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'JSelectHrmDept',
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    allowClear: {
      type: Boolean,
      default: true
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    changeOnSelect: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: '请选择所属部门'
    },
    loadingPlaceholder: {
      type: String,
      default: '加载中...'
    },
    fallbackLabel: {
      type: String,
      default: ''
    },
    pid: {
      type: [String, Number],
      default: 0
    },
    useRootChildren: {
      type: Boolean,
      default: true
    },
    url: {
      type: String,
      default: '/org/hrmOrg/loadTreeRoot'
    }
  },
  data() {
    return {
      loading: false,
      deptOptions: [],
      deptPath: []
    }
  },
  watch: {
    value: {
      immediate: true,
      handler() {
        this.syncDeptPath()
      }
    },
    fallbackLabel() {
      this.syncDeptPath()
    },
    url() {
      this.loadOptions()
    },
    pid() {
      this.loadOptions()
    }
  },
  created() {
    this.loadOptions()
  },
  methods: {
    getPopupContainer(node) {
      return node.parentNode
    },
    loadOptions() {
      this.loading = true
      return getAction(this.url, { pid: this.pid })
        .then(res => {
          const list = res && res.success && Array.isArray(res.result) && res.result.length
            ? res.result
            : []
          const source = this.useRootChildren && list.length > 0 ? (list[0].children || list) : list
          this.deptOptions = this.normalizeDeptOptions(source)
          this.syncDeptPath()
          this.emitLoaded()
        })
        .catch(() => {
          this.deptOptions = []
          this.deptPath = []
          this.$emit('loaded', null, [], [])
        })
        .finally(() => {
          this.loading = false
        })
    },
    normalizeDeptOptions(list = [], rootValue, parentLabels) {
      const labels = parentLabels || []
      return (list || [])
        .filter(item => item && (item.id || item.key || item.value || item.name || item.title))
        .map(item => {
          const label = item.name || item.title || ''
          const value = String(item.id || item.key || item.value || label)
          const companyId = rootValue || value
          const labelPath = labels.concat(label).filter(Boolean)
          const children = this.normalizeDeptOptions(item.children || [], companyId, labelPath)
          const info = {
            label,
            title: label,
            value,
            key: value,
            companyId,
            pathLabel: labelPath.join(' / '),
            pathLabels: labelPath,
            isLeaf: !children.length,
            children
          }
          if (!children.length) {
            delete info.children
          }
          return info
        })
    },
    syncDeptPath() {
      if (!this.value) {
        this.deptPath = []
        return
      }
      const matchedPath = this.findDeptPath(this.deptOptions, this.value)
      if (matchedPath.length) {
        this.deptPath = matchedPath
        return
      }
      const fallbackOption = this.buildFallbackDeptOption()
      if (fallbackOption) {
        this.deptOptions = this.ensureFallbackDeptOption(this.deptOptions, fallbackOption)
        this.deptPath = [fallbackOption.value]
        return
      }
      this.deptPath = []
    },
    buildFallbackDeptOption() {
      if (!this.value || !this.fallbackLabel) {
        return null
      }
      const value = String(this.value)
      const label = String(this.fallbackLabel)
      return {
        label,
        title: label,
        value,
        key: value,
        companyId: '',
        isLeaf: true,
        isFallback: true
      }
    },
    ensureFallbackDeptOption(list, fallbackOption) {
      const source = list || []
      return this.findDeptByValue(source, fallbackOption.value) ? source : [fallbackOption].concat(source)
    },
    findDeptPath(list, targetValue, parentPath) {
      const path = parentPath || []
      const normalizedTarget = String(targetValue || '')
      for (let i = 0; i < (list || []).length; i++) {
        const item = list[i]
        const nextPath = path.concat(String(item.value))
        if (String(item.value) === normalizedTarget) {
          return nextPath
        }
        const matchedPath = this.findDeptPath(item.children || [], normalizedTarget, nextPath)
        if (matchedPath.length) {
          return matchedPath
        }
      }
      return []
    },
    getDeptPathById(deptId, separator = '/') {
      if (deptId === undefined || deptId === null || deptId === '') {
        return ''
      }
      const currentDept = this.findDeptByValue(this.deptOptions, deptId)
      const labelPath = currentDept && currentDept.pathLabels
        ? currentDept.pathLabels
        : this.findDeptLabelPath(this.deptOptions, deptId)
      if (labelPath.length) {
        return labelPath.filter(Boolean).join(separator)
      }
      if (String(deptId) === String(this.value) && this.fallbackLabel) {
        return String(this.fallbackLabel)
      }
      return ''
    },
    findDeptLabelPath(list, targetValue, parentPath) {
      const path = parentPath || []
      const normalizedTarget = String(targetValue || '')
      for (let i = 0; i < (list || []).length; i++) {
        const item = list[i]
        const nextPath = path.concat(item.label || item.title || '')
        if (String(item.value) === normalizedTarget) {
          return nextPath
        }
        const matchedPath = this.findDeptLabelPath(item.children || [], normalizedTarget, nextPath)
        if (matchedPath.length) {
          return matchedPath
        }
      }
      return []
    },
    findDeptByValue(list, targetValue) {
      const normalizedTarget = String(targetValue || '')
      for (let i = 0; i < (list || []).length; i++) {
        const item = list[i]
        if (String(item.value) === normalizedTarget) {
          return item
        }
        const matchedDept = this.findDeptByValue(item.children || [], normalizedTarget)
        if (matchedDept) {
          return matchedDept
        }
      }
      return null
    },
    handleChange(value, selectedOptions) {
      const path = Array.isArray(value) ? value.map(item => String(item)) : []
      const currentDept = Array.isArray(selectedOptions) && selectedOptions.length
        ? selectedOptions[selectedOptions.length - 1]
        : this.findDeptByValue(this.deptOptions, path[path.length - 1])
      const deptId = currentDept ? String(currentDept.value || '') : ''
      console.log('deptId',deptId)
      const allLabel = currentDept ? this.getDeptPathById(deptId) : ''
      this.deptPath = path
      this.$emit('input', deptId)
      this.$emit('change', deptId, currentDept || null, path, selectedOptions || [])
      this.$emit('select', currentDept || null)
      this.$emit('allLabel', allLabel)
    },
    emitLoaded() {
      const currentDept = this.value ? this.findDeptByValue(this.deptOptions, this.value) : null
      this.$emit('loaded', currentDept, this.deptPath, this.deptOptions)
    },
    filterDeptOption(inputValue, path) {
      const keyword = String(inputValue || '').toLowerCase()
      return (path || []).some(option => String(option.label || option.title || '').toLowerCase().indexOf(keyword) > -1)
    }
  }
}
</script>
