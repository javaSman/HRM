<template>
  <!--
    LeaveResumptionModal.vue
    销假申请弹窗组件
    统一弹窗，根据 title 区分模式：
      - 新增/编辑：显示表单 + 提交申请按钮
      - 审批：显示表单（只读）+ 审批意见 + 审批不通过/审批通过
      - 详情：显示表单（只读）
  -->
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    centered
    wrapClassName="attendance-rule-modal"
    :bodyStyle="modalBodyStyle"
    @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <!-- 销假申请表单（左右两栏布局） -->
    <leave-resumption-apply-form
      ref="realForm"
      @ok="submitCallback"
      @submit="(loading) => (confirmLoading = loading)"
      :disabled="disableSubmit"
      :OK_show="OK_show"
    ></leave-resumption-apply-form>

    <!-- 底部按钮 -->
    <template slot="footer">
      <a-button key="back" class="modal-cancel-btn" @click="handleCancel">取消</a-button>

      <!-- 新增/编辑模式：提交申请 -->
      <a-button
        v-if="title === '新增销假' || title === '修改重申'"
        key="submit"
        type="primary"
        :loading="confirmLoading"
        @click="handleOk"
      >
        {{ title === '修改重申' ? '修改并提交' : '提交申请' }}
      </a-button>

      <!-- 审批模式：审批不通过 / 审批通过（口径参考 ServiceLeaveModal，意见均选填） -->
      <template v-if="OK_show">
        <a-button type="danger" @click="okReturn">审批不通过</a-button>
        <a-button type="primary" @click="okUP">审批通过</a-button>
      </template>
    </template>
  </j-modal>
</template>

<script>
/**
 * 销假申请弹窗组件
 *
 * 模式说明：
 *   - 新增销假：表单可编辑 + 提交申请按钮
 *   - 修改重申：表单可编辑 + 修改并提交按钮
 *   - 审批：表单只读 + 审批操作（审批不通过/审批通过，意见选填，按钮参考 ServiceLeaveModal）
 *   - 详情：表单只读
 */

import Vue from 'vue'
import LeaveResumptionApplyForm from './LeaveResumptionApplyForm'
import { httpAction } from '@/api/manage'

export default {
  name: 'LeaveResumptionModal',
  components: { LeaveResumptionApplyForm },
  data() {
    return {
      title: '',
      width: '1100px',
      visible: false,
      disableSubmit: false,
      OK_show: false,
      ok_id: '',
      bfdata: '',
      // 确定高度（非 max-height）：高度需穿过 j-form-container 的 fieldset，
      // 而 Chromium 中 fieldset 仅在“确定高度”下才把高度传给内部子项
      modalBodyStyle: {
        height: 'calc(100vh - 168px)',
        padding: '20px 24px 12px',
      },
      url: {
        submitApproval: '/hr_kq_xjgl/hrKqXjgl/updateSpStatus',
        // 退回（审批不通过，spStatus=4）
        updateRejected: '/hr_kq_xjgl/hrKqXjgl/updateRejected',
      },
      confirmLoading: false,
    }
  },
  computed: {
    currentALL() {
      let perInfo = Vue.ls.get('perInfo')
      return perInfo
    },
  },
  methods: {
    /**
     * 审批操作通用请求（按钮/口径参考 ServiceLeaveModal：审批不通过 / 审批通过，意见选填）
     * @param {String} url - submitApproval（通过）/ updateRejected（退回）
     * @param {String} spStatus - 4=不通过(退回) 2=通过
     * @param {String} confirmText - 二次确认文案
     */
    submitApproval(url, spStatus, confirmText) {
      const that = this
      this.$confirm({
        title: '审批提示',
        content: confirmText,
        onOk() {
          return httpAction(
            url,
            {
              spStatus,
              sprId: that.currentALL.id,
              id: that.ok_id,
              spOpinion: that.$refs.realForm.spdata.bz || '',
            },
            'post'
          ).then((res) => {
            if (res.success) {
              that.$refs.realForm.spdata = { bz: '', spr: '', spResult: 'approved' }
              that.$message.success(res.message)
              that.$emit('ok')
              that.visible = false
              that.OK_show = false
            } else {
              that.$message.warning(res.message)
            }
          })
        },
        onCancel() {},
      })
    },

    /**
     * 审批不通过（退回，spStatus=4，走 updateRejected，审批意见选填）
     */
    okReturn() {
      this.submitApproval(this.url.updateRejected, '4', '是否确认不通过？')
    },

    /**
     * 审批通过（spStatus=2，走 updateSpStatus，审批意见选填）
     */
    okUP() {
      this.submitApproval(this.url.submitApproval, '2', '是否确认审批通过？')
    },

    /**
     * 新增模式
     */
    add() {
      this.title = '新增销假'
      this.visible = true
      this.$nextTick(() => {
        this.OK_show = false
        this.disableSubmit = false
        this.$refs.realForm.add()
      })
    },

    /**
     * 编辑/审批/详情模式
     * @param {Object} record - 当前数据行
     */
    edit(record) {
      this.visible = true
      this.$nextTick(() => {
        this.OK_show = false

        if (this.title === '审批') {
          this.OK_show = true
          this.disableSubmit = true
          this.$refs.realForm.spdata = { bz: '', spr: '', spResult: 'approved' }
          this.$refs.realForm.spdata = { ...this.$refs.realForm.spdata, ...record }
          this.$refs.realForm.spdata.bz = ''
        } else if (this.title === '详情') {
          this.OK_show = false
          this.disableSubmit = true
        } else {
          // 编辑模式（修改重申）
          this.OK_show = false
          this.disableSubmit = false
        }

        this.bfdata = record
        this.ok_id = record.id
        this.$refs.realForm.edit(record)
      })
    },

    /**
     * 关闭弹窗
     */
    close() {
      this.$emit('close')
      this.visible = false
    },

    /**
     * 确认按钮（新增/编辑模式下触发）
     */
    handleOk() {
      this.$refs.realForm.submitForm()
    },

    /**
     * 表单提交回调
     */
    submitCallback() {
      this.$emit('ok')
      this.visible = false
      this.confirmLoading = false
    },

    /**
     * 取消按钮
     */
    handleCancel() {
      this.close()
    },
  },
}
</script>

