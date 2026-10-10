<template>
  <j-modal
    title="新增排班人员"
    :width="620"
    :visible="visible"
    :confirmLoading="submitting"
    :maskClosable="false"
    wrapClassName="attendance-rule-modal"
    :bodyStyle="modalBodyStyle"
    okText="确定"
    cancelText="取消"
    @ok="handleSubmit"
    @cancel="handleClose"
  >
    <!-- 姓名：点击调用系统人员选择器 -->
    <div class="emp-form-item">
      <div class="emp-form-label"><span class="required-star">*</span>姓名</div>
      <j-select-employee v-model="empIds" placeholder="请选择人员" buttonText="选择人员" @change="onEmpChange" />
    </div>
  </j-modal>
</template>

<script>
import { postAction } from '@/api/manage'
export default {
  name: 'ScheduleEmpAddModal',
  data() {
    return {
      visible: false,
      submitting: false,
      modalBodyStyle: {
        maxHeight: 'calc(100vh - 168px)',
        overflowY: 'auto',
        padding: '20px 24px',
      },
      // 选中人员 id（j-select-employee 默认多选，逗号拼接）
      empIds: '',
      // 选中人员完整行信息（供提交接口使用）
      empRows: [],
    }
  },
  methods: {
    show() {
      this.empIds = ''
      this.empRows = []
      this.submitting = false
      this.visible = true
    },
    handleClose() {
      this.visible = false
    },
    // 人员选择回调：value 为 id（逗号拼接），rows 为人员完整信息
    onEmpChange(value, rows) {
      this.empIds = value
      this.empRows = rows || []
    },
    // 确定提交
    handleSubmit() {
      if (!this.empIds) {
        this.$message.warning('请先选择人员')
        return
      }
      const params = this.empRows.map((item) => {
        return {
          no: item.no,
          name: item.name,
          companyId: item.companyId,
          dept: item.dept,
          postId: item.postId,
        }
      })
      postAction('hr_emp_schedule_emp/hrEmpScheduleEmp/addBatch', params).then((res) => {
        if (res.success) {
          this.$message.success(res.message || '添加成功')
          this.visible = false
          this.$emit('ok')
        } else {
          this.$message.warning(res.message || '添加失败')
        }
      })
    },
  },
}
</script>

<style scoped lang="less">
/* 统一的 Modal 头部 / 底部样式（参考 ScheduleImportModal） */
::v-deep .attendance-rule-modal .ant-modal-content {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(45, 120, 255, 0.12), 0 0 40px rgba(45, 120, 255, 0.04);
}

::v-deep .attendance-rule-modal .ant-modal-header {
  padding: 16px 24px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  border-bottom: 0;
}

::v-deep .attendance-rule-modal .ant-modal-title,
::v-deep .attendance-rule-modal .j-modal-title-row .left {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

::v-deep .attendance-rule-modal .ant-modal-close {
  top: 10px;
  right: 14px;
  width: 32px;
  height: 32px;
  color: #fff;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

::v-deep .attendance-rule-modal .ant-modal-close:hover {
  background: rgba(255, 255, 255, 0.35);
}

::v-deep .attendance-rule-modal .ant-modal-close-x {
  width: 32px;
  height: 32px;
  line-height: 32px;
}

::v-deep .attendance-rule-modal .ant-modal-body {
  background: #f8fafc;
}

::v-deep .attendance-rule-modal .ant-modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn {
  height: 34px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary {
  border: 0;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
}

::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary:hover,
::v-deep .attendance-rule-modal .ant-modal-footer .ant-btn-primary:focus {
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  opacity: 0.92;
}

.emp-form-item {
  margin-bottom: 24px;
}

.emp-form-label {
  margin-bottom: 10px;
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;

  .required-star {
    margin-right: 4px;
    color: #f5222d;
  }
}

.emp-form-tip {
  margin-top: 8px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}
</style>

