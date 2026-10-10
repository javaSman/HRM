<template>
  <j-modal
    class="recruitment-flow-modal"
    :title="title"
    :width="520"
    :visible="visible"
    :bodyStyle="bodyStyle"
    @cancel="close"
  >
    <div class="candidate-line">候选人：<strong>{{ formatValue(record.xm) }}</strong></div>
    <a-form-model ref="form" layout="vertical" :model="form" :rules="rules">
      <a-form-model-item label="评审结果" prop="sftg">
        <a-radio-group v-model="form.sftg" @change="handleResultChange">
          <a-radio value="通过">通过</a-radio>
          <a-radio value="不通过">不通过</a-radio>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item label="面试官评语" prop="py">
        <a-textarea
          v-model.trim="form.py"
          :autoSize="{ minRows: 4, maxRows: 6 }"
          placeholder="请输入面试官评审意见"
        />
      </a-form-model-item>
      <a-form-model-item v-if="form.sftg === '不通过'" label="人事总结" prop="ttyy">
        <a-textarea
          v-model.trim="form.ttyy"
          :autoSize="{ minRows: 3, maxRows: 5 }"
          placeholder="请输入淘汰原因（不通过时必填）"
        />
      </a-form-model-item>
    </a-form-model>
    <template slot="footer">
      <a-button type="primary" @click="handleOk">保存</a-button>
      <a-button @click="close">取消</a-button>
    </template>
  </j-modal>
</template>

<script>
export default {
  name: 'InterviewReviewModal',
  data() {
    return {
      visible: false,
      round: '',
      record: {},
      form: this.getDefaultForm(),
      rules: {
        sftg: [{ required: true, message: '请选择评审结果', trigger: 'change' }],
        ttyy: [{ required: true, message: '不通过时请填写人事总结', trigger: 'blur' }]
      },
      bodyStyle: { padding: '20px 24px 8px' }
    }
  },
  computed: {
    title() {
      return `${this.round || '面试'}评审`
    }
  },
  methods: {
    getDefaultForm() {
      return { sftg: '通过', py: '', ttyy: '' }
    },
    open(round, record) {
      // 评审数据暂不映射接口字段，仅按原型初始化弹窗表单。
      this.round = round || ''
      this.record = Object.assign({}, record || {})
      this.form = this.getDefaultForm()
      this.visible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    handleResultChange() {
      // 切换为“通过”时移除已填写的淘汰原因，避免后续误提交。
      if (this.form.sftg === '通过') {
        this.form.ttyy = ''
      }
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate(['ttyy']))
    },
    handleOk() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        // 仅向列表页回传表单，实际评审接口留待后续接入。
        this.$emit('ok', { round: this.round, record: this.record, form: Object.assign({}, this.form) })
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
.candidate-line {
  margin-bottom: 16px;
  color: #595959;
  font-size: 14px;
}
</style>

<style lang="less">
@import '../../common/recruitmentModal.less';
</style>
