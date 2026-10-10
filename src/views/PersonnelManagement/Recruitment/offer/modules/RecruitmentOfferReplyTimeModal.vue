<template>
  <j-modal
    title="选择最晚回复时间"
    :width="480"
    :visible="visible"
    :okClose="false"
    okText="确认"
    cancelText="取消"
    :bodyStyle="{ padding: '20px 24px 8px' }"
    @ok="handleOk"
    @cancel="close"
  >
    <a-form-model ref="form" layout="vertical" :model="model" :rules="validatorRules">
      <a-form-model-item label="最晚回复时间" prop="replyTime">
        <a-date-picker
          :value="replyTimeValue"
          format="YYYY-MM-DD HH:mm:ss"
          :show-time="{ format: 'HH:mm:ss' }"
          placeholder="请选择最晚回复时间"
          style="width: 100%"
          :getCalendarContainer="getPopupContainer"
          @change="handleReplyTimeChange"
        />
      </a-form-model-item>
    </a-form-model>
  </j-modal>
</template>

<script>
import moment from 'moment'

export default {
  name: 'RecruitmentOfferReplyTimeModal',
  data() {
    return {
      visible: false,
      model: {
        replyTime: ''
      },
      validatorRules: {
        replyTime: [{ required: true, message: '请选择最晚回复时间', trigger: 'change' }]
      }
    }
  },
  computed: {
    replyTimeValue() {
      if (!this.model.replyTime) {
        return null
      }
      const pickerValue = moment(this.model.replyTime, 'YYYY-MM-DD HH:mm:ss', true)
      return pickerValue.isValid() ? pickerValue : null
    }
  },
  methods: {
    getPopupContainer(node) {
      return node.parentNode
    },
    open(value) {
      this.model.replyTime = value || ''
      this.visible = true
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    close() {
      this.visible = false
    },
    handleReplyTimeChange(value, dateString) {
      this.model.replyTime = dateString || ''
      this.$refs.form && this.$refs.form.clearValidate(['replyTime'])
    },
    handleOk() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          return
        }
        this.$emit('ok', this.model.replyTime)
        this.close()
      })
    }
  }
}
</script>
