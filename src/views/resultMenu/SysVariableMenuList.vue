<template>
  <div>
    <both-sides-solt>
      <template #left>
        <route-menu v-model="tagId"></route-menu>
      </template>
      <template #right>
        <sys-variable-record-list :menu-id="tagId" @getKey="getKey"></sys-variable-record-list>
      </template>
    </both-sides-solt>
  </div>
</template>

<script>
import SysVariableRecordList from '@views/variableRescord/SysVariableRecordList'
import bothSidesSolt from '@views/resultMenu/bothSidesSolt'
import routeMenu from '@views/resultMenu/routeMenu'

export default {
  name: 'SysVariableMenuList',
  components: {
    bothSidesSolt,
    routeMenu,
    SysVariableRecordList
  },
  data() {
    return {
      tagId: "",
    }
  },
  methods: {
    tagChange(data) {
      this.tagId = data;
    },
    getKey(variableItem){

    },
  },


}
</script>

<style scoped>

</style>