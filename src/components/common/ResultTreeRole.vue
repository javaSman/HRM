<template>
  <div>
    <a-card :bordered="false" :bodyStyle="{padding:'0px'}">
      <a-row type="flex" :gutter="16">
        <a-col :span="cardShow?12:24">
          <span style="position: absolute;left: 10px;">成果目录</span>
          <div style="display: flex;justify-content: end;padding-right: 20px;height: 24px;">
            <div slot="extra" >
              <a-button type="primary" size="small" @click="myUpdateHandler">保存</a-button>
            </div>
          </div>
          <a-tree :replaceFields="{children:'children', title:'name', key:'id' }"
                  :auto-expand-parent="autoExpandParent" :tree-data="gData" :expanded-keys="expandedKeys"
                  :checkable="checkable" :checkStrictly="true" :multiple="multiple" :checkedKeys="checkedKeys" show-line
                  @expand="onExpand" @select="getTab" :selectedKeys="checkedKeys" @check="checkHandel">
            <template slot="name" slot-scope="item">
              {{ item.name }}
              <div style="display: inline-block" @click.stop>
                <a-icon v-if="!item.templateCode"  @click="nodeClick(item)" type="align-left" class="redClass" ></a-icon>
                <!--  授权的图层默认打开            -->
                <a-switch v-if="item.menuId" :checked="item.expand"  @change="roleLayerOpen(item)"   title='授权图层默认打开'   size="small" style="margin-left: 5px;margin-bottom: 3px;"/>
              </div>
            </template>
          </a-tree>
        </a-col>
        <a-col v-if="cardShow" :span="12">
          <role-tree-tag-card :role-id="roleId" :target-id="targetId"></role-tree-tag-card>
        </a-col>
      </a-row>



    </a-card>
  </div>
</template>

<script>
import RoleTreeTagCard from '@comp/common/RoleTreeTagCard'
import { getAction, postAction, putAction } from '@api/manage'
import {queryTreeTableList } from '@/utils/MenuListUtil'
import { menuZtLayerCode } from '@/utils/sysTreeTagUtil'


//将list添加scopedSlots 需要的格式，num，添加到第几层
const creadItem = (list) => {
  if (list == null || list.length == 0) {
    return;
  }
  list.forEach(item => {
    item['scopedSlots'] = {
      title: "name"
    }
    creadItem(item.children);
  });
}

