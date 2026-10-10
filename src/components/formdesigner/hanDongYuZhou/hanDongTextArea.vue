<template>
  <el-input
    type="textarea"
    :disabled="disabled"
    :rows="2"
    :placeholder="fcz.tableTypeDesc"
    v-model="fcz.commonDataInfo"
    @change="commonComponent">
  </el-input>
</template>

<script>
export default {
  name: "hanDongTextArea",
  props: {
    fcz:{},
    value: {
      type: String,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
  },
  watch: {
    deep:true,
  },
  methods: {
    commonComponent(fczInfo) {
      console.log("hanDongTextAreahanDongTextAreahanDongTextAreahanDongTextArea")
      console.log(fczInfo)
      console.log("hanDongTextAreahanDongTextAreahanDongTextAreahanDongTextArea")
      this.fcz.commonDataInfo = fczInfo.toString()
      this.$emit('commonComponent', this.fcz)
    },
  }
}
</script>

<style scoped>

</style>