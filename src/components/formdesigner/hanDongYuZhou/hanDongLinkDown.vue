<template>
  <el-select v-model="fcz.commonDataInfo" clearable :placeholder="fcz.tableTypeDesc" @change ="commonComponent">
    <el-option
      v-for="(itemCDC,cdc) in fcz.commonLinkDownCode"
      :key="cdc"
      :label="itemCDC.name"
      :value="itemCDC">
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: "hanDongLinkDown",
  props: {
    fcz:{},
  },
  watch: {
    deep:true,
  },
  methods: {
    commonComponent(fczInfo) {
      console.log("hanDongLinkDownhanDongLinkDownhanDongLinkDownhanDongLinkDown")
      console.log(fczInfo)
      console.log("hanDongLinkDownhanDongLinkDownhanDongLinkDownhanDongLinkDown")
      this.fcz.commonDataInfo = fczInfo.id
      this.fcz.commonLinkDownCodeChild =fczInfo.children
      this.$emit('commonComponent', this.fcz)
    },
  }
}
</script>

<style scoped>

</style>