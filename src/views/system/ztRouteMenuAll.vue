<template>
  <div>
    <a-row type="flex" :gutter="16">
      <a-col :span="6" >
        <zt-route-menu :role-id="roleId" @selectIdChange="myRouteSelectChange"></zt-route-menu>
      </a-col>
      <a-col :span="18"  style="border-left: solid 4px #1890FF;">
        <a-tabs defaultActiveKey="1" style="position: fixed;width: 50%;" v-if="routeMenuId">
          <a-tab-pane tab="模块权限" key="1">
            <zt-route-menu-role-tree :route-menu-id="routeMenuId" :role-id="roleId"></zt-route-menu-role-tree>
          </a-tab-pane>
          <a-tab-pane tab="数据规则/按钮" key="2">
<!--            <zt-diy-data-rule-role :tree-tag-id="treeTagId" :role-id="roleId"></zt-diy-data-rule-role>-->
            <zt-roule-button-tags-pop :tree-tag-id="treeTagId" :role-id="roleId"></zt-roule-button-tags-pop>
          </a-tab-pane>
          <a-tab-pane tab="数据规则" key="3">
            <zt-role-data-rule :route-menu-id="routeMenuId" :role-id="roleId"></zt-role-data-rule>
          </a-tab-pane>

        </a-tabs>
      </a-col>
    </a-row>

  </div>
</template>

<script>
import ztRouteMenu from '@views/system/ztRouteMenu'
import ztRoleDataRule from '@views/system/ztRoleDataRule'
import ztRouteMenuRoleTree from '@views/system/ztRouteMenuRoleTree'
import ztRouleButtonTagsPop from '@views/system/ztRouleButtonTagsPop'
// import ztDiyDataRuleRole from '@comp/common/ZtDiyDataRuleRole'
import { getTreeItemByTargetId } from '@/utils/sysTreeTagUtil'
export default
{
  name: 'ztRouteMenuAll',
  components:{
    ztRouteMenu,
    ztRoleDataRule,
    // ztDiyDataRuleRole,
    ztRouleButtonTagsPop,
    ztRouteMenuRoleTree
  },
  props:{
    roleId:{
      type: String,
      required:true,
    }
  },
  data(){
    return {
      routeMenuId:null,
      treeTagId:null,
    }
  },
  methods: {
    myRouteSelectChange(ids){
      if (ids!=null && ids.length>1){
        return
      }
      this.routeMenuId = ids==null ? ids :ids[0];
      this.treeTagId ="";
      if (this.routeMenuId==null || this.routeMenuId===''){
        return;
      }
      getTreeItemByTargetId(this.routeMenuId ).then(data=>{
        this.treeTagId = data.id;
      }).catch(err=>{
        this.$message.error("请检查路由菜单，是否绑定系统配置上的pc模块的菜单");
      })
    },
  }
}
</script>

<style scoped>

</style>