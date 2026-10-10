<template>
  <!--
    HrRejectModal.vue
    退回弹窗组件
    功能：审批人退回补卡申请
  -->
  <a-modal title="退回申请" :width="600" :visible="visible" :confirmLoading="confirmLoading"
    :maskClosable="false" @ok="handleOk" @cancel="handleCancel" cancelText="关闭"
    class="attendance-rule-modal">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="退回原因">
          <a-textarea v-decorator="['rejectReason', validatorRules.rejectReason]" placeholder="请输入退回原因"
            :rows="4" :maxLength="500" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
/**
 * 退回弹窗组件
 * 
 * 功能：
 *   - 审批人退回补卡申请
 *   - 必须填写退回原因
 */
import { httpAction } from '@/api/manage'

export default {
  name: 'HrRejectModal',
  props: {
    LCstate: { type: Number, default: 0 },
    ZFAll: { type: Object, default: () => {} },
    ShowZF: { type: Boolean, default: false }
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      },
      validatorRules: {
        rejectReason: { rules: [{ required: true, message: '请输入退回原因!' }] }
      },
      url: {
        reject: '/hr_bksq/hrBksq/reject'
      }
    }
  },
  watch: {
    ShowZF: {
      immediate: true,
      handler(val) {
        this.visible = val
        if (val) {
          this.model = Object.assign({}, this.ZFAll)
          this.form.resetFields()
        }
      }
    }
  },
  methods: {
    /**
     * 确定
     */
    handleOk() {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.confirmLoading = true
          const formData = Object.assign({}, this.model, values)
          httpAction(this.url.reject, formData, 'post')
            .then((res) => {
              if (res.success) {
                this.$message.success(res.message)
                this.$emit('goBack', true)
              } else {
                this.$message.warning(res.message)
              }
            })
            .finally(() => {
              this.confirmLoading = false
            })
        }
      })
    },

    /**
     * 取消
     */
    handleCancel() {
      this.$emit('goBack', false)
    }
  }
}
</script>

<style scoped lang="less">
</style>

<style>
/* ==== Modal 全局样式（非 scoped） ==== */
.attendance-rule-modal .ant-modal-header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
}

.attendance-rule-modal .ant-modal-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.attendance-rule-modal .ant-modal-close {
  color: #fff;
  top: 12px;
}

.attendance-rule-modal .ant-modal-close-x {
  width: 48px;
  height: 48px;
  line-height: 48px;
  font-size: 16px;
}

.attendance-rule-modal .ant-modal-content {
  border-radius: 8px;
  overflow: hidden;
}

.attendance-rule-modal .ant-modal-body {
  padding: 24px;
  background: #f8fafd;
}

.attendance-rule-modal .ant-modal-footer {
  border-top: 1px solid #e2e8f0;
  background: #fff;
  padding: 16px 24px;
}
</style>
