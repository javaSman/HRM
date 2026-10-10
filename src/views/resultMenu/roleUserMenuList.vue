<template>
  <div>
    <MenuTagTable ref="menuTag" title="分类菜单" :template-code="menuSysRoleAndUserCode" @myChange="tagChange">
      <role-user-list :menu-id="tagId" @getKey="getKey"></role-user-list>
    </MenuTagTable>
  </div>
</template>

<script>
import MenuTagTable from '@comp/common/MenuTagTable'
import RoleUserList from '@views/system/RoleUserList'
import {menuSysRoleAndUserCode} from '@/utils/sysTreeTagUtil'

export default {
  name: 'roleUserMenuList',
  components: {
    MenuTagTable,
    RoleUserList
  },
  data() {
    return {
      tagId: "",
      roleId:"",

      menuSysRoleAndUserCode:menuSysRoleAndUserCode
    }
  },
  methods: {
    tagChange(data) {
      this.tagId = data;
    },
    getKey(roleItem){
      let roleId =roleItem.id;
      this.$refs.menuTag.setKeyId(roleItem.menuId);
    },
  },
}
</script>

<style scoped>

</style>