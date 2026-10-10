<template>
  <!-- <el-select :disabled="disabled" v-model="fcz.commonDataInfo" clearable :placeholder="fcz.tableTypeDesc" @change ="commonComponent">
    <el-option 
      v-for="(itemCDC,cdc) in fcz.commonDictCode"
      :key="cdc"
      :label="itemCDC.name"
      :value="itemCDC.id">
    </el-option>
  </el-select> -->
  <j-dict-select-tag :disabled="disabled" type="list" v-model="fcz.commonDataInfo" :dictCode="dictcode" @change="commonComponent" />
</template>

<script>
export default {
  name: "hanDongList",
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
    console.log("hanDongListMulti created this.dictcode=",this.dictcode)
  },
  mounted(){
    this.fcz.commonDataInfo = this.value
    console.log("hanDongList mounted this.fcz.commonDataInfo=",this.fcz.commonDataInfo)
  },
  watch: {
    deep:true,
  },
  methods: {
    commonComponent(fczInfo) {
      console.log("hanDongList fczInfo=",fczInfo)
      this.fcz.commonDataInfo = fczInfo
      this.$emit('commonComponent', this.fcz)
    },
  }
}
</script>

<style scoped>

</style>