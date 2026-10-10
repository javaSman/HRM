<template>
  <a-drawer
    :title="title"
    :maskClosable="true"
    width='70%'
    placement="right"
    :closable="true"
    @close="close"
    :visible="visible"
    style="padding-bottom: 53px;height: 100%">
    <a-tabs default-active-key="1" v-model="tabKey" @change="tagChange">
      <a-tab-pane key="1" force-render tab="菜单权限" class="myTab">
        <zt-route-menu-all @close="close" :role-id="roleId"></zt-route-menu-all>
      </a-tab-pane>

      <a-tab-pane key="2" force-render tab="数据权限" class="myTab">
        <result-tree  :multiple="true" :role-id="roleId"></result-tree>
      </a-tab-pane>

      <!--  系统配置的动态显示  -->
      <a-tab-pane v-for="(item, index) in  showConfigArr" :key="(index+tabIndex)" :tab="item.name" class="myTab">
        <a-row type="flex" :gutter="16">

          <a-col :span="spanNum" v-for="(selItem,index) in selectItem" :key="item.id">
            <a-card style="height: calc(100vh - 200px);overflow-y: auto;">
              <sys-role-tree :role-id="roleId" :checkable="selItem.checkable" :code="selItem.childCode" :multiple="selItem.multiple" :title="selItem.name" :searchShow="selItem.searchShow" @iconClick="myChange"></sys-role-tree>
            </a-card>
          </a-col>

        </a-row>
      </a-tab-pane>

    </a-tabs>
  </a-drawer>

</template>
<script>
  import ztRouteMenuAll from '@views/system/ztRouteMenuAll'
  import SysRoleTree from "@comp/common/SysRoleTree";
  import resultTree from '@comp/common/ResultTreeRole'
  import { flattenTreeToMap, getTreeSystemToMap } from '@/utils/sysTreeTagUtil'

  export default {
    name: "RoleModal",
    components:{
      SysRoleTree,
      resultTree,
      ztRouteMenuAll
    },
    computed: {
      spanNum() {
        let length = this.selectItem.length;
        if (length<=0){
          length==1;
        }
        return Math.floor(24/length);
      }
    },
    data(){
      return {
        visible: false,
        roleId:"",
        title:"角色权限配置",
        tabIndex:3,
        //====================
        tabKey:'1',
        code:"sys:config",
        showConfigArr:[],
        configMap:{},
        selectItem:[],

      }
    },
    created() {
      getTreeSystemToMap().then(map=>{
        this.configMap= map;
        let list=[];
        for (const [key, value] of map) {
          if (key.includes("System") && key!=='pcSystem'){
            list.push(value);
          }
        }
        this.showConfigArr=list;
      })


    },
    methods: {

      tagChange(){
        let index = this.tabKey-this.tabIndex;
        if (index<0){
          return
        }
        let item = this.showConfigArr[index];
        this.myChange(item);
      },
      myChange(data){
        console.log("点击找到：",this.configMap)
        let key = data.childCode;
        let item = this.configMap.get(key);
        // 从数组中删除父级节点对应的下标后面全部的
        this.deleteSelectItemIndexByChildCode(data.templateCode);
        if (item==null){
          return
        }
        this.selectItem.push(item);
      },
      // 从数组中删除父级节点对应的下标后面全部的
      deleteSelectItemIndexByChildCode(templateCode){
        if (this.code==templateCode){
          this.selectItem=[];
          return;
        }
        let arr = this.selectItem;
        for (let i = 0; i < arr.length; i++) {
          let item =  arr[i];
          if (item.childCode==templateCode){
            arr.splice(i+1, arr.length - (i+1));
            this.selectItem=arr;
          }
        }
      },
      close () {
        this.visible = false;
      },
      show(roleId,title){
        this.roleId=roleId
        this.title = title;
        this.visible = true;
      },
    }
  }

</script>
<style lang="less" scoped>
.myTab{
  height: calc(100vh - 180px);
  overflow-y: auto;
  overflow-x: hidden;
}
</style>