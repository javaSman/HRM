<template>
  <div>
    <MenuTagTable ref="menuTag" title="分类菜单" template-code="tjInfoCode" @myChange="tagChange">
      <ZtTjInfoList :menu-id="tagId" @getKey="getKey"></ZtTjInfoList>
    </MenuTagTable>
  </div>
</template>

<script>
  import MenuTagTable from '@comp/common/MenuTagTable'
  import ZtTjInfoList from '@views/superQuery/ZtTjInfoList.vue'

  export default {
    name: 'roleUserMenuList',
    components: {
      MenuTagTable,
      ZtTjInfoList
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
      getKey(Item){
        this.$refs.menuTag.setKeyId(Item.menuId);
      },
    },
  }
</script>

<style scoped>

</style>