<template>
  <j-modal
    title="访谈问题跟进详情"
    :width="680"
    :visible="visible"
    :footer="null"
    :bodyStyle="{ padding: 0 }"
    @cancel="close"
  >
    <a-spin :spinning="loading">
      <div style="padding: 20px 24px">
        <!-- 员工基本信息 -->
        <div class="form-section-title" style="margin-top: 0"><span class="icon">●</span> 员工基本信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">公司</span>
            <span class="info-value">{{ record.companyId_dictText || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">所属部门</span>
            <span class="info-value">{{ record.dept_dictText || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">岗位名称</span>
            <span class="info-value">{{ record.postId_dictText || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">职级名称</span>
            <span class="info-value">{{ record.postRank_dictText || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">姓名</span>
            <span class="info-value">{{ record.xm || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">工号</span>
            <span class="info-value">{{ record.gh || '-' }}</span>
          </div>
        </div>

        <!-- 访谈信息 -->
        <div class="form-section-title"><span class="icon">●</span> 访谈信息</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">访谈类型</span>
            <span class="info-value">{{ record.ftlx || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">所属种类</span>
            <span class="info-value">{{ record.sszl || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">适用职级</span>
            <span class="info-value">{{ record.syzj || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">跟进情况</span>
            <span class="info-value">
              <a-tag :color="record.gjqk === '跟进中' ? '#e6a23c' : '#67c23a'">{{ record.gjqk || '-' }}</a-tag>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">访谈时间</span>
            <span class="info-value">{{ record.ftsj || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">跟进人</span>
            <span class="info-value">{{ record.gjr || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">问题内容</span>
            <span class="info-value" style="line-height: 1.6">{{ record.wtnr || '-' }}</span>
          </div>
          <div class="info-item double">
            <span class="info-label">访谈情况</span>
            <span class="info-value" style="line-height: 1.6">{{ record.ftqk || '-' }}</span>
          </div>
        </div>

        <!-- 跟进记录 -->
        <div class="form-section-title"><span class="icon">●</span> 跟进记录</div>
        <div class="follow-records">
          <template v-if="record.gjms">
            <div class="record-item">
              <div class="record-time">{{ record.gjsj || '-' }}</div>
              <div class="record-desc"><span class="record-label">跟进描述：</span>{{ record.gjms || '-' }}</div>
              <div v-if="record.fj" class="record-attachment">
                <span class="record-label">附件：</span>
                <a @click="lookPdf(record.fj)" style="color: #4a7bf7">📎 {{ getFileName(record.fj) }}</a>
              </div>
            </div>
          </template>
          <div v-else class="no-records">暂无跟进记录</div>
        </div>
      </div>
    </a-spin>

    <!-- 底部按钮 -->
    <template slot="footer">
      <div style="text-align: right; padding: 12px 24px; border-top: 1px solid #eee">
        <a-button @click="close">关闭</a-button>
      </div>
    </template>
  </j-modal>
</template>

<script>
import { getAction } from '@/api/manage'

export default {
  name: 'DetailModal',
  data() {
    return {
      visible: false,
      loading: false,
      record: {},
      followRecords: [],
    }
  },
  methods: {
    // 显示弹窗
    async show(record) {
      this.record = {}
      this.visible = true

      // 调用接口获取详细数据
      if (record && record.id) {
        this.loading = true
        try {
          const res = await getAction('/ryManage/hrmFtwtkj/queryById', { id: record.id })
          if (res.success) {
            this.record = res.result || {}
          } else {
            this.$message.warning(res.message || '获取详情失败')
          }
        } catch (error) {
          console.error('获取访谈详情失败:', error)
          this.$message.error('获取详情失败，请稍后重试')
        } finally {
          this.loading = false
        }
      }
    },
    // 关闭弹窗
    close() {
      this.visible = false
      this.record = {}
    },
    lookPdf(text) {
      this.$store.dispatch('openPdf', text)
    },
    // 获取文件名
    getFileName(path) {
      if (!path) return ''
      const parts = path.split('/')
      return parts[parts.length - 1] || path
    },
  },
}
</script>

<style scoped lang="less">
.form-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  font-weight: 600;
  color: #333;

  .icon {
    color: #4a7bf7;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  font-size: 13px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.full {
    grid-column: 1 / -1;
  }

  &.double {
    grid-column: span 2;
  }

  .info-label {
    font-size: 12px;
    color: #999;
  }

  .info-value {
    font-size: 14px;
    color: #333;
  }
}

.follow-records {
  margin-bottom: 16px;
}

.record-item {
  padding: 12px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  margin-bottom: 10px;
  background: #fafbfc;

  .record-time {
    font-size: 12px;
    color: #999;
    margin-bottom: 8px;
  }

  .record-desc {
    font-size: 13px;
    color: #333;
    line-height: 1.6;
    margin-bottom: 6px;
  }

  .record-attachment {
    font-size: 13px;
    color: #4a7bf7;
  }

  .record-label {
    color: #666;
  }
}

.no-records {
  color: #999;
  text-align: center;
  padding: 20px;
  font-size: 13px;
  border: 1px dashed #e8e8e8;
  border-radius: 4px;
}
</style>
