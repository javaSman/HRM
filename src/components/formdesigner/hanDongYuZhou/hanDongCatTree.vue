<template>
  <el-select v-model="fcz.commonDataInfo" :placeholder="fcz.tableTypeDesc" ref="selectTree" @change ="commonComponent">
    <el-option :key="fcz.commonDataInfo" :value="fcz.commonDataInfo" :label="fcz.tableTypeDesc" hidden>
    </el-option>
    <el-tree :data="fcz.commonCateDictCode" :props="defaultProps" @node-click="handleClickNode" node-key="id"></el-tree>
  </el-select>
</template>

<script>
import { getAction } from '@/api/manage'


export default {
  name: "hanDongCatTree",
  props: {
    fcz:{},
    defaultProps: {
      children: 'children',
      label: 'label',
      id: 'id',
    },
  },
  watch: {

  },
  created(){

  },
  methods: {
    commonComponent(fczInfo) {
      console.log("datedatedatedatedate---time")
      console.log(fczInfo)
      console.log("datedatedatedatedate")
      this.fcz.commonDataInfo = fczInfo.toString()
      this.$emit('commonComponent', fcz)
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

<style  lang="scss">
.setstyle {
  min-height: 200px;
  padding: 0 !important;
  margin: 0;
  overflow: auto;
  cursor: default !important;
}
</style>
<style scoped>

</style>