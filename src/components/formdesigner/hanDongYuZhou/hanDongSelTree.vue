<template>
  <el-select v-model="fcz.commonDataInfo" :placeholder="fcz.tableTypeDesc" ref="selectTree" onchange="commonComponent">
    <el-option :key="fcz.commonDataInfo" :value="fcz.commonDataInfo" :label="fcz.tableTypeDesc" hidden>
    </el-option>
    <el-tree :data="fcz.commonCateDictCode" :props="defaultProps" @node-click="handleClickNode" node-key="id"></el-tree>
  </el-select>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: "hanDongSelTree",
  props: {
    fcz:{},
    defaultProps: {
      children: 'children',
      label: 'label',
      id: 'id',
    },
  },
  data () {
    return {


    }
  },
  watch: {

  },

  methods: {
    commonComponent(fczInfo) {
      console.log("hanDongSelTreehanDongSelTreehanDongSelTree")
      console.log(fczInfo)
      console.log("hanDongSelTreehanDongSelTreehanDongSelTree")
      this.fcz.commonDataInfo = fczInfo
      this.$emit('commonComponent', this.fcz)
    },
    handleClickNode(data) {
      console.log(data);
      this.fcz.commonDataInfo = data.id
      this.fcz.tableTypeDesc = data.label
      // 选择器执行完成后，使其失去焦点隐藏下拉框的效果
      this.$refs.selectTree.blur();
    }
  }
}
</script>

<style scoped>

</style>