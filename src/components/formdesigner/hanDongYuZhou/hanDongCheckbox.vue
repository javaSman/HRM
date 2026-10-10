<template>
    <j-multi-select-tag :disabled="disabled" type="checkbox" v-model="fcz.commonDataInfo" :dictCode="dictcode" @change="commonComponent" />
</template>

<script>
export default {
  name: "hanDongCheckbox",
  data(){
    return {
      dictcode : "",
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
  created () {
    this.dictcode = this.fcz.dictField
    console.log("hanDongCheckbox created this.dictcode=",this.dictcode)
  },
  watch: {
  },
  mounted() {
    console.log("hanDongCheckbox this.fcz=",this.fcz)
    this.fcz.commonDataInfo = this.value
  },
  methods: {
    commonComponent(fczInfo) {
      console.log("fczInfo=",fczInfo)
      this.fcz.commonDataInfo = fczInfo
      this.$emit('commonComponent', this.fcz)
    },
  }
}
</script>

<style scoped>

</style>