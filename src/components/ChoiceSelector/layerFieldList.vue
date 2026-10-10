<template>
  <div>
    <div style="text-align: end;margin: 10px">
      <a-button style="margin-right: 5px" @click="addRow" type="primary" size="small">新增</a-button>
      <a-button style="margin-right: 5px" @click="reset" type="primary" size="small">重置</a-button>
      <a-button style="margin-right: 5px" @click="openEditHandel" type="primary" size="small">打开编辑</a-button>
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

      <template v-for="(value, key) in format" :slot="key+'Slot'" slot-scope="text, record, index">
        <div v-if="record.editable" >
          <a-input style="margin: -5px 0" :value="text" :disabled="isDisabled(key)" @change="(e) => handleChangeIndex(e.target.value, index, key)" />
        </div>
        <div v-else>
          {{text}}
        </div>
      </template>

      <!-- 操作  -->
      <template slot="action" slot-scope="text, record, index">
        <div class="editable-row-operations">
            <span v-if="record.editable">
                <a @click="saveRowIndex(record)">保存</a>
                <a-divider type="vertical" />
                <a-popconfirm title="确定取消吗?" @confirm="() => cancelIndex(record)">
                  <a>取消</a>
                </a-popconfirm>
            </span>
          <span v-else>
              <a @click="() => editRowIndex(record,index)">编辑</a>
              <a-divider type="vertical" />
              <a @click="() => handleDelete(index)">删除</a>
               <a-divider type="vertical" />
              <a @click="() => top(index)">上移</a>

            </span>
        </div>
      </template>

    </a-table>
  </div>
</template>

<script>
function isEmptyObject(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}
import { isURL } from '@/utils/validate'
import { getAction } from '@api/manage'
import { getLayerQuery, isJSON } from '@/utils/util'
import {getCommParam} from "@/utils/sysTreeTagUtil";
export default {
  name: "layerFieldList",
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
    isJsonString:{
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
    },
    format: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        this.createColumns();
      }
    }
  },
  created() {
    this.createColumns();
    this.loadData();
    this.create1();
  },
  data (){
    return {
      // { fileId:"", name:""}
      openEdit:false,
      isConvert:true,
      // format:{
      //   name:"英文名",
      //   alias:"中文名",
      // },

      url:{
        queryById: "/layerManage/ztLayer/queryById"
      },

      dataSource: [],
      // editingKey: '', //修改或新增标志
      columns: [],
      oneData:{},
    }
  },
  computed:{
    format(){
      if (this.isConvert){
        return  { field:"field", name:"name"}
      }
      return {
        name:"英文名",
        alias:"中文名",
      }
    }
  },
  methods:{
    isDisabled(value){
      if (this.openEdit){
        return false;
      }

      if (this.isConvert && value == 'field'){
        return true;
      }
      if (!this.isConvert && value == 'name'){
        return true;
      }
      return false;
    },
    editRowIndex(record,key){
      if (record) {
        record['editable'] = true;
      }
    },
    //新增行
    addRow(){
      let oneData=JSON.parse(JSON.stringify(this.oneData));
      oneData['editable']=true;
      this.dataSource.push(oneData)
    },

    async create1(){
      let that = this;
      // 如果直接是url的 type 就是 这种格式{ fileId:"", name:""}
      this.isConvert=true;
      let url = this.parameter;
      if(url!=null && url.includes("this.")){
        let su = url.split("this.")[1];
        url =  getCommParam()[su];
      }
      // 如果不是url 就是id 就查询替换成url  就是原本的格式无需处理
      if (!isURL(url)){
        this.isConvert = false
        try {
          let res = await getAction(`${this.url.queryById}?id=${url}`)
          if (res.success){
            url = res.result.resourceUrl;
            that.queryUrl = url;
          } else{
            this.$message.error("加载错误")
            return
          }
        }catch (e){
          this.$message.error("检查图层网址是否能正确访问")
        }
      }else {
        that.queryUrl = url;
      }
    },
    openEditHandel(){
      this.openEdit = true;
    },

    async reset(){
      let url = this.queryUrl;
      let fieldArr = await getLayerQuery(url);
      fieldArr.forEach(item=>{
        delete item.type;
        delete item.length;
        item['editable'] =false;
      })
      // 如果需要装换
      if (this.isConvert){
        // field
        fieldArr.forEach(item=>{
          item['field'] = item.alias;
          item['name'] = item.alias;
          delete item.alias
        })

      }
      this.dataSource=fieldArr;
      this.emitInput();
    },

    //取消
    cancelIndex(record){
      //如果是新增，取消后需要删除 listdata 数组的 最后一个
      this.dataSource.splice(this.dataSource.length-1,1)
      // if(this.editingKey === 'newkey'){
      //
      // }
      //重置 editable 数据
      record.editable=false
      // this.editingKey=null
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
    // 创建Columns
    createColumns(){
      let columns =[];
      let item1 = {
        title: '序号',
        dataIndex: '',
        key:'rowIndex',
        width:60,
        align:"center",
        customRender:function (t,r,index) {
          return parseInt(index)+1;
        }
      };
      let item2={
        title: '操作',
        dataIndex: 'action',
        align:"center",
        fixed:"right",
        width:200,
        scopedSlots: { customRender: 'action' }
      }
      let para = this.format;
      columns.push(item1);
      Object.entries(para).forEach(([key, value]) => {
        console.log(key + ": " + value);
        let item = {
          title:value,
          align:"center",
          dataIndex: key,
          scopedSlots:{customRender: `${key}Slot`}
        }
        columns.push(item)
      });
      columns.push(item2);
      this.columns = columns;
      // 添加置空数据
      console.log("==>",para)
      let oneData=JSON.parse(JSON.stringify(para));
      Object.keys(oneData).forEach((key) => {
        oneData[key]="";
      });
      this.oneData=oneData;
    },

    // 保存后台
    saveRowIndex(record){//保存或修改
      record.editable=false;
      this.emitInput();
    },
    // 根据id 删除数据
    handleDelete(index){
      this.dataSource.splice(index,1);
      this.emitInput();
    },
    // 上移动
    top(index){
      let array = this.dataSource;
      if (index > 0 && index < array.length) {
        const element = array.splice(index, 1)[0];
        array.splice(index - 1, 0, element);
      }else {
        this.$message.error("无法继续移动")
      }
    },
    emitInput(){
      let copyData = JSON.parse(JSON.stringify(this.dataSource));
      copyData.forEach(item=>{
        if ('editable' in item){
          delete item.editable;
        }
      })
      let value
      if (this.isJsonString){
        value = JSON.stringify(copyData);
      }else {
        value = JSON.parse(JSON.stringify(copyData));
      }
      // this.editingKey=null;
      this.$emit('input', value);
    },

    loadData(){
      //如果value不为空 和不为空对象
      if (this.value && !isEmptyObject(this.value)){
        let arr=[]
        if (this.isJsonString){
          try {
            arr = JSON.parse(this.value);
          }catch (e){
            console.log(e,"layerFieldList:value值JSON.parse失败")
          }
        }else {
          arr = JSON.parse(JSON.stringify(this.value));
        }

        if (!arr){
          return;
        }
        arr.forEach(item=>{
          item['editable']=false;
        })
        this.dataSource = arr;
      }else {
        this.dataSource = [];
      }

    }

  }
}
</script>

<style scoped>

</style>