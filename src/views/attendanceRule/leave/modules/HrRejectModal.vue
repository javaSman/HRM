<template>
  <a-modal
    title="退回申请"
    :width="600"
    :visible="ShowZF"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    okText="确定退回"
    cancelText="取消"
  >
    <a-spin :spinning="confirmLoading">
      <div class="otapply-reject-modal">
        <!-- 申请信息 -->
        <div class="form-section">
          <div class="section-title">
            <span class="title-icon">📋</span>
            申请信息
          </div>
          <a-descriptions :column="2" bordered size="small">
            <a-descriptions-item label="申请人">{{ ZFAll.name }}</a-descriptions-item>
            <a-descriptions-item label="工号">{{ ZFAll.no }}</a-descriptions-item>
            <a-descriptions-item label="请假类型">
              <a-tag :color="leaveTypeColor(ZFAll.leaveType)">
                {{ leaveTypeText(ZFAll.leaveType) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="请假天数">{{ ZFAll.applyDays }} 天</a-descriptions-item>
            <a-descriptions-item label="开始时间">{{ ZFAll.startTime }}</a-descriptions-item>
            <a-descriptions-item label="结束时间">{{ ZFAll.endTime }}</a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 退回原因 -->
        <div class="form-section">
          <div class="section-title">
            <span class="title-icon">⚠️</span>
            退回原因
          </div>
          <a-form-model ref="form" :model="formData" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
            <a-form-model-item label="退回原因" prop="rejectReason">
              <a-textarea
                v-model="formData.rejectReason"
                placeholder="请输入退回原因"
                :rows="4"
                :maxLength="500"
              />
            </a-form-model-item>
          </a-form-model>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'

export default {
  name: 'HrRejectModal',
  props: {
    ShowZF: {
      type: Boolean,
      default: false
    },
    ZFAll: {
      type: Object,
      default: () => ({})
    },
    LCstate: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      confirmLoading: false,
      formData: {
        rejectReason: ''
      },
      rules: {
        rejectReason: [{ required: true, message: '请输入退回原因', trigger: 'blur' }]
      },
      url: {
        reject: '/hr_xjsq/hrXjsq/reject'
      }
    }
  },
  methods: {
    handleOk() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.confirmLoading = true
          let formData = {
            id: this.ZFAll.id,
            spYj: this.formData.rejectReason
          }

          httpAction(this.url.reject, formData, 'post').then((res) => {
            if (res.success) {
              this.$message.success(res.message)
              this.$emit('goBack', true)
            } else {
              this.$message.warning(res.message)
            }
          }).finally(() => {
            this.confirmLoading = false
          })
        }
      })
    },

    handleCancel() {
      this.$emit('goBack', false)
    },

    /**
     * 请假类型颜色
     */
    leaveTypeColor(type) {
      const colorMap = {
        1: 'orange',
        2: 'blue',
        3: 'green',
        4: 'pink',
        5: 'purple',
        6: 'default'
      }
      return colorMap[type] || 'default'
    },

    /**
     * 请假类型文字
     */
    leaveTypeText(type) {
      const textMap = {
        1: '事假',
        2: '病假',
        3: '年假',
        4: '婚假',
        5: '产假',
        6: '丧假'
      }
      return textMap[type] || '未知'
    }
  }
}
</script>

<style scoped lang="less">
.otapply-reject-modal {
  padding: 0 24px;
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3d;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(37, 99, 235, 0.1);
}

.title-icon {
  margin-right: 8px;
  font-size: 18px;
}

/deep/ .ant-descriptions-item-label {
  background: rgba(37, 99, 235, 0.03);
  color: #64748b;
  font-weight: 600;
}

/deep/ .ant-descriptions-item-content {
  color: #1a2a3d;
}
</style>
