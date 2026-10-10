<!--  数据规则授权列表 -->
<template>
  <div>

    <a-card size="small" :title="key" v-for="(dataRule,key)  in dataRuleGroupedList" :key="key" class="col">
      <a slot="extra" >
        <a-button @click="clear(dataRule)" type="primary" size="small" v-show="dataRule.checkId" style="margin-right: 5px">取消</a-button>
      </a>
      <a-radio-group :default-value="dataRule.defaultId"  v-model="dataRule.checkId" @change="onChange(dataRule)"  >
        <a-radio :style="radioStyle" :value="item.id" v-for="item in dataRule.dataRuleList" :key="item.id" >
          {{ item.name }}
        </a-radio>
      </a-radio-group>

    </a-card>
    <div v-show="Object.keys(dataRuleGroupedList).length===0"><h3>无配置信息!</h3></div>


  </div>
</template>

<script>
import { getAction, postAction } from '@api/manage'

export default {
  name: 'ZtDiyDataRuleRole',
  props:{
    // 角色id
    roleId:{
      type: String,
      required:true,
    },
    // 系统配置菜单id
    treeTagId:{
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
    treeTagId:{
      handler(val) {
        this.loadData();
      },
      immediate: true,
    }
  },
  data(){
    return{
      radioStyle: {
        display: 'block'
      },
      url:{
        list:"/sys/ztDataRule/queryRuleListByRoleIdAndMenuId",
        addOrUpdateLink:"/sys/ztDataRule/addOrUpdateLink",
        deleteLink:"/sys/ztDataRule/deleteLink"
      },
      /**
       * 数据格式
       * {
       *   xxx分组1:{
       *     defaultId:"",
       *     checkId:"",
       *     arr:[]
       *   }
       *   xxx分组2:{
       *
       *   }
       * }
       */
      dataRuleGroupedList:{},
    }
  },
  methods:{
    /**
     * 加载并构建数据格式
     */
    loadData(){
      getAction(`${this.url.list}?roleId=${this.roleId}&menuId=${this.treeTagId}`).then(res=>{
        if (res.success){
          let dataRuleList = res.result==null ? [] : res.result;
          // 数据规则分组list
          const dataRuleGroupedList = dataRuleList.reduce((groups, item) => {
            (groups[item.classMethod] = groups[item.classMethod] || []).push(item);
            return groups;
          }, {});

          // 设置选原本就选中的 数据规则id
          for (let key in dataRuleGroupedList) {
            let arr = dataRuleGroupedList[key];
            let checkArr = arr.filter(item=>item.has);
            let id="";
            if (checkArr!=null && checkArr.length>0){
              id = checkArr[0].id;
            }
            dataRuleGroupedList[key] =  {
              checkId:id,
              defaultId:id,
              dataRuleList:arr
            }
          }
          this.dataRuleGroupedList= dataRuleGroupedList;

        }else {
          this.$message.error(res.message);
        }
      })
    },

    /**
     * 更新
     * @param dataRule
     */
    onChange(dataRule){
      if (dataRule.checkId==null ||  dataRule.checkId===""){
        return;
      }
      // defaultId 旧id
      if (dataRule.defaultId === dataRule.checkId){
        return;
      }
      postAction(`${this.url.addOrUpdateLink}?roleId=${this.roleId}&oldRuleId=${dataRule.defaultId}&newRuleId=${dataRule.checkId}`).then(res=>{
        if (res.success){
          this.$message.success("更新成功");
        }else {
          this.$message.error(res.message);
        }
        this.loadData();
      })

    },
    /**
     * 删除
     * @param dataRule
     */
    clear(dataRule){
      dataRule.checkId = "";
      if (dataRule.defaultId === dataRule.checkId){
        return;
      }
      let pam= {
        roleId:this.roleId,
        dataRuleId:dataRule.defaultId,
      }
      // 直接删除旧id
      postAction(this.url.deleteLink,pam).then(res=>{
        if (res.success){
          this.$message.success("删除成功");
        }else {
          this.$message.error(res.message);
        }
        this.loadData();
      })
    },
  },

}
</script>

<style scoped>
.headHandle{
  display: flex;
  justify-content: end;
  padding-right: 20px;
  height: 24px;
  text-align: center;
}
.col{
  /*border: solid 1px #DCDFE6;*/
  min-height: 200px;
  border-bottom: 3px solid #1890FF;
  margin-bottom: 10px;
}

</style>