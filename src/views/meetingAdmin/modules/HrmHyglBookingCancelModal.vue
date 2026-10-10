<template>
  <a-modal
    title="取消会议预约"
    :width="420"
    :visible="visible"
    :footer="null"
    :destroyOnClose="true"
    :maskClosable="false"
    centered
    @cancel="handleCancel"
  >
    <div class="cancel-body">
      <div class="summary-box">
        <div class="summary-row"><span class="lbl">会议主题</span><span class="val">{{ record.topic || '—' }}</span></div>
        <div class="summary-row"><span class="lbl">会议室</span><span class="val">{{ record.roomName || '—' }}</span></div>
        <div class="summary-row"><span class="lbl">时间</span><span class="val">{{ timeText }}</span></div>
      </div>
      <p class="cancel-tip">确认要取消该会议预约吗？取消后该时段将释放为可预约状态，此操作不可撤销。</p>
    </div>
    <div class="cancel-footer">
      <a-button class="h-btn h-btn-secondary" @click="handleCancel"><a-icon type="close" />暂不取消</a-button>
      <a-button class="h-btn h-btn-danger-confirm" :loading="confirmLoading" @click="handleConfirm"><a-icon type="check" />确认取消</a-button>
    </div>
  </a-modal>
</template>

<script>
import { putAction } from '@/api/manage'

export default {
  name: 'HrmHyglBookingCancelModal',
  data() {
    return {
      visible: false,
      confirmLoading: false,
      record: {},
      url: {
        cancel: '/hygl/hrmHyglBooking/cancel',
      },
    }
  },
  computed: {
    timeText() {
      if (!this.record.startTime) return '—'
      const start = this.record.startTime
      const end = this.record.endTime
      if (!end) return start
      // 格式: "2026-08-04 09:00 - 10:00" (同一天) 或 "2026-08-04 09:00 - 2026-08-05 10:00" (跨天)
      const startDate = start.split(' ')[0]
      const endDate = end.split(' ')[0]
      if (startDate === endDate) {
        const startTime = start.split(' ')[1] || ''
        const endTime = end.split(' ')[1] || ''
        return startDate + ' ' + startTime + ' - ' + endTime
      }
      return start + ' - ' + end
    },
  },
  methods: {
    show(record) {
      this.record = Object.assign({}, record)
      this.visible = true
    },
    handleConfirm() {
      const that = this
      that.confirmLoading = true
      putAction(that.url.cancel + '?id=' + that.record.id).then((res) => {
        if (res.success) {
          that.$message.success(res.message || '取消成功')
          that.$emit('ok')
          that.visible = false
        } else {
          that.$message.warning(res.message || '取消失败')
        }
      }).finally(() => {
        that.confirmLoading = false
      })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
@import '../hygl-theme.less';

.cancel-body {
  padding: 4px 0 0;
}
.summary-box {
  background: rgba(@h-primary-rgb, 0.04);
  border: 1px solid rgba(@h-primary-rgb, 0.12);
  border-radius: 8px;
  padding: 14px 16px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-size: 12.5px;
  .lbl { color: @h-muted-foreground; font-weight: 500; }
  .val { color: @h-foreground; font-weight: 600; font-variant-numeric: tabular-nums; }
}
.cancel-tip {
  margin-top: 14px;
  font-size: 13px;
  color: @h-muted-foreground;
  line-height: 1.6;
}
.cancel-footer {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
