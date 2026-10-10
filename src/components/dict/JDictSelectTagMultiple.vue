<template>
  <a-radio-group v-if="tagType=='radio'" @change="handleInput" :value="getValueSting" :disabled="disabled">
    <a-radio v-for="(item, key) in dictOptions" :key="key" :value="getOptionValue(item)">{{ getOptionText(item) }}</a-radio>
  </a-radio-group>

  <a-radio-group v-else-if="tagType=='radioButton'" buttonStyle="solid" @change="handleInput" :value="getValueSting" :disabled="disabled">
    <a-radio-button v-for="(item, key) in dictOptions" :key="key" :value="getOptionValue(item)">{{ getOptionText(item) }}</a-radio-button>
  </a-radio-group>

  <a-select
    :style="selectStyle"
    v-else-if="tagType=='select'"
    class="j-dict-select-tag-multiple"
    mode="multiple"
    :getPopupContainer="getPopupContainer"
    :placeholder="placeholder"
    :disabled="disabled"
    :value="selectValue"
    :title="selectedLabelText"
    :maxTagCount="maxTagCount"
    :showSearch="false"
    allowClear
    @change="handleInput">
    <a-select-option v-for="(item, key) in dictOptions" :key="key" :value="getOptionValue(item)">
      <span style="display: inline-block;width: 100%" :title="getOptionText(item)">
        {{ getOptionText(item) }}
      </span>
    </a-select-option>
  </a-select>
</template>

<script>
  import { ajaxGetDictItems, getDictItemsFromCache } from '@/api/api'

  export default {
    name: 'JDictSelectTagMultiple',
    props: {
      dictCode: {
        type: String,
        default: ''
      },
      placeholder: {
        type: String,
        default: ''
      },
      disabled: Boolean,
      value: {
        type: [String, Number, Array],
        default: undefined
      },
      type: {
        type: String,
        default: ''
      },
      options: {
        type: Array,
        default: () => []
      },
      maxTagCount: {
        type: Number,
        default: 3
      },
      getPopupContainer: {
        type: Function,
        default: (node) => node.parentNode
      },
      selectWidth: {
        type: [String, Number],
        default: ''
      }
    },
    data() {
      return {
        dictOptions: [],
        tagType: ''
      }
    },
    watch: {
      options: {
        handler(val) {
          if (val && val.length > 0) {
            this.setCurrentDictOptions(val)
          } else {
            this.initDictData()
          }
        }
      },
      dictCode: {
        immediate: true,
        handler() {
          this.initDictData()
        }
      }
    },
    created() {
      // console.log(this.dictCode);
      if (!this.type || this.type === 'list') {
        this.tagType = 'select'
      } else {
        this.tagType = this.type
      }
      // 获取字典数据
      // this.initDictData();
    },
    computed: {
      getValueSting() {
        // update-begin author:wangshuai date:20200601 for: 不显示placeholder的文字 ------
        // 当有null或“” placeholder不显示
        return this.value != null ? this.value.toString() : undefined
        // update-end author:wangshuai date:20200601 for: 不显示placeholder的文字 ------
      },
      selectValue() {
        if (Array.isArray(this.value)) {
          return this.value
        }
        if (this.value !== null && this.value !== undefined && this.value !== '') {
          return this.value.toString().split(',')
        }
        return []
      },
      selectedLabelText() {
        const optionMap = {}
        this.dictOptions.forEach(item => {
          const value = this.getOptionValue(item)
          optionMap[String(value)] = this.getOptionText(item)
        })
        return this.selectValue.map(item => optionMap[String(item)] || item).join(',')
      },
      selectStyle() {
        if (!this.selectWidth) {
          return null
        }
        return {
          width: typeof this.selectWidth === 'number' ? this.selectWidth + 'px' : this.selectWidth
        }
      }
    },
    methods: {
      initDictData() {
        if (this.options && this.options.length > 0) {
          this.dictOptions = [...this.options]
          return
        }
        if (!this.dictCode) {
          this.dictOptions = []
          return
        }
        // 优先从缓存中读取字典配置
        if (getDictItemsFromCache(this.dictCode)) {
          this.dictOptions = getDictItemsFromCache(this.dictCode)
          return
        }

        // 根据字典Code, 初始化字典数组
        ajaxGetDictItems(this.dictCode, null).then((res) => {
          if (res.success) {
//                console.log(res.result);
            this.dictOptions = res.result
          }
        })
      },
      handleInput(e = '') {
        let val
        if (e && Object.keys(e).includes('target')) {
          val = e.target.value
        } else {
          val = e
        }
        if (Array.isArray(val)) {
          val = val.join(',')
        }
        if (val === null || val === undefined) {
          val = ''
        }
        this.$emit('change', val)
        // LOWCOD-2146 【菜单】数据规则，选择自定义SQL 规则值无法输入空格
        this.$emit('input', val)
      },
      getOptionValue(item) {
        return item && typeof item === 'object' ? item.value : item
      },
      getOptionText(item) {
        if (item && typeof item === 'object') {
          return item.text || item.label || item.value
        }
        return item
      },
      setCurrentDictOptions(dictOptions) {
        this.dictOptions = dictOptions
      },
      getCurrentDictOptions() {
        return this.dictOptions
      }
    },
    model: {
      prop: 'value',
      event: 'change'
    }
  }
</script>

<style scoped>
  .j-dict-select-tag-multiple /deep/ .ant-select-selection--multiple {
    max-height: 32px;
    overflow: hidden;
  }

  .j-dict-select-tag-multiple /deep/ .ant-select-selection__rendered {
    max-height: 30px;
    overflow: hidden;
  }

  .j-dict-select-tag-multiple /deep/ .ant-select-selection__choice__content {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
