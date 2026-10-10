<template>
  <div>
    <!-- 右侧抽屉   -->
    <a-drawer title="字段模板配置"
              placement="right"
              width="50%"
              :closable="false"
              :visible="drawerVisible"
              @close="drawerHandleCancel">
      <dynamic-fields :code-id="tagId"></dynamic-fields>
    </a-drawer>
  </div>
</template>

<script>
import dynamicFields from "@/components/common/DynamicFields";
export default {
  name: "DynamicFieldsDrawer",
  components:{
    dynamicFields
  },
  create(){},
  data(){
    return{
      drawerVisible:false,
      tagId:'',
    }
  },
  methods:{
    show(id){
      this.tagId=id;
      this.drawerVisible=true;
    },
    //
    drawerHandleCancel(){
      this.drawerVisible=false;
    }
  }
}
</script>

<style scoped>

</style>