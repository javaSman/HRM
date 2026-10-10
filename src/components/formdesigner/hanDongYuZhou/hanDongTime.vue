<template>
  <el-time-select 
    :disabled="disabled"
    v-model="fcz.commonDataInfo"
    :picker-options="{
    start: '00:00',
    step: '00:01',
    end: '23:59'
  }"
    :placeholder="fcz.tableTypeDesc"
    @change="commonComponent">
  </el-time-select>
</template>

<script>
export default {
  name: "hanDongTime",

  props: {
    fcz:{},
    value:{
      type: String,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
  },
  mounted(){
    this.fcz.commonDataInfo = this.value
  },
  watch: {
    deep:true,
  },
  methods: {
    commonComponent(fczInfo) {
      console.log("hanDongTimehanDongTimehanDongTimehanDongTime")
      console.log(fczInfo)
      console.log("hanDongTimehanDongTimehanDongTimehanDongTimehanDongTimehanDongTime")
      this.fcz.commonDataInfo = fczInfo
      this.$emit('commonComponent', this.fcz)
    },
  }
}
</script>

<style scoped>

</style>