<template>
  <div >
    <a-row type="flex" :gutter="16" v-if="selectItem.length>0">

      <a-col :span="spanNum" v-for="(selItem,index) in selectItem" :key="selItem.id">
        <a-card style="height: calc(100vh - 200px);overflow-y: auto;">
          <sys-role-tree :role-id="roleId" :checkable="selItem.checkable" :code="selItem.childCode" :multiple="selItem.multiple" :title="selItem.name" :searchShow="selItem.searchShow" @iconClick="myChange">
            <!--    sys-role-tree的节点插槽        -->
            <template v-slot:nodeSlot="{ data }">
              <a-tooltip overlayClassName="xfCard" trigger="click" placement="bottomLeft" :arrowPointAtCenter="false" :overlayStyle="overlayStyle">
                <!--   数据规则的浮窗   -->
                <template v-slot:title>
                  <zt-roule-button-tags-pop :tree-tag-id="treeTagId" :role-id="roleId"></zt-roule-button-tags-pop>
                </template>
                <!--  显示绑定的下一个配置  -->
                <a-icon type="arrow-right" @click="show(data.id)" />
              </a-tooltip>
            </template>
          </sys-role-tree>
        </a-card>
      </a-col>

    </a-row>
    <div v-else><h3>无配置信息!</h3></div>


  </div>
</template>

<script>
import SysRoleTree from "@comp/common/SysRoleTree";
import ztRouleButtonTagsPop from '@views/system/ztRouleButtonTagsPop'
import {getTreeSystemToMap,getTreeItemByTargetId } from '@/utils/sysTreeTagUtil'
import { getAction } from '@api/manage'
export default {
  name: 'ztRouteMenuRoleTree',
  components:{
    SysRoleTree,
    ztRouleButtonTagsPop
  },
  props:{
    // 角色id
    roleId:{
      type: String,
      required:true,
    },
    // 路由菜单 id
    routeMenuId:{
      type: String,
      required:true,
    }
  },
  watch:{
    roleId:{
      handler(val) {
        // this.loadData();
        this.getObjTargetId();
      },
      immediate: true,
    },
    routeMenuId:{
      handler(val) {
        this.getObjTargetId();
        // this.loadData();
      },
      immediate: true,
    }
  },
  created() {
    this.getMap().then(()=>{});
  },
  computed: {
    spanNum() {
      let length = this.selectItem.length;
      if (length<=0){
        length==1;
      }
      return Math.floor(24/length);
    }
  },
  data(){
    return {
      overlayStyle:{
      },

      treeTagId:"",

      configMap:null,
      selectItem:[],
      code:"",
    }
  },
  // queryByTargetIdAndtemplateCode
  methods: {
    show(id){
      this.treeTagId = id;
    },

    getMap(){
      let that =  this;
      return new Promise((resolve, reject) => {
        if (that.configMap){
          resolve(that.configMap);
          return;
        }
        getTreeSystemToMap().then(map=>{
          that.configMap = map;
          resolve(map);
        });
      });
    },

    getObjTargetId(){
      let id= this.routeMenuId;
      this.selectItem=[];
      // 根据目标id 获取系统配置绑定的一项
      getTreeItemByTargetId(id).then(data=>{
        this.code=data.templateCode;
        this.myChange(data);
      })
    },
    myChange(data){

      let key = data.childCode;
      this.getMap().then(map=>{
        console.log("点击找到：",map,key)
        let item = map.get(key);
        // 从数组中删除父级节点对应的下标后面全部的
        this.deleteSelectItemIndexByChildCode(data.templateCode);
        console.log("==>item",item,"===>data",data)
        if (item==null){
          return
        }
        this.selectItem.push(item);
      })

    },
    // 从数组中删除父级节点对应的下标后面全部的
    deleteSelectItemIndexByChildCode(templateCode){
      if (this.code===templateCode){
        this.selectItem=[];
        return;
      }
      let arr = this.selectItem;
      for (let i = 0; i < arr.length; i++) {
        let item =  arr[i];
        if (item.childCode===templateCode){
          arr.splice(i+1, arr.length - (i+1));
          this.selectItem=arr;
        }
      }
    },

  }
}
</script>

<style scoped>
</style>