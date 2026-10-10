<template>
  <a-date-picker
    v-if="antype === 'date'"
    :disabledDate="disabledDate"
    dropdownClassName="j-date-picker"
    :disabled="disabled || readOnly"
    :placeholder="placeholder"
    @change="handleDateChange"
    v-model="momVal"
    :showTime="showTime"
    :format="currentFormat"
    :getCalendarContainer="getCalendarContainer"
    v-bind="$attrs"
  />

  <a-month-picker
    v-else-if="antype === 'month'"
    :disabledDate="disabledDate"
    dropdownClassName="j-date-picker"
    :disabled="disabled || readOnly"
    :placeholder="placeholder"
    @change="handleDateChange"
    v-model="momVal"
    :format="currentFormat"
    :getCalendarContainer="getCalendarContainer"
    v-bind="$attrs"
  />
</template>
<script>
import moment from 'moment'
export default {
  name: 'JDate',
  props: {
    antype: {
      type: String,
      default: 'date',
      required: false,
      validator: (value) => ['date', 'month'].includes(value),
    },
    disabledDate: {
      type: Function,
      default: () => {},
      required: false,
    },
    placeholder: {
      type: String,
      default: '',
      required: false,
    },
    value: {
      type: String,
      required: false,
    },
    dateFormat: {
      type: String,
      default: 'YYYY-MM-DD',
      required: false,
    },
    //此属性可以被废弃了
    triggerChange: {
      type: Boolean,
      required: false,
      default: false,
    },
    readOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    showTime: {
      type: [Boolean, Object],
      required: false,
      default: false,
    },
    getCalendarContainer: {
      type: Function,
      default: (node) => node.parentNode,
    },
  },
  data() {
    let dateStr = this.value
    return {
      decorator: '',
      momVal: !dateStr ? null : moment(dateStr, this.currentFormat),
    }
  },
  computed: {
    currentFormat() {
      if (this.dateFormat) {
        return this.dateFormat
      }
      return this.type === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD'
    },
  },
  watch: {
    value(val) {
      if (!val) {
        this.momVal = null
      } else {
        this.momVal = moment(val, this.currentFormat)
      }
    },
  },
  methods: {
    moment,
    handleDateChange(mom, dateStr) {
      this.$emit('change', dateStr)
    },
  },
  //2.2新增 在组件内定义 指定父组件调用时候的传值属性和事件类型 这个牛逼
  model: {
    prop: 'value',
    event: 'change',
  },
}
</script>
