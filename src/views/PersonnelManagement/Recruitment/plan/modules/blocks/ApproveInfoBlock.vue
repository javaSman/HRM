<template>
  <div class="approve-info-block">
    <a-form-model layout="vertical" class="approve-form">
      
      <a-form-model-item label="审批结论" class="approve-result-item">
        <a-radio-group v-model="result">
          <a-radio value="2">通过</a-radio>
          <a-radio value="4">不通过</a-radio>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item label="审批意见">
        <a-textarea v-model.trim="comment" :autoSize="{ minRows: 6, maxRows: 12 }" placeholder="请输入审批意见" />
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import { formatDate } from '@/utils/util'
export default {
  name: 'PlanApproveInfoBlock',
  props: {
    mindata: { type: Object, required: true },
  },
  data() {
    return {
      result: '2',
      comment: '',
    }
  },
  computed: {
    approveTime() {
      return this.mindata.spTime ? formatDate(this.mindata.spTime, 'yyyy-MM-dd hh:mm') : ''
    },
  },
  methods: {
    formatDate,
    // 供父组件提交时取值
    getValue() {
      return { result: this.result, comment: this.comment }
    },
  },
}
</script>

<style scoped lang="less">
.approve-info-block {
  width: 100%;
}

.approve-form {
  width: 100%;
}

.approve-field {
  position: relative;
  min-height: 46px;
  padding: 8px 10px 8px 13px;
  margin-bottom: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 8px;

  &::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 3px;
    content: '';
    background: linear-gradient(180deg, #5b8cff 0%, #4a7bf7 100%);
    opacity: 0.65;
  }
}

.field-label {
  display: block;
  margin-bottom: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

.approve-blank {
  min-height: 18px;
}

.approve-result-item {
  margin-top: 2px;
}
</style>
