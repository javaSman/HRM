<!-- 字典封装 转换参数名字 给系统的配置使用  -->
<template>
  <div>
    <j-dict-select-tag style="min-width: 120px" v-if="myPara.show" :value="myPara.value" :type="myPara.type"  :placeholder="myPara.placeholder" :dict-code="myPara.dictCode" @change="myChange"></j-dict-select-tag>
  </div>

</template>

<script>
import JDictSelectTag from '@comp/dict/JDictSelectTag'
export default {
  name: 'ZtDictSelectTag',
  components: { JDictSelectTag },
  watch: {
    value: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        if (newValue){
          this.myPara.value=newValue;
        }

      }
    },
    /**
     *
     *   // 1.系统表：参数规则 {"tableName":"sys_tag","showName":"name","storageName":"id","where":"template_code='menu_sys_role'","placeholder":"选择分类菜单","type":"list"}
     *   // 2.普通字典规则： {"code":"superQuery_yh","type":"radioButton"}  type调整样式
     *
     *
     * parameter 是一个json 格式的字符串  固定格式为
     * {code:'', tableName:'', showName:'', storageName:'', where:'', placeholder:''}
     * {
     *   code:"",           //字典code  如不是字典可不填
     *   tableName:"",      // 表名
     *   showName:"",       // 显示的值
     *   storageName:"",     // 存储的值
     *   where:"",            // 查询条件
     *   placeholder:"",       // 默认提示
     *   type:"radio,radioButton,list"   //样式
     * }
     */
    parameter:{
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        if (newValue){
          let obj = JSON.parse(newValue);
          this.myPara.type =obj.type ? obj.type : "list";
          this.myPara.placeholder = obj.placeholder ? obj.placeholder : "请选择";
          if (obj.code && obj.code!==''){
           this.myPara.dictCode = obj.code
          }else {
           this.myPara.dictCode =`${obj.tableName},${obj.showName},${obj.storageName},${obj.where}`
          }
          this.myPara.show=true;
        }else {
          this.myPara.show=false;
        }

      }
    }
  },
  props: {
    value: [String, Number],
    parameter:{
      type:String,
      required:true
    },
  },
  data () {
    return {

      myPara:{
        show:false,
        value:null,
        placeholder:"请选择",
        dictCode:"",
        type:"list"
      }

    }
  },
  methods: {
    myChange(value){
      this.myPara.value = value;
      this.$emit('input', value);
      this.$emit('change', value);
    }
  }
}
</script>

<style scoped>
</style>