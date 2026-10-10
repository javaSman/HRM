<template>
  <el-switch
    v-model="fcz.commonDataInfo"
    class="switch"
    :disabled="disabled"
    :active-value="fcz.activeValue"
    :inactive-value="fcz.inactiveValue"
    :active-text="fcz.activeText"
    :inactive-text="fcz.inactiveText"
    @change="commonComponent">
  </el-switch>
</template>

<script>
export default {
  name: "hanDongSwitch",
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
    deep:true,
  },
  methods: {
    commonComponent(fczInfo) {
      console.log("hanDongSwitchhanDongSwitchhanDongSwitchhanDongSwitch")
      console.log(fczInfo)
      console.log("hanDongSwitchhanDongSwitchhanDongSwitchhanDongSwitch")
      this.fcz.commonDataInfo = fczInfo.toString()
      this.$emit('commonComponent', this.fcz)
    },
  }
}
</script>

<style scoped>

</style>