<template>
  <div>
    <a-checkbox-group v-model="dataruleChecked" v-if="dataruleList.length>0">
      <a-row>
        <a-col :span="24" v-for="(item,index) in dataruleList" :key=" 'dr'+index ">
          <a-checkbox :value="item.id">{{ item.ruleName }}</a-checkbox>
        </a-col>

        <a-col :span="24">
          <div style="width: 100%;margin-top: 15px">
            <a-button @click="saveDataruleForRole" type="primary" size="small" icon="save">点击保存</a-button>
          </div>
        </a-col>
      </a-row>
    </a-checkbox-group>
    <div v-else><h3>无配置信息!</h3></div>
  </div>
</template>

<script>
import { getAction,postAction } from '@/api/manage'
export default {
  name: 'ztRoleDataRule',
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
        this.loadData();
      },
      immediate: true,
    },
    routeMenuId:{
      handler(val) {
        this.loadData();
      },
      immediate: true,
    }
  },
  data(){
    return{
      tabList: [{
        key: '1',
        tab: '数据规则',
      }, {
        key: '2',
        tab: '按钮权限',
      }],
      url:{
        datarule:"/sys/role/datarule",
      },
      dataruleList:[],
      dataruleChecked:[]
    }
  },
  methods:{
    loadData(){
      getAction(`${this.url.datarule}/${this.routeMenuId}/${this.roleId}`).then(res=>{
        console.log(res)
        if(res.success){
          this.dataruleList = res.result.datarule
          let drChecked = res.result.drChecked
          if(drChecked){
            this.dataruleChecked = drChecked.split(",")
          }
        }
      })
    },
    saveDataruleForRole(){
      if(!this.dataruleChecked || this.dataruleChecked.length==0){
        this.$message.warning("请注意，现未勾选任何数据权限!")
      }
      let params = {
        permissionId:this.routeMenuId,
        roleId:this.roleId,
        dataRuleIds:this.dataruleChecked.join(",")
      }
      console.log("保存数据权限",params)
      postAction(this.url.datarule,params).then(res=>{
        if(res.success){
          this.$message.success(res.message)
        }else{
          this.$message.error(res.message)
        }
      })
    },
  }
}
</script>

<style scoped>

</style>