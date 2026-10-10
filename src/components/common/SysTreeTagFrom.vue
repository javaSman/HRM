<template>
  <!-- 树状增删改 -->
  <a-modal v-model="treeShow" :title="treeTitle" @ok="TreeOk" width="50%">
    <table border="1" cellspacing="0" cellpadding="10" class='newTab'>
      <tr>
        <th>上级</th>
        <td :colspan="4">
          <sys-input-tree-tag :value.sync="newTree.pid" type="1" :code="code" @myChange="myChange" :disabled="pidDisable || isPidDisable"></sys-input-tree-tag>
        </td>
      </tr>
      <tr>
        <th>名称</th>
        <td :colspan="4">
          <a-input v-model="newTree.name" placeholder="请输入名称"></a-input>
        </td>
      </tr>
      <tr>
        <th>类型</th>
        <td :colspan="4">
          <a-radio-group v-model="newTree.hasChild" @change="checkConfigModel" :disabled="treeTitle=='编辑' ||  disableField">
            <a-radio :value="item.value"  v-for="(item,key) in nodeType" :key="key">{{ item.name }}</a-radio>
          </a-radio-group>
        </td>
      </tr>
      <tr>
        <th>子code</th>
        <td :colspan="4">
          <a-input v-model="newTree.childCode" placeholder="请输入子code" :disabled="disableField"></a-input>
        </td>
      </tr>

      <tr v-for="(item,index) in filedArr">
        <th>{{ item.zName }}</th>
        <td :colspan="4">
          <component :is="getMyComponentByType(item)"
                     v-model="filedObj[item.yName]"
                     :title="item.zName"
                     :componentName="item.component"
                     :parameter="handler(item.componentPara)"
                     :placeholder="item.zName"/>
        </td>

      </tr>
      <tr>
        <th>排序</th>
        <td :colspan="4">
          <a-input-number v-model="newTree.sort" placeholder="排序" :min="0" disabled></a-input-number>
        </td>
      </tr>
    </table>
  </a-modal>
</template>

<script>
import { postFormAction, putFormAction } from '@api/manage'
import { getVariableByCode } from '@/utils/util'
import { getComponentByType,getTreeSystemToMap ,setCommParam,nodeType } from '@/utils/sysTreeTagUtil'
import sysInputTreeTag from '@comp/common/SysInputTreeTag'


