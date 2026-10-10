<template>
  <div>
    <div style="text-align: end;margin: 10px">
      <a-radio-group v-model="myType" default-value="menu">
        <a-radio value="menu">
          菜单
        </a-radio>
        <a-radio value="leaf">
          叶子
        </a-radio>
      </a-radio-group>
      <a-tooltip overlayClassName="xfCard" trigger="hover" placement="bottomLeft" :arrowPointAtCenter="false">
        <template v-slot:title>
          <div class="xfList" v-for="item in fixedFieldList" @click="addRow(item.data)"> {{ item.zName }}  </div>
        </template>
        <a-button @click="addRow()" type="primary" size="small">新增</a-button>
      </a-tooltip>

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

      <template slot="zNameSlot" slot-scope="text, record, index">
        <div v-if="record.editable" >
          <a-input style="margin: -5px 0" :value="text" @change="(e) => handleChangeIndex(e.target.value, index, 'zName')" />
        </div>
        <div v-else>
          {{text}}
        </div>
      </template>
      <template slot="yNameSlot" slot-scope="text, record, index">
        <div v-if="record.editable" >
          <a-input style="margin: -5px 0" :value="text" @change="(e) => handleChangeIndex(e.target.value, index, 'yName')" />
        </div>
        <div v-else>
          {{text}}
        </div>
      </template>
<!--     selectOptions  引用位置 sysTreeTagUtil.js componentMappings -->
      <template slot="typeSlot" slot-scope="text, record, index">
<!--        <a-select style="width: 150px" v-model="record.type" placeholder="请选择" :allowClear="true" :disabled="!record.editable">-->
<!--          <a-select-option :value="key"  v-for="(value, key, index) in selectOptions" >{{ value.name }}</a-select-option>-->
<!--        </a-select>-->
        <component-type-select v-model="record.type" :disabled="!record.editable"></component-type-select>
      </template>

      <!--        componentSlot-->
      <template slot="componentSlot" slot-scope="text, record, index">
        <div v-if="record.editable" >
          <a-input style="margin: -5px 0" :value="text" @change="(e) => handleChangeIndex(e.target.value, index, 'component')" />
        </div>
        <div v-else>
          {{text}}
        </div>
      </template>
    <!--      componentParaSlot-->
      <template slot="componentParaSlot" slot-scope="text, record, index">
        <div v-if="record.editable" >
          <a-textarea style="margin: -5px 0" :autosize="{ minRows: 3}" :value="text" @change="(e) => handleChangeIndex(e.target.value, index, 'componentPara')" />
        </div>
        <div v-else>
          {{text}}
        </div>
      </template>
<!--      hasTargetIdSlot-->
      <template slot="hasTargetIdSlot" slot-scope="text, record, index">
        <div v-if="record.editable" >
          <a-switch   :default-checked="text" @change="(value) => handleChangeIndex(value, index, 'hasTargetId')" size="small" style="margin-left: 5px;margin-bottom: 3px"/>
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
              <a-popconfirm  title="确定删除吗?" @confirm="() => handleDelete(index)">
                <a>删除</a>
              </a-popconfirm>
            </span>
        </div>
      </template>

    </a-table>
  </div>
</template>

<script>
import componentTypeSelect from '@comp/ChoiceSelector/componentTypeSelect'
import {getAction,postAction,putAction,deleteAction} from "@api/manage";
import { fixedFieldList } from '@/utils/sysTreeTagUtil'

