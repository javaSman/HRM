<template>
  <div>
    <a-input @click="treeModalShow" v-model="classifyName" placeholder="请点击选择分类" @change="inputChange" :allowClear="true" ></a-input>

    <a-modal
      title="分类选择"
      :visible="treeIsShow"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <sys-menu-tag :type="'obj'" @myChange="tagChange" :template-id="templateCode" :operable="false" :title-show="false"></sys-menu-tag>
    </a-modal>
  </div>
</template>

<script>
import SysMenuTag from "@comp/common/SysMenuTag";
import { getAction } from "@api/manage";

export default {
  name: "SysInputMenuTag",
  components: {
    SysMenuTag
  },
  props: {
    // 双向绑定的值  父组件通过 :value.sync="" 绑定值
    value:[String,Object],
    templateCode:[String],
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
    inputChange(){
      let data = this.classifyDict;
      this.$emit("update:value",null);
      // if (this.classifyName==data.name){
      //   this.model.classify=data.id;
      // }else {
      //   this.model.classify='';
      // }
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
      this.classifyName=data.name;
      this.handleCancel();
      this.$emit("update:value",data.id);
    },
    // 传递进来数据时回显数据 回显示数据
    echo(){
      setTimeout(()=>{
        let id= this.value;
        if ( !id || id==''){
          return
        }
        // 查询并回显数据
        let url="/sysMenu/sysTag/queryById?id="+id;
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