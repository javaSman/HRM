<template>
  <div>
    <a-layout>
      <a-layout-header>
        <a-row type="flex">
          <a-col :span="18" :order="1">
            <a-input-search
            v-model="layerName"
            placeholder="查询图层"
            enter-button
            @search="onSearchChange"
            style="position: relative; top: 50%; transform: translateY(-50%);"
          />
          </a-col>
          <a-col :span="6" :order="2">
            <a-button type="primary"   icon="reload" style="margin-left: 5px;" @click="resetting"></a-button>
          </a-col>
        </a-row>


      </a-layout-header>
      <a-layout-content style="overflow-y: auto;height: calc(100vh - 340px)">
        <div style="margin-top: 18px"></div>
        <template v-for="item  in dataList">
          <p :class="item.id==selectId? 'selected':'unSelected'" @click="nodeClick(item)">
            <svg t="1694076579799" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4092" width="16" height="16"><path d="M872.533333 475.733333L776.533333 426.666667l96-49.066667c32-14.933333 32-59.733333 0-76.8l-341.333333-170.666667c-12.8-6.4-25.6-6.4-38.4 0l-341.333333 170.666667c-32 14.933333-32 59.733333 0 76.8l96 49.066667-96 49.066666c-32 14.933333-32 59.733333 0 76.8l93.866666 46.933334-93.866666 46.933333c-32 14.933333-32 59.733333 0 76.8l341.333333 170.666667c12.8 6.4 25.6 6.4 38.4 0l341.333333-170.666667c32-17.066667 32-61.866667 0-76.8l-93.866666-46.933333 93.866666-46.933334c32-14.933333 32-59.733333 0-76.8z m-341.333333 322.133334c-12.8 6.4-25.6 6.4-38.4 0l-226.133333-113.066667 74.666666-38.4 151.466667 76.8c12.8 6.4 25.6 6.4 38.4 0l151.466667-76.8 74.666666 38.4-226.133333 113.066667z m0-170.666667c-12.8 6.4-25.6 6.4-38.4 0l-226.133333-113.066667 76.8-38.4 149.333333 74.666667c12.8 6.4 25.6 6.4 38.4 0l149.333333-74.666667 76.8 38.4-226.133333 113.066667z m-27.733333-162.133333l-266.666667-119.466667 266.666667-125.866667c6.4-2.133333 12.8-2.133333 19.2 0l247.466666 117.333334-247.466666 130.133333c-6.4 0-14.933333 0-19.2-2.133333z" fill="#297AFF" p-id="4093"></path></svg>
            {{ item.name }}
            <a-icon type="align-left" class="redClass" @click.stop="nodeIconClick(item)"></a-icon>
          </p>
        </template>
      </a-layout-content>
      <a-layout-footer>

      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script>
import { getAction } from '@api/manage'


export default {
  name: 'ZtLayerList',
  components: {
  },
  watch:{
    // 深度监听 demo
    menuId:{
      handler(val) {
        this.loadData();
      },
      immediate: true,
    },
    keyId:{
      handler(val) {
        if (val!=null && val!=""){
          this.selectedRowKeys = [val];
        }
        // this.loadData();
      },
      immediate: true,
    },
    layerName:{
      handler(val) {
        this.name =`*${val}*`;
      },
      immediate: true,
    }

  },
  // menu_Id
  props: {
    menuId: {
      type: String,
      required: true
    },
    keyId:{
      type: String,
      required: false
    },
    isRadio:{
      type:Boolean,
      default:false,
      required: false
    }
  },
  data () {
    return {
      url: {
        list: "/layerManage/ztLayer/allList",
      },
      dataList:[],
      selectId:"",

      layerName:"",
      name:"",

    }
  },
  methods: {
    loadData(){
      let menuId = this.menuId;
      let name = this.name;
      getAction(this.url.list,{menuId,name}).then(res=>{
        if (res.success){
          this.dataList = res.result;
        }
      })
    },
    onSearchChange(){
      this.loadData();
    },
    resetting(){
      this.menuId="";
      this.name="";
      this.onSearchChange();
    },
    nodeClick(item){
      let data = item;
      this.selectId = data.id;
      let tableName = 'sys_tag';
      if (data.menuId){
        tableName ='zt_layer'
      }
      this.targetId = data.id;
      data['code'] = this.code;
      data['tableName'] = tableName;
      this.$emit("getKey",data);
    },
    nodeIconClick(item){
      let data = item;
      this.selectId = data.id;
      let tableName = 'sys_tag';
      if (data.menuId){
        tableName ='zt_layer'
      }
      this.targetId = data.id;
      data['code'] = this.code;
      data['tableName'] = tableName;
      this.$emit("getIconKey",data);
    }
  }


}
</script>

<style scoped>
.ant-layout-header {
  background-color: #fff;
  padding: 0 0px;
}
 .ant-layout-footer {
   background-color: #fff;
}
.ant-layout-content {
  background-color: #fff;
}

.selected{
  margin: 5px;
  font-weight: 600;
  background-color: #1890ff;
  color: #fff;
  cursor: pointer;
}
.unSelected{
  cursor: pointer;
  margin: 5px;
  font-weight: 600;
  color: #000C17D0
}

.redClass{
  margin-left:5px;color: red;
}
</style>