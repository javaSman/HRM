<template>
  <div>
    <a-input @click="treeModalShow" v-model="classifyName" placeholder="请点击选择" @change="inputChange" :allowClear="true" :disabled="disabled"></a-input>

    <a-modal
      :title="title"
      :visible="treeIsShow"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <sys-tree-tag ref="sysTreeTag"  :type="'obj'" :title-show="false" @myChange="tagChange" :template-id="code" :data-has0pen="'1'" :selected-style-show="true">
        <template v-slot:header><a-button type="primary" size="small" @click="menuTypeAdd">添加目录</a-button></template>
      </sys-tree-tag>
    </a-modal>


    <!-- 树状增删改 -->
    <sys-tree-tag-from  ref="tagFrom" :code="code" :disableField="true" :pid-disable="true" @renewCallback="refreshSysTreeTag"></sys-tree-tag-from>
  </div>
</template>

<script>
import { getAction } from '@api/manage'
export default {
  name: 'SysInputTreeTag',
  components: {
    sysTreeTag:() => import('@comp/common/SysTreeTag'),
    sysTreeTagFrom:()=>import('@comp/common/SysTreeTagFrom')
  },
  props: {
    // 双向绑定的值  父组件通过 :value.sync="" 绑定值
    value: {
      type: [String,Object],
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    title:{
      type: String,
      default: "选择",
      required: false,
    },
    type:{
      type: String,
      required: false,
      default:""
    },
    disabled:{
      type: Boolean,
      required: false,
      default:false
    }
  },
  watch: {
    value(newValue, oldValue) {
      this.echo();
    }
  },


  created () {
    this.echo();
  },
  data () {
    return {

      classifyDict:null,
      classifyName:'',
      treeIsShow:false,
    }
  },
  methods: {

    //  步骤是1.treeModalShow(显示弹框)->2.tagChange(点击分类栏改变)->3.用户确定选择handleOk->用户清除input选择触发事件inputChange
    tagChange(data){
      this.classifyDict=data;
    },
    // 菜单类型节点的添加
    menuTypeAdd(){
      // 添加一个菜单类型的目录项
      let oneAddItem={
        name: '',
        id: '',
        pid: '0',
        templateId: '',
        hasChild:'1',
        fieldJson:null,
        sort: 10
      }
      this.$refs.tagFrom.add(oneAddItem);
    },
    // 刷新
    refreshSysTreeTag(){
      this.$refs.sysTreeTag.getBMAll();
    },

    inputChange(){
      let data = this.classifyDict;
      this.$emit("update:value",null);

    },
    treeModalShow(){
      this.treeIsShow=true;
    },
    handleCancel(){
      this.treeIsShow=false;
    },
    handleOk(){
      let data =this.classifyDict;
      // this.model.classify=data.id;
      if(this.type && data.hasChild!= this.type ){
        this.$message.error("该节点不可被选中");
        return
      }
      this.classifyName=data.name;
      this.handleCancel();
      this.$emit("update:value",data.id);
      this.$emit("myChange",data);
    },
    // 传递进来数据时回显数据 回显示数据
    echo(){
      setTimeout(()=>{
        let id= this.value;
        if ( !id || id=='' || id=='0'){
          this.classifyName='';
          return;
        }
        // 查询并回显数据
        let url="/sys/sysTreeTag/queryById?id="+id;
        getAction(url).then(res=>{
          if (res.success){
            let data = res.result;
            this.classifyName = data.name;
          }

        })

      },0)
    }

  },
}
</script>

<style scoped>

</style>