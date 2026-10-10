<template>
  <j-modal
    class="recruitment-flow-modal"
    :title="title"
    :width="520"
    :visible="visible"
    :bodyStyle="bodyStyle"
    @cancel="close"
  >
    <div class="round-summary">
      <div>
        当前轮次：<strong>{{ currentRound }}</strong>
        <span class="round-arrow">→</span>
        下一轮：<strong>{{ targetRound }}</strong>
      </div>
      <div class="candidate-summary">{{ candidateSummary }}</div>
    </div>
    <a-form-model ref="form" layout="vertical" :model="form" :rules="rules">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-model-item :label="timeLabel" prop="mssj">
            <j-date
              v-model="form.mssj"
              :show-time="true"
              date-format="YYYY-MM-DD HH:mm:ss"
              :placeholder="`请选择${timeLabel}`"
              style="width: 100%"
            />
          </a-form-model-item>
        </a-col>
        <a-col :span="12">
          <a-form-model-item label="面试官" prop="msg">
            <j-select-employee
                v-model="form.msg"
                :multiple="false"
                placeholder="请选择"
                button-text="选择"
                valueField="name"
                 @change="(value, rows) => form.msg = value"
                />
                
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-model-item label="面试方式" prop="msfs">
            <a-select v-model="form.msfs" placeholder="请选择面试方式" @change="handleMethodChange">
              <a-select-option value="线下">线下</a-select-option>
              <a-select-option value="视频">视频</a-select-option>
              <a-select-option value="电话">电话</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-col>
        <a-col v-if="form.msfs === '线下'" :span="12">
          <a-form-model-item label="面试地点" prop="msdd">
            <a-input v-model.trim="form.msdd" placeholder="请输入面试地点" />
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-form-model-item :label="remarkLabel" prop="remark">
        <a-textarea
          v-model.trim="form.remark"
          :autoSize="{ minRows: 2, maxRows: 4 }"
          :placeholder="`${targetRound}重点考察内容或其他备注（选填）`"
        />
      </a-form-model-item>
    </a-form-model>
    <template slot="footer">
      <a-button type="primary" @click="handleOk">确认安排</a-button>
      <a-button @click="close">取消</a-button>
    </template>
  </j-modal>
</template>

<script>
export default {
  name: 'InterviewRetestModal',
  data() {
    return {
      visible: false,
      targetRound: '部门复试',
      record: {},
      form: this.getDefaultForm(),
      rules: {
        mssj: [{ required: true, message: '请选择面试时间', trigger: 'change' }],
        msg: [{ required: true, message: '请输入面试官', trigger: 'blur' }],
        msfs: [{ required: true, message: '请选择面试方式', trigger: 'change' }],
        msdd: [{ required: true, message: '请输入面试地点', trigger: 'blur' }]
      },
      bodyStyle: { padding: '20px 24px 8px' }
    }
  },
  computed: {
    currentRound() {
      return this.targetRound === '终试' ? '部门复试' : '初试'
    },
    title() {
      const name = this.record.xm ? ` - ${this.record.xm}` : ''
      return `安排${this.targetRound}${name}`
    },
    timeLabel() {
      return this.targetRound === '终试' ? '终试时间' : '复试时间'
    },
    remarkLabel() {
      return this.targetRound === '终试' ? '终试备注' : '复试备注'
    },
    candidateSummary() {
      const interviewerLabel = this.currentRound === '初试' ? '初试面试官' : '复试面试官'
      return [
        `应聘岗位：${this.formatValue(this.record.postId)}`,
        `部门：${this.formatValue(this.record.dept_dictText || this.record.deptName)}`,
        `${interviewerLabel}：${this.formatValue(this.record.msg)}`
      ].join(' | ')
    }
  },
  methods: {
    getDefaultForm() {
      return { mssj: '', msg: '', msfs: '线下', msdd: '', remark: '' }
    },
    open(targetRound, record) {
      // 复试和终试复用同一表单，仅切换轮次文案，不预设业务人员。
      this.targetRound = targetRound || '部门复试'
      this.record = Object.assign({}, record || {})
      this.form = this.getDefaultForm()
      this.visible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    handleMethodChange() {
      // 非线下面试不需要地点，清空旧值及校验状态。
      if (this.form.msfs !== '线下') {
        this.form.msdd = ''
      }
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate(['msdd']))
    },
    handleOk() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        // 仅向列表页回传表单，实际安排接口留待后续接入。
        this.$emit('ok', {
          targetRound: this.targetRound,
          record: this.record,
          form: Object.assign({}, this.form)
        })
        this.close()
      })
    },
    close() {
      this.visible = false
    },
    formatValue(value) {
      return value === undefined || value === null || value === '' ? '-' : value
    }
  }
}
</script>

<style scoped lang="less">
.round-summary {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  background: #f0f7ff;
  color: #595959;
  font-size: 13px;

  strong {
    color: #1890ff;
  }
}

.round-arrow {
  margin: 0 8px;
  color: #8c8c8c;
}

.candidate-summary {
  margin-top: 4px;
  line-height: 1.6;
}
</style>

<style lang="less">
@import '../../common/recruitmentModal.less';
</style>
