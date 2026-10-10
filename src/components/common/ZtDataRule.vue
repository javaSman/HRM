<template>
  <div>
    <a-drawer
      title="数据规则"
      placement="right"
      :closable="true"
      :visible="visible"
      width="40%"
      :after-visible-change="afterVisibleChange"
      @close="onClose"
    >
      <a-button @click="addHandel" type="primary"  size="small"style="margin: 5px;" >添加</a-button>
      <a-row :gutter="24">
        <a-col :span="24" v-for="item in dataList" :key="item.id" style='margin-bottom: 12px'>
          <a-card :bordered="true">
            <a slot="extra" href="#">
              <a-button v-if="item.isEdit" size="small" style="margin-left: 5px" @click="updateHandel(item)">更新</a-button>
              <a-button type="primary" v-else size="small" style="margin-left: 5px" @click="editHandel(item)">编辑</a-button>
              <a-button type="danger"  style="margin-left: 5px" size="small" @click="deleteHandel(item.id)">删除</a-button>
            </a>

            <div class="bodyHandel">
              <a-input addon-before="名称"  v-model="item.name" v-if="item.isEdit"></a-input>
              <div v-else>
                <a-input addon-before="名称" style='pointer-events: none' v-model="item.name" ></a-input>
              </div>
            </div>

            <div class="bodyHandel">
              <a-input addon-before="类全路径到方法名"  v-model="item.classMethod" v-if="item.isEdit"></a-input>
              <div v-else>
                <a-input addon-before="类全路径到方法名"  style='pointer-events: none' v-model="item.classMethod" ></a-input>
<!--                {{ item.classMethod }}-->
              </div>
            </div>

            <div class="bodyHandel">
              <comme-popup v-if="item.isEdit"  v-model="item.ruleValue" title="拓展参数" componentName="ObjJsonEdit" :parameter="jsonParam" ></comme-popup>
              <div  v-else style='width: 100%;height: auto;padding: 10px;border: 1px solid #eee;border-radius: 5px'   >{{ item.ruleValue }}</div>
<!--              <comme-popup v-else  v-model="item.ruleValue"  style='pointer-events: none'  title="拓展参数" componentName="ObjJsonEdit" :parameter="jsonParam" ></comme-popup>-->

            </div>

          </a-card>
        </a-col>
      </a-row>
    </a-drawer>
  </div>
</template>

<script>
import { deleteAction, getAction, postAction } from '@api/manage'
import commePopup from "@comp/ChoiceSelector/commePopup";
export default {
  name: 'ZtDataRule',
  components:{
    commePopup
  },
  computed:{
    jsonParam: function () {
      return JSON.parse(this.jsonParamStr);
    }
  },
  data() {
    return {
      menuId:"",
      dataList:[],

      jsonParamStr:'{"column-排序字段":"1","order-排序规则-{\\"code\\":\\"superQuery_order\\",\\"type\\":\\"radioButton\\"}":"ztDictSelectTag","superQueryListType-过滤条件匹配-{\\"code\\":\\"superQuery_yh\\",\\"type\\":\\"radioButton\\"}":"ztDictSelectTag","superQueryList-高级查询列表":[{"superQueryMatchType-过滤条件匹配-{\\"code\\":\\"superQuery_yh\\",\\"type\\":\\"radioButton\\"}":"ztDictSelectTag","superQueryParams-高级查询参数":[{"field-字段名":"1","type-字段类型-{\\"code\\":\\"superQuery_FieldType\\"}":"ztDictSelectTag","rule-规则-{\\"code\\":\\"superQuery_FieldRule\\"}":"ztDictSelectTag","val-字段值":"1"}]}]}',
      visible:false,
      url: {
        list: "/sys/ztDataRule/list",
        add:"sys/ztDataRule/add",
        delete: "/sys/ztDataRule/delete",
        edit: "/sys/ztDataRule/edit",
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
        menuId:menuId,
        name:"",
        ruleValue:"",
        classMethod:"",
        status:'1',
        sort:sort,
        isEdit:true
      }
      this.dataList.push(obj);
    },
    updateHandel(item){
      console.log("==>",item);
      postAction(this.url.add,item).then(res=>{
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
      getAction(`${this.url.list}?menuId=${this.menuId}`).then(res=>{
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
  width: 100%;
  margin-bottom: 10px;
}
</style>