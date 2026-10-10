<!-- SysTreeTag 按钮钮类型的列表 显示 -->
<template>
  <a-drawer
    title="按钮列表"
    placement="right"
    :closable="true"
    :visible="visible"
    width="60%"
    :after-visible-change="afterVisibleChange"
    @close="onClose"
  >
    <a-button @click="addHandel" type="primary" size="small" style="margin: 5px">添加</a-button>
    <a-row :gutter="16">
      <a-col :span="8" v-for="item in dataList" :key="item.id" style='margin-bottom: 8px'>
        <a-card :title="false">
          <a slot="extra" href="#">
            <a-button  v-if="item.isEdit" size="small" style="margin-left: 5px" @click="updateHandel(item)">更新</a-button>
            <a-button type="primary" v-else size="small" style="margin-left: 5px" @click="editHandel(item)">编辑</a-button>
            <a-button type="danger" size="small" style="margin-left: 5px"  @click="deleteHandel(item.id)">删除</a-button>
          </a>
          <div class="bodyHandel" v-if='item.isEdit' >
            <a-input addon-before="名称"  style='margin-bottom: 5px' v-model="item.name" ></a-input>
            <a-input addon-before="code"  v-model="item.childCode" ></a-input>
          </div>
          <div class="bodyHandel" v-else style='pointer-events: none'>
            <a-input addon-before="名称"  style='margin-bottom: 5px' v-model="item.name" ></a-input>
            <a-input addon-before="code"  v-model="item.childCode" ></a-input>
          </div>

        </a-card>
      </a-col>
    </a-row>
  </a-drawer>
</template>

<script>
import { deleteAction, getAction, postAction } from '@api/manage'
import { nodeType } from '@/utils/sysTreeTagUtil'
export default {
  name: 'ZtTreeTagButtonType',
  data() {
    return {
      menuId:"",
      dataList:[],

      visible:false,
      url: {
        list: "sys/sysTreeTag/queryList",
        addOrUpdate:"sys/sysTreeTag/buttonTypeAddOrUpdate",
        delete: "sys/sysTreeTag/delete",
      }
    }
  },
  methods: {
    afterVisibleChange(val) {
      console.log('visible', val);
    },
    showDrawer(id) {
      this.menuId = id;
      this.loadData();
      this.visible = true;
    },
    onClose() {
      this.visible = false;
    },
    addHandel(){
      let sort = this.dataList.length;
      let menuId = this.menuId;
      let obj = {
        id:null,
        pid:menuId,
        name:"",
        sort:sort,
        childCode:"",
        // 是否打开 0否 1是
        hasOpen:"0",
        isEdit:true
      }
      this.dataList.push(obj);

    },
    updateHandel(item){
      console.log("==>",item);
      postAction(this.url.addOrUpdate,item).then(res=>{
        if (res.success){
          this.$message.success("保存成功");
          this.loadData();
        }else{
          this.$message.error(res.message);
        }
      })
    },


    editHandel(item){
      this.$set(item, 'isEdit', true);
    },
    deleteHandel(id){
      if (id===null || id===''){
        this.dataList = this.dataList.filter(item=>item.id!==id);
        return
      }
      deleteAction(`${this.url.delete}?id=${id}`).then(res=>{
        if (res.success){
          this.$message.success("删除成功");
        }else{
          this.$message.error(res.message);
        }
        this.loadData();
      })
    },

    // 加载数据
    loadData(){
      getAction(`${this.url.list}?pid=${this.menuId}&hasChild=${nodeType.button.value}`).then(res=>{
        if (res.success){
          this.dataList = res.result==null ? []:res.result;
        }else {
          this.$message.error(res.message);
        }
      })
    }
  }
}
</script>

<style scoped>
.bodyHandel{
  margin-bottom: 10px;
}
</style>