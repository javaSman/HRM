<!--  自定义组件类型 的select 选择器 -->
<template>
  <div>
    <a-select style="width: 150px" v-model="myValue" placeholder="请选择" :allowClear="true" :disabled="disabled" @change="handleChange">
      <a-select-option :value="key"  v-for="(optionValue, key, index) in selectOptions" >{{ optionValue.name }}</a-select-option>
    </a-select>
  </div>
</template>

<script>
import { jsonComponentMap } from '@/utils/sysTreeTagUtil'
export default {
  name: 'commePopupMapSelect',
  components: {

  },
  props: {
    // 双向绑定的值  父组件通过 :value.sync="" 绑定值
    value: {
      type: String,
      required: true,
    },
    disabled:{
      type: Boolean,
      default: false
    },
  },
  methods: {
    handleChange(value) {
      this.$emit('change', value);
      this.$emit("input",value);
    }
  },
  watch: {
    value(newValue, oldValue) {
     this.myValue = newValue;
    }
  },
  created() {
    this.myValue = this.value;
  },
  computed:{
    selectOptions: function () {
      return jsonComponentMap;
    }
  },
  data () {
    return {
      myValue:"",
    }
  },
}
</script>

<style scoped>

</style>