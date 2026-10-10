<template>
  <div>
    <MenuTagTable ref="menuTag" title="分类菜单" :template-code="menuSysRoleAndUserCode" @myChange="tagChange">
      <user-list :menu-id="tagId" @getKey="getKey"></user-list>
    </MenuTagTable>
  </div>
</template>

<script>
import MenuTagTable from '@comp/common/MenuTagTable'
import UserList from '@views/system/UserList'
import { menuSysRoleAndUserCode } from '@/utils/sysTreeTagUtil'

export default {
  name: 'userMenuList',
  components: {
    MenuTagTable,
    UserList
  },
  data() {
    return {
      menuSysRoleAndUserCode:menuSysRoleAndUserCode,

      tagId: "",
      userId:"",
    }
  },
  methods: {
    tagChange(data) {
      console.log(data)
      this.tagId = data;
    },
    getKey(userItem){
      let userId =userItem.id;
      this.$refs.menuTag.setKeyId(userItem.menuId);
    },
  },
}
</script>

<style scoped>

</style>