<template>
  <a-modal
    :title="title"
    :width="666"
    :visible="visible"
    :footer="null"
    centered
    :destroyOnClose="true"
    :bodyStyle="{ maxHeight: '85vh', overflow: 'auto', padding: '20px 24px' }"
    @cancel="handleCancel"
  >
    <a-spin :spinning="loading" tip="加载中...">
      <div v-if="personInfo" class="sqgl-person-detail">
        <div class="sqgl-detail-layout">
          <!-- 左侧基本信息 -->
          <div class="sqgl-detail-left">
            <div class="sqgl-detail-cols">
              <!-- 已调出：显示调宿详情 -->
              <template v-if="tabStatus === '2'">
                <div class="sqgl-detail-row">
                  <span class="k">工号</span><span class="v">{{ personInfo.empNo || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">姓名</span><span class="v">{{ personInfo.empName || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">所属公司</span><span class="v">{{ personInfo.company || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">部门</span><span class="v">{{ personInfo.deptPath || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">原宿舍</span>
                  <span class="v dorm-old"
                    >{{ personInfo.oldAreaName }}{{ personInfo.oldBuildingName }}{{ personInfo.oldRoomName }}</span
                  >
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">原宿舍类型</span><span class="v">{{ oldDormTypeText }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">内部员工</span>
                  <span class="v">
                    <span :class="['yes-no-tag', personInfo.internalEmployee === '1' ? 'yes' : 'no']">
                      {{ personInfo.internalEmployee === '1' ? '是' : '否' }}
                    </span>
                  </span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">人员类型</span><span class="v">{{ personTypeText }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">身份证</span><span class="v nowrap">{{ personInfo.idCard || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">手机号码</span><span class="v">{{ personInfo.phone || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">是否办理网格信息</span>
                  <span class="v">
                    <span :class="['yes-no-tag', personInfo.gridInfo === '1' ? 'yes' : 'no']">
                      {{ personInfo.gridInfo === '1' ? '是' : '否' }}
                    </span>
                  </span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">调宿后宿舍</span>
                  <span class="v dorm-new"
                    >{{ personInfo.handleAreaName }}{{ personInfo.handleBuildingName
                    }}{{ personInfo.handleRoomName }}</span
                  >
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">调宿日期</span><span class="v">{{ personInfo.tsDate || '—' }}</span>
                </div>
                <div class="sqgl-detail-row full">
                  <span class="k">调宿原因</span><span class="v">{{ personInfo.reason || '—' }}</span>
                </div>
              </template>
              <!-- 已入住/已退宿：显示当前宿舍 -->
              <template v-else>
                <div class="sqgl-detail-row">
                  <span class="k">区域</span><span class="v">{{ personInfo.areaName || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">楼栋</span><span class="v">{{ personInfo.buildingName || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">宿舍</span><span class="v">{{ personInfo.roomName || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">姓名</span><span class="v">{{ personInfo.empName || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">内部员工</span>
                  <span class="v">
                    <span :class="['yes-no-tag', personInfo.internalEmployee === '1' ? 'yes' : 'no']">
                      {{ personInfo.internalEmployee === '1' ? '是' : '否' }}
                    </span>
                  </span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">身份证</span><span class="v nowrap">{{ personInfo.idCard || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">手机号码</span><span class="v">{{ personInfo.phone || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">入住日期</span><span class="v">{{ personInfo.checkinDate || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">调宿入住日期</span><span class="v">{{ personInfo.tsDate || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">预计离开日期</span><span class="v">{{ personInfo.expectedLeaveDate || '—' }}</span>
                </div>
                <!-- 已退宿：显示退宿日期 -->
                <div class="sqgl-detail-row" v-if="tabStatus === '0'">
                  <span class="k">退宿日期</span><span class="v">{{ personInfo.checkoutDate || '—' }}</span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">是否办理网格信息</span>
                  <span class="v">
                    <span :class="['yes-no-tag', personInfo.gridInfo === '1' ? 'yes' : 'no']">
                      {{ personInfo.gridInfo === '1' ? '是' : '否' }}
                    </span>
                  </span>
                </div>
                <div class="sqgl-detail-row">
                  <span class="k">状态</span>
                  <span class="v">
                    <span :class="['status-tag', statusClass]"> <span class="dot"></span>{{ statusText }} </span>
                  </span>
                </div>

                <!-- 已退宿：显示退宿原因和卫生照片 -->
                <div class="sqgl-detail-row full" v-if="tabStatus === '0'">
                  <span class="k">退宿原因</span><span class="v">{{ personInfo.reason || '—' }}</span>
                </div>
                <div class="sqgl-detail-row full" v-if="tabStatus === '0'">
                  <span class="k">卫生照片</span>
                  <span class="v">
                    <template v-if="healthPhotoList.length">
                      <img
                        v-for="(url, idx) in healthPhotoList"
                        :key="idx"
                        :src="url"
                        class="health-photo"
                        @click="previewPhoto(url)"
                      />
                    </template>
                    <span v-else>—</span>
                  </span>
                </div>
                <div class="sqgl-detail-row full">
                  <span class="k">备注</span><span class="v">{{ personInfo.remark || '—' }}</span>
                </div>
              </template>
            </div>
          </div>

          <!-- 右侧审批流程 -->
          <div class="sqgl-detail-right" v-if="false">
            <div class="approval-head">
              <div class="approval-title">审批流程</div>
              <span :class="['approval-status-tag', approvalStatusCls]">
                <span class="dot"></span>{{ approvalStatusText }}
              </span>
            </div>
            <div class="timeline">
              <div v-for="(node, i) in approvalSteps" :key="i" class="timeline-node">
                <div :class="['timeline-dot', node.dotCls]">
                  <a-icon :type="node.icon" />
                </div>
                <div class="timeline-content">
                  <div class="timeline-info">
                    <div class="timeline-name">
                      {{ node.name }}
                      <span v-if="node.tag" :class="['timeline-tag', node.tagCls]">{{ node.tag }}</span>
                    </div>
                    <div class="timeline-meta">
                      <template v-if="node.metaList && node.metaList.length">
                        <a-icon type="user" style="font-size: 11px" />
                        <template v-for="(m, mIdx) in node.metaList">
                          <span v-if="mIdx > 0" style="margin: 0 2px">,</span>{{ m }}
                        </template>
                        <div v-if="node.approveOpinion" style="width: 100%">审批意见：{{ node.approveOpinion }}</div>
                      </template>
                      <span v-else>{{ node.meta }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="!approvalSteps.length" class="sqgl-empty-hint">暂无审批流程</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="sqgl-empty-hint">暂无人员数据</div>
    </a-spin>
    <div class="sqgl-modal-footer">
      <a-button @click="handleCancel">关闭</a-button>
    </div>
  </a-modal>
</template>

<script>
import { getAction, getFileAccessHttpUrl } from '@/api/manage'

export default {
  name: 'PersonDetailModal',
  data() {
    return {
      title: '人员详情',
      visible: false,
      loading: false,
      personInfo: null,
      tabStatus: '1', // 1=已入住, 2=已调出, 0=已退宿
      dormTypeMap: {
        0: '普通宿舍',
        1: '夫妻宿舍',
        2: '客房',
        3: '临时工宿舍',
      },
      personTypeMap: {
        0: '正式员工',
        1: '临时工',
        2: '外部人员',
      },
    }
  },
  computed: {
    dormTypeText() {
      const type = this.personInfo && this.personInfo.dormType
      return this.dormTypeMap[type] || type || '—'
    },
    oldDormTypeText() {
      const type = this.personInfo && this.personInfo.oldDormType
      return this.dormTypeMap[type] || type || '—'
    },
    personTypeText() {
      const type = this.personInfo && this.personInfo.personType
      return this.personTypeMap[type] || type || '—'
    },
    statusClass() {
      const map = { 1: 'in', 2: 'moved', 0: 'out' }
      const status = this.personInfo && this.personInfo.rzStatus
      return map[status] || 'out'
    },
    statusText() {
      const map = { 1: '已入住', 2: '已调出', 0: '已退宿' }
      const status = this.personInfo && this.personInfo.rzStatus
      return map[status] || '未知'
    },
    healthPhotoList() {
      const raw = this.personInfo && this.personInfo.healthPhotos
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
      if (!this.personInfo) return false
      const name = this.personInfo.approveName
      return name !== undefined && name !== null && String(name).trim() !== ''
    },
    approvalStatusCls() {
      // 根据人员状态判断审批状态
      const status = this.personInfo && this.personInfo.rzStatus
      // 1=已入住, 2=已调出, 0=已退宿
      if (status === '1' || status === '2') return 'done'
      if (status === '0') return 'done'
      return 'done'
    },
    approvalStatusText() {
      const status = this.personInfo && this.personInfo.rzStatus
      if (status === '1') return '已入住'
      if (status === '2') return '已调出'
      if (status === '0') return '已退宿'
      return '已完成'
    },
    approvalSteps() {
      const d = this.personInfo
      if (!d) return []

      const status = d.rzStatus
      const isDone = status === '1' || status === '2' || status === '0'

      // 解析审批人和抄送人
      const approverUsers = this.parseUserList(d.approveName, d.approveCode)
      const ccUsers = this.parseUserList(d.ccName, d.ccCode)

      const approverMetaList = approverUsers.map((u) => (u.workNo ? u.name + ' · ' + u.workNo : u.name))
      const ccMetaList = ccUsers.map((u) => (u.workNo ? u.name + ' · ' + u.workNo : u.name))

      const steps = []

      // 节点1：审批人审批
      steps.push({
        name: '审批人审批',
        tag: isDone ? '已通过' : '待审批',
        tagCls: isDone ? 'done' : 'doing',
        dotCls: 'current',
        icon: 'user',
        metaList: approverMetaList.length ? approverMetaList : null,
        meta: approverMetaList.length ? '' : '—',
        approveOpinion: d.approveOpinion || null,
      })

      // 节点2：抄送
      if (ccUsers.length) {
        steps.push({
          name: '抄送',
          tag: '',
          tagCls: '',
          dotCls: isDone ? 'current' : 'pending',
          icon: 'copy',
          metaList: ccMetaList.length ? ccMetaList : null,
          meta: ccMetaList.length ? '' : '通知相关人员',
        })
      }

      return steps
    },
  },
  methods: {
    open(personId, tabStatus = '1') {
      this.visible = true
      this.personInfo = null
      this.tabStatus = tabStatus
      this.loadPersonDetail(personId)
    },
    loadPersonDetail(personId) {
      if (!personId) return
      this.loading = true
      getAction('/sqgl/hrmSqglPersonInfo/queryById', { id: personId })
        .then((res) => {
          if (res.success && res.result) {
            this.personInfo = res.result
            this.title = '人员详情 · ' + (res.result.empName || '—')
          } else {
            this.$message.warning(res.message || '获取人员详情失败')
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleCancel() {
      this.visible = false
    },
    previewPhoto(url) {
      this.$store.dispatch('openPdf', url)
    },
    parseUserList(nameStr, codeStr) {
      const names = this.splitList(nameStr)
      const codes = this.splitList(codeStr)
      if (!names.length && !codes.length) return []
      // 如果名称和工号数量一致，一一配对；否则单独展示
      if (names.length && codes.length && names.length === codes.length) {
        return names.map((name, i) => ({ name, workNo: codes[i] }))
      }
      const result = []
      names.forEach((name) => result.push({ name, workNo: '' }))
      codes.forEach((code, i) => {
        if (i < names.length) return
        result.push({ name: code, workNo: '' })
      })
      return result
    },
    splitList(val) {
      if (val === undefined || val === null || val === '') return []
      return String(val)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    },
  },
}
</script>

<style lang="less" scoped>
@sqgl-primary: #2563eb;
@sqgl-primary-rgb: 37, 99, 235;
@sqgl-border: #e2e8f0;
@sqgl-muted: #f1f5f9;
@sqgl-muted-foreground: #64748b;
@sqgl-foreground: #1a2a3d;
@sqgl-green: #10b981;
@sqgl-purple: #8b5cf6;
@sqgl-red: #ef4444;
@sqgl-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #4a9eff 100%);
@sqgl-shadow-card: 0 2px 12px rgba(45, 120, 255, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03);

.sqgl-person-detail {
  display: flex;
  flex-direction: column;
}

.sqgl-detail-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (max-width: 760px) {
  .sqgl-detail-layout {
    grid-template-columns: 1fr;
  }
}

.sqgl-detail-left {
  min-width: 0;
}

.sqgl-detail-right {
  min-width: 0;
}

.sqgl-sub-title {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(@sqgl-primary-rgb, 0.7);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 2px 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: @sqgl-gradient-blue;
    border-radius: 2px;
  }
}

.sqgl-detail-cols {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  border: 1px solid @sqgl-border;
  border-radius: 8px;
  overflow: hidden;
}

.sqgl-detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 50%;
  box-sizing: border-box;
  padding: 9px 14px;
  border-bottom: 1px dashed rgba(226, 232, 240, 0.7);
  min-height: 38px;
  &:last-child {
    border-bottom: none;
  }
  &.full {
    width: 100%;
    padding-right: 0;
  }
  .k {
    width: 96px;
    flex-shrink: 0;
    color: @sqgl-muted-foreground;
    font-size: 12px;
    white-space: nowrap;
  }
  .v {
    color: @sqgl-foreground;
    font-weight: 500;
    font-size: 13px;
    flex: 1;
    word-break: break-all;
    &.nowrap {
      white-space: nowrap;
    }
  }
}

/* ===== 宿舍号颜色 ===== */
.dorm-old {
  color: @sqgl-muted-foreground;
}
.dorm-new {
  color: @sqgl-primary;
  font-weight: 600;
}

/* ===== 是/否标签 ===== */
.yes-no-tag {
  font-weight: 500;
  &.yes {
    color: @sqgl-green;
  }
  &.no {
    color: #94a3b8;
  }
}

/* ===== 状态标签 ===== */
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  &.in {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }
  &.moved {
    background: rgba(139, 92, 246, 0.1);
    color: #7c3aed;
  }
  &.out {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
  }
}

/* ===== 卫生照片 ===== */
.health-photo {
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

/* ===== 审批流程（参考 DormAllotDetailModal.vue） ===== */
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
.timeline {
  position: relative;
  padding-left: 28px;
}
.timeline-node {
  position: relative;
  padding: 0 0 22px 0;
  &:last-child {
    padding-bottom: 0;
    &::before {
      display: none;
    }
  }
  &::before {
    content: '';
    position: absolute;
    left: -15px;
    top: 26px;
    bottom: -4px;
    width: 2px;
    background: linear-gradient(180deg, rgba(@sqgl-primary-rgb, 0.25), rgba(@sqgl-primary-rgb, 0.08));
  }
}
.timeline-dot {
  position: absolute;
  left: -28px;
  top: 0;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #fff;
  border: 2px solid @sqgl-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-shadow: 0 0 0 4px rgba(@sqgl-primary-rgb, 0.08);
  /deep/ .anticon {
    font-size: 14px;
    color: @sqgl-primary;
  }
  &.current {
    background: @sqgl-primary;
    /deep/ .anticon {
      color: #fff;
    }
  }
  &.pending {
    background: #fff;
    border-color: #cbd5e1;
    box-shadow: 0 0 0 4px rgba(100, 116, 139, 0.06);
    /deep/ .anticon {
      color: #94a3b8;
    }
  }
  &.rejected {
    background: #ef4444;
    border-color: #ef4444;
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.08);
    /deep/ .anticon {
      color: #fff;
    }
  }
}
.timeline-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-left: 4px;
}
.timeline-info {
  flex: 1;
  min-width: 0;
}
.timeline-name {
  font-size: 13px;
  font-weight: 600;
  color: @sqgl-foreground;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.timeline-tag {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 7px;
  border-radius: 4px;
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
  &.doing {
    background: rgba(45, 120, 255, 0.12);
    color: #2563eb;
  }
  &.done {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
    font-weight: 600;
  }
  &.rejected {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
  }
}
.timeline-meta {
  font-size: 11.5px;
  color: @sqgl-muted-foreground;
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.sqgl-empty-hint {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

.sqgl-modal-footer {
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px solid @sqgl-border;
  display: flex;
  justify-content: flex-end;
}
</style>

