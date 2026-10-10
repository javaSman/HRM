
<!-- 自定义规则和按钮切换 -->
<template>
  <div style="min-width: 200px;min-height: 200px">
    <a-tabs defaultActiveKey="1">
      <a-tab-pane tab="自定义数据规则" key="1">
        <zt-diy-data-rule-role :tree-tag-id="treeTagId" :role-id="roleId"></zt-diy-data-rule-role>
      </a-tab-pane>
      <a-tab-pane tab="按钮" key="2">
        <zt-diy-button-role :tree-tag-id="treeTagId" :role-id="roleId"></zt-diy-button-role>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>


<script>
import ztDiyDataRuleRole from '@comp/common/ZtDiyDataRuleRole'
import ztDiyButtonRole from '@comp/common/ZtDiyButtonRole'
export default {
  name: 'ztRouleButtonTagsPop',
  components:{
    ztDiyDataRuleRole,
    ztDiyButtonRole
  },
  props:{
    // 角色id
    roleId:{
      type: String,
      required:true,
    },
    // 系统配置菜单id
    treeTagId:{
      type: String,
      required:true,
    }
  },
  data () {
    return {

    }
  },
  methods: {

  }
}
</script>

<style scoped>

</style>