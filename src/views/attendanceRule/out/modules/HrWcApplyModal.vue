<template>
  <!--
    HrWcApplyModal.vue
    外出申请弹窗组件
    功能：统一弹窗，根据 title 区分模式：
      - 新增/编辑：显示表单 + 提交申请按钮
      - 审批：显示表单（只读）+ 审批原因输入 + 通过/不通过按钮
      - 详情：显示表单（只读）
    title 由父组件传递：'新增' / '编辑' / '审批' / '详情'
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
    <!-- 外出申请表（左右两栏布局） -->
    <hr-wc-apply-form
      ref="realForm"
      @ok="submitCallback"
      @submit="(loading) => (confirmLoading = loading)"
      :disabled="disableSubmit"
      :title="title"
      :OK_show="OK_show"
    ></hr-wc-apply-form>

    <!-- 底部按钮 -->
    <template slot="footer">
      <!-- 取消按钮：所有模式都显示 -->
      <a-button key="back" class="modal-cancel-btn" @click="handleCancel">取消</a-button>

      <!-- 新增/编辑模式：显示「提交申请」按钮 -->
      <a-button
        v-if="title === '新增' || title === '编辑'"
        key="submit"
        type="primary"
        :loading="confirmLoading"
        @click="handleOk"
      >
        {{ title == '编辑' ? '修改并提交' : '提交申请' }}
      </a-button>

      <!-- 审批模式下显示审批按钮 -->
      <template v-if="OK_show">
        <a-button type="danger" @click="okDow">审批不通过</a-button>
        <a-button type="primary" @click="okUP">审批通过</a-button>
      </template>
    </template>
  </j-modal>
</template>

<script>
/**
 * 外出申请弹窗组件
 *
 * 标题与模式对应：
 *   - 新增：表单可编辑 + 提交申请按钮
 *   - 编辑：表单可编辑 + 提交申请按钮
 *   - 审批：表单只读 + 审批原因 + 通过/不通过
 *   - 详情：表单只读 + 无操作按钮
 */
import Vue from 'vue'
import HrWcApplyForm from './HrWcApplyForm'
import { httpAction } from '@/api/manage'

export default {
  name: 'HrWcApplyModal',
  components: { HrWcApplyForm },
  data() {
    return {
      title: '',
      width: '960px',
      visible: false,
      // 是否禁用提交按钮（审批/详情模式禁用）
      disableSubmit: false,
      // 是否显示审批操作按钮（审批模式显示）
      OK_show: false,
      ok_id: '',
      bfdata: '',
      // Modal 内容样式
      modalBodyStyle: {
        maxHeight: 'calc(100vh - 168px)',
        overflowY: 'auto',
        padding: '20px 24px 12px',
      },
      // 提交接口路径
      url: {
        submitApproval: '/hr_wc_application/hrWcApplication/updateSpStatus',
      },
      // 提交加载状态
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
     * 审批不通过 已退回
     * spStatus=4,
     */
    okDow() {
      const that = this
      if (!that.$refs.realForm.model.reason) {
        that.$message.warning('请输入审批意见')
        return
      }
      this.$confirm({
        title: '审批提示',
        content: '是否确认退回',
        onOk() {
          // ===== 真实接口调用（接入时取消注释） =====
          httpAction(
            `${that.url.submitApproval}`,
            {
              spStatus: '4',
              sprId: that.currentALL.id,
              hrWcApplicationId: that.ok_id,
              spOpinion: that.$refs.realForm.model.reason,
            },
            'post'
          )
            .then((res) => {
              if (res.success) {
                that.$refs.realForm.model.reason = ''
                that.$message.success(res.message)
                that.$emit('ok')
                that.visible = false
                that.OK_show = false
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {})
          // ===== 真实接口结束 =====
        },
        onCancel() {},
      })
    },

    /**
     * 审批通过
     * 根据 spFlow 判断流转到下一节点
     * spFlow: 1=部门经理 2=HR 3=抄送人
     * spStatus: 1=审批中 2=已通过
     */
    okUP() {
      const that = this
      if (!that.$refs.realForm.model.reason) {
        that.$message.warning('请输入审批意见')
        return
      }

      this.$confirm({
        title: '审批提示',
        content: '是否确认审批通过',
        onOk() {
          // ===== 真实接口调用（接入时取消注释） =====
          httpAction(
            `${that.url.submitApproval}`,
            {
              spStatus: '2',
              sprId: that.currentALL.id,
              hrWcApplicationId: that.ok_id,
              spOpinion: that.$refs.realForm.model.reason,
            },
            'post'
          )
            .then((res) => {
              if (res.success) {
                that.$refs.realForm.model.reason = ''
                that.$message.success(res.message)
                that.$emit('ok')
                that.visible = false
                that.OK_show = false
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {})
          // ===== 真实接口结束 =====
        },
        onCancel() {},
      })
    },

    /**
     * 新增模式
     */
    add() {
      this.visible = true
      this.$nextTick(() => {
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
          // 审批模式：表单只读 + 显示审批按钮
          this.OK_show = true
          this.disableSubmit = true
          // 重置审批意见字段
          this.$refs.realForm.model.reason = ''
        } else if (this.title === '详情') {
          // 详情模式：表单只读
          this.OK_show = false
          this.disableSubmit = true
        } else {
          // 新增/编辑模式：表单可编辑
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
/* 统一的 Modal 样式 */
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
  padding: 20px 24px;
  max-height: calc(85vh - 116px);
  overflow-y: auto;
  background: #ffffff;
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

/* 审批按钮样式 */
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-danger {
  border-radius: 8px;
  font-weight: 600;
}
</style>
