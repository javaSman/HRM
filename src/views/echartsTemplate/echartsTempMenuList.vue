<template>
  <div>
<!--    sort-auto-update 拖拽是否自动去更新排序  -->
    <MenuTagTable ref="menuTag" title="echarts分类菜单" :template-code="code" @myChange="tagChange" :sort-auto-update="true">
      <zt-echarts-template-list :menu-id="tagId" :key-id="layerId" @getKey="getKey" :is-radio="isRadio"> </zt-echarts-template-list>
    </MenuTagTable>
  </div>
</template>

<script>
import MenuTagTable from '@comp/common/MenuTagTable'
import { echartsCode } from '@/utils/sysTreeTagUtil'
import ZtEchartsTemplateList from "@views/echartsTemplate/ZtEchartsTemplateList";

export default {
  name: "echartsTempMenuList",
  components: {
    MenuTagTable,
    ZtEchartsTemplateList
  },
  props: {
    value: {
      // 自定义验证逻辑（此处不限制类型）
      validator: function(value) {
        return true;
      }
    },
    parameter:{
      validator: function(value) {
        // 是否是obj 类型 且具有field 字段
        if (value instanceof Object && 'field' in value){
          return true;
        }
        return false;
      },
      required:false,
      default: ()=>{
        return { field:"id",isRadio:false }
      }
    }
  },
  watch: {
    value: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        if (this.parameter.field === 'id'){
          if (newValue){
            this.layerId = newValue;
          }
        }
        if (this.parameter.isRadio){
          this.isRadio = true;
        }
      }
    }
  },
  data() {
    return {
      tagId: "",
      layerId:"",
      isRadio:false,
      code:echartsCode,
    }
  },
  methods: {
    tagChange(data) {
      this.tagId = data;
    },
    getKey(layerItem){
      if(layerItem.length==0){
        this.$emit('input', '');
        this.$refs.menuTag.setKeyId('');
        return;
      }
      let ids=[]
      layerItem.forEach((item)=>{
          ids.push(item.id)
        })
      this.$emit('input',ids.join(","));
      this.$refs.menuTag.setKeyId(layerItem.length==1?layerItem[0].menuId:'');
    },
  },
}
</script>

<style scoped>

</style>