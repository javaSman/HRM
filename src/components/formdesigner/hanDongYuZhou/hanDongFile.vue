<template>
  <!-- <el-upload
    class="upload-demo"
    action="https://jsonplaceholder.typicode.com/posts/"
    :on-preview="handlePreview"
    :on-remove="handleRemove"
    :before-remove="beforeRemove"
    multiple
    :limit="3"
    :on-exceed="handleExceed"
    :file-list="fcz.commonDataInfo">
    <el-button size="small" type="primary">点击上传</el-button>
  </el-upload> -->
  <!-- add by nbacheng -->
  <j-upload :disabled="disabled" v-model="fcz.commonDataInfo" @change="commonComponent"  ></j-upload>
</template>

<script>
export default {
  name: "hanDongFile",
  props: {
    fcz:{},
    value: {
      type:[String,Array],
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
  mounted() {
    this.fcz.commonDataInfo = this.value
    console.log("hanDongFile mounted fcz.commonDataInfo",this.fcz.commonDataInfo)
  },
  methods: {
    commonComponent(fczInfo) {
      console.log("hanDongFile commonComponent fczInfo=",fczInfo)
      this.fcz.commonDataInfo = fczInfo
      this.$emit('commonComponent', this.fcz)
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    }
  }
}
</script>

<style scoped>

</style>