<template>
  <j-modal
    :title="title"
    :width="1200"
    :visible="visible"
    :maskClosable="false"
    switchFullscreen
    @ok="handleOk"
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel="handleCancel">
    <ces-order-main-form ref="realForm" @ok="submitCallback" :nonFlowNew="nonFlowNew" :disabled="disableSubmit"/>
  </j-modal>
</template>

<script>

  import CesOrderMainForm from './CesOrderMainForm'

  export default {
    name: 'CesOrderMainModal',
    components: {
      CesOrderMainForm
    },
    data() {
      return {
        title:'',
        width:800,
        visible: false,
        disableSubmit: false,
        nonFlowNew: true //与流程里录入做区分
      }
    },
    methods:{
      add () {
        this.visible=true
        this.$nextTick(()=>{
          this.$refs.realForm.add();
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
        this.$refs.realForm.handleOk();
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

<style scoped>
</style>