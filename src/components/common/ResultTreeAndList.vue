<template>
  <div>
    <MenuTagTable ref="menuTag" title="成果目录" :template-code="code" @myChange="tagChange" :sort-auto-update="true">
      <zt-layer-list :menu-id="tagId" :key-id="layerId" @getKey="getKey" @getIconKey="getIconKey" :is-radio="isRadio"></zt-layer-list>
    </MenuTagTable>
  </div>
</template>

<script>
import MenuTagTable from '@comp/common/MenuTagTable'
import ztLayerList from '@views/layerManage/ZtLayerList'
import { menuZtLayerCode } from '@/utils/sysTreeTagUtil'
export default {
  name: 'ResultTreeAndList',
  components: {
    MenuTagTable,
    ztLayerList
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
        console.log("=====value")
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
        console.log("this.parameter.field",this.parameter.field)
        if (this.parameter.field == 'id'){
          //this.selectedRowKeys= [newValue];
          if (newValue){
            this.layerId = newValue;
          }

        }
        if (this.parameter.isRadio){
          //this.selectedRowKeys= [newValue];
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
      code:menuZtLayerCode,
    }
  },
  methods: {
    tagChange(data) {
      this.tagId = data;
    },
    getKey(layerItem){
      this.$emit('input', layerItem.id);
      this.$refs.menuTag.setKeyId(layerItem.menuId);
      this.$emit("nodeClick",layerItem);
    },
    getIconKey(layerItem){
      this.$emit('input', layerItem.id);
      this.$refs.menuTag.setKeyId(layerItem.menuId);
      this.$emit("nodeIconClick",layerItem);
    }
  },
}
</script>

<style scoped>

</style>