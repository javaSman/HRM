<template>
  <a-modal
    :width="480"
    :visible="visible"
    :title="title"
    :maskClosable="false"
    destroyOnClose
    okText="确认离职"
    cancelText="取消"
    wrapClassName="employee-resign-modal-wrap"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form layout="vertical" class="employee-resign-form">
      <a-form-item label="员工姓名">
        <a-input :value="employeeName" readOnly />
      </a-form-item>
      <a-form-item label="所属部门">
        <a-input :value="employeeDept" readOnly />
      </a-form-item>
      <a-form-item label="岗位">
        <a-input :value="employeePosition" readOnly />
      </a-form-item>
      <a-form-item>
        <template slot="label">
          <span class="required">*</span>
          <span>正式离职日期</span>
        </template>
        <a-date-picker
          v-model="resignDate"
          format="YYYY-MM-DD"
          valueFormat="YYYY-MM-DD"
          placeholder="请选择正式离职日期"
          class="employee-resign-date"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  name: 'EmployeeResignModal',
  data() {
    return {
      title: '员工离职',
      visible: false,
      employee: {},
      resignDate: '',
    }
  },
  computed: {
    employeeName() {
      return this.readValue(this.employee, ['name', '员工姓名'])
    },
    employeeDept() {
      return this.readValue(this.employee, ['dept_dictText', 'mainDept', 'dept', '主部门'])
    },
    employeePosition() {
      return this.readValue(this.employee, ['postId_dictText', 'postName', '岗位名称'])
    },
  },
  methods: {
    show(record) {
      this.employee = record || {}
      this.resignDate = ''
      this.visible = true
    },
    handleOk() {
      if (!this.resignDate) {
        this.$message.warning('请选择正式离职日期')
        return
      }
      const formData = {
        ...this.employee,
        formalResignDate: this.resignDate,
      }
      if (this.isReachedResignDate(this.resignDate)) {
        formData.status = '已离职'
      } else {
        delete formData.status
      }
      postAction('/hrm/hrEmployeeInformation/edit', formData)
        .then((res) => {
          if (res && res.success) {
            this.$message.success('提交成功')
            this.$emit('ok')
            this.handleCancel()
          } else {
            // if (res && res.message) this.$message.warning(res.message)
            this.$message.warning('提交失败')
          }
        })
        .finally(() => {
        })
    },
    handleCancel() {
      this.visible = false
      this.employee = {}
      this.resignDate = ''
    },
    readValue(record, keys) {
      const source = record || {}
      for (let i = 0; i < keys.length; i++) {
        const value = source[keys[i]]
        if (value !== undefined && value !== null && value !== '') {
          return String(value)
        }
      }
      return '-'
    },
    isReachedResignDate(date) {
      const resignDate = this.formatDate(date)
      const today = this.formatDate(new Date())
      return !!resignDate && resignDate <= today
    },
    formatDate(date) {
      if (!date) {
        return ''
      }
      if (date && typeof date.format === 'function') {
        return date.format('YYYY-MM-DD')
      }
      if (date instanceof Date) {
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${date.getFullYear()}-${month}-${day}`
      }
      return String(date).slice(0, 10)
    },
  },
}
</script>

<style lang="less">
.employee-resign-modal-wrap {
  .ant-modal {
    max-width: 95vw;
    padding-bottom: 0;
  }

  .ant-modal-content {
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
  }

  .ant-modal-header {
    padding: 18px 20px;
    border-bottom: 1px solid #e2e8f0;
  }

  .ant-modal-title {
    color: #0f172a;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.4;
  }

  .ant-modal-close-x {
    width: 56px;
    height: 60px;
    color: #64748b;
    font-size: 16px;
    line-height: 60px;
  }

  .ant-modal-body {
    padding: 18px 20px 8px;
  }

  .ant-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 20px;
    border-top: 1px solid #e2e8f0;
  }

  .ant-modal-footer .ant-btn {
    height: 36px;
    margin-left: 10px;
    padding: 0 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
  }

  .ant-modal-footer .ant-btn:not(.ant-btn-primary) {
    border-color: #dbe3ee;
    background: #f8fafc;
    color: #0f172a;
  }

  .ant-modal-footer .ant-btn-primary {
    border-color: transparent;
    background: linear-gradient(135deg, #2d78ff, #06aeea);
    box-shadow: 0 2px 8px rgba(45, 120, 255, 0.22);
  }
}

.employee-resign-form {
  .ant-form-item {
    margin-bottom: 24px;
  }

  .ant-form-item-label {
    padding-bottom: 6px;
    line-height: 1;
  }

  .ant-form-item-label > label {
    color: rgba(45, 120, 255, 0.58);
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
  }

  .ant-form-item-label > label::after {
    display: none;
  }

  .ant-input[readonly] {
    height: 36px;
    border-color: #dbe3ee;
    border-radius: 8px;
    background: #f1f5f9;
    color: #64748b;
    cursor: default;
  }

  .ant-calendar-picker {
    width: 100%;
  }

  .ant-calendar-picker-input {
    height: 36px;
    border-color: #dbe3ee;
    border-radius: 8px;
  }
}

.employee-resign-date {
  width: 100%;
}

.required {
  margin-right: 4px;
  color: #f5222d;
}
</style>
