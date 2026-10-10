<template>
  <a-modal
    title="详情"
    :visible="visible"
    :width="820"
    :footer="null"
    :destroyOnClose="true"
    centered
    :bodyStyle="{ maxHeight: '82vh', overflow: 'auto', padding: '20px 24px' }"
    @cancel="close"
  >
    <a-spin :spinning="loading" tip="加载中...">
      <div
        :class="['sqgl-detail-wrap', !hasRightPanel ? 'single-col' : '', shouldLayoutVertical ? 'vertical-layout' : '']"
      >
        <!-- 基本信息 -->
        <div :class="['sqgl-detail-left', applyType !== 'special' && !shouldLayoutVertical ? 'single-style' : '']">
          <div :class="['sqgl-detail-row', row.full ? 'full-row' : '']" v-for="row in detailRows" :key="row.label">
            <div class="lbl">{{ row.label }}</div>
            <div class="val" v-html="row.value" @click="handleValClick"></div>
          </div>
        </div>
        <!-- 审批流程 -->
        <div class="sqgl-detail-right" v-if="hasRightPanel">
          <div class="approval-head">
            <div class="approval-title">审批流程</div>
            <span :class="['approval-status-tag', approvalStatusCls]">
              <span class="dot"></span>{{ approvalStatusText }}
            </span>
          </div>
          <approval-timeline :apply-id="detail.id" :l-cdata="detail" />
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
import moment from 'moment'
import { getAction, getFileAccessHttpUrl } from '@/api/manage'
import { initDictOptions, filterDictText } from '@/components/dict/JDictSelectUtil'
import ApprovalTimeline from './ApprovalTimeline'

const STATUS_CLS = { 0: 'pending', 1: 'approved', 2: 'handled', 3: 'cancelled', 4: 'rejected', 5: 'checkout' }
const YES_NO_MAP = { 0: '是', 1: '否' }

