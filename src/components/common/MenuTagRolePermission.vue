<template>
  <div>
    <a-drawer
      title="角色"
      placement="right"
      :closable="true"
      :visible="visible"
      width="50%"
      :after-visible-change="afterVisibleChange"
      @close="onClose">
<!--      style="width: 100%;overflow-x: scroll"-->
      <a-tabs v-model="activeMenuKey">
        <a-tab-pane  v-for="(objItem,index) in dataList" :key="index" :tab="objItem.name">
<!--          collapsable折叠效果    @on-node-mouseout="onMouseout"-->
          <vue2-org-tree :data="objItem"  :label-class-name="labelClassName"
                         :renderContent="renderContent"
                         @on-node-click="nodeClick"
                         @on-expand="onExpand"/>
        </a-tab-pane>
      </a-tabs>

      <!-- 创建浮窗盒子 -->
      <div class="ant-popover ant-popover-placement-bottom" v-show="boxShow" style=" position: absolute;" id="box">
        <div class="ant-popover-content">
          <div class="ant-popover-arrow"></div>
          <div role="tooltip" class="ant-popover-inner">
            <div class="ant-popover-inner-content">
              <h4>用户：</h4>
              <a-list bordered :data-source="UserList">
                <a-list-item slot="renderItem" slot-scope="user, index">
                  {{ user.realname }}({{ user.username }})
                  <a-switch default-checked />
                </a-list-item>
              </a-list>
            </div>
          </div>
        </div>
      </div>

    </a-drawer>

  </div>
</template>

<script>
import { getAction, deleteAction, postAction } from '@/api/manage'
import {queryTreeTableList } from '@/utils/MenuListUtil'
import {menuSysRoleAndUserCode } from '@/utils/sysTreeTagUtil'
import { getVariableByCode } from '@/utils/util'
let id='';
export default {

  name: 'MenuTagRolePermission',
  components: {

  },
  watch: {
    activeMenuKey: {
      handler(newValue, oldValue) {
        this.boxShow =false;
      },
      immediate: true
    },

  },
  data() {
    return {
      menuSysRoleAndUserCode:menuSysRoleAndUserCode,

      visible: false,
      boxShow:false,

      dataList:[],
      activeMenuKey:0,


      key:"",
      code:"",
      tableName:"",


      labelClassName:"bg-color-orange",

      UserList:[],

    };
  },
  methods: {
    afterVisibleChange(val) {
      console.log('visible', val);
    },
    showDrawer(key,code,tableName) {
      this.key = key;
      this.code = code;
      this.tableName = tableName;
      this.loadData();
      this.visible = true;
    },
    onClose() {
      this.visible = false;
    },
    switchChange(roleItem){
      // 如果值是false 就将sys_role_tree 表关联删除  true 就添加
      let tagId = this.key;
      let roleId = roleItem.id;
      let code = this.code;
      let tableName = this.tableName;

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
        postAction("ztSystem/sysRoleTag/add",data).then(res=>{
          if (res.success){
            this.$message.success("授权成功")
            roleItem.checked = true;
          }else {
              this.$message.error("请求错误")
          }
        })
      }

    },
    loadData(){
      let id  = this.key;
      let code  = this.code;
      queryTreeTableList(this.menuSysRoleAndUserCode,'0','menu_sys_role@layer',{ "tagId":id,"code":code}).then(result=>{
        this.dataList=result;
      }).catch(res=>{
        this.$message.error("请求错误")
      })
    },


    renderContent(h, data){
      // let str= `<a-switch v-model='item.checked' @change="switchChange(item)" checked-children="开" un-checked-children="关"/>`
      // <button type="button" role="switch" class="ant-switch" title="选中样式是否显示" placeholder="选中样式是否显示"></button>
      let str=null;
      if(data.checked){
        str = <button type="button" role="switch" aria-checked="true" class="ant-switch ant-switch-checked"></button>
      }else{
        str =  <button type="button" role="switch" class="ant-switch" ></button>
      }
      if (data.menuId){
        return (
          <div>
            <span>{data.title}</span>
            {str}
          </div>
        );
      }else {
        // 就是菜单节点
        return (
          <div>
            <span>{data.name}</span>
          </div>
        );
      }
    },
    nodeClick(e,data){
      this.switchChange(data);
    },
    onExpand(e,data) {
      if ("expand" in data) {
        data.expand = !data.expand;
        if (!data.expand && data.children) {
          this.collapse(data.children);
        }
      } else {
        this.$set(data, "expand", true);
      }
    },
    // 移入事件会触发很多次 所以加个比较防止一直请求接口
    onMouseout(e,data){
      console.log(11111);
      if (id == data.id){
        return;
      }
      if (!data.menuId){
        return;
      }
      id= data.id;
      this.showUserList(e,data);
    },

    showUserList(e,data){
      console.log(e);
      let roleId = data.id;
      let url = `/sys/user/userRoleList?roleId=${roleId}&pageSize=${1000}`;
      getAction(url).then(res=>{
        if (res.success){
          this.UserList = res.result.records;

          let box=  document.getElementById("box");
          box.style.left = e.clientX-300 +'px';
          box.style.top = e.clientY+20 +'px';
          this.boxShow=true;


        }else {
         this.$message.error("请求出错")
        }
      })


    },

  },

}
</script>

<style >


.bg-color-orange{
  color: #fff;
  background-color: orange;
}



</style>