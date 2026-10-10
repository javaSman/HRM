<!--
  离职取消模态框组件

  功能说明：
  - 用于取消离职申请
  - 需要填写取消原因
  - 取消后离职状态将变更为「已取消」

  组件属性：
  - visible: 控制模态框显示/隐藏
  - record: 当前离职记录数据

  事件：
  - ok: 取消成功后触发，通知父组件刷新列表

  
-->
<template>
  <a-modal
    title="确认取消"
    :width="480"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    :maskClosable="false"
    :footer="null"
  >
    <!-- 取消确认提示区域 -->
    <div style="text-align: center; margin-bottom: 16px; padding: 20px 0">
      <a-icon type="warning" style="font-size: 48px; color: #faad14; margin-bottom: 16px" />
      <div style="font-size: 16px; color: #333; font-weight: 500; margin-bottom: 8px">确认取消该离职申请？</div>
      <div style="font-size: 13px; color: #999">{{ employeeInfo }}</div>
    </div>

    <!-- 取消原因表单 -->
    <a-form-model ref="form" :model="model" :rules="rules" layout="vertical">
      <a-form-model-item label="取消原因" prop="qxyy">
        <a-textarea v-model="model.qxyy" placeholder="请输入取消原因" :rows="3" :maxLength="500" />
      </a-form-model-item>
    </a-form-model>

    <!-- 底部操作按钮 -->
    <div style="text-align: right; margin-top: 16px">
      <a-button @click="handleCancel">返回</a-button>
      <a-button
        type="danger"
        :loading="confirmLoading"
        :disabled="confirmLoading"
        @click="handleSubmit"
        style="margin-left: 8px"
      >
        确认取消
      </a-button>
    </div>
  </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import moment from 'moment'

export default {
  name: 'offboardingCancelModal',
  data() {
    return {
      visible: false, // 模态框显示状态
      confirmLoading: false, // 提交按钮加载状态
      record: {}, // 当前离职记录数据
      model: {
        qxyy: '', // 废弃原因/取消原因
      },
      rules: {
        qxyy: [{ required: true, message: '请输入取消原因', trigger: 'blur' }], // 取消原因为必填项
      },
      url: {
        cancel: '/ryManage/hrmLzgl/edit', // 取消离职接口地址
      },
    }
  },
  computed: {
    /**
     * 计算属性：员工信息展示
     * 格式：姓名（工号） 或 姓名
     * @returns {string} 格式化后的员工信息
     */
    employeeInfo() {
      if (!this.record || !this.record.xm) {
        return ''
      }
      const name = this.record.xm || ''
      const empNo = this.record.gh || ''
      return empNo ? `${name}（${empNo}）` : name
    },
  },
  methods: {
    /**
     * 打开模态框
     * @param {Object} record - 离职记录数据
     */
    open(record) {
      if (!record || !record.id) {
        this.$message.warning('当前离职记录缺少主键，无法取消')
        return
      }
      this.record = record
      this.model.qxyy = ''
      this.visible = true
      // 清除表单验证状态
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },

    /**
     * 关闭模态框
     * 重置所有状态
     */
    close() {
      this.visible = false
      this.confirmLoading = false
      this.record = {}
      this.model.qxyy = ''
    },

    /**
     * 取消按钮点击事件
     */
    handleCancel() {
      this.close()
    },

    /**
     * 提交取消离职
     * 调用取消接口，更新离职状态为「已取消」
     */
    handleSubmit() {
      if (this.confirmLoading) {
        return
      }

      this.$refs.form.validate((valid) => {
        if (!valid) {
          return
        }

        this.confirmLoading = true
        // 构建取消请求数据
        const payload = {
          ...this.record,
          zt: '已取消', // 更新状态为已取消
          qxyy: this.model.qxyy, //
        }

        httpAction(this.url.cancel, payload, 'put')
          .then((res) => {
            if (!res || !res.success) {
              throw new Error(res.message || '取消离职失败')
            }
            this.$message.success('已取消离职')
            this.$emit('ok') // 通知父组件刷新列表
            this.close()
          })
          .catch((error) => {
            this.$message.error(error.message || '取消离职失败，请稍后重试')
          })
          .finally(() => {
            this.confirmLoading = false
          })
      })
    },
  },
}
</script>

<style scoped></style>
