
<template>
  <div style="width: 100px">
<!--    {{ myPara.dictValueList}}-->
    <a-select :mode="mode" style="width: 100%" v-model="myPara.value"  @change="myChange" :allowClear="true">
      <a-select-option  v-for="(item, index) in myPara.dictValueList" :value="item.value" :key="item.value">
        {{ item.name }}
      </a-select-option>
    </a-select>
  </div>

</template>


<script>
export default {
  name: "SelectArr",
  watch: {
    value: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        if (newValue && Array.isArray(newValue)) {
          this.myPara.value =  [...newValue];
        } else if (newValue){
          this.myPara.value = newValue;
        }else {
          this.myPara.value="";
        }
      }
    },
    /**
     * 参数定义
     {
       "mode":"default" // 'default' | 'multiple' | 'tags' | 'combobox'
       "list":[{"name":"","value":""},{"name":"","value":""}]
     }
     */
    parameter: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        if (newValue) {
          let obj = JSON.parse(newValue);
          this.myPara.dictValueList = obj.list ? obj.list : [];
          this.mode = obj.mode ? obj.mode : "tags";

        }
      }
    }
  },
  props: {
    value: true,
    parameter: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      mode:"tags",
      // 数据
      myPara: {
        // 数组
        value: [],
        // 存储的字符串字典值
        dictValueList:[],
      }

    }
  },
  methods: {
    myChange(value) {
      // console.log("数据",value)
      // value 返回的是数组
      this.myPara.value = value;
      this.$emit('input', value);
      this.$emit('change',value);

    }
  }
}
</script>

<style scoped>

</style>