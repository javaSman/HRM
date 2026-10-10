<template>
  <j-modal :title="title" :width="650" :visible="visible" switchFullscreen @cancel="handleCancel" cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <a-form-model ref="form" :model="model" :rules="validatorRules" :label-align="'left'">
        <div class="cancel-form-content">
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
            label="取消原因"
            prop="spyj"
            :labelCol="{ xs: { span: 24 }, sm: { span: 4 } }"
            :wrapperCol="{ xs: { span: 24 }, sm: { span: 19 } }"
          >
            <a-textarea v-model="model.spyj" placeholder="请输入取消原因" :rows="5" :disabled="disableSubmit" />
          </a-form-model-item>
        </div>
      </a-form-model>
    </a-spin>
    <template slot="footer">
      <a-button :loading="confirmLoading" @click="handleCancel">取消</a-button>
      <a-button type="danger" :loading="confirmLoading" @click="handleConfirmCancel">确认取消</a-button>
    </template>
  </j-modal>
</template>

<script>
import { httpAction } from '@/api/manage'

export default {
  name: 'HrmTdglCancelModal',
  data() {
    return {
      title: '取消调动',
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
        spyj: [{ required: true, message: '请输入取消原因', trigger: 'blur' }],
      },
      url: {
        cancel: '/ryManage/hrmTdgl/edit',
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
    handleConfirmCancel() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.confirmLoading = true
          const params = {
            ...this.model,
            zt: '已取消',
          }
          httpAction(this.url.cancel, params, 'post')
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
.cancel-form-content {
  padding: 0 8px;
}
</style>

