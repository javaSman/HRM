<template>
  <div>
    <both-sides-solt>
      <template #left>
        <route-menu v-model="tagId"></route-menu>
      </template>
      <template #right>
        <dict-list :menu-id="tagId"></dict-list>
      </template>
    </both-sides-solt>
  </div>
</template>

<script>
import bothSidesSolt from '@views/resultMenu/bothSidesSolt'
import routeMenu from '@views/resultMenu/routeMenu'
import dictList from '@views/system/DictList'
export default {
  name: 'ztMenuDictList',
  components: {
    bothSidesSolt,
    routeMenu,
    dictList
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

    }
  }
}
</script>

<style scoped>

</style>