export default {
  name: 'SysTreeTagFrom',
  components: {
    sysInputTreeTag
  },

  props: {
    code: {
      // 模板id  （也就是项目id）
      type: String,
      required: true,
    },
    targetId:{
      type: String,
      default:"",
      required: false,
    },
    disableField:{
      type: Boolean,
      default:false,
      required: false,
    },
    // 上级选择禁用
    pidDisable: {
      type: Boolean,
      default:false,
      required: false,
    },
    // 是否过滤其他类型的 显示
    isTypeFilter:{
      type: Boolean,
      default:true,
      required: false,
    }
  },
  created() {
    getTreeSystemToMap().then(map=>{
      this.configMap= map;
    })
  },
  computed:{
    // 上级是否禁用  只要可操作层数小于2的 上级是无法选择的
    isPidDisable:function (){
      let item = this.configMap.get(this.code);
      if (item && item.layer<=1){
        return true;
      }
      return false
    },
    nodeType:function () {
      let node = JSON.parse(JSON.stringify(nodeType));
      // 如果不过滤其他类型的 显示
      if (!this.isTypeFilter){
        return node;
      }
      // 要过滤
      for (let key in node) {
        let item = node[key];
        if (item.filter){
          delete node[key];
        }
      }
      return  node;
    }
  },
  data(){
    return{
      treeShow: false,
      treeTitle: '新增',
      newTree: {
        name: '',
        id: '',
        pid: '',
        templateId: '',
        hasChild:1,
        childCode:'',
        fieldJson: "{}",
        sort: 0
      },
      filedArr:[],
      filedObj:{},

      // 变量表记录的树形结构下 配置的菜单节点 和叶子节点需要的格式
      variableData: {},

      //的信息
      configMap:new Map()
    }
  },
  methods:{
    add (record) {
      if (record){
        this.addHandler(record);
        return
      }
      this.addHandler(this.newTree);
    },
    addHandler(record){
      this.treeTitle="新增";
      this.newTree = Object.assign({}, record);
      if (record.fieldJson){
        this.filedObj = JSON.parse(record.fieldJson);
      }
      this.resetFiledObj(this.newTree.hasChild);
      this.newTree.templateId=this.code;
      this.treeShow = true;
    },

    edit (record,type="编辑") {
      this.treeTitle=type;
      this.newTree = Object.assign({}, record);
      if (record.fieldJson){
        this.filedObj = JSON.parse(record.fieldJson);
      }
      this.resetFiledArr(this.newTree.hasChild);
      this.newTree.templateId=this.code;
      this.treeShow = true;
    },

    // 节点排序的
    myChange(data){
      let sort = 0;
      if (data.children && data.children.length>0){
        sort=data.children.length;
      }else if (data.sort){
        sort = data.sort+1;
      }
      this.newTree.sort = sort;

    },

    handler(params){
      if (params != null && params.includes("this")){
        let data = JSON.parse(JSON.stringify(this.filedObj))
        setCommParam(data);
      }
      return params
    },



    TreeOk() {
      let that = this;
      if (that.newTree.name==null || that.newTree.name==""){
        this.$message.error("节点名称不能为空");
        return
      }
      if (that.newTree.pid==null || that.newTree.pid==""){
        this.$message.error("上级节点不能为空");
        return
      }


      if (this.treeTitle == '新增') {
        let newTree =  JSON.parse(JSON.stringify(this.newTree));
        let fieldJson = JSON.stringify(this.filedObj);
        // 使用这个编码 因为服务器会报 特殊字符串 需要编码
        newTree.fieldJson = encodeURIComponent(fieldJson);
        postFormAction("sys/sysTreeTag/add", newTree).then((res) => {
          if (res.success) {
            this.$message.success("操作成功");
            this.treeShow = false;
            // 添加数据 或者更新数据 给父组件的回调事件
            this.$emit('renewCallback');
          }
        });
      } else {
        let fieldJson = JSON.stringify(this.filedObj);
        // 使用这个编码 因为服务器会报 特殊字符串 需要编码
        fieldJson = encodeURIComponent(fieldJson);
        let params = {
          id: that.newTree.id,
          pid: that.newTree.pid,
          name: that.newTree.name,
          sort: that.newTree.sort,
          templateId:that.newTree.templateId,
          childCode: that.newTree.childCode,
          fieldJson:fieldJson
        }
        putFormAction("sys/sysTreeTag/edit", params).then((res) => {
          if (res.success) {
            this.$message.success("操作成功");
            this.treeShow = false;
            // 添加数据 或者更新数据 给父组件的回调事件
            this.$emit('renewCallback');
          }
        })
      }
    },
    checkConfigModel(e) {
      // 重置filedObj
      let value = e.target.value;
      this.resetFiledObj(value);
    },

    resetFiledObj(index){
      let arr=['leaf','menu'];
      let that = this;
      this.variableData = getVariableByCode(this.code);
      this.filedArr = this.variableData[arr[index]];
      this.filedObj={};
      this.filedArr.forEach(item=>{
        let value='';
        if(item.type == '5'){
          value = false;
        }
        // that.filedObj[item.yName] = '';
        // 对像加属性 必须  使用$set 才能双向绑定
        if (item.hasTargetId){
          value = that.targetId;
        }
        that.$set(this.filedObj, item.yName, value);
      })
    },
    resetFiledArr(index){
      let arr=['leaf','menu'];
      this.variableData = getVariableByCode(this.code);
      this.filedArr = this.variableData[arr[index]];
    },

    getMyComponentByType(item) {
      let type = item.type;
      return getComponentByType(type).component;
    },


  }
}
</script>

<style scoped>
/* 弹框样式 */
.newTab {
  width: 98%;
  border-collapse: collapse;
  border: solid 1px #e8e8e8;
  margin: auto;
}

.newTab th {
  background-color: #fafafa;
  width: 6%;
  text-align: center;
}

.newTab td {
  width: 30%;
}

.newTabA td {
  width: 10% !important;
}
</style>