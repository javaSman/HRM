<template>
  <div class="resume-invite-form">
    <section class="invite-section">
      <div class="invite-section-title">
        <a-icon type="profile" class="invite-section-icon" />
        <span>邀约人信息</span>
      </div>
      <div class="invite-person-card">
        <div class="invite-info-grid">
          <div><strong>姓名：</strong>{{ formatValue(record.xm) }}</div>
          <div><strong>专业：</strong>{{ formatValue(record.zy) }}</div>
          <div><strong>关联岗位：</strong>{{ formatValue(record.postName) }}</div>
          <!-- <div><strong>职级名称：</strong>{{ candidateLevelText }}</div> -->
          <div><strong>期望薪资：</strong>{{ formatValue(record.qwxz) }}</div>
        </div>
      </div>
    </section>

    <section class="invite-section">
      <div class="invite-section-title">
        <a-icon type="calendar" class="invite-section-icon" />
        <span>面试信息</span>
      </div>
      <a-row :gutter="20">
        <a-col :span="24">
          <a-form-model-item label="面试人" required>
            <j-select-employee
              v-model="form.msr"
              placeholder="请选择面试人"
              value-field="name"
              button-text="添加"
              button-icon="plus"
              button-type="default"
              @change="handleInterviewerChange"
            />
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row :gutter="20">
        <a-col :xs="24" :sm="12">
          <a-form-model-item label="面试形式" required>
            <a-select v-model="form.msxs" allowClear placeholder="请选择" @change="handleInterviewTypeChange">
              <a-select-option value="线下">线下</a-select-option>
              <a-select-option value="电话">电话</a-select-option>
              <a-select-option value="视频">视频</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col v-if="needInterviewLocation" :xs="24" :sm="12">
          <a-form-model-item label="面试地点" required>
            <a-input v-model.trim="form.msdd" placeholder="请输入面试地点" />
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row :gutter="20">
        <a-col :xs="24" :sm="12">
          <a-form-model-item label="面试时间" required>
            <j-date
              v-model="form.mssj"
              :show-time="true"
              date-format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择面试时间"
              style="width: 100%"
            />
          </a-form-model-item>
        </a-col>
        <a-col :xs="24" :sm="12">
          <a-form-model-item label="最晚确认时间" required>
            <j-date
              v-model="form.zwqrsj"
              :show-time="true"
              date-format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择最晚确认时间"
              style="width: 100%"
            />
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row :gutter="20">
        <a-col :xs="24" :sm="12">
          <a-form-model-item label="需要携带材料">
            <a-select v-model="form.xyxdcl" allowClear placeholder="请选择">
              <a-select-option value="id">身份证</a-select-option>
              <a-select-option value="resume_copy">简历复印件</a-select-option>
              <a-select-option value="both">身份证 + 简历复印件</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-form-model-item label="备注">
        <a-textarea v-model.trim="form.remark" :autoSize="{ minRows: 3, maxRows: 5 }" placeholder="请输入备注信息..." />
      </a-form-model-item>
    </section>
  </div>
</template>

<script>
export default {
  name: 'ResumeInviteForm',
  props: {
    record: { type: Object, default: () => ({}) },
    form: { type: Object, default: () => ({}) }
  },
  computed: {
    candidateLevelText() {
      return this.formatValue(
        this.record.zjmc || this.record.levelName || this.record.levelId_dictText || this.record.levelId || '-'
      )
    },
    needInterviewLocation() {
      return this.form.msxs === '线下' || this.form.msxs === 'offline'
    }
  },
  methods: {
    handleInterviewerChange(value, rows) {
      this.form.msr =
        (rows || [])
          .map(item => item.name)
          .filter(Boolean)
          .join(',') ||
        value ||
        ''
    },
    handleInterviewTypeChange(value) {
      if (value !== '线下' && value !== 'offline') {
        this.form.msdd = ''
      }
    },
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    }
  }
}
</script>

<style scoped lang="less">
.invite-section {
  margin-bottom: 24px;
}

.invite-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  font-weight: 600;
}

.invite-section-icon {
  color: #4a7bf7;
}

.invite-person-card {
  padding: 16px;
  border-radius: 8px;
  background: #f5f8ff;
  color: #555;
  font-size: 13px;
}

.invite-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
</style>
