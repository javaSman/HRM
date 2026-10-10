<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail" class="cardrepair-form">
        <!-- <div class="form-top-banner">
          <div>
            <div class="form-top-banner__title">{{ formDisabled ? '补卡申请详情' : '补卡申请' }}</div>
          </div>
          <div class="form-top-banner__status">
            <span>流程状态</span>
            <a-tag :color="currentStatus.color">{{ currentStatus.text }}</a-tag>
          </div>
        </div> -->

        <a-row :gutter="24" class="form-body-layout" style="margin: 0 0;">
          <a-col :xl="14" :lg="24">
            <div class="form-section-card">
               <!--<div class="section-head">
                <div class="section-head__title">申请信息</div>
              </div>
              <a-alert
                class="cardrepair-alert"
                message="收到缺卡或异常提醒后，请在 3 天内提交补卡申请；涉及外出或设备故障时建议补充附件。"
                type="info"
                show-icon
              /> -->
              <a-row :gutter="16">
                <a-col :md="12" :sm="24">
                  <a-form-model-item label="申请人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="applicant">
                    <a-input v-model="model.applicant" placeholder="请输入申请人" />
                  </a-form-model-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-model-item label="部门" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bm">
                    <a-input v-model="model.bm" placeholder="请输入部门" />
                  </a-form-model-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-model-item label="补卡日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="cardDate">
                    <j-date v-model="model.cardDate" placeholder="请选择补卡日期" style="width: 100%" />
                  </a-form-model-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-model-item label="异常类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="errType">
                    <a-input v-model="model.errType" placeholder="请输入异常类型" />
                  </a-form-model-item>
                </a-col>
                <a-col :span="24">
                  <a-form-model-item label="补卡时间" :labelCol="wideLabelCol" :wrapperCol="wideWrapperCol" prop="repairTime">
                    <j-date
                      v-model="model.repairTime"
                      placeholder="请选择补卡时间"
                      :show-time="true"
                      date-format="YYYY-MM-DD HH:mm:ss"
                      style="width: 100%"
                    />
                    <div class="quick-time-actions">
                      <span class="quick-time-actions__label">快捷时间</span>
                      <button
                        v-for="item in quickTimeOptions"
                        :key="item"
                        type="button"
                        class="quick-time-chip"
                        :class="{ active: isQuickTimeActive(item) }"
                        @click="applyQuickTime(item)"
                      >
                        {{ item }}
                      </button>
                    </div>
                  </a-form-model-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-model-item label="附件" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="fj">
                    <j-upload v-model="model.fj"></j-upload>
                  </a-form-model-item>
                </a-col>
                <!-- <a-col :md="12" :sm="24">
                  <a-form-model-item label="提交时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="subTime">
                    <a-input :value="model.subTime || '提交后自动生成'" disabled />
                  </a-form-model-item>
                </a-col> -->
                <a-col :span="24">
                  <a-form-model-item label="补卡原因" :labelCol="wideLabelCol" :wrapperCol="wideWrapperCol" prop="reason">
                    <a-textarea v-model="model.reason" :rows="4" placeholder="请详细描述补卡原因" />
                  </a-form-model-item>
                </a-col>
              </a-row>
            </div>

            <!-- <div class="form-section-card secondary-section">
              <div class="section-head">
                <div class="section-head__title">流程辅助信息</div>
                <div class="section-head__desc">保留系统原有字段，方便对接现有流程数据与历史记录。</div>
              </div>
              <a-row :gutter="16">
                <a-col :md="12" :sm="24">
                  <a-form-model-item label="流程状态" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bpmStatus">
                    <a-input v-model="model.bpmStatus" disabled />
                  </a-form-model-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-model-item label="当前审批人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="spr">
                    <a-input v-model="model.spr" disabled />
                  </a-form-model-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-model-item label="当前阶段" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="dqjd">
                    <a-input v-model="model.dqjd" disabled />
                  </a-form-model-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-model-item label="选择流程id" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="customProcessId">
                    <a-input v-model="model.customProcessId" disabled />
                  </a-form-model-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-model-item label="当前审批节点排序" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="px">
                    <a-input-number v-model="model.px" :disabled="true" style="width: 100%" />
                  </a-form-model-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-model-item label="applicantId" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="applicantId">
                    <a-input-number v-model="model.applicantId" :disabled="true" style="width: 100%" />
                  </a-form-model-item>
                </a-col>
                <a-col :md="12" :sm="24">
                  <a-form-model-item label="errCardlistId" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="errCardlistId">
                    <a-input-number v-model="model.errCardlistId" :disabled="true" style="width: 100%" />
                  </a-form-model-item>
                </a-col>
              </a-row>
            </div> -->
          </a-col>

          <a-col :xl="10" :lg="24">
            <div class="flow-section-card">
              <div class="section-head">
                <div class="section-head__title">审批流程</div>
                <!-- <div class="section-head__desc">右侧流程暂使用 mock 数据展示节点、会签和当前处理进度。</div> -->
              </div>
              <!-- <div class="flow-summary-grid">
                <div class="flow-summary-item">
                  <span>当前审批人</span>
                  <strong>{{ model.spr || '王丽' }}</strong>
                </div>
                <div class="flow-summary-item">
                  <span>当前阶段</span>
                  <strong>{{ model.dqjd || 'HR审批' }}</strong>
                </div>
                <div class="flow-summary-item">
                  <span>抄送范围</span>
                  <strong>考勤专员 / 薪酬组</strong>
                </div>
                <div class="flow-summary-item">
                  <span>处理策略</span>
                  <strong>主管 + HR</strong>
                </div>
              </div> -->

              <div class="flow-list">
                <div v-for="(step, index) in mockFlowSteps" :key="step.key" class="flow-item">
                  <div class="flow-item__rail">
                    <div :class="['flow-item__dot', step.status]"></div>
                    <div v-if="index !== mockFlowSteps.length - 1" class="flow-item__line"></div>
                  </div>
                  <div class="flow-item__card">
                    <div class="flow-item__head">
                      <div class="flow-item__title">
                        <span>{{ step.title }}</span>
                        <a-tag v-if="step.tag" color="orange">{{ step.tag }}</a-tag>
                      </div>
                      <a-tag :color="getFlowStatusColor(step.status)">{{ getFlowStatusText(step.status) }}</a-tag>
                    </div>
                    <div v-for="member in step.members" :key="step.key + member.name" class="flow-member">
                      <a-avatar :style="{ backgroundColor: member.color }">{{ member.name.slice(0, 1) }}</a-avatar>
                      <div class="flow-member__info">
                        <div class="flow-member__name">{{ member.name }}</div>
                        <div class="flow-member__meta">{{ member.id }}</div>
                      </div>
                      <div class="flow-member__result">
                        <span :class="['flow-member__result-text', step.status]">{{ member.result }}</span>
                        <span v-if="member.time" class="flow-member__time">{{ member.time }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>

        <div v-if="showFlowSubmitButton" class="flow-submit-bar">
          <a-button icon="check" type="primary" @click="submitForm">提 交</a-button>
        </div>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'

export default {
  name: 'ProcessCardrepairForm',
  components: {
  },
  props: {
    formData: {
      type: Object,
      default: () => ({}),
      required: false
    },
    formBpm: {
      type: Boolean,
      default: false,
      required: false
    },
    disabled: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  data() {
    return {
      model: {
        applicant: '',
        cardDate: '',
        repairTime: '',
        subTime: '',
        errType: '',
        reason: '',
        bpmStatus: '1',
        fj: '',
        bm: '',
        spr: '',
        dqjd: '',
        customProcessId: '',
        px: undefined,
        applicantId: undefined,
        errCardlistId: undefined
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 17 }
      },
      wideLabelCol: {
        xs: { span: 24 },
        sm: { span: 3 }
      },
      wideWrapperCol: {
        xs: { span: 24 },
        sm: { span: 21 }
      },
      confirmLoading: false,
      quickTimeOptions: ['07:30', '08:00', '08:30', '09:00', '18:00', '18:30'],
      mockFlowSteps: [
        {
          key: 'manager',
          title: '部门主管',
          tag: '会签',
          status: 'done',
          members: [
            { name: '张永峰', id: '工号 4632', result: '已同意', time: '06-18 09:12', color: '#1677ff' },
            { name: '李明辉', id: '工号 5821', result: '已同意', time: '06-18 09:35', color: '#13c2c2' }
          ]
        },
        {
          key: 'director',
          title: '部门总监',
          tag: '',
          status: 'done',
          members: [
            { name: '张三', id: '工号 9527', result: '已同意', time: '06-18 10:10', color: '#fa8c16' }
          ]
        },
        {
          key: 'hr',
          title: 'HR审批',
          tag: '',
          status: 'pending',
          members: [
            { name: '王丽', id: '工号 3412', result: '待处理', time: '', color: '#52c41a' }
          ]
        },
        {
          key: 'cc',
          title: '抄送',
          tag: '',
          status: 'notice',
          members: [
            { name: '薪酬组', id: '抄送节点', result: '待送达', time: '', color: '#8c8c8c' }
          ]
        }
      ],
      validatorRules: {
        cardDate: [{ required: true, message: '请选择补卡日期', trigger: 'change' }],
        repairTime: [{ required: true, message: '请选择补卡时间', trigger: 'change' }],
        errType: [{ required: true, message: '请输入异常类型', trigger: 'change' }],
        reason: [{ required: true, message: '请输入补卡原因', trigger: 'change' }]
      },
      url: {
        add: '/cardRepair/processCardrepair/add',
        edit: '/cardRepair/processCardrepair/edit',
        queryById: '/cardRepair/processCardrepair/queryById'
      }
    }
  },
  computed: {
    formDisabled() {
      if (this.formBpm === true) {
        if (this.formData.disabled === false) {
          return false
        }
        return true
      }
      return this.disabled
    },
    showFlowSubmitButton() {
      if (this.formBpm === true) {
        if (this.formData.disabled === false) {
          return true
        }
      }
      return false
    },
    currentStatus() {
      return this.getStatusMeta(this.model.bpmStatus)
    }
  },
  created() {
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
    this.showFlowData()
  },
  methods: {
    add() {
      const applicant = this.$store.state.user.info.realname || ''
      const applicantNo  =this.$store.state.user.info.username || ''
      this.edit({...this.modelDefault,
        applicant,
        applicantNo
      })
    },
    edit(record) {
      this.model = Object.assign({}, this.modelDefault, record)
    },
    showFlowData() {
      if (this.formBpm === true) {
        const params = { id: this.formData.dataId }
        getAction(this.url.queryById, params).then((res) => {
          if (res.success) {
            this.edit(res.result)
          }
        })
      }
    },
    getStatusMeta(status) {
      const raw = status === null || status === undefined ? '' : String(status).trim()
      if (raw === '1' || raw === '待提交' || raw === '草稿' || raw === '未发起') {
        return { key: 'draft', text: '待提交', color: 'gold' }
      }
      if (raw === '2' || raw === '审批中' || raw === '处理中' || raw === '进行中') {
        return { key: 'processing', text: '审批中', color: 'blue' }
      }
      if (raw === '3' || raw === '已通过' || raw === '通过' || raw === '审批通过') {
        return { key: 'approved', text: '已通过', color: 'green' }
      }
      if (raw === '4' || raw === '已驳回' || raw === '驳回') {
        return { key: 'rejected', text: '已驳回', color: 'red' }
      }
      if (raw === '5' || raw === '已撤销' || raw === '撤销') {
        return { key: 'canceled', text: '已撤销', color: '' }
      }
      return { key: 'unknown', text: raw || '未设置', color: '' }
    },
    getFlowStatusText(status) {
      if (status === 'done') {
        return '已完成'
      }
      if (status === 'pending') {
        return '待审批'
      }
      return '抄送'
    },
    getFlowStatusColor(status) {
      if (status === 'done') {
        return 'green'
      }
      if (status === 'pending') {
        return 'blue'
      }
      return ''
    },
    isQuickTimeActive(time) {
      const value = this.model.repairTime || ''
      return String(value).slice(11, 16) === time
    },
    applyQuickTime(time) {
      if (this.formDisabled) {
        return
      }
      const date = this.resolveRepairDate()
      this.model.repairTime = `${date} ${time}:00`
    },
    resolveRepairDate() {
      if (this.model.cardDate) {
        return String(this.model.cardDate).slice(0, 10)
      }
      if (this.model.repairTime) {
        return String(this.model.repairTime).slice(0, 10)
      }
      const now = new Date()
      const month = `${now.getMonth() + 1}`.padStart(2, '0')
      const day = `${now.getDate()}`.padStart(2, '0')
      return `${now.getFullYear()}-${month}-${day}`
    },
    submitForm() {
      const that = this
      this.$refs.form.validate(valid => {
        if (valid) {
          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          httpAction(httpurl, this.model, method).then((res) => {
            if (res.success) {
              that.$message.success(res.message)
              that.$emit('ok')
            } else {
              that.$message.warning(res.message)
            }
          }).finally(() => {
            that.confirmLoading = false
          })
        }
      })
    }
  }
}
</script>
<style scoped lang="less">
.cardrepair-form {
  padding: 4px 0 0;
  // background: #ccc;
  height: 70vh;
  overflow-y: auto;
}

.form-top-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 18px 20px;
  border: 1px solid #dbe8ff;
  border-radius: 16px;
  background: linear-gradient(135deg, #f7fbff 0%, #edf5ff 100%);
}

.form-top-banner__title {
  margin-bottom: 6px;
  color: #1f2d3d;
  font-size: 18px;
  font-weight: 600;
}

.form-top-banner__desc {
  color: #6b7a90;
  font-size: 13px;
  line-height: 1.7;
}

.form-top-banner__status {
  text-align: right;
}

.form-top-banner__status span {
  display: block;
  margin-bottom: 8px;
  color: #7a8799;
  font-size: 12px;
}

.form-section-card,
.flow-section-card {
  padding: 20px;
  border: 1px solid #eef3fb;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(31, 76, 148, 0.04);
}

.secondary-section {
  margin-top: 16px;
}

.section-head {
  margin-bottom: 16px;
}

.section-head__title {
  color: #1f2d3d;
  font-size: 16px;
  font-weight: 600;
}

.section-head__desc {
  margin-top: 6px;
  color: #7a8799;
  font-size: 13px;
}

.cardrepair-alert {
  margin-bottom: 18px;
  border-radius: 12px;
}

.quick-time-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.quick-time-actions__label {
  color: #7a8799;
  font-size: 12px;
}

.quick-time-chip {
  padding: 2px 10px;
  color: #4a5c78;
  font-size: 12px;
  line-height: 24px;
  border: 1px solid #d9e5f8;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-time-chip:hover,
.quick-time-chip.active {
  color: #1677ff;
  border-color: #91caff;
  background: #e6f4ff;
}

.flow-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.flow-summary-item {
  padding: 14px 16px;
  border-radius: 14px;
  background: #f7faff;
}

.flow-summary-item span {
  display: block;
  margin-bottom: 6px;
  color: #7a8799;
  font-size: 12px;
}

.flow-summary-item strong {
  color: #1f2d3d;
  font-size: 14px;
  font-weight: 600;
}

.flow-list {
  position: relative;
}

.flow-item {
  display: flex;
  gap: 14px;
}

.flow-item + .flow-item {
  margin-top: 14px;
}

.flow-item__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  flex-shrink: 0;
}

.flow-item__dot {
  width: 12px;
  height: 12px;
  margin-top: 6px;
  border-radius: 50%;
  background: #d9d9d9;
}

.flow-item__dot.done {
  background: #52c41a;
  box-shadow: 0 0 0 4px rgba(82, 196, 26, 0.12);
}

.flow-item__dot.pending {
  background: #1677ff;
  box-shadow: 0 0 0 4px rgba(22, 119, 255, 0.12);
}

.flow-item__dot.notice {
  background: #8c8c8c;
  box-shadow: 0 0 0 4px rgba(140, 140, 140, 0.12);
}

.flow-item__line {
  flex: 1;
  width: 2px;
  min-height: 60px;
  margin-top: 8px;
  border-radius: 999px;
  background: linear-gradient(180deg, #dbe8ff 0%, #edf2fa 100%);
}

.flow-item__card {
  flex: 1;
  padding: 16px;
  border: 1px solid #eef3fb;
  border-radius: 14px;
  background: #fbfdff;
}

.flow-item__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.flow-item__title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1f2d3d;
  font-size: 15px;
  font-weight: 600;
}

.flow-member {
  display: flex;
  align-items: center;
  gap: 12px;
}

.flow-member + .flow-member {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e7edf7;
}

.flow-member__info {
  flex: 1;
}

.flow-member__name {
  color: #1f2d3d;
  font-size: 14px;
  font-weight: 500;
}

.flow-member__meta,
.flow-member__time {
  color: #8c8c8c;
  font-size: 12px;
}

.flow-member__result {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.flow-member__result-text.done {
  color: #52c41a;
}

.flow-member__result-text.pending {
  color: #1677ff;
}

.flow-member__result-text.notice {
  color: #8c8c8c;
}

.flow-submit-bar {
  margin-top: 20px;
  text-align: center;
}

.flow-submit-bar .ant-btn {
  min-width: 136px;
  height: 40px;
  border-radius: 999px;
}

@media (max-width: 991px) {
  .form-top-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .form-top-banner__status {
    text-align: left;
  }

  .flow-summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
