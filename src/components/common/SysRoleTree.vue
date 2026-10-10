<template>
  <div>
    <sys-tree-tag :type="'id'" :value.sync="selectTreeId" @myChange="myChange" data-has0pen="1" :template-id="code" :layer="10" :operable="false" :checkable="checkable" :searchShow="searchShow" :multiple="multiple" :title="title">
      <template v-slot:header><a-button v-if="checkable" type="primary" size="small" @click="myUpdateHandler">保存</a-button></template>
      <template v-slot:nodeSlot="{ data }">
        <!--        <a-icon v-if="data.childCode" @click.stop="showChild(data)" type="align-left" style="margin-left:5px;color: red;"></a-icon>-->
        <a-tooltip overlayClassName="xfCard" trigger="hover" placement="bottomLeft" :arrowPointAtCenter="false">
          <!-- 按钮数据规则浮窗  -->
          <template v-slot:title v-if="data.fieldJson.includes('prefix')">
            <zt-roule-button-tags-pop :tree-tag-id="data.id" :role-id="roleId"></zt-roule-button-tags-pop>
          </template>
          <a-icon  v-if="data.childCode" @click.stop="showChild(data)" type="align-left" :class="data.childCode==childCode?'blueClass':'redClass'" ></a-icon>
          <a-icon  v-else-if="data.fieldJson.includes('prefix')"  type="arrow-right" ></a-icon>
        </a-tooltip>

        <!-- 插槽 -->
        <slot name="nodeSlot" :data="data"> </slot>
      </template>
    </sys-tree-tag>
  </div>
</template>

<script>


import sysTreeTag from "@comp/common/SysTreeTag";
import ztRouleButtonTagsPop from '@views/system/ztRouleButtonTagsPop'
import {getAction, postAction, putAction} from "@api/manage";

export default {
  name: "SysRoleTree",
  components: {
    sysTreeTag,
    ztRouleButtonTagsPop
  },
  props: {
    code:{
      // 模板code 授权的模块对应的code
      type: String,
      required: true,
    },
    roleId:{
      // 角色id
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: false,
      // 标题文字
      default: "",
    },
    multiple: {
      type: Boolean,
      required: false,
      // 是否多选
      default: false,
    },
    checkable:{
      type: Boolean,
      required: false,
      // 是否显示复选框 （也就是不给授权 所以要隐藏保存按钮）
      default: true,
    },
    searchShow:{
      type: Boolean,
      required: false,
      // 是否显示搜索框
      default: false,
    },
  },
  watch: {
    roleId: {
      handler(newValue, oldValue) {
        if (newValue){
          this.getTreeIdList();
        }
      },
      immediate: true
    },
    code:{
      handler(newValue, oldValue) {
        if (newValue){
          this.getTreeIdList();
        }
      },
      immediate: true
    }
  },

  created() {
    this.getTreeIdList();
  },
  data () {
    return {

      selectTreeId:[],
      childCode:'',
      config:{},
    }
  },
  computed: {

  },
  methods: {
    myChange(key,obj){
      console.log("123",key,obj)
    },
    showChild(data){
      console.log("iconClick",data);
      this.childCode = data.childCode;
      this.$emit("iconClick", data);
    },

    getTreeIdList(){
      let url = `sys/sysRoleTree/list?roleId=${this.roleId}&code=${this.code}`
      getAction(url).then((res) => {
        console.log("getTreeIdList",res);
        if (res.success){
          let treeIdArr  = res.result.map(item=>item.treeId);
          this.selectTreeId = JSON.parse(JSON.stringify(treeIdArr));
          console.log("getTreeIdList",this.selectTreeId);
        }
      })
    },
    myUpdateHandler(){
      let url =`sys/sysRoleTree/update`;
      let roleId = this.roleId;
      let code = this.code;
      let treeIdList = this.selectTreeId;
      let params ={ roleId, code, treeIdList };
      putAction(url,params).then(res=>{
        console.log("myUpdateHandler",res)
        if (res.success){
          this.$message.info('更新成功');
          this.getTreeIdList();
        }else {
          this.$message.info('更新错误');
        }
      })

    }

  }
}
</script>

<style scoped>
  .redClass{
    margin-left:5px;color: red;
  }
  .blueClass{
    margin-left:5px;color: #0c8fcf;
  }
</style>