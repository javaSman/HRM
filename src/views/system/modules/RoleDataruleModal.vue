<template>
  <a-drawer
    title="数据规则/按钮权限配置"
    width="365"
    :closable="false"
    @close="onClose"
    :visible="visible"
  >

    <a-tabs defaultActiveKey="1">
      <a-tab-pane tab="数据规则" key="1">
        <zt-role-data-rule :route-menu-id="functionId" :role-id="roleId"></zt-role-data-rule>
      </a-tab-pane>
      <!--<a-tab-pane tab="按钮权限" key="2">敬请期待!!!</a-tab-pane>-->
    </a-tabs>

  </a-drawer>
</template>

<script>
  import ARow from 'ant-design-vue/es/grid/Row'
  import ACol from 'ant-design-vue/es/grid/Col'
  import ztRoleDataRule from '@views/system/ztRoleDataRule'
  export default {
    name: 'RoleDataruleModal',
    components: { ACol, ARow,ztRoleDataRule },
    data(){
      return {
        roleId:'',
        visible:false,
        activeTabKey: '1',
        functionId:'',

      }
    },
    methods:{

      show(functionId,roleId){
        this.onReset()
        this.functionId = functionId
        this.roleId = roleId
        this.visible=true
      },
      onClose(){
        this.visible=false
      },
      onTabChange (key) {
        this.activeTabKey = key
      },
      onReset(){
        this.functionId=''
        this.roleId=''
      }
    }
  }
</script>

<style scoped>

</style>