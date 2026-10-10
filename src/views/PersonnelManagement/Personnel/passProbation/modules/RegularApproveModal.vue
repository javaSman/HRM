<template>
  <j-modal
    title="转正审批"
    :width="560"
    :visible="visible"
    :confirmLoading="loading"
    :bodyStyle="{ padding: '18px 24px 8px' }"
    @cancel="close"
  >
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">申请人</span>
        <span class="info-value">{{ formatValue(record.createBy) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">员工姓名</span>
        <span class="info-value">{{ formatValue(record.xm) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">所属部门</span>
        <span class="info-value">{{ formatValue(record.dept_dictText) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">岗位名称</span>
        <span class="info-value">{{ formatValue(record.postId_dictText) }}</span>
      </div>
    </div>
    <a-form-model layout="vertical" class="approve-form">
      <a-form-model-item label="审批意见" required>
        <a-textarea v-model.trim="opinion" :autoSize="{ minRows: 4, maxRows: 6 }" placeholder="请输入审批意见" />
      </a-form-model-item>
    </a-form-model>
    <template slot="footer">
      <a-button @click="close">取消</a-button>
      <a-button type="danger" :loading="loading" @click="handleReject">不通过</a-button>
      <a-button type="primary" :loading="loading" @click="handleApprove">通过</a-button>
    </template>
  </j-modal>
</template>

<script>
import { postAction } from '@/api/manage'
import Vue from 'vue'
export default {
  name: 'RegularApproveModal',
  data() {
    return {
      visible: false,
      loading: false,
      record: {},
      opinion: '',
      url: {
        approve: '/ryManage/hrmSyqgzFqzzsq/approve',
        edit: '/ryManage/hrmSyqgzFqzzsq/edit',
      },
    }
  },
  methods: {
    open(record) {
      this.record = record || {}
      this.opinion = ''
      this.visible = true
    },
    close() {
      if (this.loading) return
      this.visible = false
    },
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    },
    handleApprove() {
      if (!this.opinion) {
        this.$message.warning('请填写审批意见')
        return
      }
      this.submitApprove()
    },
    handleReject() {
      if (!this.opinion) {
        this.$message.warning('请填写审批意见')
        return
      }
      this.submitReject()
    },
    submitApprove() {
      const perInfo = Vue.ls.get('perInfo') || {}
      this.loading = true
      postAction(this.url.approve, {
        ...this.record,
        spyj: this.opinion,
        zt: '已转正',
        spr: perInfo.id
      })
        .then((res) => {
          if (!res || !res.success) {
            throw new Error((res && res.message) || '审批操作失败')
          }
          this.$message.success(res.message || '审批成功')
          this.visible = false
          this.$emit('ok')
        })
        .catch((error) => {
          this.$message.error(error.message || '审批操作失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    submitReject() {
      this.loading = true
      postAction(this.url.edit, {
        ...this.record,
        spyj: this.opinion,
        zt: '拒绝转正',
      })
        .then((res) => {
          if (!res || !res.success) {
            throw new Error((res && res.message) || '审批操作失败')
          }
          this.$message.success(res.message || '审批成功')
          this.visible = false
          this.$emit('ok')
        })
        .catch((error) => {
          this.$message.error(error.message || '审批操作失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<style scoped>
.info-grid {
  display: grid;
  margin-bottom: 16px;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  min-height: 48px;
  padding: 9px 12px;
  border-radius: 4px;
  /* background: #f7f8fa; */
}

.info-label {
  display: block;
  margin-bottom: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

.info-value {
  color: #262626;
  font-size: 13px;
}

.approve-form {
  margin-top: 6px;
}
</style>

