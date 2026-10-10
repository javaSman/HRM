<template>
  <div>
<!--    <span style="position: absolute;left: 10px;"></span>-->
    <div style="display: flex;padding-left: 5px;height: 24px;color: #000000a6;font-weight: 600;">数据资源</div>
    <a-input-search style="margin-bottom: 8px" placeholder="Search" v-model="searchValue" @change="onSearchChange" />
    <a-tree :replaceFields="{children:'children', title:'name', key:'id' }"
            :auto-expand-parent="autoExpandParent" :tree-data="gData" :expanded-keys="expandedKeys"
            :checkable="checkable" :checkStrictly="true" :multiple="multiple" :checkedKeys="checkedKeys" show-line
            @expand="onExpand" @select="getTab" :selectedKeys="checkedKeys" @check="checkHandel">
      <template slot="name" slot-scope="item">
        <a-dropdown :trigger="['contextmenu']">
          <span style="color: #000000a6;font-weight: 600;" v-if="item.templateCode">{{item.name }}</span>
          <span style="color: #000000a6;font-weight: 600;" v-else  @click="nodeClick(item)">{{item.name }} <a-icon type="align-left" class="redClass" ></a-icon></span>
        </a-dropdown>
      </template>
    </a-tree>

  </div>
</template>

<script>
import { queryTreeTableList } from '@/utils/MenuListUtil'
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
  name: 'ResultTree',
  components: {
  },
  // 接受参数
  props: {
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

      searchValue: '',

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

    checkHandel(checkedKeys,e){
      let keyArr = checkedKeys.checked;
      let dataRef = e.node.dataRef;
      // 当前点击是选中 并且菜单节点 并且有孩子 全选加入其全部的孩子节点
      if (e.checked && dataRef.templateCode && dataRef.children){
        let keyChildren = dataRef.children.map( item=> item.id);
        keyArr = [...new Set([...keyArr, ...keyChildren])];
      }else if (dataRef.templateCode && dataRef.children) {
        let keyChildren = dataRef.children.map( item=> item.id);
        keyArr = keyArr.filter(id=> !keyChildren.includes(id));
      }

      this.getTab(keyArr,null);
    },
    loadData() {
      let code = this.code;
      queryTreeTableList(code,'0').then(result=>{
        creadItem(result);
        this.gData = result
        this.dataList = []
        this.generateList(result)

        // 自动展开该节点
        this.expandedKeys=['1681216867145781250','1683648467615793154']
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
    onContextMenuClick(data, menuKey) {
      console.log("123456");
      console.log(data, menuKey);
      let tableName = 'sys_tag';
      if (data.menuId){
        tableName ='zt_layer'
      }

      let id = data.id;
      let code = this.code;
      // 显示授权组件
      // this.$refs.tagRole.showData(id,code,tableName);
    },


    nodeClick(item){
      let data = item.dataRef;
      let tableName = 'sys_tag';
      if (data.menuId){
        tableName ='zt_layer'
      }
      this.targetId = data.id;
      data['code'] = this.code;
      data['tableName'] = tableName;
      this.$emit("nodeClick",data)
    },
    onSearchChange(e){
      const value = e.target.value;
      if (value === null || value === undefined || value.trim() === ''){
        return;
      }
      // 找到匹配的元素主键
      let expandedKeys =  this.dataList.filter(item=>{
        return item.name.includes(value);
      }).map(item => item.id);

      Object.assign(this, {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true,
      });
    },

  }


}
</script>

<style scoped>
.redClass{
  margin-left:5px;color: red;
}
</style>