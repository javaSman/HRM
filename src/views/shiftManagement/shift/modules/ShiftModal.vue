<template>
  <a-modal
    :title="null"
    :width="760"
    :visible="visible"
    :maskClosable="false"
    :destroyOnClose="true"
    :confirmLoading="confirmLoading"
    :footer="null"
    wrapClassName="shift-modal-wrap"
    @ok="handleOk"
    @cancel="handleCancel">
    <a-spin :spinning="confirmLoading">
      <div class="shift-modal-shell">
        <div class="shift-modal-hero">
          <div>
            <div class="shift-modal-title">{{ title }}</div>
            <div class="shift-modal-subtitle">
              {{ model.id ? '调整班次信息后将同步更新排班规则与时段配置。' : '创建新班次并定义时段、工时和启用策略。' }}
            </div>
          </div>
          <span :class="['shift-modal-badge', model.id ? 'edit-badge' : 'create-badge']">
            {{ model.id ? '编辑模式' : '新增模式' }}
          </span>
        </div>

        <a-form-model
          ref="form"
          :model="model"
          :rules="validatorRules"
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          class="shift-modal-form">
          <div class="modal-section">
            <div class="modal-section-header">
              <div class="modal-section-title">基础信息</div>
              <div class="modal-section-desc">定义班次名称、类型和生效方式。</div>
            </div>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-model-item label="班次名称" prop="name">
                  <a-input v-model="model.name" placeholder="请输入班次名称" />
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="班次类型" prop="shiftType">
                  <a-select v-model="model.shiftType" placeholder="请选择班次类型">
                    <a-select-option
                      v-for="item in shiftTypeOptions"
                      :key="item.value"
                      :value="item.value">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
            </a-row>

            <a-form-model-item label="期限类型" prop="termType">
              <a-radio-group v-model="model.termType" class="term-type-group">
                <a-radio-button
                  v-for="item in termTypeOptions"
                  :key="item.value"
                  :value="item.value">
                  {{ item.label }}
                </a-radio-button>
              </a-radio-group>
            </a-form-model-item>
          </div>

          <div class="modal-section">
            <div class="modal-section-header section-header-inline">
              <div>
                <div class="modal-section-title">时段配置</div>
                <div class="modal-section-desc">支持一个班次配置多个连续时段与休息区间。</div>
              </div>
              <a-button class="add-period-button" icon="plus" @click="addPeriod">添加时段</a-button>
            </div>

            <a-form-model-item prop="periods" class="period-form-item">
              <div class="period-list">
                <div
                  v-for="(period, index) in model.periods"
                  :key="'period-' + index"
                  class="period-card">
                  <div class="period-card-header">
                    <div class="period-meta">
                      <span class="period-index">{{ index + 1 }}</span>
                      <span class="period-title">时段 {{ index + 1 }}</span>
                    </div>
                    <a-button
                      v-if="model.periods.length > 1"
                      class="period-remove-button"
                      size="small"
                      icon="delete"
                      @click="removePeriod(index)">
                      删除
                    </a-button>
                  </div>
                  <a-row :gutter="12">
                    <a-col :span="12">
                      <a-form-model-item
                        :labelCol="{ span: 24 }"
                        :wrapperCol="{ span: 24 }"
                        :prop="'periods.' + index + '.startTime'"
                        :rules="periodRequiredRule"
                        label="上班时间">
                        <a-input v-model="period.startTime" type="time" />
                      </a-form-model-item>
                    </a-col>
                    <a-col :span="12">
                      <a-form-model-item
                        :labelCol="{ span: 24 }"
                        :wrapperCol="{ span: 24 }"
                        :prop="'periods.' + index + '.endTime'"
                        :rules="periodRequiredRule"
                        label="下班时间">
                        <a-input v-model="period.endTime" type="time" />
                      </a-form-model-item>
                    </a-col>
                  </a-row>
                  <a-row :gutter="12">
                    <a-col :span="12">
                      <a-form-model-item
                        :labelCol="{ span: 24 }"
                        :wrapperCol="{ span: 24 }"
                        label="休息开始">
                        <a-input v-model="period.breakStart" type="time" />
                      </a-form-model-item>
                    </a-col>
                    <a-col :span="12">
                      <a-form-model-item
                        :labelCol="{ span: 24 }"
                        :wrapperCol="{ span: 24 }"
                        label="休息结束">
                        <a-input v-model="period.breakEnd" type="time" />
                      </a-form-model-item>
                    </a-col>
                  </a-row>
                </div>
              </div>
            </a-form-model-item>
          </div>

          <div class="modal-section compact-section">
            <div class="modal-section-header">
              <div class="modal-section-title">工时与状态</div>
              <div class="modal-section-desc">设置标准工时、自动加班阈值以及启用状态。</div>
            </div>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-model-item label="标准工时（小时）" prop="standardHours">
                  <a-input-number
                    v-model="model.standardHours"
                    :min="0"
                    :step="0.5"
                    :precision="1"
                    style="width: 100%" />
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="自动加班时长（小时）" prop="overtimeHours">
                  <a-input-number
                    v-model="model.overtimeHours"
                    :min="0"
                    :step="0.5"
                    :precision="1"
                    style="width: 100%" />
                </a-form-model-item>
              </a-col>
            </a-row>

            <div class="status-card">
              <div>
                <div class="status-card-title">启用状态</div>
                <div class="status-card-desc">启用后将可参与排班计划生成与换班审批。</div>
              </div>
              <div class="switch-row">
                <a-switch v-model="model.enabled" />
                <span class="switch-text">{{ model.enabled ? '启用' : '停用' }}</span>
              </div>
            </div>
          </div>
        </a-form-model>

        <div class="shift-modal-footer">
          <a-button class="modal-cancel-button" @click="handleCancel">取消</a-button>
          <a-button class="modal-confirm-button" type="primary" :loading="confirmLoading" @click="handleOk">
            {{ model.id ? '保存修改' : '确认新增' }}
          </a-button>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