<style lang="less" scoped>
/* 统一的 Modal 样式（参考 ServiceLeaveModal.vue） */
::v-deep .attendance-rule-modal .ant-modal-content {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(45, 120, 255, 0.12), 0 0 40px rgba(45, 120, 255, 0.04);
}

::v-deep .attendance-rule-modal .ant-modal-header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  border-bottom: 0;
}

::v-deep .attendance-rule-modal .ant-modal-title,
::v-deep .attendance-rule-modal .j-modal-title-row .left {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

::v-deep .attendance-rule-modal .ant-modal-close {
  top: 10px;
  right: 14px;
  width: 32px;
  height: 32px;
  color: #fff;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

::v-deep .attendance-rule-modal .ant-modal-close:hover {
  background: rgba(255, 255, 255, 0.35);
}

::v-deep .attendance-rule-modal .ant-modal-close-x {
  width: 32px;
  height: 32px;
  line-height: 32px;
}

/* 隐藏放大按钮 */
::v-deep .attendance-rule-modal .j-modal-title-row .right,
::v-deep .attendance-rule-modal .j-modal-title-row .anticon-switcher {
  display: none;
}

::v-deep .attendance-rule-modal .ant-modal-body {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
}

/* flex 高度链：a-spin 包装层、j-form-container 的 div 用 flex:1；fieldset 是
   Chromium 特殊元素，flex 高度无法穿过它传给内部表单，故 fieldset 用显式 height:100% */
::v-deep .attendance-rule-modal .ant-spin-nested-loading,
::v-deep .attendance-rule-modal .ant-spin-container,
::v-deep .attendance-rule-modal .ant-spin-container > div {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

::v-deep .attendance-rule-modal .ant-spin-container > div > fieldset:first-child {
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

::v-deep .attendance-rule-modal .ant-modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn {
  height: 34px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-danger {
  border: 0;
  color: #fff;
  background: linear-gradient(135deg, #fc211a 0%, #ff9362 100%) !important;
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
}
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-danger:hover,
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-danger:focus {
  color: #fff;
  background: linear-gradient(135deg, #fc211a 0%, #ff9362 100%) !important;
  opacity: 0.92;
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary {
  border: 0;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary:hover,
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary:focus {
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  opacity: 0.92;
}
</style>
