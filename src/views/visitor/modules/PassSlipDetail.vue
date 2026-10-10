<template>
  <a-modal
    :title="title"
    :width="900"
    :visible="visible"
    :footer="null"
    @cancel="handleCancel"
    class="visitor-detail-modal"
  >
    <a-spin :spinning="loading">
      <div class="visitor-detail-body">
        <!-- 放行信息 -->
        <div class="section-title"><span class="section-title-text">放行信息</span></div>
        <div class="detail-card">
          <div class="detail-grid">
            <div class="detail-row">
              <div class="detail-label">放行人</div>
              <div class="detail-value">{{ record.fxr || '—' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">所属公司</div>
              <div class="detail-value">{{ record.ssgs || '—' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">车牌号</div>
              <div class="detail-value">{{ record.cph || '—' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">手机号码</div>
              <div class="detail-value">{{ record.sjhf || '—' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">放行日期</div>
              <div class="detail-value">{{ formatDate(record.fxrq) }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">放行区域</div>
              <div class="detail-value">{{ record.fxqr_dictText || record.fxqr || '—' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">经手人(申请人)</div>
              <div class="detail-value">{{ record.jsr || '—' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">状态</div>
              <div class="detail-value">
                <span :class="['status-tag', statusClass]">
                  <span v-if="showDot" class="dot"></span>{{ statusText }}
                </span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">申请事件</div>
              <div class="detail-value">{{ record.createTime.slice(0, 16) }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">审核通过时间</div>
              <div class="detail-value">{{ formatDate(record.shtgsj) }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">放行时间</div>
              <div class="detail-value">{{ record.fxsj || '—' }}</div>
            </div>
            <div class="detail-row full">
              <div class="detail-label">物品名称及数量</div>
              <div class="detail-value">{{ goodsText || '—' }}</div>
            </div>
            <div class="detail-row full">
              <div class="detail-label">备注说明</div>
              <div class="detail-value" style="white-space: pre-line">{{ record.bzsm || '—' }}</div>
            </div>
            <div class="detail-row full">
              <div class="detail-label">物品图片</div>
              <div class="detail-value">
                <j-upload
                  v-if="record.wptp"
                  v-model="record.wptp"
                  text="选择文件"
                  :returnUrl="true"
                  disabled
                  fileType="image"
                />
                <span v-else>—</span>
              </div>
            </div>
          </div>
        </div>
        <!-- 审批流程 -->
        <div class="section-title" style="margin-top: 22px"><span class="section-title-text">审批流程</span></div>
        <div class="approval-card">
          <approval-timeline :apply-id="record.id" :l-cdata="record" />
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
import { getAction } from '@/api/manage'
import JUploadList from '@/components/jeecg/JUploadList.vue'
import ApprovalTimeline from './ApprovalTimeline'

export default {
  name: 'PassSlipDetail',
  components: {
    JUploadList,
    ApprovalTimeline,
  },
  data() {
    return {
      title: '放行条详情',
      visible: false,
      record: {},
      loading: false,
      approvalData: null,
      userMap: {},
      approvalSteps: [],
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
    statusMap() {
      return {
        0: { label: '审批中', cls: 'pending' },
        1: { label: '待放行', cls: 'waiting' },
        2: { label: '不通过', cls: 'rejected' },
        3: { label: '已撤回', cls: 'cancelled' },
        4: { label: '已放行', cls: 'released' },
      }
    },
    statusText() {
      var status = this.record.zt || ''
      var statusInfo = this.statusMap[status]
      return (statusInfo && statusInfo.label) || this.record.zt_dictText || status || '—'
    },
    statusClass() {
      var status = this.record.zt || ''
      var statusInfo = this.statusMap[status]
      return (statusInfo && statusInfo.cls) || ''
    },
    showDot() {
      var status = this.record.zt || ''
      return ['0', '1'].indexOf(status) !== -1
    },
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '—'
      return String(dateStr).split(' ')[0].split('T')[0]
    },
    show(record, title) {
      this.record = record || {}
      this.title = title || '放行条详情'
      this.visible = true
      this.loading = true
      this.approvalData = null
      this.userMap = {}

      var that = this
      that
        .loadApprovalData()
        .then(function () {
          that.loading = false
        })
        .catch(function () {
          that.loading = false
        })
    },
    loadApprovalData() {
      var that = this
      return getAction('/fkzx/hrmFkzxSplc/list', { busId: that.record.id })
        .then(function (res) {
          if (res.success && res.result) {
            // 兼容流程引擎格式：result 直接是审批节点数组（customProcessSqdSpjdList 格式）
            if (Array.isArray(res.result)) {
              that.$set(that.record, 'customProcessSqdSpjdList', res.result)
              return Promise.resolve()
            }
            // 兼容旧格式：{ records: [...] } 分页结构
            if (res.result.records && res.result.records.length > 0) {
              that.approvalData = res.result.records[0]
              // 将审批流程数据合并到 record 上，供 ApprovalTimeline 组件读取
              that.$set(that.record, 'splc', that.approvalData)
              var sprVals = that.approvalData.spr || ''
              var csrVals = that.approvalData.csr || ''
              var allNos = []
              if (sprVals) allNos = allNos.concat(that.extractWorkNos(sprVals))
              if (csrVals) allNos = allNos.concat(that.extractWorkNos(csrVals))
              if (allNos.length > 0) {
                return that.loadUserInfoByNos(allNos.join(','))
              }
            }
          }
          return Promise.resolve()
        })
        .catch(function (err) {
          console.error('查询审批流程失败：', err)
          return Promise.resolve()
        })
    },
    extractWorkNos(vals) {
      return String(vals)
        .split(',')
        .filter(Boolean)
        .filter(function (v) {
          return !/[\u4e00-\u9fa5]/.test(v)
        })
    },
    loadUserInfoByNos(nos) {
      var that = this
      return getAction('/hrm/hrEmployeeInformation/queryByNos', {
        nos: nos,
      })
        .then(function (res) {
          if (res.result) {
            var list = Array.isArray(res.result) ? res.result : res.result.records || []
            list.forEach(function (user) {
              if (!that.userMap[user.no]) {
                that.userMap[user.no] = {
                  realname: user.name,
                  workNo: user.no || '',
                }
              }
            })
          }
          return Promise.resolve()
        })
        .catch(function (err) {
          console.error('查询用户信息失败：', err)
          return Promise.resolve()
        })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
@import '../visitor-theme.less';

.visitor-detail-modal {
  /deep/ .ant-modal-body {
    padding: 22px 24px;
    max-height: 80vh;
    overflow-y: auto;
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
    &.full {
      width: 100%;
    }
    &:last-child {
      border-bottom: none;
    }
  }
  /deep/ .detail-label {
    width: 110px;
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

.visitor-detail-body {
  font-family: @v-font-sans;
  color: @v-foreground;
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
  &.waiting {
    background: rgba(59, 130, 246, 0.1);
    color: #2563eb;
  }
  &.rejected {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
  }
  &.cancelled {
    background: rgba(100, 116, 139, 0.1);
    color: @v-muted-foreground;
  }
  &.released {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }
}

.approval-card {
  border: 1px solid @v-border;
  border-radius: 10px;
  padding: 14px 18px 16px;
  background: #fff;
}
</style>

