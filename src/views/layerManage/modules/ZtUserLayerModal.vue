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
    <zt-user-layer-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></zt-user-layer-form>
  </j-modal>
</template>

<script>

  import ZtUserLayerForm from './ZtUserLayerForm'
  export default {
    name: 'ZtUserLayerModal',
    components: {
      ZtUserLayerForm
    },
    props:{
      layerId:{
        type: String,
        required:true,
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
        this.visible=true;
        let layerId = this.layerId;
        this.$nextTick(()=>{
          this.$refs.realForm.add(layerId);
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