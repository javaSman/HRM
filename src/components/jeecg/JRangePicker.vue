<template>
  <a-range-picker :disabledDate="disabledDate" dropdownClassName="j-range-picker" :disabled="disabled || readOnly"
    :placeholder="placeholder" @change="handleRangeChange" :value="momVal" :format="dateFormat"
    :getCalendarContainer="getCalendarContainer" v-bind="$attrs" />
</template>
<script>
import moment from 'moment'
export default {
  name: 'JRangePicker',
  props: {
    disabledDate: {
      type: Function,
      default: () => { },
      required: false
    },
    placeholder: {
      type: Array,
      default: () => ['开始日期', '结束日期'],
      required: false
    },
    value: {
      type: Array,
      required: false,
      default: () => []
    },
    dateFormat: {
      type: String,
      default: 'YYYY-MM-DD',
      required: false
    },
    triggerChange: {
      type: Boolean,
      required: false,
      default: false
    },
    readOnly: {
      type: Boolean,
      required: false,
      default: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    getCalendarContainer: {
      type: Function,
      default: (node) => node.parentNode
    }
  },
  data() {
    let val = this.value;
    return {
      decorator: "",
      momVal: !val || !val.length ? [] : [moment(val[0], this.dateFormat), moment(val[1], this.dateFormat)]
    }
  },
  watch: {
    value(val) {
      console.log('watch value', val)
      if (!val || !val.length) {
        this.momVal = []
      } else {
        this.momVal = [moment(val[0], this.dateFormat), moment(val[1], this.dateFormat)]
      }
    }
  },
  methods: {
    moment,
    handleRangeChange(mom, dateStr) {
      // dateStr 是数组 ['2025-01-01', '2025-01-02']，清除时是 ['', '']
      // 清除时应该 emit [] 而不是 ['', '']
      if (!dateStr || (dateStr.length === 2 && !dateStr[0] && !dateStr[1])) {
        this.$emit('change', []);
      } else {
        this.$emit('change', dateStr);
      }
    }
  },
  //2.2新增 在组件内定义 指定父组件调用时候的传值属性和事件类型
  model: {
    prop: 'value',
    event: 'change'
  }
}
</script>