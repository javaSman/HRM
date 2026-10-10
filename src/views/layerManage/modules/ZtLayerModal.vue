<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    switchFullscreen
    @ok="handleOk"
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel="handleCancel"
    cancelText="关闭">
    <zt-layer-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></zt-layer-form>

    <a-drawer
      title="同步模块名称"
      placement="right"
      :width="500"
      :closable="true"
      :visible="syncVisible"
      @close="syncHandleCancel"
      @ok="syncHandleOk"
    >
      <div style="text-align: center">
        <a-row :gutter="16" style="background-color: #ececec; padding: 7px 0px;">
          <a-col :span="8" v-for="(item, num) in dataList" :key="item.code">
            <a-card :title="item.name">
              <a-card-grid style="width:100%;height:80px; text-align:center" v-for="(tagItem,index) in item.tagList" :hoverable="false" :key="tagItem.id" >
                {{ tagItem.name }}<a-switch v-model="tagItem.status" checked-children="同步" un-checked-children="不同步" size="small" style="margin-left: 5px;margin-bottom: 3px"/>
              </a-card-grid>
            </a-card>
          </a-col>
        </a-row>

        <a-button type="primary" @click="syncHandleOk">确定</a-button>
      </div>

    </a-drawer>

  </j-modal>
</template>

<script>

  import ZtLayerForm from './ZtLayerForm'
  import { getAction, putAction } from '@api/manage'
  export default {
    name: 'ZtLayerModal',
    components: {
      ZtLayerForm
    },
    props: {
      menuId: {
        type: String,
        required: true
      }
    },
    data () {
      return {
        title:'',
        width:800,
        visible: false,
        disableSubmit: false,



        syncVisible:false,
        targetName:"",
        dataList:[],
      }
    },
    methods: {
      add () {
        this.visible=true
        this.$nextTick(()=>{
          this.$refs.realForm.add(this.menuId);
        })
      },
      edit (record) {
        this.visible=true
        this.$nextTick(()=>{
          this.$refs.realForm.edit(record);
        })
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        this.$refs.realForm.submitForm();
      },
      submitCallback(data){
        // 如果data 不是空证明是编辑
        if (!data){
          this.$emit('ok');
          this.visible = false;
          return
        }
        // 查询是否有关联的数据
        let url=`sys/sysTreeTag/queryConfigMapByTargetId?targetId=${data.id}`;
        getAction(url).then(res=>{
          if (res.success && res.result && res.result.length>0){
            // 有可以同步的数据
            let list = res.result;
            list.forEach(item=>{
               let tagList = item.tagList;
              tagList.forEach(tagItem=>{
                tagItem['status'] = false;
              })
            })
            this.dataList = list;
            this.targetName = data.name;
            this.syncVisible = true;

          }else {
            this.$emit('ok');
            this.visible = false;
          }
        })
      },
      handleCancel () {
        this.close()
      },
      syncClose(){
        this.syncVisible=false;
        this.$emit('ok');
        this.visible = false;
      },


      syncHandleOk(){
        let list = this.dataList;
        let idArr = [];
        let targetName =this.targetName;
        list.forEach(item=>{
          let tagList = item.tagList;
          tagList.forEach(tagItem=>{
            if (tagItem.status){
              idArr.push(tagItem.id);
            }
          })
        })
        // 不更新
        if (idArr.length==0){
         this.syncClose();
          return
        }

        // 得到更新的 idArr
        let url=`sys/sysTreeTag/syncTargetName?targetName=${targetName}&ids=${idArr.toString()}`
        putAction(url).then(res=>{
          if(res.success){
            this.$message.success("同步成功");
            this.syncClose();
          }else {
            this.$message.success("同步失败");
            this.syncClose();
          }
        })

      },
      syncHandleCancel(){
        this.syncClose();
      }
    }
  }
</script>