const shiftTypeOptions = [
  { value: 'fixed', label: '固定班次' },
  { value: 'flexible', label: '弹性班次' },
  { value: 'rotation', label: '轮换班次' }
]

const termTypeOptions = [
  { value: 'fixed', label: '固定期限' },
  { value: 'unlimited', label: '无固定期限' }
]

function createDefaultPeriod () {
  return {
    startTime: '09:00',
    endTime: '18:00',
    breakStart: '12:00',
    breakEnd: '13:00'
  }
}

function createDefaultModel () {
  return {
    id: '',
    name: '',
    shiftType: 'fixed',
    termType: 'fixed',
    standardHours: 8,
    overtimeHours: 0,
    enabled: true,
    periods: [createDefaultPeriod()]
  }
}

function clonePeriods (periods) {
  const source = Array.isArray(periods) && periods.length ? periods : [createDefaultPeriod()]
  return source.map(item => ({
    startTime: item.startTime || '',
    endTime: item.endTime || '',
    breakStart: item.breakStart || '',
    breakEnd: item.breakEnd || ''
  }))
}

export default {
  name: 'ShiftModal',
  data () {
    return {
      title: '新增班次',
      visible: false,
      confirmLoading: false,
      model: createDefaultModel(),
      shiftTypeOptions,
      termTypeOptions,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      },
      periodRequiredRule: [{ required: true, message: '请输入时间', trigger: 'change' }],
      validatorRules: {
        name: [{ required: true, message: '请输入班次名称', trigger: 'blur' }],
        shiftType: [{ required: true, message: '请选择班次类型', trigger: 'change' }],
        termType: [{ required: true, message: '请选择期限类型', trigger: 'change' }],
        periods: [{
          validator: (rule, value, callback) => {
            if (!Array.isArray(value) || !value.length) {
              callback(new Error('请至少配置一个时段'))
              return
            }
            callback()
          },
          trigger: 'change'
        }],
        standardHours: [{ required: true, message: '请输入标准工时', trigger: 'change' }],
        overtimeHours: [{ required: true, message: '请输入自动加班时长', trigger: 'change' }]
      }
    }
  },
  methods: {
    add () {
      this.title = '新增班次'
      this.model = createDefaultModel()
      this.visible = true
      this.clearValidate()
    },
    edit (record) {
      this.title = '编辑班次'
      this.model = {
        id: record.id || '',
        name: record.name || '',
        shiftType: record.shiftType || 'fixed',
        termType: record.termType || 'fixed',
        standardHours: record.standardHours === undefined ? 8 : Number(record.standardHours),
        overtimeHours: record.overtimeHours === undefined ? 0 : Number(record.overtimeHours),
        enabled: record.enabled !== false,
        periods: clonePeriods(record.periods)
      }
      this.visible = true
      this.clearValidate()
    },
    clearValidate () {
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
    addPeriod () {
      this.model.periods.push(createDefaultPeriod())
    },
    removePeriod (index) {
      if (this.model.periods.length === 1) {
        return
      }
      this.model.periods.splice(index, 1)
    },
    close () {
      this.visible = false
      this.confirmLoading = false
      this.$emit('close')
    },
    handleCancel () {
      this.close()
    },
    buildPayload () {
      return {
        id: this.model.id,
        name: this.model.name,
        shiftType: this.model.shiftType,
        termType: this.model.termType,
        standardHours: Number(this.model.standardHours || 0),
        overtimeHours: Number(this.model.overtimeHours || 0),
        enabled: !!this.model.enabled,
        periods: clonePeriods(this.model.periods)
      }
    },
    handleOk () {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return false
        }
        this.confirmLoading = true
        this.$emit('ok', this.buildPayload())
        this.confirmLoading = false
        this.close()
      })
    }
  }
}
</script>

