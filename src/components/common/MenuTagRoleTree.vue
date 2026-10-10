<template>
  <div>
    <div style="display: flex;padding-left: 5px;height: 24px;color: #000000a6;font-weight: 600;">{{  title }}</div>
    <a-tree :replaceFields="{children:'children', title:'name', key:'id' }"
            :auto-expand-parent="autoExpandParent" :tree-data="gData" :expanded-keys="expandedKeys"
            :checkable="checkable" :checkStrictly="true" :multiple="multiple" :checkedKeys="checkedKeys" show-line
            @expand="onExpand" @select="getTab" :selectedKeys="checkedKeys" @check="checkHandel">
      <template slot="name" slot-scope="item">
        <!--        节点  checked  " -->
        <span v-if="item.menuId" style="color: #000000a6;font-weight: 600;">
          {{item.title }}
          <a-switch :checked="item.checked"  @change="switchChange(item)"   size="small" style="margin-left: 5px;margin-bottom: 3px"/>
        </span>
        <!--        目录-->
        <span v-else style="color: #000000a6;font-weight: 600;">{{item.name }}</span>
      </template>
    </a-tree>
  </div>
</template>

<script>
import { queryTreeTableList } from '@/utils/MenuListUtil'
import { deleteAction, postAction } from '@api/manage'
import { menuSysRoleAndUserCode } from '@/utils/sysTreeTagUtil'
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
  name: 'MenuTagRoleTree',
  props: {
    title: {
      type: String,
      required: false,
      // 标题
      default: "角色",
    },
    checkable: {
      type: Boolean,
      required: false,
      // 是否显示复选框
      default: false,
    },
    multiple: {
      type: Boolean,
      required: false,
      // 是否多选
      default: false,
    }
  },
  // 数据
  data () {
    return {
      menuSysRoleAndUserCode:menuSysRoleAndUserCode,

      key:"",
      code:"",
      tableName:"",
      menuId:"",
      menuTableName:"",

      defaultExpandAll:true,
      autoExpandParent: true,
      // 展开的节点
      expandedKeys: [],
      // 选中节点
      checkedKeys: [],
      gData: [],
      dataList:[],
    }
  },
  created() {
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
    checkHandel(checkedKeys,e){
      console.log("MenuTagRoleTree",checkedKeys,e)
    },
    showData(key,code,tableName,menuId,menuTableName) {
      this.key = key;
      this.code = code;
      this.tableName = tableName;
      this.menuId = menuId;
      this.menuTableName = menuTableName;
      this.loadData();
    },

    loadData(){
      let id  = this.key;
      let code  = this.code;
      queryTreeTableList(this.menuSysRoleAndUserCode,'0','menu_sys_role@layer',{ "tagId":id,"code":code}).then(result=>{
        creadItem(result);
        this.gData = result
        this.dataList = []
        this.generateList(result);

        // 设置展开的节点
        let expandedKeys = this.gData.filter(item => !item.menuId).map(item => item.id);
        console.log("==expandedKeys=",expandedKeys)
        this.expandedKeys=expandedKeys;


      }).catch(res=>{
        this.$message.error("请求错误")
      })
    },
    generateList(data) {
      if (data == null) {
        return
      }
      for (let i = 0; i < data.length; i++) {
        const node = data[i];
        this.dataList.push(node);
        if (node.children) {
          this.generateList(node.children);
        }
      }
    },
    switchChange(Item){
      let roleItem = Item.dataRef;
      // 如果值是false 就将sys_role_tree 表关联删除  true 就添加
      let tagId = this.key;
      let roleId = roleItem.id;
      let code = this.code;
      let tableName = this.tableName;
      let menuId = this.menuId;
      let menuTableName = this.menuTableName;
      console.log("===MenuTagRoleTree:roleItem===",roleItem)
      if(roleItem.checked){
        // 如果是true  需要改成false 就把关联表删除
        deleteAction(`ztSystem/sysRoleTag/deleteBy?roleId=${roleId}&tagId=${tagId}`).then(res=>{
          if (res.success){
            this.$message.success("取消授权成功")
            roleItem.checked= false;
          }else {
            this.$message.error("请求错误")
          }
        })

      }else {
        // 如果是false  需要改成true 就把关联表添加
        let data={ roleId, tagId, code,tableName };
        postAction(`ztSystem/sysRoleTag/cascadeAdd?menuId=${menuId}&menuTableName=${menuTableName}`,data).then(res=>{
          if (res.success){
            this.$message.success("授权成功")
            roleItem.checked = true;
          }else {
            this.$message.error("请求错误")
          }
        })
      }

    },

  }
}
</script>

<style scoped>

</style>