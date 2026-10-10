<template>
  <j-modal :title="modalTitle" :width="600" :visible="visible" switchFullscreen
    wrapClassName="attendance-yc-audit-modal" @ok="handleOk" @cancel="handleCancel" cancelText="取消" okText="确认处理">
    <div class="yc-modal-body">
      <div class="yc-summary">
        <div class="yc-summary-row">
          <div class="yc-summary-item">
            <span class="yc-summary-label">姓名：</span>
            <span class="yc-summary-value">{{ formatText(model.name) }}</span>
          </div>
          <div class="yc-summary-item">
            <span class="yc-summary-label">工号：</span>
            <span class="yc-summary-value">{{ formatText(model.no) }}</span>
          </div>
          <div class="yc-summary-item">
            <span class="yc-summary-label">部门：</span>
            <span class="yc-summary-value">{{ model.deptBelong_dictText }}</span>
          </div>
        </div>
        <div class="yc-summary-row">
          <div class="yc-summary-item">
            <span class="yc-summary-label">日期：</span>
            <span class="yc-summary-value">{{ model.skrq ? model.skrq.split(' ')[0] : '-' }}</span>
          </div>
          <div class="yc-summary-item">
            <span class="yc-summary-label">异常类型：</span>
            <a-tag
              v-if="(model.attendanceStatus || '').indexOf('+') === -1"
              :color="getAttendanceStatusClass(model.attendanceStatus_dictText)"
            >
              {{ model.attendanceStatus_dictText }}
            </a-tag>
            <template v-else>
              <a-tag
                v-for="item in getAttendanceStatusList(model.attendanceStatus)"
                :key="item.code"
                :color="item.color"
              >
                {{ item.text }}
              </a-tag>
            </template>
          </div>
        </div>
      </div>

      <div class="yc-section">
        <div class="yc-section-title">处理信息</div>
        <a-form-model :model="model" :rules="rules" ref="form" layout="vertical">
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-model-item label="异常说明">
                <a-textarea v-model="model.bz" disabled :rows="3" placeholder="请输入异常说明" />
              </a-form-model-item>
            </a-col>

            <a-col :span="24">
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-model-item label="打卡时间1">
                    <j-time style="width:100%" v-model="model.one" />
                  </a-form-model-item>
                </a-col>
                <a-col :span="12">
                  <a-form-model-item label="打卡时间2">
                    <j-time style="width:100%" v-model="model.two" />
                  </a-form-model-item>
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-model-item label="打卡时间3">
                    <j-time style="width:100%" v-model="model.three" />
                  </a-form-model-item>
                </a-col>
                <a-col :span="12">
                  <a-form-model-item label="打卡时间4">
                    <j-time style="width:100%" v-model="model.four" />
                  </a-form-model-item>
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-model-item label="打卡时间5">
                    <j-time style="width:100%" v-model="model.five" />
                  </a-form-model-item>
                </a-col>
                <a-col :span="12">
                  <a-form-model-item label="打卡时间6">
                    <j-time style="width:100%" v-model="model.six" />
                  </a-form-model-item>
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-model-item label="打卡时间7">
                    <j-time style="width:100%" v-model="model.seven" />
                  </a-form-model-item>
                </a-col>
                <a-col :span="12">
                  <a-form-model-item label="打卡时间8">
                    <j-time style="width:100%" v-model="model.eight" />
                  </a-form-model-item>
                </a-col>
              </a-row>
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-model-item label="打卡时间9">
                    <j-time style="width:100%" v-model="model.nine" />
                  </a-form-model-item>
                </a-col>
                <a-col :span="12">
                  <a-form-model-item label="打卡时间10">
                    <j-time style="width:100%" v-model="model.ten" />
                  </a-form-model-item>
                </a-col>
              </a-row>
            </a-col>

            <a-col :span="24">
              <a-form-model-item label="处理状态" prop="status">
                <j-dict-select-tag v-model="model.status" dictCode="yckq_clzt" allowClear placeholder="请选择处理状态" style="width: 200px" />
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="处理说明">
                <a-textarea v-model="model.errBz" :rows="3" placeholder="请输入处理说明" />
              </a-form-model-item>
            </a-col>
            <a-col :span="24">
              <a-form-model-item label="处理附件">
                <j-upload v-model="model.fj" />
              </a-form-model-item>
            </a-col>
          </a-row>
        </a-form-model>
      </div>
    </div>
  </j-modal>
</template>

