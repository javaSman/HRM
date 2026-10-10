<template>
  <div>
    <a-input @click="treeModalShow" :value="classifyName" placeholder="请点击选择分类" @change="inputChange" :allowClear="true" ></a-input>
    <a-modal
      title="分类选择"
      :visible="treeIsShow"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <route-menu v-model="objValue"></route-menu>
    </a-modal>
  </div>
</template>

<script>
import routeMenu from '@views/resultMenu/routeMenu'
import { mapState } from 'vuex'

export default {
  name: 'InputRouteMenu',
  components: {
    routeMenu
  },
  props: {
    // 双向绑定的值  父组件通过 :value.sync="" 绑定值
    value:[String,Object],
    templateCode:[String],
  },
  watch:{
    value: {
      handler(newValue, oldValue) {
       this.objValue = newValue;
      },
      immediate: true
    },
  },
  computed: {
    ...mapState({
      // 主路由
      mainRouters: state => state.permission.addRouters,
      // 后台菜单
      permissionMenuList: state => state.user.permissionList
    }),
    classifyName(){
      let arr =  [];
      this.generateList(this.permissionMenuList,arr);
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === this.objValue){
          return arr[i].meta.title;
        }
      }

    }
  },
  created () {
  },
  data () {
    return {
      objValue:"",
      treeIsShow:false,

    }
  },
  methods: {

    //  步骤是1.treeModalShow(显示弹框)->2.tagChange(点击分类栏改变)->3.用户确定选择handleOk->用户清除input选择触发事件inputChange

    inputChange(){
      this.$emit("input",null);
    },
    treeModalShow(){
      this.treeIsShow=true;
    },
    handleCancel(){
      this.treeIsShow=false;
    },
    handleOk(){
      this.handleCancel();
      this.$emit("input",this.objValue);
    },
    generateList(data,arr=[]) {
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
  }
}
</script>

<style scoped>

</style>