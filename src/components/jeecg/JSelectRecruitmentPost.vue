<template>
  <a-select
    :value="value"
    :allowClear="allowClear"
    :showSearch="showSearch"
    optionFilterProp="children"
    style="width: 100%"
    :disabled="disabled"
    :loading="loading"
    :placeholder="loading ? loadingPlaceholder : placeholder"
    :getPopupContainer="getParentContainer"
    @change="handleChange"
  >
    <a-select-option v-for="item in options" :key="item.key" :value="item.value">
      {{ item.label }}
    </a-select-option>
  </a-select>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'JSelectRecruitmentPost',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    deptId: {
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
    placeholder: {
      type: String,
      default: '请选择岗位名称'
    },
    loadingPlaceholder: {
      type: String,
      default: '岗位加载中...'
    },
    valueField: {
      type: String,
      default: 'id'
    },
    labelField: {
      type: String,
      default: 'postName'
    },
    fallbackValue: {
      type: [String, Number],
      default: ''
    },
    fallbackLabel: {
      type: String,
      default: ''
    },
    loadWhenEmpty: {
      type: Boolean,
      default: true
    },
    url: {
      type: String,
      default: '/zpManage/hrmYrsq/getChildSequences'
    },
    getPopupContainer: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      rows: [],
      requestId: 0
    }
  },
  computed: {
    hasDeptId() {
      return this.deptId !== undefined && this.deptId !== null && this.deptId !== ''
    },
    requestDeptId() {
      return this.hasDeptId ? this.deptId : 0
    },
    options() {
      const options = (this.rows || [])
        .map((item, index) => this.toOption(item, index))
        .filter(item => item.label !== '' && item.value !== '')
      const fallbackValue = this.getFallbackValue()
      if (fallbackValue !== '' && !options.some(item => String(item.value) === String(fallbackValue))) {
        options.unshift({
          key: 'fallback-' + String(fallbackValue),
          label: this.fallbackLabel || String(fallbackValue),
          value: fallbackValue,
          row: null
        })
      }
      return options
    }
  },
  watch: {
    deptId: {
      immediate: true,
      handler() {
        this.loadOptions()
      }
    },
    url() {
      this.loadOptions()
    }
  },
  methods: {
    getParentContainer(node) {
      return typeof this.getPopupContainer === 'function' ? this.getPopupContainer(node) : node.parentNode
    },
    getFallbackValue() {
      if (this.fallbackValue !== undefined && this.fallbackValue !== null && this.fallbackValue !== '') {
        return this.fallbackValue
      }
      return ''
    },
    toOption(row, index) {
      const rawValue = row ? row[this.valueField] : ''
      const value = rawValue === undefined || rawValue === null ? '' : rawValue
      const label = row ? (row[this.labelField] || row.postName || row.name || '') : ''
      return {
        key: String(value) + '-' + index,
        label: String(label || ''),
        value,
        row
      }
    },
    getRows(res) {
      const result = res && res.result !== undefined ? res.result : res
      if (Array.isArray(result)) {
        return result
      }
      if (result && Array.isArray(result.records)) {
        return result.records
      }
      return []
    },
    loadOptions() {
      if (!this.loadWhenEmpty && !this.hasDeptId) {
        this.rows = []
        this.$emit('loaded', [])
        return Promise.resolve([])
      }
      const currentRequestId = ++this.requestId
      this.loading = true
      this.$emit('loading', true)
      return getAction(this.url, { deptId: this.requestDeptId })
        .then(res => {
          if (currentRequestId !== this.requestId) {
            return []
          }
          const rows = this.getRows(res)
          this.rows = rows
          this.$emit('loaded', rows)
          return rows
        })
        .catch(() => {
          if (currentRequestId === this.requestId) {
            this.rows = []
            this.$emit('loaded', [])
          }
          return []
        })
        .finally(() => {
          if (currentRequestId === this.requestId) {
            this.loading = false
            this.$emit('loading', false)
          }
        })
    },
    handleChange(value) {
      const selectedValue = value === undefined || value === null ? '' : value
      const option = this.options.find(item => String(item.value) === String(selectedValue))
      this.$emit('change', selectedValue, option ? option.row : null, this.rows)
    }
  }
}
</script>
