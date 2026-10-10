<template>
  <a-modal
    :visible="visible"
    :width="440"
    :confirmLoading="confirmLoading"
    :closable="false"
    :maskClosable="false"
    wrapClassName="revoke-confirm-modal"
    @cancel="handleCancel"
  >
    <div class="cancel-modal-body">
      <div class="cancel-modal-icon">
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
      <div class="cancel-modal-title">确认撤回</div>
      <div class="cancel-modal-desc">撤回后申请将失效，确定要撤回吗？</div>
      <div class="cancel-modal-label">撤回原因</div>
      <a-textarea
        v-model="formData.spOpinion"
        class="cancel-modal-textarea"
        placeholder="请输入撤回原因（选填）"
        :rows="3"
        :maxLength="500"
      />
    </div>

    <template slot="footer">
      <div class="cancel-modal-footer">
        <button class="cancel-btn cancel-btn-default" @click="handleCancel">取消</button>
        <button class="cancel-btn cancel-btn-danger" :disabled="confirmLoading" @click="handleOk">
          {{ confirmLoading ? '提交中...' : '确认撤回' }}
        </button>
      </div>
    </template>
  </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'

export default {
  name: 'HrRevokeModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    record: {
      type: Object,
      default: () => ({}),
    },
    isDeduct: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      confirmLoading: false,
      formData: {
        spOpinion: '',
      },
      url: {
        withdraw: '/hr_xjsq/hrXjsq/updateWithdraw',
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
        this.isDeduct ? '/hrHolidayDeduct/hrHolidayDeduct/updateWithdraw' : this.url.withdraw,
        {
          ...this.record,
          spStatus: 3,
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
.revoke-confirm-modal {
  .ant-modal-content {
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(37, 99, 235, 0.06);
  }

  .ant-modal-body {
    padding: 28px 24px 20px;
  }

  .cancel-modal-icon {
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

  .cancel-modal-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a2a3d;
    text-align: center;
    margin-bottom: 8px;
  }

  .cancel-modal-desc {
    font-size: 13px;
    color: #64748b;
    text-align: center;
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .cancel-modal-label {
    font-size: 13px;
    font-weight: 500;
    color: #1a2a3d;
    margin-bottom: 8px;
  }

  .cancel-modal-textarea {
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

  .cancel-modal-footer {
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  .cancel-btn {
    min-width: 120px;
    height: 36px;
    padding: 0 20px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .cancel-btn-default {
    background: #ffffff;
    color: #1a2a3d;
    border: 1px solid rgba(37, 99, 235, 0.15);

    &:hover {
      background: rgba(37, 99, 235, 0.05);
      border-color: rgba(37, 99, 235, 0.25);
      color: #2563eb;
    }
  }

  .cancel-btn-danger {
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