export default {
  name: 'ResultTreeRole',
  // 注册组件
  components:{
    RoleTreeTagCard
  },
  // 监听
  watch:{
    roleId: {
      handler(newValue, oldValue) {
        if (newValue && this.dataList.length>0){
          this.getTagIdList();
        }
      },
      immediate: true
    },
  },
  // 接受参数
  props: {
    checkable: {
      type: Boolean,
      required: false,
      // 是否显示复选框
      default: true,
    },
    multiple: {
      type: Boolean,
      required: false,
      // 是否多选
      default: true,
    },
    roleId:{
      // 角色id
      type: String,
      required: true,
    },
  },
  // 计算属性
  computed: {
    menuList(){
      return this.dataList.filter(item=> item.templateCode);
    },
    leafList(){
      return this.dataList.filter(item=> !item.templateCode);
    },
    menuCheckedKeys(){
      const menuListIds = this.menuList.map(item => item.id);
      return  this.checkedKeys.filter(id => menuListIds.includes(id));
    },
    leafCheckedKeys(){
      const leafListIds = this.leafList.map(item => item.id);
      return  this.checkedKeys.filter(id => leafListIds.includes(id));
    }


  },
  created () {
    this.loadData();
  },
  // 数据
  data () {
    return {
      code:menuZtLayerCode,
      autoExpandParent: true,
      // 展开的节点
      expandedKeys: [],
      // 选中节点
      checkedKeys: [],
      gData: [],
      dataList:[],

      //
      cardShow: false,
      targetId:"",
    }
  },
  // 方法区
  methods: {
    onExpand(expandedKeys) {
      // console.log(expandedKeys)
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    getTab(ids, e) {
      this.checkedKeys=ids;
    },

    /**
     * 获取当前节点 所有的祖先节点id
     * @param parentIdArr
     * @param node
     */
    getParentId(node, parentIdArr=[]){
      if (!node.dataRef){
        return parentIdArr;
      }
      parentIdArr.push(node.dataRef.id);
      return  this.getParentId(node.$parent,parentIdArr);
    },
    /**
     * 获取当前节点的所有的后代节点id
     */
    getChildrenId(dataRef,childrenArr=[]){
      let childrenDataArr = dataRef.children;
      if (!dataRef || childrenDataArr.length<=0){
        return;
      }
      for (let index in childrenDataArr) {
        let nodeData = childrenDataArr[index];
        childrenArr.push(nodeData.id);
        this.getChildrenId(nodeData,childrenArr);
      }
    },

    /**
     * 复选框的勾选事件
     * @param checkedKeys
     * @param e
     */
    checkHandel(checkedKeys,e){
      let keyArr = checkedKeys.checked;

      //当前节点的数据
      let dataRef = e.node.dataRef;
      // 获取当前节点的祖先id们
      let parentIdArr =this.getParentId(e.node);
      // 获取当前节点的所有的孩子节点
      let childrenIdArr = [];
      this.getChildrenId(dataRef,childrenIdArr);


      // 当前点击是选中  全选加入其全部的孩子节点 和父级节点
      if (e.checked && dataRef.children){
        // let keyChildren = dataRef.children.map( item=> item.id);
        // 将父级几点下级节点 和原本选中的加入去重后  赋值给keyArr
        keyArr = [...new Set([...keyArr,...parentIdArr ,...childrenIdArr])];
      // 当前点击的节点是取消 并且是菜单节点  只取消所有的下级节点
      }else if (dataRef.children) {
        // let keyChildren = dataRef.children.map( item=> item.id);
        keyArr = keyArr.filter(id=> !childrenIdArr.includes(id));
      }

      this.getTab(keyArr,null);
    },
    loadData() {
      let code = this.code;
      queryTreeTableList(code,'0').then(result=>{
        creadItem(result);
        this.gData = result
        let arr = [];
        this.generateList(result,arr);
        this.dataList = arr;

        this.getTagIdList();
      })
    },
    generateList(data,arr) {
      if (data == null) {
        return
      }
      for (let i = 0; i < data.length; i++) {
        const node = data[i];
        arr.push(node);
        if (node.children) {
          this.generateList(node.children,arr);
        }
      }
    },
    getTagIdList(){
      let url = `ztSystem/sysRoleTag/list?roleId=${this.roleId}&code=${this.code}`
      getAction(url).then((res) => {
        console.log("getTreeIdList",res);
        if (res.success){
          // 把tableName 是zt_layer 的筛选出来；
         let roIdZtLayerList = res.result.filter(item=>item.tableName == 'zt_layer');

          this.dataList.forEach(dataItem=>{
            let id="";
            let flag =roIdZtLayerList.some(layerItem=>{
              if (layerItem.tagId == dataItem.id){
                id=layerItem.id;
              }
              if (layerItem.tagId == dataItem.id && layerItem.expand=='1' ){
                return true;
              }

            })
            console.log("flag",flag);
            this.$set(dataItem, 'expand', flag);
            this.$delete(dataItem, 'roleTagId');
            this.$set(dataItem, 'roleTagId', id);
          })

          let treeIdArr  = res.result.map(item=>item.tagId);
          this.checkedKeys = JSON.parse(JSON.stringify(treeIdArr));
          console.log("getTreeIdList",treeIdArr);
        }
      })
    },

    myUpdateHandler(){
      let url =`ztSystem/sysRoleTag/update`;
      let roleId = this.roleId;
      let code = this.code;
      let menuCheckedKeys = this.menuCheckedKeys;
      // 选中的叶子节点的id  也就是图层的id
      let leafCheckedKeys = this.leafCheckedKeys;
      // 叶子节点的更新数据
      let  leafNode = this.dataList.filter(item => leafCheckedKeys.includes(item.id)).map(item=>{
        return {
          id:item.id,
          expand:item.expand ? "1" : "0"
        }
      })
      //菜单节点的更新数据
      let  menuNode = menuCheckedKeys.map(id =>{ return { id:id, expand:"0" } })

      // 组装更新数据
      let tableTagIds=[];
      tableTagIds.push({
        tableName:"sys_tag",
        tagIdList:menuNode,
      })
      tableTagIds.push({
        tableName:"zt_layer",
        tagIdList:leafNode,
      })

      let params ={
        roleId,
        code,
        tableTagIds
      };
      putAction(url,params).then(res=>{
        console.log("myUpdateHandler",res)
        if (res.success){
          this.$message.info('更新成功');
          this.getTagIdList();
        }else {
          this.$message.info('更新错误');
        }
      })
    },
    nodeClick(item){
      console.log("===",item)
      this.targetId = item.id;
      this.cardShow = true;
    },
    // 授权的角色图层的默认打开
    roleLayerOpen(item){
      item = item.dataRef;

      // 判断是否 图层被选中
      let bool = this.leafCheckedKeys.includes(item.id);
      if (!item.roleTagId) {
        if (bool){
          item.expand = !item.expand;
        }else {
          this.$message.error("请授权后再设置默认打开");
        }
        return;
      }
      putAction("/ztSystem/sysRoleTag/edit", {
        id: item.roleTagId,
        expand: item.expand ? "0" : "1"
      }).then(res => {
        if (res.success) {
          item.expand = !item.expand;
          this.getTagIdList();
          this.$message.success("更新成功");
        } else {
          this.$message.error("更新失败");
        }
      });

    }

  }
}
</script>

<style scoped>
.redClass{
  margin-left:5px;
  color: red;margin-right: 5px;
}
</style>