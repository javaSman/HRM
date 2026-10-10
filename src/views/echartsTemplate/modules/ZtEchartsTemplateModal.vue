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
    <zt-echarts-template-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></zt-echarts-template-form>
  </j-modal>
</template>

<script>

  import ZtEchartsTemplateForm from './ZtEchartsTemplateForm'
  export default {
    name: 'ZtEchartsTemplateModal',
    components: {
      ZtEchartsTemplateForm
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
        width:1000,
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