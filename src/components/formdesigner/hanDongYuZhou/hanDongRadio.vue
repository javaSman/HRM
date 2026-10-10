<template>
  <el-radio-group :disabled="disabled" v-model="fcz.commonDataInfo" @change ="commonComponent">
    <el-radio v-for="(itemCdc,cdc) in fcz.commonDictCode"
              :label="itemCdc.id"
              :key="cdc">{{itemCdc.name}}</el-radio>
  </el-radio-group>
</template>

<script>
export default {
  name: "hanDongRadio",
  data(){
    return {

    }
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
  watch: {

  },
  mounted() {
    console.log("hanDongRadio this.fcz=",this.fcz)
    this.fcz.commonDataInfo = this.value
  },
  methods: {
    commonComponent(fczInfo) {
      console.log("hanDongRadio fczInfo=",fczInfo)
      this.fcz.commonDataInfo = fczInfo
      this.$emit('commonComponent', this.fcz)
    },
  }
}
</script>

<style scoped>

</style>