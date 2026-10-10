<template>
  <a-card :bordered="false" style="overflow-x: scroll;white-space: nowrap;">
    <a-row type="flex" :gutter="16" :style=" spanNum <= 4? 'width: 120%;':''">
      <a-col :span="spanNum">
        <a-card style="height: calc(100vh - 200px);overflow-y: auto">
          <sys-tree-tag :type="'obj'" :template-id="code" :layer="2" :operable="true" :selectedStyleShow="true" :checkable="false" :multiple="false" title="权限配置" @renewCallback="getData" @myChange="myChange"></sys-tree-tag>
        </a-card>
      </a-col>

      <a-col :span="spanNum" v-for="(item,index) in selectItem" :key="item.id">
        <a-card style="height: calc(100vh - 200px);overflow-y: auto;">
          <sys-tree-tag :type="'obj'" :template-id="item.childCode" :layer="item.layer" :operable="item.operable" :title="item.name" :selectedStyleShow="true" @myChange="myChange"></sys-tree-tag>
        </a-card>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
import sysTreeTag from "@comp/common/SysTreeTag";
import {getTreeSystemToMap} from '@/utils/sysTreeTagUtil'

export default {
  name: "SysConfigTree",
  components: {
    sysTreeTag,
  },
  data() {
    return {
      code:"sys:config",
      configMap:{},
      selectItem:[],

    }
  },
  computed: {
    spanNum() {
      let length = this.selectItem.length;
      if (length<=0){
        length=1;
      }
      length = length+1;
      return Math.floor(24/length);
    }
  },
  created() {
    this.getData();

  },
  methods: {
    myChange(data){
      let key = data.childCode;
      let item = this.configMap.get(key);
      // 从数组中删除父级节点对应的下标后面全部的
      this.deleteSelectItemIndexByChildCode(data.templateCode);
      if (item==null){
        return
      }
      this.selectItem.push(item);
    },

    // 从数组中删除父级节点对应的下标后面全部的
    deleteSelectItemIndexByChildCode(templateCode){
      if ("sys:config"==templateCode){
        this.selectItem=[];
        return;
      }
      let arr = this.selectItem;
      for (let i = 0; i < arr.length; i++) {
        let item =  arr[i];
        if (item.childCode==templateCode){
          arr.splice(i+1, arr.length - (i+1));
          this.selectItem=arr;
        }
      }
    },

    getData(){
      getTreeSystemToMap().then(map=>{
        this.configMap= map;
      })
    },

  }
}
</script>

<style scoped>
.selectClass{
  border-top: 4px solid #40a9ff;
}
</style>