<template>
  <j-modal :title="title" :width="650" :visible="visible" switchFullscreen @cancel="handleCancel" cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <a-form-model ref="form" :model="model" :rules="validatorRules" :label-align="'left'">
        <div class="approve-form-content">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item label="发起人" :labelCol="labelCol" :wrapperCol="wrapperCol">
                {{ model.fqr }}
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="姓名" :labelCol="labelCol" :wrapperCol="wrapperCol">
                {{ model.xm }}
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-model-item label="调动类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
                {{ model.ddlx }}
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="调动原因" :labelCol="labelCol" :wrapperCol="wrapperCol">
                {{ model.ddyy }}
              </a-form-model-item>
            </a-col>
          </a-row>

          <a-form-model-item
            label="审批意见"
            prop="spyj"
            :labelCol="{ xs: { span: 24 }, sm: { span: 4 } }"
            :wrapperCol="{ xs: { span: 24 }, sm: { span: 19 } }"
          >
            <a-textarea v-model="model.spyj" placeholder="请输入审批意见" :rows="5" :disabled="disableSubmit" />
          </a-form-model-item>
        </div>
      </a-form-model>
    </a-spin>
    <template slot="footer">
      <a-button :loading="confirmLoading" @click="handleCancel">取消</a-button>
      <a-button type="danger" :loading="confirmLoading" @click="handleReject">不同意</a-button>
      <a-button type="primary" :loading="confirmLoading" @click="handleApprove">同意</a-button>
    </template>
  </j-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import Vue from 'vue'
export default {
  name: 'HrmTdglApproveModal',
  data() {
    return {
      title: '调动审批',
      visible: false,
      confirmLoading: false,
      disableSubmit: false,
      model: {
        id: '',
        fqr: '',
        xm: '',
        ddlx: '',
        ddyy: '',
        spyj: '',
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      validatorRules: {
        spyj: [{ required: true, message: '请输入审批意见', trigger: 'blur' }],
      },
      url: {
        approve: '/ryManage/hrmTdgl/approve',
      },
    }
  },
  methods: {
    show(record) {
      this.visible = true
      this.model = {
        ...record,
      }
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    handleCancel() {
      this.close()
    },
    handleReject() {
      this.submitApprove('已拒绝')
    },
    handleApprove() {
      this.submitApprove('已通过')
    },
    submitApprove(status) {
      const perInfo = Vue.ls.get('perInfo')
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.confirmLoading = true
          const params = {
            ...this.model,
            spyj: this.model.spyj,
            zt: status,
            spr: perInfo.id
          }
          httpAction(this.url.approve, params, 'post')
            .then((res) => {
              if (res.success) {
                this.$message.success(res.message || '操作成功')
                this.$emit('ok')
                this.close()
              } else {
                this.$message.warning(res.message || '操作失败')
              }
            })
            .finally(() => {
              this.confirmLoading = false
            })
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
.approve-form-content {
  padding: 0 8px;
}
</style>

