<template>
  <el-date-picker
    v-model="fcz.commonDataInfo"
    type="date"
    :disabled="disabled"
    :placeholder="fcz.tableTypeDesc"
    value-format="yyyy-MM-dd HH:mm:ss"
    @change ="commonComponent">
  </el-date-picker>
</template>

<script>
export default {
  name: "hanDongDate",
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
      console.log("hanDongDate fczInfo=",fczInfo)
      this.fcz.commonDataInfo = fczInfo.toString()
      this.$emit('commonComponent', this.fcz)
    },
  }
}
</script>

<style scoped>

</style>