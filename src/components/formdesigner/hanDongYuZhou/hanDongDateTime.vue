<template>
  <el-date-picker
    v-model="fcz.commonDataInfo"
    type="datetime"
    :disabled="disabled"
    :placeholder="fcz.tableTypeDesc"
    value-format="yyyy-MM-dd"
    @change ="commonComponent">
  </el-date-picker>
</template>

<script>
export default {
  name: "hanDongDateTime",
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
      console.log("hanDongDateTime fczInfo=",fczInfo)
      this.fcz.commonDataInfo = fczInfo.toString()
      this.$emit('commonComponent', this.fcz)
    },
  }
}
</script>

<style scoped>

</style>