export default {
  name: "DynamicFields",
  components: {
    componentTypeSelect
  },
  props:{
    codeId:{
      type: String,
      required:true,
    }
  },
  watch:{
    codeId:{
      handler (newValue, oldValue) {
        this.myCodeId=newValue;
        this.loadData();
      },
      immediate: true
    },
    myType:{
      handler (newValue, oldValue) {
        this.myType=newValue;
        this.loadData();
      },
      immediate: true
    }
  },
  created() {

  },
  computed:{
    // selectOptions: function () {
    //   return componentMappings;
    // }
  },
  data (){
    return {
      // 固定类型字段列表
      fixedFieldList,

      myCodeId:'',
      myType:'menu',
      dataSource: [],
      editingKey: '', //修改或新增标志
      dataItem:{
        id:"",
        json:null,
      },
      columns: [
        {
          title: '序号',
          dataIndex: '',
          key:'rowIndex',
          width:60,
          align:"center",
          customRender:function (t,r,index) {
            return parseInt(index)+1;
          }
        },
        {
          title:'字段英文名称',
          align:"center",
          dataIndex: 'yName',
          scopedSlots:{customRender: 'yNameSlot'}
        },
        {
          title:'字段名称',
          align:"center",
          dataIndex: 'zName',
          scopedSlots:{customRender: 'zNameSlot'}
        },
        {
          title:'字段类型',
          align:"center",
          dataIndex: 'type',
          scopedSlots:{customRender: 'typeSlot'}
        },
        {
          title:'组件名称',
          align:"center",
          dataIndex: 'component',
          scopedSlots:{customRender: 'componentSlot'}
        },
        {
          title:'组件参数',
          align:"center",
          dataIndex: 'componentPara',
          scopedSlots:{customRender: 'componentParaSlot'}
        },
        {
          title:'是否关联id',
          align:"center",
          dataIndex: 'hasTargetId',
          scopedSlots:{customRender: 'hasTargetIdSlot'}
        },
        {
          title: '操作',
          dataIndex: 'action',
          align:"center",
          // fixed:"right",
          width:200,
          scopedSlots: { customRender: 'action' }
        }
      ],
    }
  },
  methods:{
    editRowIndex(record,key){
      //判断是否处于编辑状态
      if(this.editingKey !== null && this.editingKey !== ''){
        if(this.editingKey==='newkey'){
          this.$message.error('请先完成本次操作后在做添加')
        }else{
          this.$message.error('请先完成修改后在做添加')
        }
        return false
      }
      this.editingKey = key  //修改状态 防止 在修改时，点击新增
      //该行设置为 可编辑状态
      if (record) {
        record.editable = true
      }
    },
    //新增行
    addRow(arr){
      //判断是否处于编辑状态
      if(this.editingKey !== null && this.editingKey !== ''){
        if(this.editingKey==='newkey'){
          this.$message.error('请先完成本次操作后在做添加')
        }else{
          this.$message.error('请先完成修改后在做添加')
        }
        return false
      }
      this.editingKey = 'newkey'  //新增状态 防止 在新增时，点击修改
      let oneObj = {
        zName:'',
        yName:"",
        type:'1',
        component:"",
        componentPara:"",
        editable:true,
        hasTargetId:false,
      }
      if (arr){
        arr.forEach(item=>{
          this.dataSource.push(item);
        })
      }else {
        this.dataSource.push(oneObj);
      }

    },
    //取消
    cancelIndex(record){
      //如果是新增，取消后需要删除 listdata 数组的 最后一个
      if(this.editingKey === 'newkey'){
        this.dataSource.splice(this.dataSource.length-1,1)
      }
      //重置 editable 数据
      record.editable=false
      this.editingKey=null
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


    // 保存后台
    saveRowIndex(record){//保存或修改
      let data = this.dataItem;
      record.editable=false;
      let copyData = JSON.parse(JSON.stringify(data));
      copyData.json = JSON.stringify(copyData.json);
      this.save(copyData).then(res=>{
        this.editingKey=null;
        this.$message.info('更新成功');
      })
    },
    // 根据id 删除数据
    handleDelete(index){
      // 删除一个数组
      this.dataSource.splice(index,1);
      let data = this.dataItem;
      // 保存数据
      let copyData = JSON.parse(JSON.stringify(data));
      copyData.json = JSON.stringify(copyData.json);
      this.save(copyData).then(res=>{
        this.editingKey=null;
        this.$message.info('删除成功');
      })
    },
    save(data){
      return new Promise((resolve, reject)=>{
        let url="/variableRescord/sysVariableRecord/edit";
        putAction(url,data).then(res=>{
          resolve(res);
        })
      })
    },

    loadData(){
      let code= this.myCodeId;
      let getUrl ="/variableRescord/sysVariableRecord/queryByCode?code="+code;
      let that = this;
      let type = this.myType;
      getAction(getUrl).then(res=>{
        // 如果存在 直接返回
        if (res.success && res.result){
          let data = res.result;
          that.dataItem.id=data.id;
          let obj = JSON.parse(data.json);
          that.dataItem.json=obj;
          let arr=obj[type];
          arr.forEach(item=>{
            item['editable']=false;
          })
          this.dataSource=arr;
        }
      })
    }


  }
}
</script>

<style scoped>
.xfList{
  cursor: pointer;
  margin: 2px;
  padding: 3px;
}
.xfList:hover {
  background-color: #1890FF80;
  color: #fff;
}
</style>