export default {
  name: 'DormAllotDetailModal',
  components: { ApprovalTimeline },
  data() {
    return {
      visible: false,
      loading: false,
      applyType: '0',
      detail: {},
      dormTypeDict: [],
      itemsDict: [],
      rzStatusDict: [],
      statusDict: [],
      personTypeDict: [],
    }
  },
  created() {
    this.loadDicts()
  },
  computed: {
    detailRows() {
      const d = this.detail
      if (!d || !d.id) return []
      if (this.applyType === 'special') return this.specialRows
      const dash = (v) => (v === 0 ? '0' : v || '—')
      const fmtTime = (v) => (v ? moment(v).format('YYYY-MM-DD HH:mm') : '—')
      const fmtDate = (v) => (v ? moment(v).format('YYYY-MM-DD') : '—')
      const statusRow = {
        label: '状态',
        value: `<span class="sqgl-status-tag ${STATUS_CLS[d.status] || ''}">${
          filterDictText(this.statusDict, d.status) || d.statusLabel || d.status || '—'
        }</span>`,
      }
      if (this.applyType === '0') {
        const rows = [
          { label: '区域', value: dash(d.areaName) },
          { label: '楼栋', value: dash(d.handleBuildingName) },
          { label: '宿舍', value: dash(d.handleRoomName) },
          { label: '宿舍类型', value: filterDictText(this.dormTypeDict, d.dormType) || dash(d.dormType) },
          { label: '领取物品', value: filterDictText(this.itemsDict, d.items) },
          { label: '入住人', value: `${dash(d.empName)}(${dash(d.empNo)})` },
          { label: '性别', value: dash(d.sex) },
          { label: '部门', value: dash(d.deptPath) },
          { label: '身份证', value: dash(d.idCard) },
          { label: '手机号码', value: dash(d.phone) },
          { label: '人员类型', value: filterDictText(this.personTypeDict, d.personType) || dash(d.personType) },
          { label: '入住日期', value: fmtDate(d.checkinDate) },
        ]
        if (d.dormType === '1') {
          rows.push(
            { label: '配偶姓名', value: `${dash(d.spouseName)}(${dash(d.spouseNo)})` },
            { label: '配偶联系方式', value: dash(d.spousePhone) },
            { label: '配偶身份证', value: dash(d.spouseIdcard) }
          )
        }
        rows.push(
          { label: '申请时间', value: fmtTime(d.applyTime) },
          statusRow,
          { label: '入住原因', value: dash(d.reason), full: true },
          { label: '备注', value: dash(d.remark), full: true }
        )
        return rows
      }
      if (this.applyType === '1') {
        return [
          { label: '公司', value: dash(d.company) },
          { label: '部门', value: dash(d.deptPath) },
          { label: '调宿人姓名', value: dash(d.empName) + (d.empNo ? `(${dash(d.empNo)})` : '') },
          { label: '性别', value: dash(d.sex) },
          { label: '人员类型', value: filterDictText(this.personTypeDict, d.personType) || dash(d.personType) },
          // { label: '工号', value: dash(d.empNo) },
          { label: '原宿舍', value: this.joinDorm(d.oldAreaName, d.oldBuildingName, d.oldRoomName) },
          { label: '调宿后区域', value: d.areaName },
          {
            label: '调宿后宿舍',
            value: d.handleRoomName && this.joinDorm(d.areaName, d.handleBuildingName, d.handleRoomName),
          },
          { label: '调宿入住日期', value: fmtDate(d.tsDate) },
          { label: '申请时间', value: fmtTime(d.applyTime) },
          statusRow,
          { label: '调宿原因', value: dash(d.transferReason) },
        ]
      }
      // 退宿 (applyType === '2')
      if (this.applyType === '2') {
        return [
          { label: '宿舍区域', value: dash(d.areaName) },
          { label: '楼栋', value: dash(d.buildingName) },
          { label: '宿舍', value: dash(d.roomName) },
          { label: '申请人', value: dash(d.empName) + (d.empNo ? `(${dash(d.empNo)})` : '') },
          { label: '性别', value: dash(d.sex) },
          // { label: '工号', value: dash(d.empNo) },
          { label: '公司', value: dash(d.company) },
          { label: '部门', value: dash(d.deptPath) },
          { label: '身份证', value: dash(d.idCard) },
          { label: '手机号码', value: dash(d.phone) },
          { label: '人员类型', value: filterDictText(this.personTypeDict, d.personType) || dash(d.personType) },
          { label: '入住日期', value: fmtDate(d.checkinDate) },
          { label: '申请时间', value: fmtTime(d.applyTime) },
          { label: '预计退宿日期', value: fmtDate(d.expectedLeaveDate) },
          { label: '退宿日期', value: fmtDate(d.checkoutDate) },
          statusRow,
          { label: '卫生照片', value: this.buildPhotoHtml(), full: true },
          { label: '退宿原因', value: dash(d.checkoutReason), full: true },
        ]
      }
      return []
    },
    specialRows() {
      // 住宿特办详情字段（按原型 宿舍审核.html 排列）
      const d = this.detail
      if (!d || !d.id) return []
      const dash = (v) => (v === 0 ? '0' : v || '—')
      const fmtTime = (v) => (v ? moment(v).format('YYYY-MM-DD HH:mm') : '—')
      const fmtDate = (v) => (v ? moment(v).format('YYYY-MM-DD') : '—')
      const rzStatusCode = d.rzStatus
      const rzStatusLabel =
        d.rzStatus_dictText || filterDictText(this.rzStatusDict, rzStatusCode) || rzStatusCode || '—'
      const rzStatusCls = STATUS_CLS[rzStatusCode] || ''
      const netTag =
        d.gridInfo == 1 ? '<span class="sqgl-status-tag approved">是</span>' : '<span style="color:#94a3b8">否</span>'
      const arr = [
        { label: '区域', value: dash(d.areaName) },
        { label: '楼栋', value: dash(d.handleBuildingName || d.buildingName) },
        { label: '宿舍', value: dash(d.handleRoomName || d.roomName) },
        { label: '姓名', value: `${dash(d.empName)}(${dash(d.empNo)})` },
        { label: '性别', value: dash(d.sex) },
        { label: '身份证', value: dash(d.idCard) },
        { label: '手机号码', value: dash(d.phone) },
        { label: '宿舍类型', value: filterDictText(this.dormTypeDict, d.dormType) || dash(d.dormType) },
        { label: '内部员工', value: d.internalEmployee == 1 ? '是' : '否' },
        { label: '人员类型', value: filterDictText(this.personTypeDict, d.personType) || dash(d.personType) },
      ]
      if (d.dormType === '1') {
        arr.push(
          { label: '配偶姓名', value: `${dash(d.spouseName)}(${dash(d.spouseNo)})` },
          { label: '配偶联系方式', value: dash(d.spousePhone) },
          { label: '配偶身份证', value: dash(d.spouseIdcard) }
        )
      }
      arr.push(
        { label: '入住日期', value: fmtDate(d.checkinDate) },
        { label: '调宿入住日期', value: fmtDate(d.tsDate) },
        { label: '预计离开日期', value: fmtDate(d.expectedLeaveDate) },
        { label: '退宿日期', value: fmtTime(d.checkoutDate) },
        { label: '是否办理网络信息', value: netTag },
        { label: '状态', value: `<span class="sqgl-status-tag ${rzStatusCls}">${rzStatusLabel}</span>` },
        { label: '卫生照片', value: this.buildPhotoHtml(), full: true },
        { label: '退宿原因', value: dash(d.checkoutReason), full: true },
        { label: '备注', value: dash(d.remark), full: true }
      )
      return arr
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
    hasApprovalFlow() {
      const name = this.detail.approveName
      return name !== undefined && name !== null && String(name).trim() !== ''
    },
    hasRightPanel() {
      return this.applyType !== 'special' || this.hasApprovalFlow
    },
    shouldLayoutVertical() {
      // applyType === '0' (入住) 或 '2' (退宿) 时使用垂直布局
      return this.applyType === '0' || this.applyType === '2'
      // return false /** false，三种申请类型的详情弹窗都会和调宿申请一样  */
    },
    approvalStatusCls() {
      const s = this.detail.status
      if (s === '0') return 'doing'
      if (s === '1' || s === '2' || s === '5') return 'done'
      if (s === '4') return 'rejected'
      return 'wait'
    },
    approvalStatusText() {
      const s = this.detail.status
      if (s === '0') return '进行中'
      if (s === '1' || s === '2') return '已通过'
      if (s === '4') return '不通过'
      if (s === '3') return '已撤回'
      if (s === '5') return '已结束'
      return '已结束'
    },
  },
  methods: {
    async loadDicts() {
      initDictOptions('hrm_sqgl_apply_dorm_type').then((res) => {
        if (res.success) {
          this.dormTypeDict = res.success ? res.result || [] : []
        }
      })
      initDictOptions('hrm_sqgl_apply_items').then((res) => {
        if (res.success) {
          this.itemsDict = res.success ? res.result || [] : []
        }
      })
      initDictOptions('hrm_sqgl_apply_rz_status').then((res) => {
        if (res.success) {
          this.rzStatusDict = res.result || []
        }
      })
      initDictOptions('hrm_sqgl_apply_status').then((res) => {
        if (res.success) {
          this.statusDict = res.result || []
        }
      })
      initDictOptions('hrm_sqgl_apply_person_type').then((res) => {
        if (res.success) {
          this.personTypeDict = res.result || []
        }
      })
    },
    open(id, applyType) {
      this.applyType = applyType
      this.visible = true
      this.detail = {}
      this.loading = true
      const detailUrl = applyType === 'special' ? '/sqgl/approval/resident/queryById' : '/sqgl/hrmSqglApply/queryById'
      getAction(detailUrl, { id })
        .then((res) => {
          if (res.success) this.detail = res.result || {}
          else this.$message.warning(res.message)
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
    previewPhoto(url) {
      this.$store.dispatch('openPdf', url)
    },
    buildPhotoHtml() {
      const photos = this.photoList
      if (!photos.length) return '—'
      return photos
        .map(
          (url) =>
            `<img src="${url}" data-url="${url}" class="sqgl-photo-img" style="width:72px;height:72px;object-fit:cover;border-radius:6px;border:1px solid #e2e8f0;margin:0 6px 6px 0;cursor:pointer" />`
        )
        .join('')
    },
    handleValClick(e) {
      const target = e.target
      if (target && target.classList && target.classList.contains('sqgl-photo-img')) {
        const url = target.getAttribute('data-url')
        if (url) {
          this.$store.dispatch('openPdf', url)
        }
      }
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
@sqgl-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #4a9eff 100%);

.sqgl-detail-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  align-items: stretch;
  background: #fff;
  border: 1px solid @sqgl-border;
  border-radius: 8px;
  padding: 16px 18px;
  &.single-col {
    grid-template-columns: 1fr;
    .sqgl-detail-left {
      padding-right: 0;
      border-right: none;
    }
  }
  &.vertical-layout {
    grid-template-columns: 1fr;
    gap: 16px;
    .sqgl-detail-left {
      padding-right: 0;
      border-right: none;
      border-bottom: 1px solid @sqgl-border;
      padding-bottom: 16px;
    }
    .sqgl-detail-right {
      padding-left: 0;
      padding-top: 0;
    }
  }
}
.sqgl-detail-left {
  padding-right: 18px;
  border-right: 1px solid @sqgl-border;
  display: flex;
  flex-wrap: wrap;
  &.single-style {
    .sqgl-detail-row {
      width: 100%;
    }
  }
}
.sqgl-detail-right {
  padding-left: 18px;
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
.sqgl-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 50%;
  box-sizing: border-box;
  padding: 8px 12px 8px 0;
  border-bottom: 1px dashed rgba(226, 232, 240, 0.7);
  &:last-child {
    border-bottom: none;
  }
  &.full-row {
    width: 100%;
    padding-right: 0;
  }
  .lbl {
    width: 96px;
    flex-shrink: 0;
    color: @sqgl-muted-foreground;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
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

/* 状态标签（v-html 注入，需 /deep/ 穿透 scoped） */
/deep/ .sqgl-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
  }
  &.pending {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
  }
  &.approved,
  &.handled {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }
  &.cancelled {
    background: rgba(100, 116, 139, 0.1);
    color: @sqgl-muted-foreground;
  }
  &.rejected {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
  }
  &.checkout {
    background: rgba(100, 116, 139, 0.12);
    color: #475569;
  }
}

/* 审批流程（参考原型 宿舍审核.html） */
.approval-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.approval-title {
  font-size: 14px;
  font-weight: 600;
  color: @sqgl-foreground;
  display: flex;
  align-items: center;
  gap: 6px;
}
.approval-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
  }
  &.doing {
    background: rgba(45, 120, 255, 0.1);
    color: #2563eb;
  }
  &.done {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }
  &.rejected {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
  }
  &.wait {
    background: rgba(100, 116, 139, 0.1);
    color: @sqgl-muted-foreground;
  }
}
.sqgl-empty-hint {
  text-align: center;
  color: #94a3b8;
  font-size: 12.5px;
  padding: 20px 0;
}

@media (max-width: 900px) {
  .sqgl-detail-wrap {
    grid-template-columns: 1fr;
    .sqgl-detail-left {
      padding-right: 0;
      border-right: none;
      padding-bottom: 16px;
      border-bottom: 1px solid @sqgl-border;
    }
    .sqgl-detail-right {
      padding-left: 0;
      padding-top: 16px;
    }
  }
}
</style>
