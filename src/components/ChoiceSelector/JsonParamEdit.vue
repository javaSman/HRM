<!--  obj 参数编辑器  -->
<template>
  <div style="border-left: 4px solid #1890FF;">
    <div style="text-align: end;margin: 10px">
      <a-button @click="addRow" type="primary" size="small" style="margin-right: 5px">新增</a-button>
      <slot name="header"></slot>
    </div>
<!--    {{ dataSource }}-->
    <a-table :columns="columns" :data-source="dataSource" size="small" bordered :pagination="false">

      <template slot="name" slot-scope="text, record, index">
        <a-input v-model="record.name" placeholder="请输入属性名"></a-input>
      </template>

      <template slot="zName" slot-scope="text, record, index">
        <a-input v-model="record.zName" placeholder="请输入中文名"></a-input>
      </template>

      <template slot="type" slot-scope="text, record, index">
        <a-select style="width: 180px" v-model="record.type" placeholder="请选择" :allowClear="true" :key="index">
          <a-select-option :value="key"  v-for="(value, key, index) in selectOptions"  :key="value">
            {{ value }}
          </a-select-option>
        </a-select>

      </template>
      <!--   组件参数   typeParam-->
      <template slot="typeParam" slot-scope="text, record, index">
<!--        <a-textarea placeholder="请输入组件参数" :autosize="{ minRows: 1}" v-model="record.typeParam" :disabled="record.type === 'array' || record.type ==='object' || !getComponentByKey(record.type) " />-->
        <!-- 根据动态组件 来编辑组件参数        -->
        <span v-if="getComponentFlag(record.type)" >
          <comme-popup  v-model="record.typeParam" title="请输入组件参数" :componentName="'ObjJsonEdit'" :parameter="getComponentByKey(record.type)" ></comme-popup>
        </span>



      </template>


<!--      <template slot="param" slot-scope="text, record, index">-->
<!--        <list-json-param-edit v-if="record.type === 'array' || record.type ==='object' " v-model="record.param" :is-list="record.type === 'array'" :is-json-string="false"></list-json-param-edit>-->
<!--        <div v-else>{{ text }}</div>-->
<!--      </template>-->

      <p slot="expandedRowRender" slot-scope="record" style="margin: 0;" v-if="record.type === 'array' || record.type ==='object'">
        <list-json-param-edit  v-model="record.param" :is-list="record.type === 'array'" :is-json-string="false"/>
      </p>


      <template slot="action" slot-scope="text, record, index">
        <div class="editable-row-operations">
          <a-button @click="handleDelete(index)" type="primary" size="small">删除</a-button>

          <a-button @click="moveUp(index)" type="primary" size="small" style="margin: 5px">上移</a-button>
        </div>
      </template>

    </a-table>
  </div>
</template>

<script>



const columns = [
  {
    title: '属性名',
    dataIndex: 'name',
    width: 150,
    scopedSlots: { customRender: 'name' },
  },
  {
    title: '中文名',
    dataIndex: 'zName',
    width: 150,
    scopedSlots: { customRender: 'zName' },
  },
  {
    title: '组件类型',
    dataIndex: 'type',
    width: 80,
    scopedSlots: { customRender: 'type' },
  },
  {
    title: '组件参数',
    dataIndex: 'typeParam',
    width: 150,
    scopedSlots: { customRender: 'typeParam' },
  },
  {
    title: '操作',
    dataIndex: 'action',
    align:"center",
    width:100,
    scopedSlots: { customRender: 'action' }
  }
];
import { getValueType } from '@/utils/sysTreeTagUtil'
import { componentMappings } from '@/utils/sysTreeTagUtil'
import commePopup from "@comp/ChoiceSelector/commePopup";

export default {

  name: 'listJsonParamEdit',
  components: { commePopup },
  props: {
    value: {
      // 自定义验证逻辑（此处不限制类型）
      validator: function(value) {
        return true;
      }
    },
    isList:{
      type:Boolean,
      default:false,
      required:false
    },
    isJsonString:{
      type:Boolean,
      default:true,
      required:false
    }
  },
  watch:{
    value: {
      handler(newValue, oldValue) {

      },
      immediate: true // 设置immediate为true
    },
    dataSource:{
      //immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        console.log(1111);
        this.myChange();
      }
    },
  },
  data () {
    return {
      columns,
      dataSource:[]
    }
  },
  created() {
    this.updateDatasource(this.value);
  },
  computed: {
    selectOptions: function () {
      let map={};
      for (let key in componentMappings) {
        map[key]=componentMappings[key].name;
      }
      map['array']="列表类型";
      map['object']="对象类型";
      return map;
    }
  },
  methods: {

    /**
     * 根据key 获取组件
     * @param key
     * @returns {*}
     */
    getComponentByKey(key){
      return componentMappings[key].param;
    },
    /**
     * 是否显示
     * @param key
     * @returns {boolean}
     */
    getComponentFlag(key){
      if (key === 'array' || key ==='object'){
        return false;
      }
      return  !! (componentMappings[key] && componentMappings[key]['param']);
    },

    /**
     * 根据value值 去解析成Datasource
     * @param newValue
     */
    updateDatasource(newValue){
      if (newValue==null || newValue==""){
        this.dataSource = [];
        return
      }
      let value
      // 如果声明传递进来的值是json 字符串
      if (this.isJsonString){
        value= JSON.parse(newValue);
      }else {
        value = newValue;
      }

      if (this.isList && value instanceof Array){
        value = value[0];
      }

      let objValueArr = [];

      for (let key in value) {
        if (key.includes('-')){
          let keys = key.split('-');
          let obj = {};
          obj['name'] = keys[0];
          obj['zName'] = keys[1];
          obj['typeParam'] =  keys[2];
          let type = value[key];


          let valueType = getValueType(type);
          let param ="";
          if (valueType === 'array' && type.length === 1){
            param =  type;
            type = valueType;
          }
          if (valueType ==='object'){
            param = type;
            type = valueType;
          }

          obj['type'] = type;
          obj['param'] = param;
          objValueArr.push(obj);
        }
      }
      this.dataSource = objValueArr;
    },



    myChange(){
      let tempObj={};
      this.dataSource.forEach(item=>{
        let key = item.name +"-"+item.zName;
        if (item.typeParam && item.typeParam!==''){
          key = key +"-" +item.typeParam
        }
        let type = item.type;
        if (item.type==='array'){
          if (item.param instanceof Array){
            type = item.param;
          }else {
            let arr=[];
            arr.push(item.param);
            type = arr;
          }

        }else if (item.type==='object'){
          type = item.param;
        }
        tempObj[key] = type;
      })
      // let arr = [];
      // if (this.isList){
      //   arr.push(tempObj);
      //   tempObj = arr;
      // }
      let tempObjStr
      if (this.isJsonString){
        tempObjStr = JSON.stringify(tempObj);
      }else {
        tempObjStr = tempObj;
      }

      this.$emit('input',tempObjStr);
      this.$emit('change',tempObjStr);
    },
    // 根据id 删除数据
    handleDelete(index){
      this.dataSource.splice(index,1);
      this.myChange();
    },
    // 上移动
    moveUp(index){
      if (index === 0){
        return;
      }
      let arr = this.dataSource;
      let toMove = arr[index];
      arr.splice(index, 1);
      arr.splice(index - 1, 0, toMove);
      this.myChange();
    },


    //新增行
    addRow(){
      let oneData={
        "name":"",
        "zName":"",
        "type":"",
        "param":"",
        "typeParam":""// 组件参数
      }
      this.dataSource.push(oneData);
      this.myChange();
    },
  }
}
</script>

<style scoped>

</style>