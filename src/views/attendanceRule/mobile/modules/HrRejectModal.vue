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
                <a-textarea v-model="ZFAll.cancelReason" placeholder="请输入退回原因" :auto-size="{ minRows: 2 }" />
            </a-form-model-item>
        </a-form-model>

        <template slot="footer">
            <a-button @click="out">关闭</a-button>
            <a-button type="danger" @click="handleReject(1)">退回上一环</a-button>
            <a-button type="primary" @click="handleReject(2)">退回填报人</a-button>
        </template>
    </j-modal>
</template>

<script>
/**
 * 退回申请弹窗组件
 * 
 * 功能：
 *   - 审批人点击「退回」时弹出
 *   - 填写退回原因
 *   - 支持两种退回方式：
 *     1. 退回上一环（退回给上一级审批人）
 *     2. 退回填报人（直接退回给申请人）
 */
import { postAction } from '@/api/manage'

export default {
    name: 'HrRejectModal',
    props: {
        ShowZF: { type: Boolean, default: false },
        ZFAll: { type: Object, default: () => ({}) },
        LCstate: { type: Number, default: 0 }
    },
    data() {
        return {}
    },
    methods: {
        /**
         * 关闭弹窗
         */
        out() {
            this.$emit('goBack', false)
        },

        /**
         * 处理退回
         * @param {Number} type - 退回类型：1=退回上一环，2=退回填报人
         */
        handleReject(type) {
            if (!this.ZFAll.cancelReason || this.ZFAll.cancelReason.trim() === '') {
                this.$message.warning('请输入退回原因')
                return
            }

            // 调用退回接口
            const url = '/hr_yddksq/hrYddksq/reject'
            const params = {
                id: this.ZFAll.id,
                cancelReason: this.ZFAll.cancelReason,
                rejectType: type  // 1=退回上一环，2=退回填报人
            }

            postAction(url, params).then(res => {
                if (res.success) {
                    this.$message.success('退回成功')
                    this.$emit('goBack', true)
                } else {
                    this.$message.error(res.message || '退回失败')
                }
            }).catch(err => {
                this.$message.error('退回失败，请稍后重试')
            })
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
