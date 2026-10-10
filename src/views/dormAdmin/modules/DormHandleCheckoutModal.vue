<template>
  <a-modal
    title="退宿确认"
    :visible="visible"
    :width="420"
    :confirmLoading="confirmLoading"
    :maskClosable="false"
    :destroyOnClose="true"
    :bodyStyle="{ padding: '20px 24px' }"
    @ok="handleOk"
    @cancel="handleCancel"
    centered
  >
    <template slot="footer">
      <a-button key="cancel" @click="handleCancel">取消</a-button>
      <a-button key="ok" type="primary" :loading="confirmLoading" @click="handleOk">确认退宿</a-button>
    </template>

    <div class="confirm-box">
      <div class="confirm-icon">
        <a-icon type="exclamation-circle" :style="{ fontSize: '24px', color: '#ef4444' }" />
      </div>
      <div class="confirm-text">是否确认 <b>「{{ empName }}」</b> 退宿？</div>
      <div class="confirm-text">确认后将释放 <b>{{ dormText }}</b> 的床位，并自动记录退宿日期：<b>{{ today }}</b>。</div>
    </div>
  </a-modal>
</template>

<script>
import moment from 'moment'
import { putAction } from '@/api/manage'

export default {
  name: 'DormHandleCheckoutModal',
  data() {
    return {
      visible: false,
      confirmLoading: false,
      recordId: '',
      empName: '—',
      dormText: '—',
      today: moment().format('YYYY-MM-DD'),
    }
  },
  methods: {
    open(record) {
      this.visible = true
      this.confirmLoading = false
      this.recordId = record.id || ''
      this.empName = record.empName || '—'
      const parts = [record.areaName, record.buildingName, record.roomName].filter(Boolean)
      this.dormText = parts.length ? parts.join(' / ') : '—'
      this.today = moment().format('YYYY-MM-DD')
    },
    handleOk() {
      this.confirmLoading = true
      putAction('/sqgl/approval/handleCheckout?id=' + encodeURIComponent(this.recordId), {})
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '办理成功！')
            this.$emit('ok')
            this.visible = false
          } else {
            this.$message.warning(res.message || '办理失败')
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
.confirm-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 20px 12px;
  text-align: center;
}
.confirm-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.1);
  flex-shrink: 0;
}
.confirm-text {
  font-size: 14px;
  color: #1a2a3d;
  line-height: 1.7;
  b {
    color: #2563eb;
    font-weight: 600;
  }
}
</style>
