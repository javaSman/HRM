<!--路由菜单树组件-->
<template>
  <div>
    <a-card v-if="titleShow" :bordered="false" :bodyStyle="{padding:'0px'}">
      <div style="display: flex;justify-content: end;padding-right: 20px;">
        <span style="position: absolute;left: 10px;">{{ title }}</span>
      </div>
      <div :style="bodyStyle" v-if='gData.length>0'>
        <a-input-search style="margin-bottom: 8px" placeholder="Search" v-model="searchValue" @change="onSearchChange" />
        <a-tree :replaceFields="{children:'children', title:'name', key:'id' }"
                :auto-expand-parent="autoExpandParent" :tree-data="gData" :expanded-keys="expandedKeys"
                :checkable="checkable" checkStrictly :multiple="multiple" :checkedKeys="checkedKeys" show-line
                @expand="onExpand" @select="getTab" >
        </a-tree>
      </div>
    </a-card>
  </div>
</template>

<script>
// 树转数组
const treeToArray = (list, newArr = []) => {
  list.forEach(item => {
    const {
      children
    } = item
    if (children) {
      // delete item.children
      if (children.length) {
        newArr.push(item)
        return treeToArray(children, newArr)
      }
    }
    newArr.push(item)
  })
  return newArr
}
import { mapState } from 'vuex'
export default {
  name: 'routeMenu',
  components: {
  },

  props: {
    // 双向绑定的值  父组件通过 :value.sync="" 绑定值
    value: [String, Object],
    bodyStyle: {
      type: Object,
      required: false,
      // 内容区样式
      default: function() {
        return {
          height: "65vh",
          "overflow-y": "auto",
        }
      },
    },
    expandedKey:{
      // 展开的节点
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: false,
      // 标题文字
      default: "分类",
    },
    titleShow: {
      type: Boolean,
      required: false,
      // 标题是否显示
      default: true,
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
    },
    type: {
      type: String,
      required: false,
      //[id,name,obj]  点击选择后返回的字段
      default: "id",
    },
  },


  created() {
    this.gData =  this.copy(this.permissionMenuList);;
    this.dataList = [];
    this.generateList(this.gData);
  },
  computed: {
    ...mapState({
      // 主路由
      mainRouters: state => state.permission.addRouters,
      // 后台菜单
      permissionMenuList: state => state.user.permissionList
    }),
    smenuStyle() {
      let style = { 'padding': '0' }
      if (this.fixSiderbar) {
        style['height'] = 'calc(100% - 59px)'
        style['overflow'] = 'auto'
        style['overflow-x'] = 'hidden'
      }
      return style
    }
  },
  data() {
    return {

      autoExpandParent: true,
      gData: [],
      dataList: [],
      // 选中节点
      checkedKeys: [],
      expandedKeys: [],
      searchValue: '',
    }
  },
  methods: {
    onExpand(expandedKeys) {
      console.log(expandedKeys)
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    copy(arr,tempArr=[]){
      if (arr==null || arr.length===0){
        return
      }
      for (let i = 0; i < arr.length; i++) {

        let node = arr[i];
        let tempNode={
          id:node.id,
          name:node.meta.title,
          children: []
        }
        this.copy(node.children,tempNode.children)
        tempArr.push(tempNode);
      }
      return tempArr;
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

    getTab(ids, e) {
      console.log(ids);
      this.checkedKeys = ids;
      // 获取得到的数据; 如果是单选
      if (!this.multiple) {
        let tempId = this.checkedKeys[0];
        let TreeDataList = JSON.parse(JSON.stringify(this.gData)); // 将树列表数据 拷贝一份
        let dataArr = treeToArray(TreeDataList, []); // 将拷贝树列表 转成数组列表格式
        let arr = dataArr.filter(item => item.id == tempId);
        let data = this.type == "obj" ? arr[0] : arr[0][this.type];
        this.$emit("input", data);
        this.$emit("myChange", data);
      } else {
        let keys = this.checkedKeys;
        let TreeDataList = JSON.parse(JSON.stringify(this.gData)); // 将树列表数据 拷贝一份
        let dataArr = treeToArray(TreeDataList, []); // 将拷贝树列表 转成数组列表格式
        // 在列表中根据keys 筛选出选中的数据
        let selectArr = dataArr.filter(item => {
          for (let i = 0; i < keys.length; i++) {
            if (item.id == keys[i]) {
              return true;
            }
          }
        })
        // 根据外部传递的 this.type  返回对应数据
        let arr = [];
        if (this.type != "obj") {
          arr = selectArr.map(item => item[this.type])
        } else {
          arr = selectArr;
        }
        this.$emit("input", arr);
        this.$emit("myChange", arr);
      }
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

  },

}
</script>

<style scoped>
::v-deep .ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
  background-color: #1890ff;
  color: #fff;
}

.blueClass{
  background-color: #1890ff;
  color: #fff;
}

/deep/ .ant-tree li .ant-tree-node-content-wrapper {
  width: 80%;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>