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
    <yzzw-jgdw-and-nj-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"></yzzw-jgdw-and-nj-form>
  </j-modal>
</template>

<script>

  import YzzwJgdwAndNjForm from './YzzwJgdwAndNjForm.vue'
  export default {
    name: 'YzzwJgdwAndNjModal',
    components: {
      YzzwJgdwAndNjForm
    }, 
    data () {
      return {
        title:'',
        width:'80%',
        visible: false,
        disableSubmit: false
      }
    },
    methods: {
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