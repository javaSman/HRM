<!--
  离职审批通过模态框组件

  功能说明：
  - 用于审批通过离职申请
  - 审批通过后，离职申请将流转至「待离职」状态
  - 支持填写审批意见

  组件属性：
  - visible: 控制模态框显示/隐藏
  - record: 当前离职记录数据

  事件：
  - ok: 审批成功后触发，通知父组件刷新列表

  
-->
<template>
  <a-modal
    :title="'审批通过 - ' + employeeInfo"
    :width="520"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :maskClosable="false"
  >
    <!-- 审批通过提示信息 -->
    <a-alert
      message="审批通过后，离职申请将流转至「待离职」状态"
      type="success"
      show-icon
      style="margin-bottom: 16px"
    />

    <!-- 审批表单 -->
    <a-form-model ref="form" :model="model" :rules="rules" layout="vertical">
      <a-form-model-item label="审批意见" prop="spyj">
        <a-textarea
          v-model="model.spyj"
          placeholder="请输入审批意见，如：同意离职，请做好工作交接"
          :rows="4"
          :maxLength="500"
        />
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import Vue from 'vue'
//import moment from 'moment'

export default {
  name: 'offboardingApproveModal',
  data() {
    return {
      visible: false, // 模态框显示状态
      confirmLoading: false, // 提交按钮加载状态
      record: {}, // 当前离职记录数据
      model: {
        spyj: '', // 审批意见
      },
      rules: {}, // 表单验证规则
      url: {
        approve: '/ryManage/hrmLzgl/edit', // 审批接口地址
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
        this.$message.warning('当前离职记录缺少主键，无法审批')
        return
      }
      this.record = record
      this.model.spyj = ''
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
      this.model.spyj = ''
    },

    /**
     * 取消按钮点击事件
     */
    handleCancel() {
      this.close()
    },

    /**
     * 提交审批
     * 调用审批接口，更新离职状态为「待离职」
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
        const perInfo = Vue.ls.get('perInfo')
        // 构建审批请求数据
        const payload = {
          ...this.record,
          zt: '待离职', // 更新状态为待离职
          spyj: this.model.spyj || '', // 审批意见
          createByNo: perInfo.no
        }

        httpAction(this.url.approve, payload, 'put')
          .then((res) => {
            if (!res || !res.success) {
              throw new Error(res.message || '审批失败')
            }
            this.$message.success('审批已通过，进入待离职状态')
            this.$emit('ok') // 通知父组件刷新列表
            this.close()
          })
          .catch((error) => {
            this.$message.error(error.message || '审批失败，请稍后重试')
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