<style scoped lang="less">
.shift-modal-shell {
  color: #223247;
}

.shift-modal-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding: 20px 22px;
  border: 1px solid #dde8f5;
  border-radius: 14px;
  background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
}

.shift-modal-title {
  color: #1b2840;
  font-size: 20px;
  font-weight: 700;
}

.shift-modal-subtitle {
  margin-top: 6px;
  color: #7084a0;
  font-size: 13px;
  line-height: 1.7;
}

.shift-modal-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.create-badge {
  color: #315efb;
  background: #e8efff;
}

.edit-badge {
  color: #8b5cf6;
  background: #f2eaff;
}

.shift-modal-form {
  display: grid;
  gap: 16px;
}

.modal-section {
  padding: 18px 20px 4px;
  background: #ffffff;
  border: 1px solid #e0e9f3;
  border-radius: 14px;
}

.compact-section {
  padding-bottom: 18px;
}

.modal-section-header {
  margin-bottom: 16px;
}

.section-header-inline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.modal-section-title {
  color: #24354c;
  font-size: 15px;
  font-weight: 700;
}

.modal-section-desc {
  margin-top: 4px;
  color: #7e91aa;
  font-size: 12px;
  line-height: 1.7;
}

.term-type-group {
  display: inline-flex;
  border-radius: 10px;
  // overflow: hidden;
}

.period-form-item {
  margin-bottom: 0;
}

.period-list {
  margin-bottom: 0;
}

.period-card {
  margin-bottom: 12px;
  padding: 14px 16px 2px;
  background: #f8fbff;
  border: 1px solid #dbe7f3;
  border-radius: 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.period-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.period-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.period-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: #e8efff;
  color: #315efb;
  font-size: 12px;
  font-weight: 700;
}

.period-title {
  color: #31455f;
  font-weight: 600;
}

.period-remove-button {
  border-radius: 8px;
  border-color: #ffd9d6;
  color: #ef4444;
  background: #fff7f7;
}

.add-period-button {
  border-radius: 10px;
  border-color: #d7e3f4;
  color: #315efb;
  background: #f6f9ff;
}

.status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 4px;
  padding: 14px 16px;
  background: #f8fbff;
  border: 1px solid #dbe7f3;
  border-radius: 12px;
}

.status-card-title {
  color: #31455f;
  font-weight: 700;
}

.status-card-desc {
  margin-top: 4px;
  color: #7e91aa;
  font-size: 12px;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.switch-text {
  color: #5f738f;
}

.shift-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
}

.modal-cancel-button {
  height: 38px;
  padding: 0 18px;
  border-radius: 10px;
  border-color: #d8e2ef;
  color: #617592;
}

.modal-confirm-button {
  height: 38px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 10px 22px rgba(79, 116, 255, 0.22);
  background: linear-gradient(135deg, #4f74ff 0%, #315efb 100%);
}

.modal-confirm-button:hover,
.modal-confirm-button:focus {
  background: linear-gradient(135deg, #3f67fb 0%, #264ff0 100%);
}

/deep/ .shift-modal-wrap .ant-modal-content {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 22px 60px rgba(18, 35, 58, 0.2);
}

/deep/ .shift-modal-wrap .ant-modal-close-x {
  width: 48px;
  height: 48px;
  line-height: 48px;
  color: #7e91aa;
}

/deep/ .shift-modal-wrap .ant-modal-body {
  padding: 22px;
}

/deep/ .shift-modal-form .ant-form-item {
  margin-bottom: 18px;
}

/deep/ .shift-modal-form .ant-form-item-label > label {
  color: #5d7190;
  font-weight: 600;
}

/deep/ .shift-modal-form .ant-input,
/deep/ .shift-modal-form .ant-select-selection,
/deep/ .shift-modal-form .ant-input-number,
/deep/ .shift-modal-form .ant-input-number-input {
  border-radius: 10px;
  border-color: #d7e3f1;
  background: #fbfdff;
}

/deep/ .shift-modal-form .ant-select-selection--single,
/deep/ .shift-modal-form .ant-input {
  min-height: 38px;
}

/deep/ .shift-modal-form .ant-select-selection__rendered {
  line-height: 36px;
}

/deep/ .term-type-group .ant-radio-button-wrapper {
  height: 36px;
  line-height: 34px;
  border-color: #d7e3f1;
  color: #5d7190;
  background: #fbfdff;
}

/deep/ .term-type-group .ant-radio-button-wrapper-checked {
  color: #315efb;
  border-color: #315efb;
  box-shadow: none;
}
</style>
