<template>
  <div>
    <list-json-edit ref="listJson" :parameter="jsonParam" :isJsonString="false" v-model="dataSource" @change="onchange()" :type="false">
      <template v-slot:header>
        <a-button style="margin-right: 5px" @click="reset" type="primary" size="small">重置</a-button>
      </template>
    </list-json-edit>
  </div>
</template>

<script>
import { getCommParam } from '@/utils/sysTreeTagUtil'
import { isURL } from '@/utils/validate'
import { getAction } from '@api/manage'
import { getLayerQuery } from '@/utils/util'
import ListJsonEdit from '@comp/ChoiceSelector/listJsonEdit'

export default {
  name: 'YzLayerFieldList',
  components:{
    ListJsonEdit
  },
  props:{
    value: {
      // 自定义验证逻辑（此处不限制类型）
      validator: function(value) {
        return true;
      }
    },
    parameter:{
      type:String,
      default: "this.layerId",
      required:false
    },
    // 是否转换json
    type:{
      type:Boolean,
      default:true,
      required:false
    }
  },
  watch:{
    value: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        this.loadData();
      }
    }
  },
  created() {
    this.loadData();
  },
  data (){
    return {
      jsonParam:{ "name-字段名": "1", "zhName-中文名": "1", "isTableShow-是否表头显示": "5", "isGather-是否合并字段": "5","isChartField-图表字段":"5"},
      url:{
        queryById: "/layerManage/ztLayer/queryById"
      },
      dataSource: [],
      // 图层地址
      queryUrl:"",
    }
  },
  methods:{

    // 初始化数据
    loadData(){
      let arr=[];
      if (this.value){
        // 是否转化json
        arr = this.type ? JSON.parse(this.value):JSON.parse(JSON.stringify(this.value));
      }
      this.dataSource = arr ? arr :[];
      this.getLayerUrl();
    },
    // 获取图层地址
    getLayerUrl(){
      // 加载图层数据
      let param = this.parameter;
      if(param!=null && param.includes("this.")){
        let su = param.split("this.")[1];
        param =  getCommParam()[su];
      }
      // 如果是一个图层地址地址
      if (isURL(param)){
        this.queryUrl = param;
        return;
      }
      // 如果是一个图层id
      getAction(`${this.url.queryById}?id=${param}`).then(res=>{
        if (res.success){
          this.queryUrl = res.result.resourceUrl;
        } else{
          this.$message.error("加载错误")
        }
      }).catch(e=>{
        this.$message.error("检查图层网址是否能正确访问")
      })
    },

    // 重置
    reset(){
      getLayerQuery(this.queryUrl).then(fieldArr=>{
        console.log("===========",fieldArr)
        let arr= [];
        fieldArr.forEach(item=>{
          let one = {
            "name":item.name,
            "zhName":item.alias,
            "isTableShow":true,
            "isGather": false,
            "isChartField":false,
          }
          arr.push(one);
        })
        // 完成
        // this.dataSource=arr;
        // 重置一下数据
        this.$refs.listJson.initDataSource(arr);
      })
    },
    // 数据改变
    onchange(){
      let copyData = JSON.parse(JSON.stringify(this.dataSource));
      if (this.type){
        copyData = JSON.stringify(copyData);
      }else {
        copyData = JSON.parse(JSON.stringify(copyData));
      }
      this.$emit('input', copyData);
      this.$emit('change', copyData)
    }


  }
}
</script>

<style scoped>

</style>