<template>
  <el-select :disabled="disabled" v-model="fcz.commonDataInfo" filterable  :placeholder="fcz.tableTypeDesc" @change ="commonComponent">
    <el-option 
      v-for="itemCDC in fcz.commonDictCode"
      :key="itemCDC.id"
      :label="itemCDC.name"
      :value="itemCDC.id">
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: "hanDongSelSearch",
  data:{
    dataValue:''
  },
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
  mounted(){
    this.fcz.commonDataInfo = this.value
  },
  watch: {
    deep:true,
  },
  methods: {
    commonComponent(fczInfo) {
      console.log("hanDongSelSearch fczInfo=",fczInfo)
      this.fcz.commonDataInfo = fczInfo.toString()
      this.$emit('commonComponent', this.fcz)
    },
  }

}
</script>

<style scoped>

</style>