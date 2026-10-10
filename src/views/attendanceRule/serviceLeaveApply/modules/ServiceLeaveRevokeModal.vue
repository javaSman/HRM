<template>
  <!--
    ServiceLeaveRevokeModal.vue
    工龄年假申请-撤回弹窗
    接口：POST /hr_kq_glnjsq/hrKqGlnjsq/updateWithdraw
    body: { id, spOpinion }，撤回原因选填；仅审批中(spStatus=1)可撤回，撤回后 spStatus=3
  -->
  <a-modal
    :visible="visible"
    :width="440"
    :confirmLoading="confirmLoading"
    :closable="false"
    :maskClosable="false"
    wrapClassName="service-leave-revoke-modal"
    @cancel="handleCancel"
  >
    <div class="revoke-modal-body">
      <div class="revoke-modal-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <div class="revoke-modal-title">确认撤回</div>
      <div class="revoke-modal-desc">撤回后该申请将变为「已撤回」状态，确定要撤回吗？</div>
      <div class="revoke-modal-label">撤回原因</div>
      <a-textarea
        v-model="formData.spOpinion"
        class="revoke-modal-textarea"
        placeholder="请输入撤回原因（选填）"
        :rows="3"
        :maxLength="500"
      />
    </div>

    <template slot="footer">
      <div class="revoke-modal-footer">
        <button class="revoke-btn revoke-btn-default" @click="handleCancel">取消</button>
        <button class="revoke-btn revoke-btn-danger" :disabled="confirmLoading" @click="handleOk">
          {{ confirmLoading ? '提交中...' : '确认撤回' }}
        </button>
      </div>
    </template>
  </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'

export default {
  name: 'ServiceLeaveRevokeModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    record: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      confirmLoading: false,
      formData: {
        spOpinion: '',
      },
      url: {
        withdraw: '/hr_kq_glnjsq/hrKqGlnjsq/updateWithdraw',
      },
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.formData.spOpinion = ''
      }
    },
  },
  methods: {
    handleOk() {
      this.confirmLoading = true
      httpAction(
        this.url.withdraw,
        {
          id: this.record.id,
          spOpinion: this.formData.spOpinion,
        },
        'post'
      )
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.$emit('ok')
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },

    handleCancel() {
      if (this.confirmLoading) return
      this.$emit('cancel')
    },
  },
}
</script>

<style lang="less">
/* 弹窗 teleport 到 body，需使用全局样式 + wrapClassName 限定范围 */
.service-leave-revoke-modal {
  .ant-modal-content {
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(37, 99, 235, 0.06);
  }

  .ant-modal-body {
    padding: 28px 24px 20px;
  }

  .revoke-modal-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(249, 115, 22, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;

    svg {
      width: 24px;
      height: 24px;
      color: #f97316;
    }
  }

  .revoke-modal-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a2a3d;
    text-align: center;
    margin-bottom: 8px;
  }

  .revoke-modal-desc {
    font-size: 13px;
    color: #64748b;
    text-align: center;
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .revoke-modal-label {
    font-size: 13px;
    font-weight: 500;
    color: #1a2a3d;
    margin-bottom: 8px;
  }

  .revoke-modal-textarea {
    min-height: 80px !important;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.5;
    resize: vertical;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  }

  .ant-modal-footer {
    padding: 12px 24px;
    border-top: 1px solid #e2e8f0;
  }

  .revoke-modal-footer {
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  .revoke-btn {
    min-width: 120px;
    height: 36px;
    padding: 0 20px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .revoke-btn-default {
    background: #ffffff;
    color: #1a2a3d;
    border: 1px solid rgba(37, 99, 235, 0.15);

    &:hover {
      background: rgba(37, 99, 235, 0.05);
      border-color: rgba(37, 99, 235, 0.25);
      color: #2563eb;
    }
  }

  .revoke-btn-danger {
    background: #ffffff;
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);

    &:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.05);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>
