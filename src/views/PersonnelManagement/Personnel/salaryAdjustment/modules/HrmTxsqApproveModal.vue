<template>
  <j-modal
    title="薪资调整审批"
    :width="600"
    :visible="visible"
    switchFullscreen
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="取消"
    okText="确认提交"
  >
    <a-spin :spinning="confirmLoading">
      <!-- 基本信息展示 -->
      <div class="approve-info-card">
        <div class="info-row">
          <span class="info-label">工号：</span>
          <span class="info-value">{{ record.gh || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">姓名：</span>
          <span class="info-value">{{ record.xm || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">调薪类型：</span>
          <span class="info-value">{{ record.txlx || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">调薪前薪资(k)：</span>
          <span class="info-value">{{ record.txqxz || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">调薪后薪资(k)：</span>
          <span class="info-value">{{ record.txhxz || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">生效日期：</span>
          <span class="info-value">{{ record.sxrq || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">调薪原因：</span>
          <span class="info-value">{{ record.txyy || '-' }}</span>
        </div>
      </div>

      <!-- 审批表单 -->
      <a-form-model ref="form" :model="model" :rules="validatorRules" class="approve-form">
        <a-form-model-item label="审批结果" prop="approveResult">
          <a-radio-group v-model="model.approveResult">
            <a-radio value="通过">通过</a-radio>
            <a-radio value="不通过">不通过</a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item label="审批意见" prop="spyj">
          <a-textarea v-model="model.spyj" placeholder="请输入审批意见" :rows="3" :maxLength="500" />
        </a-form-model-item>
      </a-form-model>
    </a-spin>
  </j-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import Vue from 'vue'
export default {
  name: 'HrmTxsqApproveModal',
  data() {
    return {
      visible: false,
      confirmLoading: false,
      record: {},
      model: {
        approveResult: '通过',
        spyj: '',
      },
      validatorRules: {
        approveResult: [{ required: true, message: '请选择审批结果!', trigger: 'change' }],
      },
      url: {
        approve: '/ryManage/hrmTxsq/approve',
      },
    }
  },
  methods: {
    show(record) {
      this.record = Object.assign({}, record)
      this.model = {
        approveResult: '通过',
        spyj: '',
      }
      this.visible = true
    },
    handleOk() {
      const perInfo = Vue.ls.get('perInfo')
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.confirmLoading = true
          const params = {
            ...this.record,
            zt: this.model.approveResult,
            spyj: this.model.spyj,
            spr: perInfo.id
          }
          httpAction(this.url.approve, params, 'post')
            .then((res) => {
              if (res.success) {
                this.$message.success('审批成功')
                this.$emit('ok')
                this.visible = false
              } else {
                this.$message.warning(res.message)
              }
            })
            .finally(() => {
              this.confirmLoading = false
            })
        }
      })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style scoped lang="less">
.approve-info-card {
  padding: 16px;
  margin-bottom: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  width: 120px;
  color: #909399;
  font-size: 13px;
}

.info-value {
  flex: 1;
  color: #303133;
  font-size: 13px;
}

.approve-form {
  padding: 0 20px;
}
</style>

