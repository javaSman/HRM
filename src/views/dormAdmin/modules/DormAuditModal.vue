<template>
  <a-modal
    title="审核"
    :visible="visible"
    :width="560"
    :destroyOnClose="true"
    :maskClosable="false"
    centered
    :bodyStyle="{ maxHeight: '72vh', overflow: 'auto', padding: '20px 24px' }"
    @cancel="close"
  >
    <a-spin :spinning="loading" tip="加载中...">
      <div class="sqgl-audit-wrap">
        <!-- 申请信息回显 -->
        <div class="sqgl-sec-title">申请信息</div>
        <div class="sqgl-audit-card">
          <div class="sqgl-audit-row" v-for="row in detailRows" :key="row.label">
            <div class="lbl">{{ row.label }}</div>
            <div class="val" v-html="row.value"></div>
          </div>
        </div>

        <!-- 原因（独立展示，对应原型 detailFieldsHtml 之外的 reason 组） -->
        <div class="sqgl-sec-title" style="margin-top: 16px">{{ reasonLabel }}</div>
        <div class="sqgl-reason-text">{{ reasonText }}</div>

        <!-- 卫生照片（退宿审核） -->
        <template v-if="applyType === '2'">
          <div class="sqgl-sec-title" style="margin-top: 16px">卫生照片</div>
          <div class="sqgl-photo-list" v-if="photoList.length">
            <img v-for="(url, i) in photoList" :key="i" :src="url" @click="previewPhoto(url)" />
          </div>
          <div class="sqgl-empty-hint" v-else>—</div>
        </template>

        <!-- 审核意见 -->
        <div class="sqgl-sec-title" style="margin-top: 16px">审核意见</div>
        <a-textarea v-model.trim="opinion" :rows="4" placeholder="请输入审核意见（选填）" :maxLength="500" />
      </div>
    </a-spin>

    <template slot="footer">
      <a-button @click="close">取消</a-button>
      <a-button class="sqgl-btn-reject" :loading="rejectLoading" @click="handleAudit('4')">不同意</a-button>
      <a-button type="primary" :loading="approveLoading" @click="handleAudit('1')">同意</a-button>
    </template>
  </a-modal>
</template>

<script>
import moment from 'moment'
import Vue from 'vue'
import { getAction, putAction, getFileAccessHttpUrl } from '@/api/manage'

const STATUS_LABEL = { 0: '审批中', 1: '已通过', 2: '已办理', 3: '已撤回', 4: '不通过' }

export default {
  name: 'DormAuditModal',
  data() {
    return {
      visible: false,
      loading: false,
      approveLoading: false,
      rejectLoading: false,
      applyType: '0',
      detail: {},
      opinion: '',
    }
  },
  computed: {
    detailRows() {
      const d = this.detail
      if (!d || !d.id) return []
      const dash = (v) => (v === 0 ? '0' : v || '—')
      const fmtTime = (v) => (v ? moment(v).format('YYYY-MM-DD HH:mm') : '—')
      const fmtDate = (v) => (v ? moment(v).format('YYYY-MM-DD') : '—')
      const statusRow = {
        label: '状态',
        value: `<span class="sqgl-status-tag ${this.statusCls(d.status)}">${
          d.statusLabel || STATUS_LABEL[d.status] || d.status || '—'
        }</span>`,
      }
      if (this.applyType === '0') {
        // 入住审核：区域、楼栋、宿舍、领取物品、入住人、入住日期、[配偶三项]、申请时间、状态、备注
        const rows = [
          { label: '区域', value: dash(d.areaName) },
          // { label: '楼栋', value: dash(d.buildingName) },
          // { label: '宿舍', value: dash(d.roomName) },
          // { label: '领取物品', value: this.itemsText(d.items) },
          { label: '入住人', value: dash(d.empName) },
          { label: '入住日期', value: fmtDate(d.checkinDate) },
        ]
        if (d.dormType === '1') {
          rows.push(
            { label: '配偶姓名', value: dash(d.spouseName) },
            { label: '配偶联系方式', value: dash(d.spousePhone) },
            { label: '配偶身份证', value: dash(d.spouseIdcard) }
          )
        }
        rows.push(
          { label: '申请时间', value: fmtTime(d.applyTime) },
          statusRow
          // { label: '备注', value: dash(d.remark) }
        )
        return rows
      }
      if (this.applyType === '1') {
        // 调宿审核：公司、部门、申请人、工号、原宿舍、调宿后区域、调宿入住日期、申请时间、状态
        return [
          { label: '公司', value: dash(d.company) },
          { label: '部门', value: dash(d.dept) },
          { label: '申请人', value: dash(d.empName) },
          { label: '工号', value: dash(d.empNo) },
          { label: '原宿舍', value: this.joinDorm(d.oldAreaName, d.oldBuildingName, d.oldRoomName) },
          { label: '调宿后区域', value: this.joinDorm(d.areaName, d.buildingName, d.roomName) },
          { label: '调宿入住日期', value: fmtDate(d.tsDate) },
          { label: '申请时间', value: fmtTime(d.applyTime) },
          statusRow,
        ]
      }
      // 退宿审核：宿舍区域、楼栋、宿舍、申请人、工号、部门、入住日期、申请时间、预计退宿日期、状态
      return [
        { label: '宿舍区域', value: dash(d.areaName) },
        { label: '楼栋', value: dash(d.buildingName) },
        { label: '宿舍', value: dash(d.roomName) },
        { label: '申请人', value: dash(d.empName) },
        { label: '工号', value: dash(d.empNo) },
        { label: '部门', value: dash(d.dept) },
        { label: '入住日期', value: fmtDate(d.checkinDate) },
        { label: '申请时间', value: fmtTime(d.applyTime) },
        { label: '预计退宿日期', value: fmtDate(d.expectedLeaveDate) },
        statusRow,
      ]
    },
    reasonLabel() {
      return { 0: '入住原因', 1: '调宿原因', 2: '退宿原因' }[this.applyType] || '原因'
    },
    reasonText() {
      return this.applyType === '0'
        ? this.detail.reason || '—'
        : this.applyType === '1'
        ? this.detail.transferReason || '—'
        : this.detail.checkoutReason || '—'
    },

    photoList() {
      const raw = this.detail.healthPhotos
      if (!raw) return []
      try {
        const arr = JSON.parse(raw)
        return (arr || []).map((u) => getFileAccessHttpUrl(u)).filter(Boolean)
      } catch (e) {
        return raw
          .split(',')
          .filter(Boolean)
          .map((u) => getFileAccessHttpUrl(u))
      }
    },
  },
  methods: {
    open(id, applyType) {
      this.applyType = applyType
      this.visible = true
      this.detail = {}
      this.opinion = ''
      this.loading = true
      getAction('/sqgl/hrmSqglApply/queryById', { id })
        .then((res) => {
          if (res.success) {
            this.detail = res.result || {}
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    close() {
      this.visible = false
    },
    joinDorm(area, bld, room) {
      const parts = [area, bld, room].filter(Boolean)
      return parts.length ? parts.join(' / ') : '—'
    },
    itemsText(raw) {
      if (!raw) return '—'
      try {
        const arr = JSON.parse(raw)
        return arr && arr.length ? arr.join('、') : '—'
      } catch (e) {
        return raw
      }
    },
    statusCls(code) {
      const map = { 0: 'pending', 1: 'approved', 2: 'handled', 3: 'cancelled', 4: 'rejected' }
      return map[code] || ''
    },
    previewPhoto(url) {
      this.$store.dispatch('openPdf', url)
    },
    handleAudit(result) {
      const loading = result === '1' ? 'approveLoading' : 'rejectLoading'
      this[loading] = true
      const perInfo = Vue.ls.get('perInfo') || {}
      const payload = {
        id: this.detail.id,
        result: result,
        opinion: this.opinion,
        sprId: perInfo.id || '',
      }
      putAction('/sqgl/approval/audit', payload)
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '操作成功！')
            this.$emit('ok')
            this.visible = false
          } else {
            this.$message.warning(res.message || '操作失败')
          }
        })
        .finally(() => {
          this[loading] = false
        })
    },
  },
}
</script>

