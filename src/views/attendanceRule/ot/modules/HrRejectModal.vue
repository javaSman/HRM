<template>
  <!--
    HrRejectModal.vue
    退回申请弹窗组件
    功能：审批人点击「退回」时弹出，填写退回原因
    支持两种退回方式：退回上一环 / 退回填报人
  -->
  <j-modal title="退回申请" :visible="ShowZF" @cancel="out" :width="520" wrapClassName="attendance-rule-modal"
    :bodyStyle="{ padding: '20px 24px' }" :dialogStyle="{ top: '16px' }" cancelText="关闭">
    <a-form-model :model="ZFAll">
      <!-- 退回原因 -->
      <a-form-model-item label="退回原因" :labelCol="{ xs: { span: 24 }, sm: { span: 7 } }"
        :wrapperCol="{ xs: { span: 24 }, sm: { span: 16 } }">
        <a-textarea v-model="ZFAll.cancelReason" placeholder="请输入退回原因" :auto-size="{ minRows: 2 }"></a-textarea>
      </a-form-model-item>
    </a-form-model>

    <template slot="footer">
      <a-button key="back" @click="out">取消</a-button>
      <!-- 当前节点非第一环时，显示「退回上一环」 -->
      <a-button v-if="ZFAll.approvalStatus > 1" type="primary" @click="handleOkZF(0)">
        退回上一环
      </a-button>
      <!-- 一律可退回填报人 -->
      <a-button type="danger" @click="handleOkZF(1)">
        退回填报人
      </a-button>
    </template>
  </j-modal>
</template>

<script>
/**
 * 退回弹窗组件
 * 复用自 ZhyqTbauditList 的 thall.vue，按加班申请模块调整
 */
import { httpAction, postAction } from '@/api/manage'

export default {
  name: 'HrRejectModal',
  props: {
    // 被退回的申请数据
    ZFAll: {
      type: Object,
      default: () => ({}),
      required: false
    },
    // 是否显示弹窗
    ShowZF: {
      type: Boolean,
      default: false,
      required: false
    },
    // 当前审批节点（1=部门经理 2=HR）
    LCstate: {
      type: Number,
      default: 0,
      required: false
    }
  },
  data() {
    return {
      // TODO: 替换真实接口路径
      url: {
        // 退回接口：/hr/attendance/jbApplication/goBack?id=xxx&bz=xxx&choice=0/1
        goBack: '/hr/attendance/jbApplication/goBack'
      }
    }
  },
  methods: {
    /**
     * 关闭弹窗
     */
    out() {
      this.$emit('goBack', false)
    },

    /**
     * 确认退回
     * @param {Number} num - 0=退回上一环 1=退回填报人（回到待提交）
     * TODO: 替换为真实接口调用
     */
    handleOkZF(num) {
      const bz = this.ZFAll.cancelReason || ''
      // ===== 假数据操作（开发阶段，接入真实接口后删除） =====
      this.$message.success(num === 1 ? '已退回填报人' : '已退回上一环')
      this.$emit('goBack', false)
      // ===== 假数据结束 =====

      // ===== 真实接口调用（接入时取消注释） =====
      // httpAction(
      //   `${this.url.goBack}?id=${this.ZFAll.id}&bz=${bz}&choice=${num}`,
      //   '',
      //   'post'
      // ).then((res) => {
      //   if (res.success) {
      //     this.$message.success(res.message)
      //     this.$emit('goBack', false)
      //   } else {
      //     this.$message.warning(res.message)
      //   }
      // }).finally(() => {})
      // ===== 真实接口结束 =====
    }
  }
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

::v-deep .attendance-rule-modal .ant-modal-body {
  padding: 20px 24px;
  max-height: calc(85vh - 116px);
  overflow-y: auto;
  background: #f8fafc;
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
