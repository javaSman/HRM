<template>
  <a-modal
    title="放行确认"
    :width="500"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :footer="null"
    :bodyStyle="{ padding: '0px 24px 14px' }"
    @cancel="handleCancel"
    cancelText="取消"
  >
    <a-form style="padding-bottom: 24px">
      <a-form-item label="放行人">
        <div class="v-display-field">{{ record.fxr || '—' }}</div>
      </a-form-item>
      <a-form-item label="物品名称及数量">
        <div class="v-display-field">{{ goodsText || '—' }}</div>
      </a-form-item>
      <a-form-item label="放行日期">
        <div class="v-display-field">{{ formatDate(record.fxrq) }}</div>
      </a-form-item>
      <a-form-item label="放行区域">
        <div class="v-display-field">{{ record.fxqr_dictText || record.fxqr || '—' }}</div>
      </a-form-item>
    </a-form>
    <div class="v-review-footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" icon="check" @click="handleConfirm" :loading="confirmLoading">确认</a-button>
    </div>
  </a-modal>
</template>

<script>
import { putAction } from '@/api/manage'
import { formatDate } from '@/utils/util'
export default {
  name: 'PassSlipRelease',
  data() {
    return {
      visible: false,
      confirmLoading: false,
      record: {},
    }
  },
  computed: {
    goodsText() {
      var list = this.record.wpxxList || []
      if (list.length > 0) {
        return list
          .map(function (item) {
            return (item.wpmc || '') + ' x ' + (item.wpsl || 0)
          })
          .join('，')
      }
      return this.record.wpmc ? this.record.wpmc + (this.record.wpsl ? ' x ' + this.record.wpsl : '') : ''
    },
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '—'
      return String(dateStr).split(' ')[0].split('T')[0]
    },
    show(record) {
      this.record = record || {}
      this.visible = true
    },
    handleConfirm() {
      this.confirmLoading = true
      var params = {
        id: this.record.id,
        fxsj: formatDate(Date.now(), 'yyyy-MM-dd hh:mm:ss'),
        fxzt: '1',
      }
      putAction('/fkzx/hrmFxtsqxx/edit', params)
        .then(
          function (res) {
            if (res.success) {
              this.$message.success('放行成功')
              this.visible = false
              this.$emit('ok')
            } else {
              this.$message.warning(res.message || '放行失败')
            }
          }.bind(this)
        )
        .catch(
          function () {
            this.$message.error('放行失败')
          }.bind(this)
        )
        .finally(
          function () {
            this.confirmLoading = false
          }.bind(this)
        )
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
.ant-form-item {
  margin-bottom: 0;
}
.v-display-field {
  border: 1px solid #e2e8f0;
  background: #fbfcff;
  border-radius: 6px;
  padding: 5px 12px;
  min-height: 32px;
  font-size: 13px;
  color: #1e293b;
  word-break: break-all;
  line-height: 22px;
}
.v-review-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}
</style>