<style lang="less" scoped>
@sqgl-primary: #2563eb;
@sqgl-primary-rgb: 37, 99, 235;
@sqgl-border: #e2e8f0;
@sqgl-muted-foreground: #64748b;
@sqgl-foreground: #1a2a3d;
@sqgl-red: #ef4444;
@sqgl-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #4a9eff 100%);

.sqgl-audit-wrap {
  padding-bottom: 8px;
}
.sqgl-sec-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(@sqgl-primary-rgb, 0.7);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px;
  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: @sqgl-gradient-blue;
    border-radius: 2px;
  }
}
.sqgl-audit-card {
  background: linear-gradient(135deg, rgba(@sqgl-primary-rgb, 0.04), rgba(@sqgl-primary-rgb, 0.012));
  border: 1px solid rgba(@sqgl-primary-rgb, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
}
.sqgl-audit-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(226, 232, 240, 0.7);
  &:last-child {
    border-bottom: none;
  }
  .lbl {
    width: 110px;
    flex-shrink: 0;
    color: @sqgl-muted-foreground;
    font-size: 13px;
    font-weight: 500;
  }
  .val {
    font-size: 13px;
    color: @sqgl-foreground;
    font-weight: 500;
    flex: 1;
    word-break: break-all;
  }
}
.sqgl-photo-list img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid @sqgl-border;
  margin: 0 6px 6px 0;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: @sqgl-primary;
    box-shadow: 0 2px 8px rgba(45, 120, 255, 0.2);
  }
}
/deep/ .sqgl-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  &.approved,
  &.handled {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }
  &.rejected {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
  }
  &.cancelled {
    background: rgba(100, 116, 139, 0.1);
    color: @sqgl-muted-foreground;
  }
}
.sqgl-reason-text {
  font-size: 13px;
  color: @sqgl-foreground;
  line-height: 1.7;
  padding: 10px 14px;
  background: rgba(@sqgl-primary-rgb, 0.03);
  border: 1px solid rgba(@sqgl-primary-rgb, 0.08);
  border-radius: 8px;
  word-break: break-all;
}
.sqgl-empty-hint {
  color: @sqgl-muted-foreground;
  font-size: 13px;
  padding: 4px 0;
}
.sqgl-btn-reject {
  color: @sqgl-red;
  border-color: rgba(239, 68, 68, 0.4);
  &:hover {
    color: #dc2626;
    border-color: @sqgl-red;
    background: rgba(239, 68, 68, 0.06);
  }
}
</style>

