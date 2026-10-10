<template>
  <j-modal
    title="调薪详情"
    :width="900"
    :visible="visible"
    switchFullscreen
    :footer="null"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <!-- 顶部状态条 -->
      <div class="status-bar">
        <span
          >调薪类型：<strong>{{ record.txlx || '-' }}</strong></span
        >
        <span>
          状态：
          <strong :style="{ color: statusColor }">{{ record.zt || '-' }}</strong>
        </span>
        <span
          >生效日期：<span style="color: #555">{{ record.sxrq || '-' }}</span></span
        >
      </div>

      <!-- 基本信息 -->
      <div class="section-title">基本信息</div>
      <div class="info-header">
        姓名：<strong>{{ record.xm || '-' }}</strong> &nbsp;&nbsp; 工号：<span style="color: #555">{{
          record.gh || '-'
        }}</span>
      </div>
      <table class="info-table">
        <tbody>
          <tr>
            <td class="label">公司</td>
            <td class="value">{{ record.companyId_dictText || '-' }}</td>
            <td class="label">所属部门</td>
            <td class="value">{{ record.dept_dictText || '-' }}</td>
          </tr>
          <tr>
            <td class="label">岗位名称</td>
            <td class="value">{{ record.postId_dictText || '-' }}</td>
            <td class="label">调薪类型</td>
            <td class="value">{{ record.txlx || '-' }}</td>
          </tr>
          <tr>
            <td class="label">调薪前薪资(k)</td>
            <td class="value salary-old">{{ record.txqxz || '-' }}</td>
            <td class="label">调薪后薪资(k)</td>
            <td class="value salary-new">{{ record.txhxz || '-' }}</td>
          </tr>
          <tr>
            <td class="label">生效日期</td>
            <td class="value">{{ record.sxrq || '-' }}</td>
            <td class="label">申请时间</td>
            <td class="value">{{ record.sqsj || '-' }}</td>
          </tr>
          <tr>
            <td class="label">申请人</td>
            <td class="value">{{ record.sqr || '-' }}</td>
            <td class="label">抄送人</td>
            <td class="value">{{ record.csr_dictText || record.csr || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 调薪原因 -->
      <div class="reason-section">
        <div class="reason-label">调薪原因</div>
        <div class="reason-content">{{ record.txyy || '-' }}</div>
      </div>

      <!-- 审批流程 -->
      <div class="section-title">审批流程</div>
      <div class="flow-container">
        <approval-timeline :apply-id="record.id" :l-cdata="record" />
      </div>
    </a-spin>
  </j-modal>
</template>

<script>
import { getAction } from '@/api/manage'
import ApprovalTimeline from './ApprovalTimeline.vue'

export default {
  name: 'HrmTxsqDetailModal',
  components: {
    ApprovalTimeline,
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      record: {},
    }
  },
  computed: {
    statusColor() {
      const colors = {
        审批中: '#e6a23c',
        通过: '#55c42a',
        不通过: '#f56c6c',
        已取消: '#909399',
      }
      return colors[this.record.zt] || '#909399'
    },
  },
  methods: {
    async show(record) {
      this.record = {}
      this.visible = true

      // 调用接口获取详细数据
      if (record && record.id) {
        this.confirmLoading = true
        try {
          const res = await getAction('/ryManage/hrmTxsq/queryById', { id: record.id })
          if (res.success) {
            this.record = res.result || {}
          } else {
            this.$message.warning(res.message || '获取详情失败')
          }
        } catch (error) {
          console.error('获取薪资调整详情失败:', error)
          this.$message.error('获取详情失败，请稍后重试')
        } finally {
          this.confirmLoading = false
        }
      }
    },
    handleCancel() {
      this.visible = false
      this.record = {}
    },
  },
}
</script>

<style scoped lang="less">
/* 顶部状态条 */
.status-bar {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #f8f9fb;
  border-radius: 8px;
  font-size: 13px;
  color: #666;

  strong {
    color: #333;
  }
}

/* 区块标题 */
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

/* 姓名、工号行 */
.info-header {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;

  strong {
    color: #333;
  }
}

/* 信息表格 */
.info-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  td {
    padding: 10px 14px;
    border: 1px solid #eee;
  }

  .label {
    width: 18%;
    color: #888;
    background: #fafbfc;
  }

  .value {
    color: #333;
  }

  .salary-old {
    color: #ff4d4f;
    font-weight: 500;
  }

  .salary-new {
    color: #52c41a;
    font-weight: 500;
  }
}

/* 调薪原因区块 */
.reason-section {
  margin-top: 16px;
}

.reason-label {
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}

.reason-content {
  background: #f8f9fb;
  padding: 14px 16px;
  border-radius: 6px;
  line-height: 1.8;
  color: #555;
  font-size: 13px;
}

/* 审批流程容器 */
.flow-container {
  padding-left: 10px;
}
</style>

