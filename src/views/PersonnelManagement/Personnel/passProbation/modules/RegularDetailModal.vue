<template>
  <j-modal
    :title="modalTitle"
    :width="1000"
    :visible="visible"
    switchFullscreen
    :bodyStyle="{ padding: '0' }"
    :dialogStyle="{ top: '30px' }"
    @cancel="close"
  >
    <a-spin :spinning="loading">
      <!-- 基本信息 -->
      <div class="detail-basic-section">
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="detail-info-item">
              <span class="detail-info-label">姓名</span>
              <span class="detail-info-value">{{ formatValue(detail.xm) }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-info-item">
              <span class="detail-info-label">工号</span>
              <span class="detail-info-value">{{ formatValue(detail.gh) }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-info-item">
              <span class="detail-info-label">公司</span>
              <span class="detail-info-value">{{ formatValue(detail.companyId_dictText) }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-info-item">
              <span class="detail-info-label">所属部门</span>
              <span class="detail-info-value">{{ formatValue(detail.dept_dictText) }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-info-item">
              <span class="detail-info-label">岗位名称</span>
              <span class="detail-info-value">{{ formatValue(detail.postId_dictText) }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-info-item">
              <span class="detail-info-label">职级名称</span>
              <span class="detail-info-value">{{ formatValue(detail.postRank_dictText) }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-info-item">
              <span class="detail-info-label">申请状态</span>
              <span class="detail-info-value">
                {{ detail.zt }}
                <!-- <a-tag v-if="detail.zt" :color="statusColor">{{ detail.zt }}</a-tag>
                <span v-else>-</span> -->
              </span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-info-item">
              <span class="detail-info-label">试用期开始</span>
              <span class="detail-info-value">{{ formatValue(detail.syqkssj) }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-info-item">
              <span class="detail-info-label">试用期结束</span>
              <span class="detail-info-value">{{ formatValue(detail.syqjssj) }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-info-item">
              <span class="detail-info-label">计划转正日期</span>
              <span class="detail-info-value">{{ formatValue(detail.jhzzrq) }}</span>
            </div>
          </a-col>
          <a-col :span="8">
            <div class="detail-info-item">
              <span class="detail-info-label">申请人</span>
              <span class="detail-info-value">{{ formatValue(detail.createBy) }}</span>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- Tab 切换区域 -->
      <a-tabs :activeKey="activeTab" :animated="false" class="detail-tabs" @change="activeTab = $event">
        <a-tab-pane key="opinion" tab="转正意见">
          <div class="detail-tab-content">
            <div class="detail-section-title"><a-icon type="form" /> 转正意见</div>
            <div class="detail-opinion-box">
              {{ formatValue(detail.zzyj) }}
            </div>
            <div class="detail-opinion-applicant">
              申请人：<span>{{ formatValue(detail.createBy) }}</span>
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="flow" tab="审批流程">
          <div class="detail-tab-content">
            <div class="detail-section-title"><a-icon type="audit" /> 审批流程</div>
            <approval-timeline :apply-id="detail.id" :l-cdata="detail" />
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-spin>

    <template slot="footer">
      <a-button @click="close">关闭</a-button>
    </template>
  </j-modal>
</template>

<script>
import { getAction } from '@/api/manage'
import ApprovalTimeline from './ApprovalTimeline'

function formatValue(value) {
  return value === undefined || value === null || value === '' ? '-' : value
}

export default {
  name: 'RegularDetailModal',
  components: { ApprovalTimeline },
  data() {
    return {
      visible: false,
      loading: false,
      activeTab: 'opinion',
      detail: {},
      url: {
        queryById: '/ryManage/hrmSyqgzFqzzsq/queryById',
      },
    }
  },
  computed: {
    modalTitle() {
      return `转正申请详情 - ${formatValue(this.detail.xm)}`
    },
    statusColor() {
      const colors = {
        已转正: '#55c42a',
        未转正: '#e6a23c',
        拒绝转正: '#f56c6c',
      }
      return colors[this.detail.zt] || '#1890ff'
    },
  },
  methods: {
    open(record) {
      if (!record || !record.id) {
        this.$message.warning('缺少记录ID，无法加载详情')
        return
      }
      this.detail = {}
      this.activeTab = 'opinion'
      this.visible = true
      this.loading = true

      // 加载详情数据
      getAction(this.url.queryById, { id: record.id })
        .then((res) => {
          if (!res || !res.success) {
            throw new Error((res && res.message) || '详情加载失败')
          }
          this.detail = res.result || {}
        })
        .catch((error) => {
          this.visible = false
          this.$message.error(error.message || '详情加载失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },
    close() {
      this.visible = false
      this.detail = {}
      this.activeTab = 'opinion'
    },
    formatValue,
  },
}
</script>

<style scoped lang="less">
.detail-basic-section {
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  // background: #fafafa;
}

.detail-info-item {
  display: flex;
  margin-bottom: 12px;
  line-height: 32px;
}

.detail-info-label {
  flex-shrink: 0;
  width: 90px;
  color: #999;
  font-size: 13px;
}

.detail-info-value {
  flex: 1;
  min-width: 0;
  color: #333;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-tabs {
  padding: 0 24px;
}

.detail-tab-content {
  padding: 20px 0;
}

.detail-section-title {
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: #333;
  font-size: 15px;
  font-weight: 600;

  .anticon {
    margin-right: 8px;
    color: #1890ff;
  }
}

.detail-opinion-box {
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fb;
  line-height: 1.8;
  color: #555;
  min-height: 80px;
}

.detail-opinion-applicant {
  margin-top: 16px;
  font-size: 13px;
  color: #999;

  span {
    color: #333;
  }
}

.flow-remark {
  margin-top: 6px;
  padding: 8px 12px;
  border-radius: 4px;
  background: #f5f5f5;
  color: #666;
  font-size: 13px;
}
</style>
