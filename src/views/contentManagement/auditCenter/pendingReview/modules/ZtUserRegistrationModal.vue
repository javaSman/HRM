<!--
 * @Author: 匹诺曹 1164698177@qq.com
 * @Date: 2025-11-20 14:48:11
 * @LastEditors: 匹诺曹 1164698177@qq.com
 * @LastEditTime: 2025-11-20 16:50:07
 * @FilePath: \ztsisnew\ant-design-vue-jeecg\src\views\contentManagement\auditCenter\pendingReview\modules\ZtUserRegistrationModal.vue
 * @Description: 
-->
<template>
  <j-modal :title="title" :width="width" :visible="visible" switchFullscreen @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }" @cancel="handleCancel" cancelText="关闭">
    <zt-user-registration-form ref="realForm" @ok="submitCallback"
      :disabled="disableSubmit"></zt-user-registration-form>
  </j-modal>
</template>

<script>

import ZtUserRegistrationForm from './ZtUserRegistrationForm'
export default {
  name: 'ZtUserRegistrationModal',
  components: {
    ZtUserRegistrationForm
  },
  data () {
    return {
      title: '',
      width: 800,
      visible: false,
      disableSubmit: false
    }
  },
  methods: {
    add () {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add();
      })
    },
    edit (record) {
      this.visible = true
      this.$nextTick(() => {
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
    submitCallback () {
      this.$emit('ok');
      this.visible = false;
    },
    handleCancel () {
      this.close()
    }
  }
}
</script>