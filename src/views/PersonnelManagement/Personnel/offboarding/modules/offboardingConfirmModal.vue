<!--
  离职确认模态框组件

  功能说明：
  - 用于确认员工已完成离职流程
  - 需要选择实际离职日期
  - 确认后将员工状态变更为"已离职"，并同步更新员工档案

  组件属性：
  - visible: 控制模态框显示/隐藏
  - record: 当前离职记录数据

  事件：
  - ok: 确认成功后触发，通知父组件刷新列表

  
-->
<template>
  <a-modal
    title="确认离职"
    :width="480"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    :maskClosable="false"
  >
    <!-- 确认离职提示区域 -->
    <div style="text-align: center; margin-bottom: 16px; padding: 20px 0">
      <a-icon type="check-circle" style="font-size: 48px; color: #52c41a; margin-bottom: 16px" />
      <div style="font-size: 16px; color: #333; font-weight: 500; margin-bottom: 8px">确认该员工已完成离职？</div>
      <div style="font-size: 13px; color: #999">{{ employeeInfo }}</div>
    </div>

    <!-- 实际离职日期选择 -->
    <div
      style="background: #f8f9fb; padding: 14px 16px; border-radius: 6px; font-size: 13px; line-height: 2; color: #666"
    >
      <div style="display: flex; align-items: center">
        <span><span style="color: #ff4d4f">*</span> 实际离职日期：</span>
        <a-date-picker
          v-model="actualDate"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          placeholder="请选择日期"
          style="width: 160px"
          :disabled-date="disabledDate"
        />
      </div>
    </div>

    <!-- 操作提示信息 -->
    <div style="font-size: 12px; color: #999; margin-top: 12px; line-height: 1.6">
      确认后系统将：<br />
      1. 将员工状态变更为"已离职"<br />
      2. 同步更新员工档案信息<br />
      3. 生成离职证明办理提醒
    </div>

    <!-- 底部操作按钮 -->
    <template slot="footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" :loading="confirmLoading" @click="handleSubmit"> 确认离职 </a-button>
    </template>
  </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import moment from 'moment'
import Vue from 'vue'
export default {
  name: 'offboardingConfirmModal',
  data() {
    return {
      visible: false, // 模态框显示状态
      confirmLoading: false, // 提交按钮加载状态
      record: {}, // 当前离职记录数据
      actualDate: null, // 实际离职日期
      url: {
        confirm: '/ryManage/hrmLzgl/confirmLeave', // 确认离职接口地址
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
     * 禁用日期选择
     * 限制只能选择今天及之前的日期
     * @param {moment} current - 当前日期对象
     * @returns {boolean} - true表示禁用，false表示可选
     */
    disabledDate(current) {
      // 禁用今天之后的日期（只能选择今天和往前的日期）
      return current && current > moment().endOf('day')
    },

    /**
     * 打开模态框
     * @param {Object} record - 离职记录数据
     */
    open(record) {
      if (!record || !record.id) {
        this.$message.warning('当前离职记录缺少主键，无法确认离职')
        return
      }
      this.record = record
      this.actualDate = null
      this.visible = true
    },

    /**
     * 关闭模态框
     * 重置所有状态
     */
    close() {
      this.visible = false
      this.confirmLoading = false
      this.record = {}
      this.actualDate = null
    },

    /**
     * 取消按钮点击事件
     */
    handleCancel() {
      this.close()
    },

    /**
     * 提交确认离职
     * 调用确认接口，更新离职状态为「已离职」
     */
    handleSubmit() {
      if (this.confirmLoading) {
        return
      }

      // 验证实际离职日期是否已选择
      if (!this.actualDate) {
        this.$message.warning('请选择实际离职日期')
        return
      }

      this.confirmLoading = true
      // 构建确认请求数据
      const perInfo = Vue.ls.get('perInfo')
      const payload = {
        ...this.record,
        zt: '已离职', // 更新状态为已离职
        sjlzrq: this.actualDate, // 实际离职日期
        spr: perInfo.id
      }

      httpAction(this.url.confirm, payload, 'post')
        .then((res) => {
          if (!res || !res.success) {
            throw new Error(res.message || '确认离职失败')
          }
          this.$message.success('员工已确认离职')
          this.$emit('ok') // 通知父组件刷新列表
          this.close()
        })
        .catch((error) => {
          this.$message.error(error.message || '确认离职失败，请稍后重试')
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
  },
}
</script>

<style scoped></style>
