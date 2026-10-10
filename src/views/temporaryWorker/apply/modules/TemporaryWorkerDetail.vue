<!--
  @description 临时工申请详情/审批模态框组件
  @date 2026-08-19
  @functionality 提供临时工申请的查看详情和审批功能，支持查看基本信息、需求明细、审批流程，支持审批操作（同意/驳回）
-->
<template>
  <!-- 详情/审批模态框 -->
  <a-modal :title="title" :width="900" :visible="visible" :footer="null" @cancel="handleCancel" class="detail-modal">
    <div class="modal-content-wrapper">
      <a-spin :spinning="loading" class="modal-scroll-area">
        <div class="detail-body">
          <!-- 基本信息：部门、申请人、申请日期、状态 -->
          <div class="section-title">基本信息</div>
          <div class="detail-card">
            <div class="detail-grid">
              <div class="detail-row">
                <div class="detail-label">需求部门</div>
                <div class="detail-value">{{ detailData.deptName || '—' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">申请人</div>
                <div class="detail-value">
                  <div v-if="applicantList.length" class="applicant-list">
                    <span v-for="applicant in applicantList" :key="applicant.code" class="applicant">
                      <span class="applicant-avatar">{{ applicant.name.charAt(0) }}</span>
                      <span class="applicant-name">{{ applicant.name }}</span>
                      <span v-if="applicant.code">（{{ applicant.code }}）</span>
                    </span>
                  </div>
                  <span v-else>-</span>
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-label">申请日期</div>
                <div class="detail-value">{{ formatDate(detailData.applyDate) }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">状态</div>
                <div class="detail-value">
                  <span :class="['status-tag', statusClass]">
                    <span v-if="showDot" class="dot"></span>{{ statusText }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 需求明细：展示多个需求项 -->
          <div class="section-title" style="margin-top: 22px">需求明细</div>
          <div class="demand-list">
            <div v-for="(item, idx) in demandList" :key="idx" class="demand-card">
              <div class="demand-title">需求项{{ idx + 1 }}</div>
              <div class="sub-grid">
                <div class="sub">
                  <div class="lbl">需求工种</div>
                  <div class="val">
                    <div class="detail-val">{{ item.workTypeName || item.workType || '—' }}</div>
                  </div>
                </div>
                <div class="sub">
                  <div class="lbl">需求性质</div>
                  <div class="val">
                    <div class="detail-val">{{ item.demandNature || '—' }}</div>
                  </div>
                </div>
                <div class="sub">
                  <div class="lbl">人数</div>
                  <div class="val">
                    <div class="detail-val">{{ item.personCount || '—' }}</div>
                  </div>
                </div>
                <div v-if="item.demandNature === '续签'" class="sub" style="grid-column: span 2">
                  <div class="lbl">续签人员</div>
                  <div class="val">
                    <div class="detail-val">{{ item.xqNos_dictText || '—' }}</div>
                  </div>
                </div>
                <div class="sub">
                  <div class="lbl">工期(天)</div>
                  <div class="val">
                    <div class="detail-val">{{ item.workDays || '—' }}</div>
                  </div>
                </div>
                <div class="sub">
                  <div class="lbl">开始日期</div>
                  <div class="val">
                    <div class="detail-val">{{ formatDate(item.startDate) }}</div>
                  </div>
                </div>
                <div class="sub">
                  <div class="lbl">结束日期</div>
                  <div class="val">
                    <div class="detail-val">{{ formatDate(item.endDate) }}</div>
                  </div>
                </div>
                <div class="sub" style="grid-column: span 2">
                  <div class="lbl">服务项目</div>
                  <div class="val">
                    <div class="detail-val">{{ item.serviceProject || '—' }}</div>
                  </div>
                </div>
                <div class="sub" style="grid-column: span 2">
                  <div class="lbl">附件</div>
                  <div class="val">
                    <j-upload-list
                      v-if="item.attachment"
                      v-model="item.attachment"
                      :disabled="true"
                      :returnUrl="true"
                      onlySuffix
                    />
                    <div class="attach-empty" v-else>无附件</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 审批流程（仅查看模式显示） -->
          <template v-if="viewMode !== 'audit'">
            <div class="section-title" style="margin-top: 22px">审批流程</div>
            <div class="approval-card">
              <approval-timeline :apply-id="detailData.id" :l-cdata="detailData" />
            </div>
          </template>

          <!-- 审批意见（仅审批模式显示）：输入审批意见 -->
          <template v-if="viewMode === 'audit'">
            <div class="section-title" style="margin-top: 22px">审批意见</div>
            <div class="opinion-card">
              <a-form-model ref="auditForm" :model="auditForm" layout="vertical">
                <a-form-model-item label="审批意见">
                  <a-textarea
                    v-model="auditForm.spyj"
                    placeholder="请填写您的审批意见，例如：同意该临时工需求申请，请按规定办理入场手续..."
                    :autoSize="{ minRows: 3, maxRows: 5 }"
                  />
                </a-form-model-item>
              </a-form-model>
            </div>
          </template>
        </div>
      </a-spin>

      <!-- 底部按钮（仅审批模式显示） -->
      <div v-if="viewMode === 'audit'" class="audit-footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="danger" :loading="rejectLoading" @click="handleReject"> 驳回 </a-button>
        <a-button type="primary" :loading="approveLoading" @click="handleApprove"> 同意 </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script>
import Vue from 'vue'
import { getAction, postAction } from '@/api/manage'
import JUploadList from '@/components/jeecg/JUploadList.vue'
import { filterDictTextByCache } from '@/components/dict/JDictSelectUtil'
import ApprovalTimeline from './ApprovalTimeline'

/**
 * 临时工申请详情/审批模态框组件
 * 提供临时工申请的查看详情和审批功能
 * 支持查看基本信息、需求明细、审批流程
 * 支持审批操作（同意/驳回）
 */
export default {
  name: 'TemporaryWorkerDetail',
  components: { JUploadList, ApprovalTimeline },
  props: {
    /** 页面模式：apply-申请模式，audit-审批模式 */
    mode: {
      type: String,
      default: 'apply', // apply 或 audit，用于区分调用哪个接口
    },
  },
  data() {
    return {
      /** 模态框标题 */
      title: '临时工需求详情',
      /** 模态框显示状态 */
      visible: false,
      /** 视图模式：detail-查看详情，audit-审批操作 */
      viewMode: 'detail', // detail 或 audit，用于区分查看还是审批操作
      /** 当前记录 */
      record: {},
      /** 详情数据 */
      detailData: {},
      /** 加载状态 */
      loading: false,
      /** 需求明细列表 */
      demandList: [],
      /** 审批表单数据 */
      auditForm: {
        spyj: '', // 审批意见
      },
      /** 同意按钮加载状态 */
      approveLoading: false,
      /** 驳回按钮加载状态 */
      rejectLoading: false,
    }
  },
  computed: {
    /**
     * 申请人列表（申请人支持多选，后端返回逗号拼接的姓名和工号字符串，按逗号拆分后一一对应）
     * @returns {Array<{name: string, code: string}>} 申请人列表
     */
    applicantList() {
      const names = String(this.detailData.applicantName || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const codes = String(this.detailData.applicantCode || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      return names.map((name, idx) => ({ name, code: codes[idx] || '' }))
    },
    /**
     * 状态映射配置
     * @returns {Object} 状态映射对象
     */
    statusMap() {
      return {
        0: { label: '审批中', cls: 'pending' },
        1: { label: '已通过', cls: 'handled' },
        3: { label: '不通过', cls: 'rejected' },
        2: { label: '已撤回', cls: 'cancelled' },
      }
    },
    /**
     * 状态文本
     * @returns {string} 状态文本
     */
    statusText() {
      var status = this.detailData.status
      // 使用字典翻译
      const dictText = filterDictTextByCache('temp_worker_apply_status', status)
      return dictText || status || '—'
    },
    /**
     * 状态样式类名
     * @returns {string} 样式类名
     */
    statusClass() {
      var status = this.detailData.status
      var statusInfo = this.statusMap[status]
      return (statusInfo && statusInfo.cls) || ''
    },
    /**
     * 是否显示状态圆点
     * @returns {boolean} 是否显示
     */
    showDot() {
      var status = this.detailData.status
      return [0, 1].indexOf(status) !== -1
    },
  },
  methods: {
    /**
     * 格式化日期
     * @param {string} dateStr - 日期字符串
     * @returns {string} 格式化后的日期
     */
    formatDate(dateStr) {
      if (!dateStr) return '—'
      return String(dateStr).split(' ')[0].split('T')[0]
    },
    /**
     * 打开查看详情模式
     * @param {Object} record - 申请记录
     * @param {string} title - 模态框标题
     * @returns {void}
     */
    show(record, title) {
      this.record = record || {}
      this.title = title || '临时工需求详情'
      this.viewMode = 'detail'
      this.visible = true
      this.loading = true
      this.detailData = {}
      this.demandList = []
      this.auditForm.spyj = ''

      this.loadDetailData()
        .then(() => {
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    /**
     * 打开审批模式
     * @param {Object} record - 申请记录
     * @returns {void}
     */
    audit(record) {
      this.record = record || {}
      this.title = '审批临时工需求'
      this.viewMode = 'audit'
      this.visible = true
      this.loading = true
      this.detailData = {}
      this.auditForm.spyj = ''

      this.loadDetailData()
        .then(() => {
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    /**
     * 加载详情数据
     * @returns {Promise} 加载Promise
     */
    loadDetailData() {
      // 根据 mode (prop) 调用不同的接口
      const detailUrl =
        this.mode === 'audit'
          ? `/lsggl/tempWorkerAudit/detail/${this.record.id}`
          : `/lsggl/tempWorkerApply/detail/${this.record.id}`

      return getAction(detailUrl)
        .then((res) => {
          if (res.success && res.result) {
            this.detailData = res.result
            this.demandList = res.result.itemList || []
            // 适配 ApprovalTimeline 组件的申请人字段（name -> applicantName）
            this.detailData.name = res.result.applicantName || ''
          }
          return Promise.resolve()
        })
        .catch((err) => {
          console.error('加载详情失败：', err)
          return Promise.resolve()
        })
    },
    /**
     * 取消操作
     * @returns {void}
     */
    handleCancel() {
      this.visible = false
    },
    /**
     * 同意审批
     * @returns {void}
     */
    handleApprove() {
      this.doAudit(1)
    },
    /**
     * 驳回审批
     * @returns {void}
     */
    handleReject() {
      this.doAudit(2)
    },
    /**
     * 执行审批操作
     * @param {number} approvalResult - 审批结果（1-同意，2-驳回）
     * @returns {void}
     */
    doAudit(approvalResult) {
      if (approvalResult === 1) {
        this.approveLoading = true
      } else {
        this.rejectLoading = true
      }

      // 获取当前用户信息
      let perInfo = Vue.ls.get('perInfo')
      const formData = {
        applyId: this.detailData.id,
        userId: perInfo.id || '',
        approvalResult: approvalResult,
        approvalOpinion: this.auditForm.spyj || '',
      }

      postAction('/lsggl/tempWorkerAudit/approve', formData)
        .then((res) => {
          if (res.success) {
            this.$message.success(approvalResult === 1 ? '审批通过' : '已驳回')
            this.visible = false
            this.$emit('ok')
          } else {
            this.$message.warning(res.message || '审批失败')
          }
        })
        .catch(() => {
          this.$message.error('审批失败')
        })
        .finally(() => {
          this.approveLoading = false
          this.rejectLoading = false
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../temporary-worker-theme.less';

.detail-modal {
  /deep/ .ant-modal-body {
    padding: 0;
    display: flex;
    flex-direction: column;
    max-height: 80vh;
  }
  /deep/ .ant-modal-header {
    border-bottom: 1px solid @v-border;
  }
  /deep/ .ant-modal-title {
    font-size: 15px;
    font-weight: 600;
    color: @v-foreground;
  }
  /deep/ .detail-grid {
    display: flex;
    flex-wrap: wrap;
  }
  /deep/ .detail-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 9px 0;
    border-bottom: 1px dashed rgba(226, 232, 240, 0.7);
    width: 50%;
    box-sizing: border-box;
    &:last-child {
      border-bottom: none;
    }
  }
  /deep/ .detail-label {
    width: 90px;
    flex-shrink: 0;
    color: @v-muted-foreground;
    font-size: 13px;
    font-weight: 500;
    padding-top: 1px;
  }
  /deep/ .detail-value {
    font-size: 13px;
    color: @v-foreground;
    font-weight: 500;
    flex: 1;
    word-break: break-all;
    min-width: 0;
  }
}

.modal-content-wrapper {
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.modal-scroll-area {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.detail-body {
  font-family: @v-font-sans;
  color: @v-foreground;
  padding: 22px 24px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(@v-primary-rgb, 0.7);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: @v-gradient-blue;
    border-radius: 2px;
  }
}

.detail-card {
  border: 1px solid @v-border;
  border-radius: 10px;
  padding: 6px 16px;
  background: #fff;
}

.applicant-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
}

.applicant {
  display: flex;
  align-items: center;
  gap: 8px;
}

.applicant-avatar {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: @v-gradient-blue;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.applicant-name {
  font-size: 12.5px;
  font-weight: 500;
  color: @v-foreground;
}

.applicant-code {
  font-size: 11px;
  color: @v-muted-foreground;
  margin-left: 4px;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
    animation: v-blink-dot 1.6s ease-in-out infinite;
  }
  &.pending {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
  }
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
    color: @v-muted-foreground;
  }
}

.demand-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.demand-card {
  border: 1px solid @v-border;
  border-radius: 10px;
  padding: 14px 16px;
  background: #fff;
  box-shadow: @v-shadow-card;
}

.demand-title {
  font-size: 13px;
  font-weight: 600;
  color: @v-foreground;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  &::before {
    content: '';
    width: 3px;
    height: 14px;
    background: @v-gradient-blue;
    border-radius: 2px;
  }
}

.sub-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}

.sub {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.sub .lbl {
  color: @v-muted-foreground;
  font-size: 13px;
  font-weight: 500;
  width: 84px;
  flex-shrink: 0;
  padding-top: 9px;
}

.sub .val {
  flex: 1;
}

.detail-val {
  font-size: 13px;
  color: @v-foreground;
  padding: 9px 12px;
  border: 1px solid @v-border;
  border-radius: 6px;
  background: rgba(@v-primary-rgb, 0.025);
  min-height: 36px;
  display: flex;
  align-items: center;
  gap: 6px;
  word-break: break-all;
}

.attach-empty {
  font-size: 12.5px;
  color: #94a3b8;
  padding: 9px 12px;
  border: 1px dashed @v-border;
  border-radius: 6px;
  background: rgba(@v-primary-rgb, 0.02);
}

.approval-card {
  border: 1px solid @v-border;
  border-radius: 10px;
  padding: 14px 18px 16px;
  background: #fff;
}

.audit-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid @v-border;
  background: #fff;
  flex-shrink: 0;

  .ant-btn-danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border-color: transparent;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
    }
  }

  .ant-btn-primary {
    background: linear-gradient(135deg, #10b981, #059669);
    border-color: transparent;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
    }
  }
}

.opinion-card {
  border: 1px solid @v-border;
  border-radius: 10px;
  padding: 14px 16px;
  background: #fff;
}
</style>
