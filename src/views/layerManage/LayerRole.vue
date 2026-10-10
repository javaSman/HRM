<template>
  <a-card :bordered="false">
    <a-row type="flex" :gutter="16">
      <a-col :span="8">
        <!-- 成果目录   -->
        <div style="height: calc(100vh - 200px); border: 1px solid #cdcdcd">
          <result-tree-and-list @nodeClick="nodeClick" @nodeIconClick="nodeIconClick"></result-tree-and-list>
        </div>
      </a-col>

      <!-- 成果目录  授权角色列表-->
      <a-col :span="5" v-show="drawerVisible">
        <a-card style="height: calc(100vh - 200px);overflow-y: auto">
          <menu-tag-role-tree ref="dataTagRole" :title="`数据资源（${treeName}）`"></menu-tag-role-tree>
        </a-card>
      </a-col>

      <!-- 成果目录  关联模块(卡片)-->
      <a-col :span="6" v-if="drawerVisible">
        <a-card style="height: calc(100vh - 200px);overflow-y: auto">
          <tree-tag-card  :target-id="treeId" :target-name="treeName" :code-list-obj="codeList" :row-num="2" @myChange="showRole"></tree-tag-card>
        </a-card>
      </a-col>

      <!-- 模块(卡片) 授权角色列表-->
      <a-col :span="5" v-show="cardVisible">
        <a-card style="height: calc(100vh - 200px);overflow-y: auto">
          <config-tag-role-tree ref="tagCardRole" :title="cardTitle"></config-tag-role-tree>
        </a-card>
      </a-col>

      <a-col :span="16" v-if="layerUserVisible">
        <a-card style="height: calc(100vh - 200px);overflow-y: auto">
          <zt-user-layer-list :layer-id="treeId"></zt-user-layer-list>
        </a-card>
      </a-col>


    </a-row>
  </a-card>
</template>

<script>
import ResultTree from '@comp/common/ResultTree'
import resultTreeAndList from '@comp/common/ResultTreeAndList'
import treeTagCard from '@comp/common/TreeTagCard'
import menuTagRoleTree from '@comp/common/MenuTagRoleTree'
import configTagRoleTree from '@comp/common/ConfigTagRoleTree'
import { getVariableByCode } from '@/utils/util'
import {menuZtLayerCode} from '@/utils/sysTreeTagUtil'

import ztUserLayerList from '@views/layerManage/ZtUserLayerList'

export default {
  name: 'LayerRole',
  components: {
    ResultTree,
    resultTreeAndList,
    treeTagCard,
    menuTagRoleTree,
    configTagRoleTree,
    ztUserLayerList
  },
  data() {
    return {
      menuZtLayerCode:menuZtLayerCode,

      drawerVisible:false,
      cardVisible:false,

      layerUserVisible:false,


      treeId:"",
      treeName:"",
      // 与哪些模块相关
      codeList:[],
      cardTitle:"",
    }
  },
  created() {
    // 系统变量中控制 resultMenuCode
    let data = getVariableByCode("resultMenuCode");
    this.codeList = data.codeList;
  },
  methods:{
    //=========== 分割是ResultTree 相关 后面提取出去 =========
    nodeClick(item){
      console.log("item===11",item)
      this.treeId = item.id;
      this.treeName = item.name;

      let id = item.id;
      let code = this.menuZtLayerCode
      let tableName = item.tableName;
      let menuId = item.menuId;
      let menuTableName = "sys_tag";
      this.drawerVisible=true;
      this.cardVisible = false;
      this.layerUserVisible = false;
      // 显示授权组件
      this.$refs.dataTagRole.showData(id,code,tableName,menuId,menuTableName);
    },
    nodeIconClick(item){
      console.log("========1212====",item.id)
      this.treeId = item.id;

      this.drawerVisible = false;
      this.cardVisible = false;
      this.layerUserVisible =true;
    },


    showRole(data){
      console.log("==data==",data);
      let code = data.templateCode;
      let id = data.id;
      let titleName = data.titleName;
      this.cardTitle = titleName+"（角色授权）";
      this.cardVisible = true;
      this.$refs.tagCardRole.showData(id,code);
    },
  }
}
</script>

<style scoped>

</style>