<template>
  <div style="background-color: #ececec; padding: 5px;">
    <div style="display: flex;padding-left: 5px;height: 24px;color: #000000a6;font-weight: 600;">关联模块</div>
    <a-row :gutter="16">
      <a-col :span="12" v-for="(valueList, key) in data" :key="key">
        <a-card :title="key">
          <a-card-grid style="width:100%;text-align:center;height: 80px" v-for="(item,index) in valueList" :hoverable="false">
            {{ item.name }}<a-switch   :checked="item.hasOpen"  @change="openChange(key,index)" size="small" style="margin-left: 5px;margin-bottom: 3px"/>
          </a-card-grid>
        </a-card>
      </a-col>
    </a-row>

  </div>
</template>

<script>
import { deleteAction, getAction, postAction, putFormAction } from '@api/manage'

export default {
  name: 'RoleTreeTagCard',
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
    },
    roleId: {
      immediate: true, // 监听初始时的值变化
      handler(newValue, oldValue) {
        this.loadData();
      }
    },
  },
  // 接受参数
  props: {
    targetId: {
      type: String,
      required: true
    },
    roleId:{
      type: String,
      required: true
    }
  },
  // 计算属性
  computed: {

  },
  created () {
  },
  // 数据
  data () {
    return {
      url:"sys/sysRoleTree/queryConfigMapByTargetIdInRoId",
      data:{},
    }
  },
  // 方法区
  methods: {
    loadData(){
      let url =`${this.url}?targetId=${this.targetId}&roleId=${this.roleId}`
      getAction(url).then(res=>{
        if (res.success && res.result){
          let data = res.result;
          for (let key in data) {
            data[key].forEach(item=>{
              if (item.keyId){
                item.hasOpen = true;
              }else {
                item.hasOpen = false;
              }
            })
          }

          this.data = data;
        }else {
          // this.$message.error("数据加载出错");
        }
      })
    },
    openChange(key,index) {
      let item = this.data[key][index];
      console.log(item);
      if (item.hasOpen){
        let url = `sys/sysRoleTree/deleteById?id=${item.keyId}`;
        deleteAction(url).then(res=>{
          if (res.success){
            this.$message.success("取消授权成功");
            this.loadData();
          }else {
            this.$message.error("授权失败，未知错误！")
          }
        })
        // 删除
      }else {
        let url=`sys/sysRoleTree/add`;
        let roleId=this.roleId;
        let treeId= item.id;
        let code = item.templateCode;
        let param={
          roleId,
          treeId,
          code
        }
        postAction(url,param).then(res=>{
          if (res.success){
            this.$message.success("授权成功");
            this.loadData();
          }else {
            this.$message.error("授权失败，未知错误！")
          }
        })
        // 添加
      }


    }
  }
}
</script>

<style scoped>

</style>