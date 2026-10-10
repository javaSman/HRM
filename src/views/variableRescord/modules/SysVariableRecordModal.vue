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
    <sys-variable-record-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></sys-variable-record-form>
  </j-modal>
</template>

<script>

  import SysVariableRecordForm from './SysVariableRecordForm'
  import {getVariableList} from "@/utils/util";

  export default {
    name: 'SysVariableRecordModal',
    components: {
      SysVariableRecordForm
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
        disableSubmit: false
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
        // 重新获取 变量
        getVariableList();
        this.$refs.realForm.submitForm();
      },
      submitCallback(){
        this.$emit('ok');
        this.visible = false;
      },
      handleCancel () {
        this.close()
      }
    }
  }
</script>