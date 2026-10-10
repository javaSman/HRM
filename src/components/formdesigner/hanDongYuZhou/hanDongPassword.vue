<template>
  <el-input type="password" :placeholder="fcz.tableTypeDesc" v-model="fcz.commonDataInfo" autocomplete="off" @change ="commonComponent"></el-input>
</template>

<script>
export default {
  name: "hanDongPassword",
  data(){
    return {

    }
  },
  props: {
    fcz:{},
  },
  watch: {
    deep:true,
  },
  methods: {
    commonComponent(fczInfo) {
      console.log("hanDongPasswordhanDongPasswordhanDongPassword")
      console.log(fczInfo)
      console.log("hanDongPasswordhanDongPasswordhanDongPasswordhanDongPassword")
      this.fcz.commonDataInfo = fczInfo
      this.$emit('commonComponent', this.fcz)
    },
  }
}
</script>

<style scoped>

</style>