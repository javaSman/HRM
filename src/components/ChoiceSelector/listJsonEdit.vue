<template>
  <div>
<!--    TODO: 这里还能优化优化完 挪到卫星影像-->
<!--    {{  value }}-->
    <div style="text-align: end;margin: 10px">
      <a-button @click="addRow" type="primary" size="small" style="margin-right: 5px">新增</a-button>
      <a-button @click="edit" :type='isEdit?"" :"primary"' size="small" style="margin-right: 5px">{{ isEdit ? "关闭编辑" : "启用编辑"  }}</a-button>
      <slot name="header"></slot>
    </div>
    <a-table
      ref="table"
      size="middle"
      :scroll="{x:true}"
      :bordered="true"
      rowKey="id"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="false"
      class="j-table-force-nowrap">

      <template v-for="(item, num) in basicTypeParam" :slot="item.name+'Slot'" slot-scope="text, record, index">
        <!--   :type="false" :is-json-string="false"   参数是listjson 编辑组件 和objJSON 组件是否 是否将对象字符串转化为 对象的    -->
        <component v-if="isEdit"  :is="getComponent(item.type)" v-model="dataSource[index][item.name]" :parameter="item.typeParam" :is-json-string="false"/>
        <span v-else>{{ dataSource[index][item.name] }}</span>
      </template>

      <p slot="expandedRowRender" slot-scope="record,index" style="margin: 0;margin-left: 40px;">
        <span v-for="(item) in objTypeParam" >
          <span  v-if="isEdit">
            {{ item.title }}:
            <component  :is="getComponent(item.type)" v-model="record[item.name]" :parameter="item.param" :is-json-string="false"/>
          </span>
          <span v-else  style="display: block">
            {{item.name}}:
            {{ record[item.name] }}
          </span>

          <span ></span>
        </span>
      </p>

      <!-- 操作  -->
      <template slot="action" slot-scope="text, record, index">
        <div class="editable-row-operations">
          <a-button @click="handleDelete(index)" type="danger" size="small">删除</a-button>
        </div>
      </template>

    </a-table>
  </div>
</template>

<script>
import { getComponentByType ,getValueType,commePopupMappings } from '@/utils/sysTreeTagUtil'
export default {
  name: "listJsonEdit",
  props:{
    value: {
      // 自定义验证逻辑（此处不限制类型）
      validator: function(value) {
        return true;
      }
    },
    parameter:{
      type:Object,
      required:true
    },
    // 是否转换json
    isJsonString:{
      type:Boolean,
      default:true,
      required:false
    }
  },
  watch:{
    // value: {
    //   handler(newValue, oldValue) {
    //     this.initDataSource();
    //   }
    // },
    dataSource:{
        //immediate: true,
        deep: true,
        handler(newValue, oldValue) {
          this.saveRowIndex(newValue);
        }
    },
    parameter: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        this.initParameter();
        this.createColumns();
      }
    }
  },
  computed: {
    basicTypeParam:function (){
      return this.analysisParameter.filter(item => item.type!=='object' && item.type!=='array');
    },
    objTypeParam:function (){
      return this.analysisParameter.filter(item => item.type==='object' || item.type==='array');
    }
  },
  created() {
    this.initParameter();
    this.createColumns();
    this.initDataSource();
  },
  data (){
    return {
      dataSource: [],
      columns: [],
      oneData:{},

      //参数解析{ name:"属性名（英文名的）"  title:"表头（中文名）"  type:"字段类型（组件类型）" }
      analysisParameter:[],

      isEdit:false
    }
  },
  methods:{
    //新增行
    addRow(){
      this.isEdit=true;
      let oneData=JSON.parse(JSON.stringify(this.oneData));
      this.dataSource.push(oneData)
    },
    edit(){
      this.isEdit=!this.isEdit;
    },
    /**
     * @param value 修改后的数据
     * @param key 数据源数组的 第几个
     * @param column 修改的列名
     */
    handleChangeIndex(value, key, column) {
      const dataSource = this.dataSource
      const target = dataSource[key]
      if (target) {
        target[column] = value
        this.dataSource = dataSource
      }
    },
    // 保存
    saveRowIndex(dataSource){//保存或修改
      let copyData = JSON.parse(JSON.stringify(dataSource));
      let value
      if (this.isJsonString){
        value = JSON.stringify(copyData);
      }else {
        value = JSON.parse(JSON.stringify(copyData));
      }
      this.$emit('input', value);
      this.$emit('change', value)
    },
    // 根据id 删除数据
    handleDelete(index){
      this.dataSource.splice(index,1);
      let copyData = JSON.parse(JSON.stringify(this.dataSource));

      let value
      if (this.isJsonString){
        value = JSON.stringify(copyData);
      }else {
        value = JSON.parse(JSON.stringify(copyData));
      }
      this.$emit('input', value);
      this.$emit('change', value)
    },

    /**
     * 初始化值 列表值
     */
    initDataSource(outsideValue){
      let value = this.value;
      if (outsideValue){
        value=outsideValue;
      }

      // 初始化数据
      if (value){
        let arr
        if (this.isJsonString){
          arr = JSON.parse(value);
        }else {
          arr = JSON.parse(JSON.stringify(value));
        }
        if (!arr){
          return;
        }
        this.dataSource = arr;
      }else {
        this.dataSource = [];
      }

    },
    /**
     * 初始化传递的参数
     */
    initParameter(){
      let tempArr=[];
      let para = this.parameter;
      Object.entries(para).forEach(([key, value]) => {
        // 切割出属性名name 和 title
        let arr = key.split("-");
        let name = arr[0];
        let title = arr[1];
        // 组件参数
        let typeParam = arr[2];

        // 判断这个值是什么类型的 数组类型（直接调用jsonList 组件） 对象类型直接调用 (jsonObj组件) 字符串的就是直接字段组件类型的
        let valueType = getValueType(value);
        let param ="";
        if (valueType === 'array' && value.length === 1){
          param =  value[0];
          value = valueType;
        }
        if (valueType ==='object'){
          param = value;
          value = valueType;
        }


        let tempObj={
          name,
          title,
          typeParam,
          type:value,
          param:param
        }
        tempArr.push(tempObj);
      });
      // console.log(tempArr)
      this.analysisParameter=tempArr;
    },
    // 创建表头Columns
    createColumns(){
      let columns =[];
      let item1 = {
        title: '序号',
        dataIndex: '',
        key:'rowIndex',
        width:30,
        align:"center",
        customRender:function (t,r,index) {
          return parseInt(index)+1;
        }
      };
      let item2={
        title: '操作',
        dataIndex: 'action',
        align:"center",
        // fixed:"right",
        width:80,
        scopedSlots: { customRender: 'action' }
      }

      columns.push(item1);
      let parameterArr = this.basicTypeParam;
      // 初始化置空数据
      let oneData={};
      parameterArr.forEach(parameterItem=>{
        let item = {
          title:parameterItem.title,
          align:"center",
          dataIndex: parameterItem.name,
          scopedSlots:{customRender: `${parameterItem.name}Slot`}
        }
        columns.push(item);

        oneData[parameterItem.name]="";
      })
      columns.push(item2);
      this.columns = columns;
      this.oneData=oneData;
    },

    //获取动态组件 引用地址
    getComponent(type){
      if (type === 'array'){
       return  commePopupMappings['listJsonEdit'];
      }
      if (type === 'object'){
        return  commePopupMappings['ObjJsonEdit'];
      }
      return  getComponentByType(type).component;
    },

  }
}
</script>

<style scoped>

</style>