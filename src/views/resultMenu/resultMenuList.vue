<template>
  <div>
<!--    sort-auto-update 拖拽是否自动去更新排序  -->
    <MenuTagTable ref="menuTag" title="成果目录" :template-code="code" @myChange="tagChange" :sort-auto-update="true">
      <zt-layer-table-list :menu-id="tagId" :key-id="layerId" @getKey="getKey" :is-radio="isRadio"></zt-layer-table-list>
    </MenuTagTable>
  </div>
</template>

<script>
import MenuTagTable from '@comp/common/MenuTagTable'
import { menuZtLayerCode } from '@/utils/sysTreeTagUtil'
import ZtLayerTableList from '@views/layerManage/ZtLayerTableList'

/**
 {
"name": "",
"id": "",
"pid": "1663431677237612546",
"templateId": "QuickLayerCode",
"hasChild": "1",
"fieldJson": null,
"sort": 2
}
 */
export default {
  name: "resultMenuList",
  components: {
    MenuTagTable,
    ZtLayerTableList,
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
          console.log("newValue",newValue)
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
      da1:"",

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