<script>
export default {
  name: 'HrKqYcAuditModal',
  props: {
    exceptionCodes: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      attendanceStatusMap: {
        迟到: { text: '迟到', color: 'orange', code: 'BE_LATE' },
        早退: { text: '早退', color: 'purple', code: 'LEAVE_EARLY' },
        缺卡: { text: '缺卡', color: 'blue', code: 'MISSING' },
        旷工: { text: '旷工', color: 'red', code: 'ABSENT' },
        其他: { text: '其他', color: '', code: 'OTHER' },
        休息日: { text: '休息日', color: 'blue', code: 'Weekend' },
        节假日: { text: '节假日', color: 'red', code: 'Holiday' },
        休假: { text: '休假', color: '#00cce3', code: 'XJ' },
      },
      visible: false,
      title: '异常审核',
      model: {
        attendanceStatus_dictText: null
      },
      form: {},
      rules: {
        status: [{ required: true, message: '请选择处理方式', trigger: 'change' }],
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 }
      },
      url: {
        add: '/hr_kq_yg/hrYckqYg/add',
        edit: '/hr_kq_yg/hrYckqYg/edit',
      },
    }
  },
  computed: {
    modalTitle() {
      return `异常审核 - ${this.formatText(this.model.name)}（${this.formatText(this.model.no)}）`
    }
  },
  methods: {
    getAttendanceStatusClass(status) {
      const statusMeta = String(status || '').split('+')
        .map(item => this.attendanceStatusMap[item]).find(Boolean)
      return statusMeta ? statusMeta.color : ''
    },
    getAttendanceStatusClassObj(status) {
      let obj = { color: '', text: '' }
      for (let key in this.attendanceStatusMap) {
        if (this.attendanceStatusMap[key].code == status) {
          obj = this.attendanceStatusMap[key]
        }
      }
      return obj
    },
    // 拆分组合状态，仅保留 tabsList 中的异常类型
    getAttendanceStatusList(status) {
      return String(status || '')
        .split('+')
        .filter(code => this.exceptionCodes.indexOf(code) !== -1)
        .map(code => Object.assign({ code }, this.getAttendanceStatusClassObj(code)))
    },
    // 处理时间值，提取纯时间部分
    formatTimeValue(value) {
      if (!value || value === '' || value === null || value === undefined) {
        return null
      }
      const timeStr = String(value)
      // 判断是否包含关键字，提取时间部分
      if (timeStr.indexOf('迟') !== -1) {
        return timeStr.replace('迟', '') || null
      }
      if (timeStr.indexOf('早') !== -1) {
        return timeStr.replace('早', '') || null
      }
      if (timeStr.indexOf('缺') !== -1) {
        return null
      }
      if (timeStr.indexOf('旷') !== -1) {
        return null
      }
      if (timeStr.indexOf('休') != -1) {
        return null
      }
      if (timeStr.indexOf('节') != -1) {
        return null
      }
      // 纯时间，直接返回
      return timeStr
    },
    show(record = {}) {
      // 处理时间字段
      const processedRecord = Object.assign({}, record)
      const timeFields = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
      timeFields.forEach(field => {
        processedRecord[field] = this.formatTimeValue(record[field])
      })
      this.model = processedRecord
      this.visible = true
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    handleOk() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        // TODO: 调用处理接口
        this.$message.success('处理成功')
        this.$emit('ok')
        this.visible = false
      })
    },
    handleCancel() {
      this.visible = false
    },
    formatText(text) {
      return text === undefined || text === null || text === '' ? '-' : text
    },
    beforeUpload() {
      return false
    },
    handleUploadChange({ fileList }) {
      this.model.fileList = fileList
    },
    handleRemove(file) {
      const index = this.model.fileList.indexOf(file)
      const newFileList = this.model.fileList.slice()
      newFileList.splice(index, 1)
      this.model.fileList = newFileList
    },
  }
}
</script>

<style scoped lang="less">
.yc-modal-body {
  padding: 0;
}

.yc-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 20px;
  margin-bottom: 16px;
  padding: 14px 16px;
  background: rgba(37, 99, 235, 0.02);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.yc-summary-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.yc-summary-label {
  color: #64748b;
  font-weight: 500;
}

.yc-summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 20px;
}

.yc-summary-value {
  color: #1a2a3d;
  font-weight: 600;
}

.yc-section {
  margin-top: 4px;
}

.yc-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a2a3d;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
}

::v-deep .ant-form-item {
  margin-bottom: 8px;
}
</style>

<style>
  .attendance-yc-audit-modal .ant-modal-content {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(45, 120, 255, 0.12), 0 0 40px rgba(45, 120, 255, 0.04);
  }

  .attendance-yc-audit-modal .ant-modal-header {
    padding: 16px 24px;
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    border-bottom: 0;
  }

  .attendance-yc-audit-modal .ant-modal-title,
  .attendance-yc-audit-modal .j-modal-title-row .left {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
  }

  .attendance-yc-audit-modal .ant-modal-close {
    top: 10px;
    right: 14px;
    width: 32px;
    height: 32px;
    color: #fff;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
  }

  .attendance-yc-audit-modal .ant-modal-close:hover {
    background: rgba(255, 255, 255, 0.35);
  }

  .attendance-yc-audit-modal .ant-modal-close-x {
    width: 32px;
    height: 32px;
    line-height: 32px;
  }

  .attendance-yc-audit-modal .ant-modal-body {
    padding: 20px 24px;
    max-height: calc(85vh - 116px);
    overflow-y: auto;
  }

  .attendance-yc-audit-modal .ant-modal-footer {
    padding: 14px 24px;
    border-top: 1px solid #e2e8f0;
  }

  .attendance-yc-audit-modal .ant-modal-footer .ant-btn:not(.ant-btn-primary) {
    height: 34px;
    padding: 0 20px;
    color: #64748b;
    background: #ffffff;
    border-color: #e2e8f0;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
  }

  .attendance-yc-audit-modal .ant-modal-footer .ant-btn:not(.ant-btn-primary):hover {
    color: #1a2a3d;
    border-color: rgba(45, 120, 255, 0.35);
  }

  .attendance-yc-audit-modal .ant-modal-footer .ant-btn-primary {
    height: 34px;
    border: 0;
    border-radius: 8px;
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
    font-size: 12px;
    font-weight: 600;
  }

  .attendance-yc-audit-modal .ant-modal-footer .ant-btn-primary:hover,
  .attendance-yc-audit-modal .ant-modal-footer .ant-btn-primary:focus {
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    opacity: 0.92;
  }
</style>
