<template>
  <el-input v-if="fcz.dbType=='string'" :disabled="disabled" :placeholder="fcz.tableTypeDesc" v-model="fcz.commonDataInfo" clearable @change ="commonComponent"></el-input>
  <a-input-number v-else-if="fcz.dbType=='double'" :disabled="disabled" :placeholder="fcz.tableTypeDesc" v-model="fcz.commonDataInfo" clearable @change ="commonComponent" />
  <a-input-number v-else-if="fcz.dbType=='BigDecimal'" :disabled="disabled" :placeholder="fcz.tableTypeDesc" v-model="fcz.commonDataInfo" clearable @change ="commonComponent" />
  <a-input-number v-else-if="fcz.dbType=='int'" :disabled="disabled" :placeholder="fcz.tableTypeDesc" v-model="fcz.commonDataInfo" clearable @change ="commonComponent" />
</template>

<script>
export default {
  name: "hanDongInput",
  data(){
    return {

    }
  },
  props: {
    fcz:{},
    value: {
      type: [String,Number],
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
      console.log("hanDongInput fczInfo=",fczInfo)
      this.fcz.commonDataInfo = fczInfo
      this.$emit('commonComponent', this.fcz)
    },
  }
}
</script>

<style scoped>

</style>