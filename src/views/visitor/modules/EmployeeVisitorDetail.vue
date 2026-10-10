<template>
  <a-modal
    :title="title"
    :width="900"
    :visible="visible"
    :footer="null"
    @cancel="handleCancel"
    class="visitor-detail-modal"
    centered
  >
    <a-spin :spinning="loading">
      <div class="visitor-detail-body">
        <!-- 访客信息 -->
        <div class="section-title"><span class="section-title-text">访客信息</span></div>
        <div class="detail-card">
          <div class="detail-grid">
            <div class="detail-row">
              <div class="detail-label">姓名</div>
              <div class="detail-value">{{ record.xm || '—' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">联系方式</div>
              <div class="detail-value">{{ record.lxfs || '—' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">身份证号码</div>
              <div class="detail-value">{{ record.sfzh || '—' }}</div>
            </div>
            <div class="detail-row" v-if="!isTemp">
              <div class="detail-label">所属公司或个人</div>
              <div class="detail-value">{{ record.ssgshgr || '—' }}</div>
            </div>
            <div class="detail-row" v-if="isTemp">
              <div class="detail-label">派遣公司</div>
              <div class="detail-value">{{ record.pqgs_dictText || record.pqgs || '—' }}</div>
            </div>
            <div class="detail-row" v-if="!isTemp">
              <div class="detail-label">来访区域</div>
              <div class="detail-value">{{ lfqyText }}</div>
            </div>
            <div class="detail-row" v-if="!isTemp">
              <div class="detail-label">车牌号</div>
              <div class="detail-value">{{ record.cph || '—' }}</div>
            </div>
            <div class="detail-row" v-if="!isTemp">
              <div class="detail-label">来访事由</div>
              <div class="detail-value">{{ lfsyText }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">来访类型</div>
              <div class="detail-value">{{ lflxText }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">预计来访时间</div>
              <div class="detail-value">{{ record.yjlfsj || '—' }}</div>
            </div>
            <div class="detail-row" v-if="!isTemp">
              <div class="detail-label">申请时间</div>
              <div class="detail-value">{{ record.createTime || '—' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">接待人</div>
              <div class="detail-value">{{ record.jdr || '—' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">接待人联系方式</div>
              <div class="detail-value">{{ record.jdrlxfs || '—' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">来访人数</div>
              <div class="detail-value">{{ record.lfrs ? record.lfrs + ' 人' : '—' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">状态</div>
              <div class="detail-value">
                <span :class="['status-tag', statusClass]"
                  ><span v-if="showDot" class="dot"></span>{{ statusText }}</span
                >
              </div>
            </div>
            <div class="detail-row full" v-if="!isTemp">
              <div class="detail-label">来访事由详细</div>
              <div class="detail-value" v-html="record.lfsrxx || '—'" style="white-space: pre-line"></div>
            </div>
            <div class="detail-row full">
              <div class="detail-label">附件</div>
              <div class="detail-value">
                <j-upload-list
                  v-if="record.scfj"
                  v-model="record.scfj"
                  text="选择文件"
                  bizPath="visitor"
                  :returnUrl="true"
                  disabled
                  onlySuffix
                />
                <!-- <div v-if="attachments.length" class="detail-attach">
                  <span v-for="(file, idx) in attachments" :key="idx" class="file-chip" @click="lookPdf(file)"
                    ><a-icon type="file" />{{ file }}</span
                  >
                </div> -->
                <span v-else>—</span>
              </div>
            </div>
          </div>
        </div>
        <!-- 同行人 -->
        <template v-if="showCompanions">
          <div class="section-title" style="margin-top: 20px"><span class="section-title-text">同行人</span></div>
          <div class="companion-card">
            <table v-if="companionsList.length" class="companion-table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>身份证</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in companionsList" :key="idx">
                  <td>{{ item.xm || '—' }}</td>
                  <td>{{ item.sfzh || '—' }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="detail-empty">
              <div class="box-icon">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14 38h72v48a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V38z"
                    fill="#f1f5f9"
                    stroke="#94a3b8"
                    stroke-width="2"
                  />
                  <path d="M14 38L22 24h56l8 14" stroke="#94a3b8" stroke-width="2" fill="#f8fafc" />
                  <path d="M22 24L18 38" stroke="#94a3b8" stroke-width="2" />
                  <path d="M78 24l4 14" stroke="#94a3b8" stroke-width="2" />
                  <path d="M50 30v6" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
                  <path d="M44 36h12" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
                  <rect
                    x="40"
                    y="58"
                    width="20"
                    height="12"
                    rx="1.5"
                    fill="#dbeafe"
                    stroke="#2563eb"
                    stroke-width="1.5"
                  />
                  <path d="M44 58v-3a6 6 0 0 1 12 0v3" stroke="#2563eb" stroke-width="1.5" fill="none" />
                </svg>
              </div>
              <div class="empty-text">暂无数据</div>
            </div>
          </div>
        </template>
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
  name: 'EmployeeVisitorDetail',
  components: {
    JUploadList,
    ApprovalTimeline,
  },
  data: function () {
    return {
      title: '访客详情',
      visible: false,
      record: {},
      loading: false,
      showCompanions: true,
      detailType: '',
      approvalData: null,
      companionsList: [],
      userMap: {},
    }
  },
  computed: {
    isTemp: function () {
      return this.detailType === 'temp'
    },
    statusMap: function () {
      return {
        0: { label: '审批中', cls: 'pending' },
        1: { label: '已通过', cls: 'approved' },
        2: { label: '不通过', cls: 'rejected' },
        3: { label: '已撤回', cls: 'cancelled' },
        待来访: { label: '待来访', cls: 'waiting' },
        已来访: { label: '已来访', cls: 'visited' },
      }
    },
    statusText: function () {
      // zt=1时按lfzt显示来访状态
      if (this.record.zt === '1' || this.record.zt === 1) {
        var lfzt = this.record.lfzt
        if (lfzt === '1' || lfzt === 1) return '已来访'
        return '待来访'
      }
      var status = this.record.zt || ''
      var statusInfo = this.statusMap[status]
      return (statusInfo && statusInfo.label) || status || '—'
    },
    statusClass: function () {
      if (this.record.zt === '1' || this.record.zt === 1) {
        var lfzt = this.record.lfzt
        if (lfzt === '1' || lfzt === 1) return 'visited'
        return 'waiting'
      }
      var status = this.record.zt || ''
      var statusInfo = this.statusMap[status]
      return (statusInfo && statusInfo.cls) || ''
    },
    showDot: function () {
      var status = this.record.zt || ''
      return ['0', '待来访'].indexOf(status) !== -1
    },
    attachments: function () {
      var scfj = this.record.scfj
      if (!scfj) return []
      if (typeof scfj === 'string') {
        return scfj.split(',').filter(function (item) {
          return item && item.trim()
        })
      }
      return Array.isArray(scfj) ? scfj : []
    },
    // 来访区域文本
    lfqyText: function () {
      return this.record.lfqy_dictText || this.record.lfqy || '—'
    },
    // 来访类型文本
    lflxText: function () {
      return this.record.lflx_dictText || this.record.lflx || '—'
    },
    // 来访事由文本
    lfsyText: function () {
      return this.record.lfsy_dictText || this.record.lfsy || '—'
    },
  },
  methods: {
    lookPdf: function (file) {
      this.$store.dispatch('openPdf', file)
    },
    show: function (record, title, showCompanions, detailType) {
      this.record = record || {}
      this.title = title || '访客详情'
      this.showCompanions = showCompanions !== false
      this.detailType = detailType || ''
      this.visible = true
      this.loading = true
      this.approvalData = null
      this.companionsList = []
      this.userMap = {}
      var that = this
      var promises = [that.loadApprovalData()]
      if (this.showCompanions) {
        promises.push(that.loadCompanions())
      }
      Promise.all(promises)
        .then(function () {
          that.loading = false
        })
        .catch(function () {
          that.loading = false
        })
    },
    loadApprovalData: function () {
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
              // 将审批流程数据合并到 record 上，供 ApprovalTimeline 组件读取（新旧格式都兼容）
              that.$set(that.record, 'splc', that.approvalData)
              var sprVals = that.approvalData.spr || ''
              var csrVals = that.approvalData.csr || ''
              // 收集所有工号（非中文的值视为工号，需查询接口）
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
        })
    },
    // 从逗号分隔的值中提取工号（不含中文的值视为工号）
    extractWorkNos: function (vals) {
      return String(vals)
        .split(',')
        .filter(Boolean)
        .filter(function (v) {
          return !/[一-龥]/.test(v)
        })
    },
    loadUserInfoByNos: function (nos) {
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
    loadCompanions: function () {
      var that = this
      return getAction('/fkzx/hrmFkzxSq/listHrmFkzxsqTxrByMainId', { fkzxSqId: that.record.id })
        .then(function (res) {
          if (res.success && res.result) {
            // 兼容分页对象和直接数组两种返回结构
            that.companionsList = Array.isArray(res.result) ? res.result : res.result.records || []
          }
          return Promise.resolve()
        })
        .catch(function (err) {
          console.error('查询同行人失败：', err)
          return Promise.resolve()
        })
    },
    handleCancel: function () {
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
  &.approved {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }
  &.pending {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
  }
  &.cancelled {
    background: rgba(100, 116, 139, 0.1);
    color: @v-muted-foreground;
  }
  &.rejected {
    background: rgba(239, 68, 68, 0.08);
    color: #dc2626;
  }
  &.visited {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }
  &.waiting {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
  }
}
.detail-attach {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  .file-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    padding: 4px 10px;
    background: rgba(@v-primary-rgb, 0.06);
    border: 1px solid rgba(@v-primary-rgb, 0.18);
    border-radius: 6px;
    font-size: 12px;
    color: @v-foreground;
    .anticon {
      font-size: 12px;
      color: @v-primary;
    }
  }
}
.companion-card {
  border: 1px solid @v-border;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}
.companion-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
  thead th {
    background: rgba(@v-primary-rgb, 0.04);
    color: rgba(@v-primary-rgb, 0.65);
    font-weight: 600;
    font-size: 12px;
    padding: 10px 16px;
    text-align: center;
    border-bottom: 1px solid @v-border;
    letter-spacing: 0.02em;
  }
  tbody td {
    padding: 10px 16px;
    border-bottom: 1px solid rgba(226, 232, 240, 0.5);
    color: @v-foreground;
    font-size: 13px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tbody tr:hover {
    background: rgba(@v-primary-rgb, 0.025);
  }
}
.detail-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 0 12px;
  gap: 8px;
  .box-icon {
    width: 42px;
    height: 42px;
    color: #94a3b8;
    svg {
      width: 100%;
      height: 100%;
    }
  }
  .empty-text {
    font-size: 12px;
    color: @v-muted-foreground;
  }
}
.approval-card {
  border: 1px solid @v-border;
  border-radius: 10px;
  padding: 14px 18px 16px;
  background: #fff;
}
</style>

