<template>
  <div ref="myCard">

    <a-card title="" v-if="dataList.length!==0 || codeList.length!==0"  >
      <template #extra>
        <a-button type="primary" size="small" @click="update"> 更新</a-button>
      </template>
      <a-checkbox-group   v-model="idValues" style="width: 100%">
        <a-row>
          <a-col  :span="span" v-for="item in dataList" :key="item.id">
            <a-checkbox :value="item.id"   >
              {{ item.name }}
            </a-checkbox>
          </a-col>
        </a-row>


      </a-checkbox-group>
      <a-divider v-if="dataList.length!==0 && codeList.length!==0" />
      <a-checkbox-group v-model="codeValues" style="width: 100%">
        <a-row>
          <a-col  :span="span" v-for="item in codeList" :key="item.childCode">
            <a-checkbox :value="item.childCode" >
              {{ item.name }}
            </a-checkbox>
          </a-col>
        </a-row>

      </a-checkbox-group>
    </a-card>
    <h3 v-else>
      无配置
    </h3>

  </div>
</template>

<script>
import { getAction, postAction, putAction } from '@api/manage'

export default {
  name: 'ZtDiyButtonRole',
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
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize(); // 初始化时计算一次
  },
  data(){
    return{
      span:12,

      url:{
        list:"sys/sysRoleTree/queryListByRoleAndPidType",
        updateButtonLink:"sys/sysRoleTree/updateButton",
      },
      dataList:[],
      codeList:[],
      idValues:[],
      codeValues:[],
    }
  },
  methods:{
    /**
     * 加载并构建数据格式
     */
    loadData(){
      this.codeValues=[];
      getAction(`${this.url.list}?roleId=${this.roleId}&pid=${this.treeTagId}&type=2`).then(res=>{
        if (res.success){
           let dataArr = res.result==null ? []: res.result;
          this.dataList = dataArr.filter(item => item.id!=null && item.id !=='' )
          this.codeList = dataArr.filter(item => item.id == null || item.id ==='');
          this.idValues = this.dataList.filter(item=>item.keyId!=null).map(item=>item.id)
        }else {
          this.$message.error(res.message);
        }
      })
    },

    /**
     * 更新
     * @param dataRule
     */
    update(data){
      let ids =this.idValues;
      let codes =this.codeValues;
      let roleId = this.roleId;
      let treeTagId = this.treeTagId;
      let param={
        roleId,
        menuId:treeTagId,
        treeIdList:ids,
        codeList:codes
      };
      putAction(`${this.url.updateButtonLink}`,param).then(res=>{
        if (res.success){
          this.loadData();
          this.$message.success(res.message);
        }else {
          this.$message.error(res.message);
        }
      })
    },

    /**
     * 根据宽度动态计算排列多少个
     */
    handleResize() {
      const width = this.$refs.myCard.clientWidth;
      let num = Math.floor(width / 120);
      this.span = Math.ceil(24/num);
    }
  },
}
</script>

<style scoped>
/deep/ .ant-divider.ant-divider-horizontal{
  margin: 5px 0;
}

</style>