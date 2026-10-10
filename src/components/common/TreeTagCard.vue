<template>
  <div >
    <div style="display: flex;padding-left: 5px;height: 24px;color: #000000a6;font-weight: 600;">功能模块</div>
    <h4 style="margin: 16px">
      待关联:
    </h4>
    <a-row :gutter="16" style="background-color: #ececec; padding: 7px 0px;">
      <a-col :span="rowNumCom" v-for="(item, num) in codeListCom" :key="item.code">
        <a-card :title="false">
          <a-card-grid style="width:100%;text-align:center" :hoverable="false">
            {{ item.name }}<a-switch v-model="dglSwitch" @change="dOpenChange(item)" size="small" style="margin-left: 5px;margin-bottom: 3px"/>
          </a-card-grid>
        </a-card>
      </a-col>
    </a-row>


    <h4 style="margin: 16px">
      已关联:
    </h4>
    <a-row :gutter="16" style="background-color: #ececec; padding: 7px 0px;">
      <a-col :span="rowNumCom" v-for="(item, num) in dataList" :key="item.code">
        <a-card :title="item.name">
          <a-card-grid style="width:100%;height:80px; text-align:center" v-for="(tagItem,index) in item.tagList" :hoverable="false" :key="tagItem.id" >
            {{ tagItem.name }}<a-switch   :checked="tagItem.hasOpen === '1'"  @change="openChange(tagItem)" size="small" style="margin-left: 5px;margin-bottom: 3px"/>
            <a-icon   @click.stop="cardClick(tagItem,item.name)" type="align-left" :class="tagItem.id==checkId?'blueClass':'redClass'" ></a-icon>
          </a-card-grid>
        </a-card>
      </a-col>
    </a-row>

    <!-- 这里是动态组件 大概率是这个组件 SysTreeTagFrom   可以在treeTagCardPopupMappings查看动态组件 在表系统变量 成果目录相关也可查看  -->
    <component ref="tagFrom" v-if="componentShow" :is="getComponent()" :code="code" :disableField="true" :targetId="targetId" @renewCallback="loadData"/>

  </div>
</template>

<script>
import { getAction, putFormAction } from '@api/manage'
import {  treeTagCardPopupMappings } from '@/utils/sysTreeTagUtil'

export default {
  name: 'TreeTagCard',
  // 注册组件
  components:{
  },
  // 监听
  watch:{
    targetId: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        this.loadData();
      }
    }
  },
  // 接受参数
  props: {
    targetId: {
      type: String,
      required: true
    },
    targetName: {
      type: String,
      default:"",
      required: false
    },
    /*
    * {
    * name:"",  名字
    * code:"",  code
    * components:“”  操作的组件
    * }
    * */
    codeListObj:{
      type: Array,
      default:()=>{
        return [];
      },
      required: false
    },
    rowNum:{
      type: Number,
      default:6,
      required: false
    }
  },
  // 计算属性
  computed: {
    codeListCom(){
      let dataList = this.dataList;
      const result = this.codeListObj.filter(obj1 => !dataList.some(obj2 => obj2.code === obj1.code));
      return result;
    },
    rowNumCom(){
      return 24/this.rowNum;
    },

  },
  created () {
  },
  // 数据
  data () {
    return {
      dglSwitch:false,

      url:"sys/sysTreeTag/queryConfigMapByTargetId",
      dataList:[],

      componentShow:false,
      componentName:"",
      code:"",

      checkId:"",
    }
  },
  // 方法区
  methods: {
    loadData(){
      let url =`${this.url}?targetId=${this.targetId}`
      getAction(url).then(res=>{
        if (res.success){
          this.dataList = res.result;
        }else {
          this.$message.error("数据加载出错");
        }
      })
    },
    openChange(tagItem) {
      let item = tagItem;
      console.log(item);
      let hasOpenStatus = '1';
      if (item.hasOpen=='1'){
        hasOpenStatus='0'
      }
      // 发送请求 编辑节点状态
      let params = {
        id: item.id,
        hasOpen:hasOpenStatus
      }
      putFormAction("sys/sysTreeTag/edit", params).then((res) => {
        if (res.success) {
          item.hasOpen= hasOpenStatus;
          if (hasOpenStatus === '1'){
            this.$message.success("打开成功");
          }else {
            this.$message.success("关闭成功");
          }
        }else {
          this.$message.error("更新失败");
        }
      })

    },
    // 待关联的开关时间
    dOpenChange(item){


      this.componentName = item.components;
      let name = this.targetName;
      // let targetId = this.targetId;

      this.code = item.code;
      this.componentShow = true;

      let data = {
        name: name,
        id: "",
        pid: "0",
        templateId: item.code,
        hasChild: "0",
        fieldJson: null,
        sort: 20
      }



      setTimeout(()=>{
        this.$refs.tagFrom.add( data)
      },100)
      // this.$message.error("京秦期待，这里还没开发");
      this.dglSwitch = false;
    },

    getComponent() {
      let name = this.componentName;
      console.log("treeTagCardPopupMappings[name]",treeTagCardPopupMappings[name])
      console.log("name",name)
      console.log("treeTagCardPopupMappings",treeTagCardPopupMappings)

      return treeTagCardPopupMappings[name];
    },
    cardClick(item,title){
      this.checkId = item.id;
      item['titleName'] = title;
      this.$emit("myChange",item);
    }

  }
}
</script>

<style scoped>
.redClass{
  margin-left:5px;color: red;
}
.blueClass{
  margin-left:5px;color: #1890FF;
}
</style>