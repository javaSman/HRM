<!--
  @description 临时工离职模态框组件
  @date 2026-08-19
  @functionality 提供临时工离职操作功能，填写离职日期并提交离职申请
-->
<template>
  <!-- 离职模态框 -->
  <a-modal
    title="临时工离职"
    :visible="visible"
    :width="480"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form-model ref="leaveForm" :model="formData" :rules="rules" :labelCol="{ span: 6 }" :wrapperCol="{ span: 16 }">
      <a-form-model-item label="姓名">
        <span>{{ record ? record.name + '（' + record.workerCode + '）' : '' }}</span>
      </a-form-model-item>
      <a-form-model-item label="工号">
        <span>{{ record ? record.workerCode : '' }}</span>
      </a-form-model-item>
      <a-form-model-item label="离职日期" prop="leaveDate">
        <j-date v-model="formData.leaveDate" placeholder="默认当前日期" />
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import JDate from '@/components/jeecg/JDate'

/**
 * 临时工离职模态框组件
 * 提供临时工离职操作功能
 * 填写离职日期并提交离职申请
 */
export default {
  name: 'LeaveModal',
  components: { JDate },
  props: {
    /** 模态框显示状态 */
    visible: {
      type: Boolean,
      default: false,
    },
    /** 离职记录 */
    record: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      /** 确认按钮加载状态 */
      confirmLoading: false,
      /** 表单数据 */
      formData: {
        leaveDate: '', // 离职日期
      },
      /** 表单验证规则 */
      rules: {
        leaveDate: [{ required: true, message: '请选择离职日期', trigger: 'change' }],
      },
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initForm()
      }
    },
  },
  methods: {
    /**
     * 初始化表单
     * @returns {void}
     */
    initForm() {
      const now = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      this.formData.leaveDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    },
    /**
     * 确认提交
     * @returns {void}
     */
    handleSubmit() {
      this.$refs.leaveForm.validate((valid) => {
        if (valid) {
          this.confirmLoading = true
          // 提交表单（父组件处理成功后会关闭弹窗）
          this.$emit(
            'ok',
            this.formData.leaveDate,
            this.record,
            () => {
              // 成功回调：关闭弹窗
              this.confirmLoading = false
              this.handleCancel()
            },
            () => {
              // 失败回调：停止加载状态
              this.confirmLoading = false
            }
          )
        }
      })
    },
    /**
     * 取消操作
     * @returns {void}
     */
    handleCancel() {
      this.$refs.leaveForm && this.$refs.leaveForm.resetFields()
      this.$emit('update:visible', false)
      this.$emit('cancel')
    },
  },
}
</script>

